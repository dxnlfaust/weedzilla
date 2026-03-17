/**
 * Image URL helpers.
 *
 * Supabase Storage transforms require the Pro plan ($25/mo).
 * For now these are pass-through — when you upgrade, flip
 * ENABLE_TRANSFORMS to true and the resize URLs will kick in.
 */

const ENABLE_TRANSFORMS = false;

const SUPABASE_STORAGE_PATH = "/storage/v1/object/public/";
const SUPABASE_RENDER_PATH = "/storage/v1/render/image/public/";

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export function getOptimizedUrl(
  url: string | null | undefined,
  options: ImageTransformOptions
): string {
  if (!url) return "";
  if (!ENABLE_TRANSFORMS) return url;
  if (!url.includes(SUPABASE_STORAGE_PATH)) return url;

  const transformed = url.replace(SUPABASE_STORAGE_PATH, SUPABASE_RENDER_PATH);
  const params = new URLSearchParams();
  if (options.width) params.set("width", String(options.width));
  if (options.height) params.set("height", String(options.height));
  if (options.quality) params.set("quality", String(options.quality));

  return `${transformed}?${params.toString()}`;
}

// Presets — currently pass-through, will resize when ENABLE_TRANSFORMS = true
export const thumbnail = (url: string | null | undefined) =>
  getOptimizedUrl(url, { width: 400 });

export const display = (url: string | null | undefined) =>
  getOptimizedUrl(url, { width: 1200 });

export const avatarSm = (url: string | null | undefined) =>
  getOptimizedUrl(url, { width: 64 });

export const avatarMd = (url: string | null | undefined) =>
  getOptimizedUrl(url, { width: 128 });
