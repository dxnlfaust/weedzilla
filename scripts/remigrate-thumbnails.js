#!/usr/bin/env node
/**
 * Reprocess all existing post thumbnails at higher quality.
 * Uses the display image (1200px) as source — originals have been deleted.
 * New spec: 600px wide, 85% JPEG quality.
 *
 * Usage (from project root):
 *   node scripts/remigrate-thumbnails.js
 *
 * Requires: sharp, dotenv  (npm install --save-dev sharp dotenv)
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const BUCKET = "post-images";

function extractStoragePath(publicUrl) {
  const marker = `/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + marker.length));
}

async function downloadFile(path) {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) throw new Error(`Download failed for ${path}: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

async function resizeBuffer(buffer, width, quality) {
  return sharp(buffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
}

async function uploadBuffer(buffer, storagePath) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

/**
 * Re-generate a thumbnail from the display image URL.
 * Overwrites the existing thumbnail path in-place.
 */
async function reprocessThumb(displayUrl, thumbUrl) {
  const displayPath = extractStoragePath(displayUrl);
  const thumbPath = extractStoragePath(thumbUrl);
  if (!displayPath || !thumbPath) {
    throw new Error(`Cannot parse storage paths:\n  display: ${displayUrl}\n  thumb: ${thumbUrl}`);
  }

  console.log(`    ↓ display: ${displayPath}`);
  const buffer = await downloadFile(displayPath);

  const resized = await resizeBuffer(buffer, 600, 85);

  console.log(`    ↑ thumb:   ${thumbPath}`);
  await uploadBuffer(resized, thumbPath);
}

async function main() {
  console.log("Querying posts with existing thumbnails...\n");

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, post_type, image_url, thumbnail_url, image_url_after, thumbnail_url_after")
    .not("thumbnail_url", "is", null)
    .eq("is_removed", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  console.log(`Found ${posts.length} posts to reprocess.\n`);

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    const idx = `[${success + failed + 1}/${posts.length}]`;
    console.log(`${idx} Post ${post.id} (${post.post_type})`);

    try {
      console.log("  Reprocessing thumbnail...");
      await reprocessThumb(post.image_url, post.thumbnail_url);

      if (post.post_type === "before_after" && post.image_url_after && post.thumbnail_url_after) {
        console.log("  Reprocessing after-thumbnail...");
        await reprocessThumb(post.image_url_after, post.thumbnail_url_after);
      }

      console.log("  ✓ Done\n");
      success++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`Reprocess complete. ${success} succeeded, ${failed} failed.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
