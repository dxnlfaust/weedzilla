"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Re-usable admin check — throws if caller is not an admin. */
async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");

  return user.id;
}

// ============================================================
// SPECIES
// ============================================================

export async function approveSpecies(formData: FormData) {
  const adminId = await requireAdmin();
  const id = Number(formData.get("id"));
  const scientificName = String(formData.get("scientific_name")).trim();
  const family = String(formData.get("family") || "").trim() || null;
  const commonNamesRaw = String(formData.get("common_names") || "").trim();
  const commonNames = commonNamesRaw
    ? commonNamesRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  if (!scientificName) return;

  const supabase = createAdminClient();
  await supabase
    .from("species")
    .update({
      status: "approved",
      scientific_name: scientificName,
      family: family,
      common_names: commonNames,
    })
    .eq("id", id);

  void adminId;
  revalidatePath("/admin");
}

export async function rejectSpecies(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));

  const supabase = createAdminClient();
  await supabase.from("species").update({ status: "rejected" }).eq("id", id);

  revalidatePath("/admin");
}

// ============================================================
// POST REPORTS
// ============================================================

export async function dismissPostReport(formData: FormData) {
  const adminId = await requireAdmin();
  const reportId = String(formData.get("report_id"));

  const supabase = createAdminClient();
  await supabase
    .from("reports")
    .update({
      status: "dismissed",
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  revalidatePath("/admin");
}

export async function hidePostFromReport(formData: FormData) {
  const adminId = await requireAdmin();
  const reportId = String(formData.get("report_id"));
  const postId = String(formData.get("post_id"));

  const supabase = createAdminClient();
  await Promise.all([
    supabase.from("posts").update({ is_hidden: true }).eq("id", postId),
    supabase
      .from("reports")
      .update({
        status: "reviewed",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId),
  ]);

  revalidatePath("/admin");
}

export async function removePostFromReport(formData: FormData) {
  const adminId = await requireAdmin();
  const reportId = String(formData.get("report_id"));
  const postId = String(formData.get("post_id"));

  const supabase = createAdminClient();
  await Promise.all([
    supabase.from("posts").update({ is_removed: true }).eq("id", postId),
    supabase
      .from("reports")
      .update({
        status: "reviewed",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reportId),
  ]);

  revalidatePath("/admin");
}

// ============================================================
// COMMENT REPORTS
// ============================================================

export async function dismissCommentReport(formData: FormData) {
  await requireAdmin();
  const reportId = String(formData.get("report_id"));

  const supabase = createAdminClient();
  await supabase
    .from("comment_reports")
    .update({ status: "dismissed" })
    .eq("id", reportId);

  revalidatePath("/admin");
}

export async function hideCommentFromReport(formData: FormData) {
  await requireAdmin();
  const reportId = String(formData.get("report_id"));
  const commentId = String(formData.get("comment_id"));

  const supabase = createAdminClient();
  await Promise.all([
    supabase.from("comments").update({ is_hidden: true }).eq("id", commentId),
    supabase
      .from("comment_reports")
      .update({ status: "reviewed" })
      .eq("id", reportId),
  ]);

  revalidatePath("/admin");
}

// ============================================================
// USER BANS
// ============================================================

export async function banUser(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id"));
  const reason = String(formData.get("ban_reason") || "").trim() || "Violation of community guidelines";

  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ is_banned: true, ban_reason: reason })
    .eq("id", userId);

  revalidatePath("/admin");
}

export async function unbanUser(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("user_id"));

  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ is_banned: false, ban_reason: null })
    .eq("id", userId);

  revalidatePath("/admin");
}

// ============================================================
// HIDDEN POSTS — unhide after review
// ============================================================

export async function unhidePost(formData: FormData) {
  await requireAdmin();
  const postId = String(formData.get("post_id"));

  const supabase = createAdminClient();
  await supabase
    .from("posts")
    .update({ is_hidden: false, report_count: 0 })
    .eq("id", postId);

  revalidatePath("/admin");
}

// ============================================================
// PROCESS WEEKLY WINNERS
// ============================================================

export async function processWinners(formData: FormData) {
  await requireAdmin();
  const weekYear = String(formData.get("week_year")).trim();
  if (!/^\d{4}-W\d{2}$/.test(weekYear)) return;

  const supabase = createAdminClient();
  await supabase.rpc("process_weekly_winners", { p_week_year: weekYear });

  revalidatePath("/admin");
  revalidatePath("/winners");
  revalidatePath("/");
}
