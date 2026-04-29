#!/usr/bin/env node
/**
 * Backfill display + thumbnail versions for existing posts.
 *
 * Prerequisites (run from project root):
 *   npm install --save-dev sharp dotenv
 *   (@supabase/supabase-js is already a project dependency)
 *
 * Usage:
 *   node scripts/migrate-images.js
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const { randomUUID } = require("crypto");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = "post-images";

/** Extract the storage path from a Supabase public URL */
function extractStoragePath(publicUrl) {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

/** Download a file from storage, returning a Buffer */
async function downloadFile(path) {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) throw new Error(`Download failed for ${path}: ${error.message}`);
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/** Resize a buffer using sharp and return a Buffer */
async function resizeBuffer(buffer, maxWidth, quality) {
  return sharp(buffer)
    .rotate() // auto-orient from EXIF
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
}

/** Upload a buffer to storage, return public URL */
async function uploadBuffer(buffer, storagePath) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

/** Delete a file from storage (best-effort) */
async function deleteFile(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.warn(`  ⚠ Could not delete ${path}: ${error.message}`);
}

/**
 * Process one image URL:
 *   - Download original
 *   - Resize to display (1200px, 80%) and thumb (400px, 70%)
 *   - Upload both, delete original
 *   - Return { displayUrl, thumbUrl }
 */
async function processImage(originalUrl, userId) {
  const originalPath = extractStoragePath(originalUrl);
  if (!originalPath) {
    throw new Error(`Cannot parse storage path from: ${originalUrl}`);
  }

  console.log(`    ↓ ${originalPath}`);
  const buffer = await downloadFile(originalPath);

  const [displayBuf, thumbBuf] = await Promise.all([
    resizeBuffer(buffer, 1200, 80),
    resizeBuffer(buffer, 400, 70),
  ]);

  const id = randomUUID();
  const displayPath = `${userId}/${id}-display.jpg`;
  const thumbPath = `${userId}/${id}-thumb.jpg`;

  const [displayUrl, thumbUrl] = await Promise.all([
    uploadBuffer(displayBuf, displayPath),
    uploadBuffer(thumbBuf, thumbPath),
  ]);

  await deleteFile(originalPath);

  return { displayUrl, thumbUrl };
}

async function main() {
  console.log("Querying posts that need migration...\n");

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, user_id, image_url, thumbnail_url, image_url_after, thumbnail_url_after, post_type"
    )
    .is("thumbnail_url", null)
    .eq("is_removed", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  console.log(`Found ${posts.length} posts to migrate.\n`);

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    const idx = `[${success + failed + 1}/${posts.length}]`;
    console.log(`${idx} Post ${post.id} (${post.post_type})`);

    try {
      const updates = {};

      console.log("  Processing image_url...");
      const { displayUrl, thumbUrl } = await processImage(
        post.image_url,
        post.user_id
      );
      updates.image_url = displayUrl;
      updates.thumbnail_url = thumbUrl;

      if (post.post_type === "before_after" && post.image_url_after) {
        console.log("  Processing image_url_after...");
        const { displayUrl: afterDisplay, thumbUrl: afterThumb } =
          await processImage(post.image_url_after, post.user_id);
        updates.image_url_after = afterDisplay;
        updates.thumbnail_url_after = afterThumb;
      }

      const { error: updateError } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", post.id);

      if (updateError) throw new Error(`DB update: ${updateError.message}`);

      console.log("  ✓ Done\n");
      success++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`Migration complete. ${success} succeeded, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
