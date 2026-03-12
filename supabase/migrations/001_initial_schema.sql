-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  crown_count INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  ban_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at on profiles
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SPECIES
-- ============================================================
CREATE TABLE public.species (
  id SERIAL PRIMARY KEY,
  scientific_name TEXT NOT NULL UNIQUE,
  common_names TEXT[] NOT NULL DEFAULT '{}',
  family TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  submitted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_species_scientific_trgm ON public.species
  USING GIN (scientific_name gin_trgm_ops);

-- Note: array_to_string is not IMMUTABLE so cannot be used in a GIN index expression.
-- The search_species function handles common_names search without an index (fine for ~100 species).

-- ============================================================
-- SYNONYMS
-- ============================================================
CREATE TABLE public.species_synonyms (
  id SERIAL PRIMARY KEY,
  species_id INTEGER NOT NULL REFERENCES public.species(id) ON DELETE CASCADE,
  synonym_name TEXT NOT NULL UNIQUE,
  synonym_type TEXT NOT NULL DEFAULT 'scientific'
    CHECK (synonym_type IN ('scientific', 'common', 'basionym')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_synonyms_name_trgm ON public.species_synonyms
  USING GIN (synonym_name gin_trgm_ops);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  species_id INTEGER NOT NULL REFERENCES public.species(id),
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  week_year TEXT NOT NULL,
  report_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  is_removed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_week ON public.posts(week_year);
CREATE INDEX idx_posts_species ON public.posts(species_id);
CREATE INDEX idx_posts_user ON public.posts(user_id);

-- ============================================================
-- VOTES
-- ============================================================
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  week_year TEXT NOT NULL,
  species_id INTEGER NOT NULL REFERENCES public.species(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, post_id),
  UNIQUE(user_id, species_id, week_year)
);

CREATE INDEX idx_votes_post ON public.votes(post_id);

-- ============================================================
-- REPORTS (Phase 3 table, created now)
-- ============================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('nsfw', 'off_topic', 'spam', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(reporter_id, post_id)
);

-- ============================================================
-- WEEKLY WINNERS (Phase 2 table, created now)
-- ============================================================
CREATE TABLE public.weekly_winners (
  id SERIAL PRIMARY KEY,
  week_year TEXT NOT NULL,
  species_id INTEGER NOT NULL REFERENCES public.species(id),
  post_id UUID NOT NULL REFERENCES public.posts(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(week_year, species_id)
);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Get current ISO week string (AEST)
CREATE OR REPLACE FUNCTION current_week_year()
RETURNS TEXT AS $$
  SELECT to_char(
    (now() AT TIME ZONE 'Australia/Sydney')::date,
    'IYYY-"W"IW'
  );
$$ LANGUAGE sql STABLE;

-- Fuzzy species search
CREATE OR REPLACE FUNCTION search_species(query TEXT, max_results INTEGER DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  scientific_name TEXT,
  common_names TEXT[],
  family TEXT,
  similarity REAL,
  matched_via TEXT
) AS $$
  SELECT DISTINCT ON (s.id)
    s.id,
    s.scientific_name,
    s.common_names,
    s.family,
    GREATEST(
      similarity(s.scientific_name, query),
      similarity(array_to_string(s.common_names, ' '), query),
      COALESCE(MAX(similarity(syn.synonym_name, query)), 0)
    ) AS similarity,
    CASE
      WHEN similarity(s.scientific_name, query) >= GREATEST(
        similarity(array_to_string(s.common_names, ' '), query),
        COALESCE(MAX(similarity(syn.synonym_name, query)), 0)
      ) THEN 'scientific'
      WHEN similarity(array_to_string(s.common_names, ' '), query) >= COALESCE(MAX(similarity(syn.synonym_name, query)), 0) THEN 'common'
      ELSE 'synonym'
    END AS matched_via
  FROM public.species s
  LEFT JOIN public.species_synonyms syn ON syn.species_id = s.id
  WHERE s.status = 'approved'
    AND (
      similarity(s.scientific_name, query) > 0.15
      OR similarity(array_to_string(s.common_names, ' '), query) > 0.15
      OR similarity(syn.synonym_name, query) > 0.15
    )
  GROUP BY s.id, s.scientific_name, s.common_names, s.family
  ORDER BY s.id, similarity DESC
  LIMIT max_results;
$$ LANGUAGE sql STABLE;

-- Get vote count for a post
CREATE OR REPLACE FUNCTION get_post_vote_count(target_post_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.votes WHERE post_id = target_post_id;
$$ LANGUAGE sql STABLE;

-- Atomic vote swap (delete old vote in same species+week, insert new)
CREATE OR REPLACE FUNCTION swap_vote(
  p_user_id UUID,
  p_new_post_id UUID,
  p_species_id INTEGER,
  p_week_year TEXT
) RETURNS VOID AS $$
BEGIN
  DELETE FROM public.votes
    WHERE user_id = p_user_id AND species_id = p_species_id AND week_year = p_week_year;
  INSERT INTO public.votes (user_id, post_id, species_id, week_year)
    VALUES (p_user_id, p_new_post_id, p_species_id, p_week_year);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species_synonyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_winners ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- SPECIES
CREATE POLICY "Approved species viewable by everyone"
  ON public.species FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can submit species"
  ON public.species FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own submissions"
  ON public.species FOR SELECT
  USING (submitted_by = auth.uid());

-- SYNONYMS
CREATE POLICY "Synonyms viewable by everyone"
  ON public.species_synonyms FOR SELECT USING (true);

-- POSTS
CREATE POLICY "Visible posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (is_hidden = FALSE AND is_removed = FALSE);

CREATE POLICY "Authenticated non-banned users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = user_id);

-- VOTES
CREATE POLICY "Votes are viewable by everyone"
  ON public.votes FOR SELECT USING (true);

CREATE POLICY "Authenticated non-banned users can vote"
  ON public.votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

CREATE POLICY "Users can remove own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- REPORTS
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view reports"
  ON public.reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- WEEKLY WINNERS
CREATE POLICY "Winners viewable by everyone"
  ON public.weekly_winners FOR SELECT USING (true);

-- ============================================================
-- STORAGE (run these after creating the post-images bucket)
-- ============================================================

-- Anyone can view images
CREATE POLICY "Public image access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete own images
CREATE POLICY "Users delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
