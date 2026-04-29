import { createClient } from "@/lib/supabase/client";
import { resizeImageToBlob } from "./imageResize";

export interface UploadedImageUrls {
  displayUrl: string;
  thumbUrl: string;
}

export async function uploadPostImage(
  file: File,
  userId: string
): Promise<UploadedImageUrls> {
  const supabase = createClient();
  const id = crypto.randomUUID();

  const [displayBlob, thumbBlob] = await Promise.all([
    resizeImageToBlob(file, 1200, 0.8),
    resizeImageToBlob(file, 400, 0.7),
  ]);

  const displayPath = `${userId}/${id}-display.jpg`;
  const thumbPath = `${userId}/${id}-thumb.jpg`;

  const [{ error: displayError }, { error: thumbError }] = await Promise.all([
    supabase.storage
      .from("post-images")
      .upload(displayPath, displayBlob, { contentType: "image/jpeg" }),
    supabase.storage
      .from("post-images")
      .upload(thumbPath, thumbBlob, { contentType: "image/jpeg" }),
  ]);

  if (displayError) throw displayError;
  if (thumbError) throw thumbError;

  const displayUrl = supabase.storage
    .from("post-images")
    .getPublicUrl(displayPath).data.publicUrl;
  const thumbUrl = supabase.storage
    .from("post-images")
    .getPublicUrl(thumbPath).data.publicUrl;

  return { displayUrl, thumbUrl };
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function validateImageFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "File type not supported. Please upload JPEG, PNG, WebP, or HEIC.",
    };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: "File size must be under 10MB." };
  }
  return { valid: true };
}
