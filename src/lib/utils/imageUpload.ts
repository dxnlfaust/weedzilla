import { createClient } from "@/lib/supabase/client";

export async function uploadPostImage(
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(filePath, file, { contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
];
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
