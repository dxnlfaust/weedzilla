-- ============================================================
-- WIN NOTIFICATIONS: Track which wins the user has been notified about
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add column to track when user was last notified of a win
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_notified_win_at TIMESTAMPTZ DEFAULT NULL;

-- Set existing users to now() so they don't get flooded with old win notifications
UPDATE public.profiles SET last_notified_win_at = now() WHERE last_notified_win_at IS NULL;

-- RPC to get unseen wins for a user
CREATE OR REPLACE FUNCTION get_unseen_wins(p_user_id UUID)
RETURNS TABLE (
  id INTEGER,
  week_year TEXT,
  post_type TEXT,
  place INTEGER,
  vote_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
  SELECT ww.id, ww.week_year, ww.post_type, ww.place, ww.vote_count, ww.created_at
  FROM public.weekly_winners ww
  JOIN public.profiles p ON p.id = p_user_id
  WHERE ww.user_id = p_user_id
    AND (p.last_notified_win_at IS NULL OR ww.created_at > p.last_notified_win_at)
  ORDER BY ww.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_unseen_wins(UUID) TO authenticated;
