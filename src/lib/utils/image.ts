/**
 * Supabase Storage image optimization via render transforms.
 * Falls back to original URL if the URL is not a Supabase storage URL.
 * Requires Supabase Pro plan for transforms to work — original URL is safe fallback.
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
}

const SUPABASE_STORAGE_PATH = "/storage/v1/object/public/";
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

export function getOptimizedUrl(
  url: string | null | undefined,
  options: ImageTransformOptions
): string {
  if (!url) return "";
  if (!url.includes(SUPABASE_STORAGE_PATH)) return url;

  const transformed = url.replace(SUPABASE_STORAGE_PATH, SUPABASE_RENDER_PATH);
  const params = new URLSearchParams();
  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));
  if (options.quality) params.set("quality", String(options.quality));

  return `${transformed}?${params.toString()}`;
}

// Presets
export const thumbnail = (url: string | null | undefined) =>
  getOptimizedUrl(url, { width: 400 });

export const display = (url: string | null | undefined) =>
  getOptimizedUrl(url, { width: 1200 });

export const avatarSm = (url: string | null | undefined) =>
  getOptimizedUrl(url, { width: 64 });

export const avatarMd = (url: string | null | undefined) =>
  getOptimizedUrl(url, { width: 128 });
