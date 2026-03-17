-- ============================================================
-- FEATURE UPDATE: B&A Posts, Simplified Voting, Unified Winners
-- Run this in Supabase SQL Editor
-- ============================================================

BEGIN;

-- ============================================================
-- VOTING: Remove per-species constraint, drop species_id
-- ============================================================
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_user_id_species_id_week_year_key;
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS votes_species_id_fkey;
ALTER TABLE public.votes DROP COLUMN IF EXISTS species_id;

-- Remove the swap_vote function (no longer needed)
DROP FUNCTION IF EXISTS swap_vote(UUID, UUID, INTEGER, TEXT);

-- ============================================================
-- POSTS: Add B&A support + view_count
-- ============================================================
ALTER TABLE public.posts ADD COLUMN post_type TEXT NOT NULL DEFAULT 'weed'
  CHECK (post_type IN ('weed', 'before_after'));

ALTER TABLE public.posts ADD COLUMN image_url_after TEXT;

-- Make species_id nullable (B&A posts can use site_description instead)
ALTER TABLE public.posts ALTER COLUMN species_id DROP NOT NULL;

ALTER TABLE public.posts ADD COLUMN site_description TEXT;

ALTER TABLE public.posts ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Validation: weed posts MUST have species_id; B&A posts need species_id OR site_description
ALTER TABLE public.posts ADD CONSTRAINT posts_type_validation CHECK (
  (post_type = 'weed' AND species_id IS NOT NULL)
  OR
  (post_type = 'before_after' AND (species_id IS NOT NULL OR site_description IS NOT NULL))
);

-- ============================================================
-- WEEKLY WINNERS: Restructure for unified top-3
-- ============================================================

-- Clear old per-species winner data (competition model is fundamentally different)
DELETE FROM public.weekly_winners;

-- Drop old constraints
ALTER TABLE public.weekly_winners DROP CONSTRAINT IF EXISTS weekly_winners_week_year_species_id_key;
ALTER TABLE public.weekly_winners DROP CONSTRAINT IF EXISTS weekly_winners_species_id_fkey;
ALTER TABLE public.weekly_winners DROP COLUMN IF EXISTS species_id;

-- Add new columns
ALTER TABLE public.weekly_winners ADD COLUMN post_type TEXT NOT NULL DEFAULT 'weed'
  CHECK (post_type IN ('weed', 'before_after'));
ALTER TABLE public.weekly_winners ADD COLUMN place INTEGER NOT NULL DEFAULT 1
  CHECK (place IN (1, 2, 3));

-- New unique constraint: one winner per place per type per week
ALTER TABLE public.weekly_winners ADD CONSTRAINT weekly_winners_week_type_place_key
  UNIQUE (week_year, post_type, place);

-- Reset all crown counts (old per-species wins are cleared)
UPDATE public.profiles SET crown_count = 0;

-- ============================================================
-- UPDATED process_weekly_winners FUNCTION
-- Now processes top-3 per post_type with underdog tiebreak
-- ============================================================
CREATE OR REPLACE FUNCTION process_weekly_winners(p_week_year TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_type TEXT;
  v_count INTEGER := 0;
BEGIN
  -- Process each post_type separately
  FOR v_type IN SELECT unnest(ARRAY['weed', 'before_after']) LOOP
    INSERT INTO public.weekly_winners (week_year, post_type, place, post_id, user_id, vote_count)
    WITH ranked AS (
      SELECT
        p.id          AS post_id,
        p.user_id,
        COUNT(v.id)   AS vote_count,
        p.view_count,
        p.created_at,
        ROW_NUMBER() OVER (
          ORDER BY COUNT(v.id) DESC, p.view_count ASC, p.created_at ASC
        ) AS rn
      FROM public.posts p
      LEFT JOIN public.votes v ON v.post_id = p.id
      WHERE p.week_year    = p_week_year
        AND p.post_type    = v_type
        AND p.is_hidden    = FALSE
        AND p.is_removed   = FALSE
      GROUP BY p.id, p.user_id, p.view_count, p.created_at
      HAVING COUNT(v.id) > 0
    )
    SELECT p_week_year, v_type, rn::INTEGER, post_id, user_id, vote_count::INTEGER
    FROM ranked
    WHERE rn <= 3
    ON CONFLICT (week_year, post_type, place) DO UPDATE
      SET post_id    = EXCLUDED.post_id,
          user_id    = EXCLUDED.user_id,
          vote_count = EXCLUDED.vote_count;
  END LOOP;

  -- Crown count = gold wins only (place = 1)
  UPDATE public.profiles
  SET crown_count = (
    SELECT COUNT(*)::INTEGER
    FROM public.weekly_winners
    WHERE user_id = profiles.id AND place = 1
  )
  WHERE id IN (
    SELECT DISTINCT user_id FROM public.weekly_winners WHERE week_year = p_week_year
  );

  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.weekly_winners WHERE week_year = p_week_year;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VIEW COUNT INCREMENT (fire-and-forget from post detail page)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_view_count(p_post_id UUID)
RETURNS VOID AS $$
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = p_post_id;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon, authenticated;

-- ============================================================
-- UPDATE WINNER POST DELETE TRIGGER for new schema
-- ============================================================
CREATE OR REPLACE FUNCTION handle_winner_post_deleted()
RETURNS TRIGGER AS $$
DECLARE
  v_ww RECORD;
  v_runner_post_id UUID;
  v_runner_user_id UUID;
  v_runner_vote_count INTEGER;
BEGIN
  FOR v_ww IN
    SELECT id, week_year, post_type, place, user_id
    FROM public.weekly_winners
    WHERE post_id = OLD.id
  LOOP
    -- Find runner-up: next best post not already a winner for this week+type
    SELECT p.id, p.user_id, COUNT(v.id)::INTEGER
    INTO v_runner_post_id, v_runner_user_id, v_runner_vote_count
    FROM public.posts p
    LEFT JOIN public.votes v ON v.post_id = p.id
    WHERE p.week_year = v_ww.week_year
      AND p.post_type = v_ww.post_type
      AND p.id != OLD.id
      AND p.is_hidden = FALSE
      AND p.is_removed = FALSE
      AND p.id NOT IN (
        SELECT post_id FROM public.weekly_winners
        WHERE week_year = v_ww.week_year AND post_type = v_ww.post_type
      )
    GROUP BY p.id, p.user_id, p.view_count, p.created_at
    HAVING COUNT(v.id) > 0
    ORDER BY COUNT(v.id) DESC, p.view_count ASC, p.created_at ASC
    LIMIT 1;

    IF v_runner_post_id IS NOT NULL THEN
      UPDATE public.weekly_winners
      SET post_id = v_runner_post_id,
          user_id = v_runner_user_id,
          vote_count = v_runner_vote_count
      WHERE id = v_ww.id;
    ELSE
      DELETE FROM public.weekly_winners WHERE id = v_ww.id;
    END IF;

    -- Recalc crowns for old winner (gold only)
    UPDATE public.profiles
    SET crown_count = (
      SELECT COUNT(*)::INTEGER FROM public.weekly_winners
      WHERE user_id = v_ww.user_id AND place = 1
    )
    WHERE id = v_ww.user_id;

    -- Recalc crowns for new winner (gold only)
    IF v_runner_user_id IS NOT NULL AND v_runner_user_id != v_ww.user_id THEN
      UPDATE public.profiles
      SET crown_count = (
        SELECT COUNT(*)::INTEGER FROM public.weekly_winners
        WHERE user_id = v_runner_user_id AND place = 1
      )
      WHERE id = v_runner_user_id;
    END IF;
  END LOOP;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
