-- ============================================================
-- ADMIN RLS POLICIES
-- Run this in Supabase SQL Editor
-- ============================================================
--
-- To grant yourself admin access, run:
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
-- Never do this through the app UI — SQL editor only.
-- ============================================================

BEGIN;

-- Helper function: true if the current user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_admin_or_mod()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: true only for admin (not moderator)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- === SPECIES ===
-- Admins/mods can see all species (including pending/rejected)
CREATE POLICY "Admins can view all species"
  ON public.species FOR SELECT
  USING (public.is_admin_or_mod());

-- Admins/mods can update species (approve, reject, edit)
CREATE POLICY "Admins can update species"
  ON public.species FOR UPDATE
  USING (public.is_admin_or_mod())
  WITH CHECK (public.is_admin_or_mod());

-- === POSTS ===
-- Admins/mods can see all posts (including hidden/removed)
CREATE POLICY "Admins can view all posts"
  ON public.posts FOR SELECT
  USING (public.is_admin_or_mod());

-- Admins/mods can update posts (hide, remove)
CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE
  USING (public.is_admin_or_mod())
  WITH CHECK (public.is_admin_or_mod());

-- === COMMENTS ===
-- Admins/mods can see all comments (including hidden)
CREATE POLICY "Admins can view all comments"
  ON public.comments FOR SELECT
  USING (public.is_admin_or_mod());

-- Admins/mods can update comments (hide)
CREATE POLICY "Admins can update comments"
  ON public.comments FOR UPDATE
  USING (public.is_admin_or_mod())
  WITH CHECK (public.is_admin_or_mod());

-- === REPORTS ===
-- Admins/mods can update report status
CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (public.is_admin_or_mod())
  WITH CHECK (public.is_admin_or_mod());

-- === COMMENT REPORTS ===
-- Admins/mods can update comment report status
CREATE POLICY "Admins can update comment reports"
  ON public.comment_reports FOR UPDATE
  USING (public.is_admin_or_mod())
  WITH CHECK (public.is_admin_or_mod());

-- === PROFILES ===
-- Admins can update any profile (ban/unban, role changes)
-- Note: The existing "Users can update own profile" policy also applies (OR logic)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

COMMIT;
