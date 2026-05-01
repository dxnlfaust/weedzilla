"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updatePost(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const postId = String(formData.get("post_id"));
  const speciesIdRaw = formData.get("species_id");
  const speciesId = speciesIdRaw ? Number(speciesIdRaw) : null;
  const caption = String(formData.get("caption") || "").trim() || null;
  const siteDescription = String(formData.get("site_description") || "").trim() || null;

  // .eq("user_id") ensures users can only edit their own posts even if RLS is misconfigured
  const { error } = await supabase
    .from("posts")
    .update({ species_id: speciesId, caption, site_description: siteDescription })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath(`/post/${postId}`);
  return {};
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) return { error: error.message };

  // Sign out the session after deletion
  await supabase.auth.signOut();

  return {};
}
