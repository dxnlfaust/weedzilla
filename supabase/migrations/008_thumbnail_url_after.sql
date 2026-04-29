-- Add thumbnail_url_after for B&A post after-image thumbnails
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS thumbnail_url_after text;
