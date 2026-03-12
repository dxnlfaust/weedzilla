# WeedZilla — Development Specification

## Project Overview

**WeedZilla** is a web-based image forum for bush regenerators, conservationists, and land managers to share photos of weeds they've removed and compete in weekly voting competitions by species category.

**Core loop:** A user removes a weed → photographs it → uploads the image → tags the species → other users vote → weekly winners are crowned per species category → winners appear on the dashboard and earn profile badges.

**Tech stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (Auth, Database, Storage, Edge Functions).

---

## Phase Plan

### Phase 1 — MVP (BUILD THIS NOW)
- Supabase project setup: Auth, Database schema, Storage buckets, RLS policies
- User registration/login (email + password, email verification required)
- User profile (display name, avatar, crown count)
- Image upload with species tagging (fuzzy search, autocomplete)
- Species list with synonyms support
- Voting (one vote per user per species per week)
- Feed: homepage showing most-voted posts from the current week
- Species category pages
- Responsive web design (mobile-first)

### Phase 2 — Weekly Competition System
- Scheduled Edge Function (runs Monday 00:05 AEST) to calculate weekly winners per species
- Weekly Winners table population
- Dashboard "Winners" banner/carousel on homepage
- Crown count increment on winner profiles
- Crown badge display on profiles and next to usernames
- Historical winners archive page
- Week-over-week stats

### Phase 3 — Moderation & Anti-Abuse
- Report button on posts (reason selection: NSFW, off-topic, spam, other)
- Admin moderation queue (approve/remove post, warn/ban user)
- Auto-hide posts after N reports (threshold: 3)
- Rate limiting: new accounts capped at 3 posts/day for first 7 days
- User banning (soft ban — account disabled, posts hidden)
- Optional: automated image moderation via external API on upload

### Phase 4 — Polish & PWA
- PWA manifest + service worker (installable, offline shell)
- Image optimization pipeline (auto-generate thumbnail 400px, display 1200px, WebP)
- Push notifications for winners
- "Other" species admin workflow (pending species queue, approve/merge/reject)
- Social share buttons (share winning post to socials)
- SEO: public species category pages with meta tags
- Leaderboard page (top users by crown count, top species by post volume)

---

## Design System

### Typography
- **Primary font:** Inter (import from Google Fonts)
- Headings: Inter SemiBold (600) or Bold (700)
- Body: Inter Regular (400)
- Captions/metadata: Inter Regular (400), smaller size, muted color

### Color Palette

| Token              | Hex       | Usage                                              |
|--------------------|-----------|-----------------------------------------------------|
| `eucalypt`         | `#2D6A4F` | Primary brand color, buttons, active states, links  |
| `eucalypt-light`   | `#40916C` | Hover states, secondary accents                     |
| `eucalypt-dark`    | `#1B4332` | Dark accents, header backgrounds                    |
| `red`              | `#E63946` | Destructive actions, report/flag, error states      |
| `white`            | `#FFFFFF` | Backgrounds, card surfaces                          |
| `carbon`           | `#222222` | Primary text, headings                              |
| `grey-500`         | `#6B7280` | Secondary text, metadata, placeholders              |
| `grey-200`         | `#E5E7EB` | Borders, dividers, input outlines                   |
| `grey-100`         | `#F3F4F6` | Page background, subtle card backgrounds            |
| `gold`             | `#F59E0B` | Crown/winner badge accent                           |

### Style Principles
- **Sleek, minimal, modern.** Generous whitespace. No gradients, no drop shadows on cards (use subtle borders or elevation via `ring-1`). Clean lines.
- Border radius: `rounded-lg` (8px) for cards, `rounded-full` for avatars and badges.
- Image cards: square aspect ratio thumbnails in grids, full-width on detail view.
- Icons: Lucide React icons only.
- Transitions: `transition-colors duration-150` on interactive elements.
- Mobile-first responsive: single-column on mobile, 2-col on `md`, 3-col on `lg` for image grids.

### Component Style Guide

**Buttons**
- Primary: `bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-4 py-2 font-medium`
- Secondary/outline: `border border-eucalypt text-eucalypt hover:bg-eucalypt hover:text-white rounded-lg px-4 py-2`
- Destructive: `bg-red text-white hover:bg-red/90 rounded-lg px-4 py-2`
- Disabled: `opacity-50 cursor-not-allowed`

**Cards (Post cards)**
- White background, `border border-grey-200 rounded-lg overflow-hidden`
- Image fills top of card (aspect-square, object-cover)
- Below image: species name (scientific, italic), user display name, vote count, vote button
- Vote button: heart icon from Lucide, filled red when voted, outline when not

**Navigation**
- Top nav bar: `bg-eucalypt-dark text-white`, logo left, nav links center, avatar/auth right
- Mobile: hamburger menu or bottom tab bar

**Forms/Inputs**
- `border border-grey-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none`
- Labels: `text-sm font-medium text-carbon mb-1`

---

## Database Schema (Supabase / PostgreSQL)

### Extensions Required
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- fuzzy text search
CREATE EXTENSION IF NOT EXISTS moddatetime;  -- auto-update updated_at
```

### Tables

```sql
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

-- Trigger: auto-create profile on signup
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

-- Trigram index for fuzzy search on scientific name
CREATE INDEX idx_species_scientific_trgm ON public.species
  USING GIN (scientific_name gin_trgm_ops);

-- Trigram index on common names (cast array to text for searching)
CREATE INDEX idx_species_common_trgm ON public.species
  USING GIN (array_to_string(common_names, ' ') gin_trgm_ops);

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

-- Trigram index on synonym names for fuzzy search
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
  week_year TEXT NOT NULL,  -- ISO week: '2025-W12'
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

  -- One vote per user per post
  UNIQUE(user_id, post_id),
  -- One vote per user per species per week
  UNIQUE(user_id, species_id, week_year)
);

CREATE INDEX idx_votes_post ON public.votes(post_id);

-- ============================================================
-- REPORTS (Phase 3, but create table now)
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

  -- One report per user per post
  UNIQUE(reporter_id, post_id)
);

-- ============================================================
-- WEEKLY WINNERS (Phase 2, but create table now)
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
```

### Helper Functions

```sql
-- Get current ISO week string (AEST)
CREATE OR REPLACE FUNCTION current_week_year()
RETURNS TEXT AS $$
  SELECT to_char(
    (now() AT TIME ZONE 'Australia/Sydney')::date,
    'IYYY-"W"IW'
  );
$$ LANGUAGE sql STABLE;

-- Fuzzy species search: searches scientific name, common names, AND synonyms
-- Returns approved species, ordered by similarity
CREATE OR REPLACE FUNCTION search_species(query TEXT, max_results INTEGER DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  scientific_name TEXT,
  common_names TEXT[],
  family TEXT,
  similarity REAL,
  matched_via TEXT  -- 'scientific', 'common', 'synonym'
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
```

### Row Level Security Policies

```sql
-- Enable RLS on all tables
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
```

### Storage Buckets

```sql
-- Create bucket for post images
-- In Supabase dashboard or via API:
-- Bucket name: 'post-images'
-- Public: true (images are publicly viewable)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/heic
```

Storage RLS:
```sql
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
```

Image upload path convention: `post-images/{user_id}/{timestamp}-{random}.{ext}`

---

## Project Structure

```
weedzilla/
├── public/
│   ├── favicon.ico
│   └── manifest.json            # (Phase 4 PWA)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout: font, nav, providers
│   │   ├── page.tsx             # Homepage: trending posts feed
│   │   ├── globals.css          # Tailwind base + custom properties
│   │   ├── login/
│   │   │   └── page.tsx         # Login form
│   │   ├── signup/
│   │   │   └── page.tsx         # Signup form
│   │   ├── profile/
│   │   │   ├── page.tsx         # Own profile (edit mode)
│   │   │   └── [userId]/
│   │   │       └── page.tsx     # Public profile view
│   │   ├── upload/
│   │   │   └── page.tsx         # Upload post + tag species
│   │   ├── post/
│   │   │   └── [postId]/
│   │   │       └── page.tsx     # Single post detail + vote
│   │   ├── species/
│   │   │   ├── page.tsx         # Browse all species categories
│   │   │   └── [speciesId]/
│   │   │       └── page.tsx     # Species category: all posts for this species
│   │   └── admin/               # (Phase 3)
│   │       ├── reports/
│   │       │   └── page.tsx
│   │       └── species/
│   │           └── page.tsx     # Manage pending species
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthGuard.tsx    # Redirect if not logged in
│   │   ├── posts/
│   │   │   ├── PostCard.tsx     # Image card with vote button
│   │   │   ├── PostGrid.tsx     # Responsive grid of PostCards
│   │   │   ├── PostDetail.tsx   # Full post view
│   │   │   └── UploadForm.tsx   # Image upload + species select
│   │   ├── species/
│   │   │   ├── SpeciesSearch.tsx     # Fuzzy search combobox
│   │   │   ├── SpeciesBadge.tsx      # Pill showing species name
│   │   │   └── SpeciesGrid.tsx       # Grid of species categories
│   │   ├── voting/
│   │   │   └── VoteButton.tsx        # Heart icon, toggle vote
│   │   ├── profile/
│   │   │   ├── ProfileHeader.tsx     # Avatar, name, crowns
│   │   │   ├── ProfileEditForm.tsx
│   │   │   └── CrownBadge.tsx        # Crown icon + count
│   │   ├── winners/                  # (Phase 2)
│   │   │   ├── WinnerBanner.tsx
│   │   │   └── WinnerCard.tsx
│   │   └── moderation/              # (Phase 3)
│   │       ├── ReportButton.tsx
│   │       └── ReportQueue.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts        # Browser Supabase client
│   │   │   ├── server.ts        # Server-side Supabase client
│   │   │   └── middleware.ts    # Auth middleware for protected routes
│   │   ├── utils/
│   │   │   ├── weekYear.ts      # ISO week calculation helpers
│   │   │   ├── imageUpload.ts   # Handle upload to Supabase Storage
│   │   │   └── formatters.ts    # Date, number formatting
│   │   └── types/
│   │       └── database.ts      # Generated Supabase types
│   └── hooks/
│       ├── useAuth.ts           # Auth state hook
│       ├── useVote.ts           # Vote toggle logic
│       └── useSpeciesSearch.ts  # Debounced fuzzy search hook
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # All tables, functions, RLS
│   ├── seed.sql                     # Initial species data
│   └── functions/                   # (Phase 2) Edge Functions
│       └── calculate-winners/
│           └── index.ts
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## Phase 1 Implementation Details

### 1. Project Setup

```bash
npx create-next-app@latest weedzilla --typescript --tailwind --eslint --app --src-dir
cd weedzilla
npm install @supabase/supabase-js @supabase/ssr lucide-react
npm install -D supabase
```

**tailwind.config.ts** — extend with custom colors:
```typescript
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    colors: {
      eucalypt: {
        DEFAULT: '#2D6A4F',
        light: '#40916C',
        dark: '#1B4332',
      },
      red: {
        DEFAULT: '#E63946',
      },
      carbon: '#222222',
      gold: '#F59E0B',
    },
  },
},
```

**Environment variables** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Authentication Flow

- Use Supabase Auth with `@supabase/ssr` for server-side session management.
- Signup: email, password, display_name (passed in `raw_user_meta_data`). Sends verification email.
- Login: email + password. Redirect to homepage on success.
- Middleware (`src/lib/supabase/middleware.ts`): refresh session on every request. Protect `/upload`, `/profile` routes — redirect to `/login` if unauthenticated.
- Show auth state in Navbar: logged out = Login/Signup buttons, logged in = avatar dropdown with Profile, Upload, Logout.

### 3. Species Search Component (`SpeciesSearch.tsx`)

This is a critical UX component. Implementation:

- Headless UI `Combobox` (or build custom with Downshift).
- On input change (debounced 250ms), call the `search_species` Supabase RPC function.
- Display results in dropdown: scientific name in italics, common name(s) in regular text, "matched via synonym" indicator if relevant.
- If no results, show option: "Can't find your species? Submit '[typed text]' as a new entry" — this creates a species record with `status: 'pending'` and `submitted_by: current_user`.
- Minimum 2 characters before searching.
- Selected species returns the `species_id` to the parent form.

Example search UX:
```
User types: "turkey rhu"
Dropdown shows:
  Acetosa sagittata (Turkey rhubarb) — matched via common name
  Rumex sagittatus — matched via synonym [formerly Rumex sagittatus]
```

### 4. Image Upload Flow

1. User navigates to `/upload` (auth required).
2. Form fields: image file input (with drag-and-drop zone), species search combobox, optional caption (max 280 chars).
3. Client-side validation: file type (JPEG, PNG, WebP, HEIC), file size (max 10MB), image dimensions (warn if < 400px on either side).
4. On submit:
   a. Upload image to Supabase Storage at `post-images/{user_id}/{Date.now()}-{randomId}.{ext}`.
   b. Get public URL from storage.
   c. Calculate `week_year` using the `weekYear.ts` helper (ISO week in AEST timezone).
   d. Insert row into `posts` table with `user_id`, `species_id`, `image_url`, `caption`, `week_year`.
   e. Redirect to the new post's detail page.
5. Show upload progress indicator.

### 5. Feed / Homepage

- Query: all posts from the current `week_year`, ordered by vote count descending, then `created_at` descending.
- Use a Supabase query that joins posts with species and profiles, and includes a vote count subquery.
- Render as `PostGrid` → `PostCard` components.
- Each PostCard shows: thumbnail image, species scientific name (italic), species common name, uploader's display name, vote count, vote button (heart).
- Pagination: infinite scroll or "Load more" button, 20 posts per page.
- Above the grid: a simple filter bar — "This Week" (default) | "All Time" toggle. "This Week" shows current week_year. "All Time" shows all posts sorted by vote count.

### 6. Species Category Page (`/species/[speciesId]`)

- Header: species scientific name (large, italic), common names, family.
- Below: grid of all posts tagged with this species, current week first, sorted by votes.
- Users can vote here. Each user gets ONE vote per species per week (enforced by the unique constraint). If they vote for a different post in the same species+week, the old vote is removed and the new one is placed. The UI should make this clear: "You've voted for [post] this week. Voting for this one will move your vote."

### 7. Voting Logic (`useVote` hook)

```
Toggle vote:
1. Check if user already voted for this post → if yes, remove vote (DELETE from votes).
2. Check if user already voted for another post in the same species+week → if yes, show confirmation, then DELETE old vote and INSERT new vote.
3. Otherwise, INSERT new vote.
4. Optimistically update UI (increment/decrement vote count, toggle heart fill).
5. Revalidate on error.
```

### 8. Profile Page

**Own profile (`/profile`):**
- Display name (editable), avatar (upload/change), email (read-only).
- Crown count display with CrownBadge component.
- Grid of user's own posts (all time), with edit/delete options.

**Public profile (`/profile/[userId]`):**
- Display name, avatar, crown count, join date.
- Grid of user's posts.

### 9. Week Calculation Utility

All week boundaries are in AEST (Australia/Sydney timezone). Use a shared utility:

```typescript
// src/lib/utils/weekYear.ts
// Returns ISO week string like '2025-W12'
// Uses AEST timezone for all calculations
// Week starts Monday, ends Sunday 23:59:59 AEST
// Voting for a week closes Sunday 23:59:59 AEST
```

This is critical for consistency — server and client must agree on what "this week" means.

---

## Seed Data: Initial Species List

Seed the database with the top ~100 environmental weeds common to Australian bush regeneration. Include scientific name, common name(s), and family. Here are some to start with — **expand this to at least 100 species**:

```sql
INSERT INTO public.species (scientific_name, common_names, family, status) VALUES
('Acetosa sagittata', ARRAY['Turkey rhubarb', 'Rambling dock'], 'Polygonaceae', 'approved'),
('Lantana camara', ARRAY['Lantana', 'Common lantana'], 'Verbenaceae', 'approved'),
('Ligustrum sinense', ARRAY['Small-leaved privet'], 'Oleaceae', 'approved'),
('Ligustrum lucidum', ARRAY['Large-leaved privet', 'Glossy privet'], 'Oleaceae', 'approved'),
('Cinnamomum camphora', ARRAY['Camphor laurel'], 'Lauraceae', 'approved'),
('Olea europaea subsp. cuspidata', ARRAY['African olive'], 'Oleaceae', 'approved'),
('Asparagus aethiopicus', ARRAY['Asparagus fern', 'Ground asparagus'], 'Asparagaceae', 'approved'),
('Anredera cordifolia', ARRAY['Madeira vine'], 'Basellaceae', 'approved'),
('Tradescantia fluminensis', ARRAY['Wandering trad', 'Wandering Jew'], 'Commelinaceae', 'approved'),
('Ipomoea cairica', ARRAY['Coastal morning glory', 'Mile-a-minute'], 'Convolvulaceae', 'approved'),
('Ipomoea indica', ARRAY['Blue morning glory'], 'Convolvulaceae', 'approved'),
('Ochna serrulata', ARRAY['Mickey Mouse plant', 'Ochna'], 'Ochnaceae', 'approved'),
('Senna pendula', ARRAY['Cassia', 'Easter cassia', 'Senna'], 'Fabaceae', 'approved'),
('Erythrina crista-galli', ARRAY['Cockspur coral tree'], 'Fabaceae', 'approved'),
('Solanum mauritianum', ARRAY['Wild tobacco', 'Tobacco bush'], 'Solanaceae', 'approved'),
('Chrysanthemoides monilifera', ARRAY['Bitou bush', 'Boneseed'], 'Asteraceae', 'approved'),
('Rubus fruticosus agg.', ARRAY['Blackberry'], 'Rosaceae', 'approved'),
('Genista monspessulana', ARRAY['Montpellier broom', 'Cape broom'], 'Fabaceae', 'approved'),
('Cytisus scoparius', ARRAY['Scotch broom', 'English broom'], 'Fabaceae', 'approved'),
('Ludwigia peruviana', ARRAY['Ludwigia', 'Water primrose'], 'Onagraceae', 'approved'),
('Salvinia molesta', ARRAY['Salvinia', 'Giant salvinia'], 'Salviniaceae', 'approved'),
('Eichhornia crassipes', ARRAY['Water hyacinth'], 'Pontederiaceae', 'approved'),
('Ageratina adenophora', ARRAY['Crofton weed'], 'Asteraceae', 'approved'),
('Bidens pilosa', ARRAY['Cobblers pegs', 'Farmers friend'], 'Asteraceae', 'approved'),
('Conyza bonariensis', ARRAY['Flaxleaf fleabane'], 'Asteraceae', 'approved'),
('Ehrharta erecta', ARRAY['Panic veldtgrass', 'Ehrharta'], 'Poaceae', 'approved'),
('Chloris gayana', ARRAY['Rhodes grass'], 'Poaceae', 'approved'),
('Araujia sericifera', ARRAY['Moth vine', 'Cruel vine'], 'Apocynaceae', 'approved'),
('Cardiospermum grandiflorum', ARRAY['Balloon vine'], 'Sapindaceae', 'approved'),
('Delairea odorata', ARRAY['Cape ivy'], 'Asteraceae', 'approved'),
('Ricinus communis', ARRAY['Castor oil plant'], 'Euphorbiaceae', 'approved'),
('Schinus terebinthifolia', ARRAY['Brazilian pepper tree'], 'Anacardiaceae', 'approved');

-- Key synonyms
INSERT INTO public.species_synonyms (species_id, synonym_name, synonym_type) VALUES
((SELECT id FROM species WHERE scientific_name = 'Acetosa sagittata'), 'Rumex sagittatus', 'scientific'),
((SELECT id FROM species WHERE scientific_name = 'Tradescantia fluminensis'), 'Tradescantia albiflora', 'scientific'),
((SELECT id FROM species WHERE scientific_name = 'Chrysanthemoides monilifera'), 'Chrysanthemoides monilifera subsp. rotundata', 'scientific'),
((SELECT id FROM species WHERE scientific_name = 'Eichhornia crassipes'), 'Pontederia crassipes', 'scientific'),
((SELECT id FROM species WHERE scientific_name = 'Asparagus aethiopicus'), 'Asparagus densiflorus', 'scientific'),
((SELECT id FROM species WHERE scientific_name = 'Delairea odorata'), 'Senecio mikanioides', 'scientific');
```

**Expand the seed data to at least 100 species.** Use the NSW WeedWise list as a reference. Include major weeds from these categories: vines/scramblers, trees/shrubs, aquatic, grasses, herbaceous. Include known synonyms where nomenclature has recently changed.

---

## Key Implementation Notes

### Image Storage Pattern
Upload path: `post-images/{user_id}/{timestamp}-{nanoid}.{ext}`
Public URL: `{SUPABASE_URL}/storage/v1/object/public/post-images/{path}`
For Phase 1, store only the original image. Phase 4 adds thumbnail/display size generation.

### Supabase Client Setup
Use `@supabase/ssr` with Next.js App Router pattern:
- `createBrowserClient()` for client components
- `createServerClient()` for server components and route handlers
- Middleware to refresh auth tokens

### Responsive Breakpoints
Follow Tailwind defaults:
- Mobile: single column grid, full-width cards
- `md` (768px): 2-column grid
- `lg` (1024px): 3-column grid
- `xl` (1280px): 3-column grid with max-width container

### Error Handling
- All Supabase queries should handle errors gracefully with user-facing toast notifications.
- Use a toast library (e.g., `sonner`) for non-blocking notifications.
- Form validation: inline error messages below fields, red border on invalid inputs.

### Accessibility
- All images must have alt text (default: "{species_name} removed by {display_name}").
- Vote button: proper aria-label reflecting state ("Vote for this post" / "Remove your vote").
- Keyboard navigable: combobox, buttons, links.
- Color contrast: all text meets WCAG AA against its background.

---

## What NOT to Build in Phase 1

- No automated image moderation (Phase 3)
- No push notifications (Phase 4)
- No PWA/service worker (Phase 4)
- No image resizing/thumbnail generation (Phase 4, serve originals for now)
- No admin panel (Phase 3, manage via Supabase dashboard for now)
- No social sharing (Phase 4)
- No leaderboard page (Phase 4)
- No winner calculation/display (Phase 2)
- No email notifications

---

## Getting Started Checklist

1. Create Supabase project at supabase.com
2. Run the migration SQL to create all tables, functions, indexes, and RLS policies
3. Run the seed SQL to populate the initial species list
4. Create the `post-images` storage bucket with public access
5. Scaffold the Next.js project with the directory structure above
6. Implement auth flow (signup → verify email → login → session management)
7. Build SpeciesSearch component with fuzzy search
8. Build upload flow (image + species tag + caption)
9. Build homepage feed (current week posts sorted by votes)
10. Build species category page
11. Build voting logic with optimistic UI
12. Build profile pages
13. Style everything per the design system
14. Test on mobile viewport
