-- ============================================================
-- PHASE 2: WEEKLY WINNER FUNCTIONS
-- Run this in Supabase SQL Editor after 001_initial_schema.sql
-- ============================================================

-- Returns the previous ISO week string in AEST
-- (When called on Monday, returns the week that just ended)
CREATE OR REPLACE FUNCTION get_previous_week_year()
RETURNS TEXT AS $$
  SELECT to_char(
    ((now() AT TIME ZONE 'Australia/Sydney')::date - INTERVAL '7 days'),
    'IYYY-"W"IW'
  );
$$ LANGUAGE sql STABLE;

-- Calculates and records weekly winners for a given week.
-- - Finds the most-voted post per species (min 1 vote)
-- - Tie-break: earliest created_at
-- - Upserts into weekly_winners (idempotent)
-- - Recalculates crown_count for all winning users (not an increment, so re-runs are safe)
-- - Returns the number of winners recorded
CREATE OR REPLACE FUNCTION process_weekly_winners(p_week_year TEXT)
RETURNS INTEGER AS $$
BEGIN
  INSERT INTO public.weekly_winners (week_year, species_id, post_id, user_id, vote_count)
  WITH ranked AS (
    SELECT
      p.species_id,
      p.id          AS post_id,
      p.user_id,
      COUNT(v.id)   AS vote_count,
      ROW_NUMBER() OVER (
        PARTITION BY p.species_id
        ORDER BY COUNT(v.id) DESC, p.created_at ASC
      ) AS rn
    FROM public.posts p
    LEFT JOIN public.votes v ON v.post_id = p.id
    WHERE p.week_year    = p_week_year
      AND p.is_hidden    = FALSE
      AND p.is_removed   = FALSE
    GROUP BY p.species_id, p.id, p.user_id, p.created_at
    HAVING COUNT(v.id) > 0
  )
  SELECT p_week_year, species_id, post_id, user_id, vote_count::INTEGER
  FROM ranked
  WHERE rn = 1
  ON CONFLICT (week_year, species_id) DO UPDATE
    SET post_id    = EXCLUDED.post_id,
        user_id    = EXCLUDED.user_id,
        vote_count = EXCLUDED.vote_count;

  -- Recalculate crown_count from total wins (idempotent — COUNT not increment)
  UPDATE public.profiles
  SET crown_count = (
    SELECT COUNT(*)::INTEGER
    FROM public.weekly_winners
    WHERE user_id = profiles.id
  )
  WHERE id IN (
    SELECT DISTINCT user_id FROM public.weekly_winners WHERE week_year = p_week_year
  );

  RETURN (
    SELECT COUNT(*)::INTEGER FROM public.weekly_winners WHERE week_year = p_week_year
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restrict to service_role only (called via protected API route)
REVOKE EXECUTE ON FUNCTION process_weekly_winners(TEXT) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION process_weekly_winners(TEXT) TO service_role;
