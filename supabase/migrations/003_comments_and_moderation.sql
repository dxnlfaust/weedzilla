-- ============================================================
-- PHASE 3: COMMENTS, REPORTING & MODERATION
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  report_count INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Non-hidden comments viewable by everyone"
  ON public.comments FOR SELECT
  USING (is_hidden = FALSE);

CREATE POLICY "Authenticated non-banned users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- COMMENT REPORTS
-- ============================================================
CREATE TABLE public.comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('harassment', 'spam', 'off_topic', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(reporter_id, comment_id)
);

ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Non-banned users can report comments"
  ON public.comment_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_id
    AND NOT EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

CREATE POLICY "Admins can view comment reports"
  ON public.comment_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- ============================================================
-- AUTO-HIDE TRIGGERS
-- ============================================================

-- Auto-hide posts after 3 reports
CREATE OR REPLACE FUNCTION auto_hide_reported_post()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts
  SET report_count = report_count + 1
  WHERE id = NEW.post_id;

  UPDATE public.posts
  SET is_hidden = TRUE
  WHERE id = NEW.post_id AND report_count >= 3;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_report
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION auto_hide_reported_post();

-- Auto-hide comments after 3 reports
CREATE OR REPLACE FUNCTION auto_hide_reported_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.comments
  SET report_count = report_count + 1
  WHERE id = NEW.comment_id;

  UPDATE public.comments
  SET is_hidden = TRUE
  WHERE id = NEW.comment_id AND report_count >= 3;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_report
  AFTER INSERT ON public.comment_reports
  FOR EACH ROW EXECUTE FUNCTION auto_hide_reported_comment();
