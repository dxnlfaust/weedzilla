-- ============================================================
-- NOTIFICATIONS: In-app notification system
-- Run this in Supabase SQL Editor
-- ============================================================

BEGIN;

-- === Notifications table ===
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'win')),
  -- For comment notifications: links to the post that was commented on
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  -- For comment notifications: who left the comment
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Human-readable message
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

-- RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- === Trigger: notify post owner when someone comments ===
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner UUID;
  v_post_species TEXT;
  v_commenter_name TEXT;
BEGIN
  -- Get the post owner
  SELECT user_id INTO v_post_owner FROM public.posts WHERE id = NEW.post_id;

  -- Don't notify if user comments on their own post
  IF v_post_owner IS NULL OR v_post_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter display name
  SELECT display_name INTO v_commenter_name FROM public.profiles WHERE id = NEW.user_id;

  -- Get post species name for context
  SELECT s.scientific_name INTO v_post_species
  FROM public.posts p
  LEFT JOIN public.species s ON s.id = p.species_id
  WHERE p.id = NEW.post_id;

  INSERT INTO public.notifications (user_id, type, post_id, actor_id, message)
  VALUES (
    v_post_owner,
    'comment',
    NEW.post_id,
    NEW.user_id,
    COALESCE(v_commenter_name, 'Someone') || ' commented on your ' || COALESCE(v_post_species, 'post')
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_comment ON public.comments;
CREATE TRIGGER trg_notify_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- === Trigger: notify winners when weekly_winners are processed ===
CREATE OR REPLACE FUNCTION notify_on_win()
RETURNS TRIGGER AS $$
DECLARE
  v_place_label TEXT;
  v_type_label TEXT;
  v_week_label TEXT;
BEGIN
  -- Build human-readable labels
  v_place_label := CASE NEW.place
    WHEN 1 THEN 'Gold'
    WHEN 2 THEN 'Silver'
    WHEN 3 THEN 'Bronze'
    ELSE 'Place ' || NEW.place
  END;

  v_type_label := CASE NEW.post_type
    WHEN 'weed' THEN 'Weed of the Week'
    WHEN 'before_after' THEN 'B&A of the Week'
    ELSE NEW.post_type
  END;

  -- Parse week_year (e.g., "2026-W12") into readable form
  v_week_label := 'Week ' || LTRIM(SPLIT_PART(NEW.week_year, 'W', 2), '0') || ', ' || SPLIT_PART(NEW.week_year, '-', 1);

  INSERT INTO public.notifications (user_id, type, post_id, message)
  VALUES (
    NEW.user_id,
    'win',
    NEW.post_id,
    v_place_label || ' — ' || v_type_label || '! Congratulations for ' || v_week_label || '.'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_win ON public.weekly_winners;
CREATE TRIGGER trg_notify_on_win
  AFTER INSERT ON public.weekly_winners
  FOR EACH ROW EXECUTE FUNCTION notify_on_win();

-- === RPC: get unread notification count ===
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.notifications
  WHERE user_id = p_user_id AND is_read = FALSE;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;

-- === RPC: mark all notifications as read ===
CREATE OR REPLACE FUNCTION mark_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
  UPDATE public.notifications SET is_read = TRUE
  WHERE user_id = p_user_id AND is_read = FALSE;
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_notifications_read(UUID) TO authenticated;

COMMIT;
