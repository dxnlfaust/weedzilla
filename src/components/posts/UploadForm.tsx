"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { uploadPostImage, validateImageFile } from "@/lib/utils/imageUpload";
import { getCurrentWeekYear } from "@/lib/utils/weekYear";
import { SpeciesSearch } from "@/components/species/SpeciesSearch";
import { toast } from "sonner";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface UploadFormProps {
  userId: string;
  accountCreatedAt: string;
  postType: "weed" | "before_after";
}

export function UploadForm({ userId, accountCreatedAt, postType }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  // Shared state
  const [speciesId, setSpeciesId] = useState<number | null>(null);
  const [speciesName, setSpeciesName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  // Weed mode: single image
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");

  // B&A mode: two images
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [beforeError, setBeforeError] = useState("");
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [afterError, setAfterError] = useState("");

  // B&A only
  const [siteDescription, setSiteDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  // Drag state
  const [dragOver, setDragOver] = useState(false);

  function handleFile(f: File) {
    const validation = validateImageFile(f);
    if (!validation.valid) {
      setFileError(validation.error);
      return;
    }
    setFileError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleBeforeFile(f: File) {
    const validation = validateImageFile(f);
    if (!validation.valid) {
      setBeforeError(validation.error);
      return;
    }
    setBeforeError("");
    setBeforeFile(f);
    setBeforePreview(URL.createObjectURL(f));
  }

  function handleAfterFile(f: File) {
    const validation = validateImageFile(f);
    if (!validation.valid) {
      setAfterError(validation.error);
      return;
    }
    setAfterError("");
    setAfterFile(f);
    setAfterPreview(URL.createObjectURL(f));
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  function removeFile() {
    setFile(null);
    setPreview(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeBeforeFile() {
    setBeforeFile(null);
    setBeforePreview(null);
    setBeforeError("");
  }

  function removeAfterFile() {
    setAfterFile(null);
    setAfterPreview(null);
    setAfterError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");

    // Validate based on post type
    if (postType === "weed") {
      if (!file) {
        toast.error("Please select an image.");
        return;
      }
      if (!speciesId) {
        toast.error("Please select a species.");
        return;
      }
    } else {
      if (!beforeFile || !afterFile) {
        toast.error("Please select both before and after images.");
        return;
      }
      if (!speciesId && !siteDescription.trim()) {
        setValidationError("Please tag a species or describe the site.");
        return;
      }
    }

    setUploading(true);

    try {
      // Rate limit: new accounts (< 7 days) capped at 3 posts/day
      const accountAge = Date.now() - new Date(accountCreatedAt).getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (accountAge < sevenDays) {
        const supabaseCheck = createClient();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count } = await supabaseCheck
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("created_at", todayStart.toISOString());
        if ((count ?? 0) >= 3) {
          toast.error(
            "New accounts can upload up to 3 posts per day for the first week."
          );
          setUploading(false);
          return;
        }
      }

      const weekYear = getCurrentWeekYear();
      const supabase = createClient();

      if (postType === "weed") {
        const imageUrl = await uploadPostImage(file!, userId);
        const { data, error } = await supabase
          .from("posts")
          .insert({
            user_id: userId,
            species_id: speciesId,
            image_url: imageUrl,
            caption: caption || null,
            week_year: weekYear,
            post_type: "weed",
          })
          .select("id")
          .single();

        if (error) throw error;
        toast.success("Post uploaded!");
        router.push(`/post/${data.id}`);
      } else {
        const [beforeUrl, afterUrl] = await Promise.all([
          uploadPostImage(beforeFile!, userId),
          uploadPostImage(afterFile!, userId),
        ]);

        const { data, error } = await supabase
          .from("posts")
          .insert({
            user_id: userId,
            species_id: speciesId || null,
            image_url: beforeUrl,
            image_url_after: afterUrl,
            caption: caption || null,
            site_description: siteDescription.trim() || null,
            week_year: weekYear,
            post_type: "before_after",
          })
          .select("id")
          .single();

        if (error) throw error;
        toast.success("Before & After uploaded!");
        router.push(`/post/${data.id}`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setUploading(false);
    }
  }

  const isWeed = postType === "weed";
  const canSubmit = isWeed
    ? file && speciesId
    : beforeFile && afterFile && (speciesId || siteDescription.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image upload */}
      {isWeed ? (
        <div>
          <label className="block text-sm font-medium text-carbon mb-1">
            Photo
          </label>
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Upload preview"
                className="w-full aspect-square object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={removeFile}
                aria-label="Remove image"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 transition-colors duration-150"
              >
                <X className="h-5 w-5 text-carbon" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-150 ${
                dragOver
                  ? "border-eucalypt bg-eucalypt/5"
                  : "border-gray-300 hover:border-eucalypt"
              }`}
            >
              <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 mb-1">
                Drag and drop your photo here, or click to browse
              </p>
              <p className="text-xs text-gray-400">
                JPEG, PNG, WebP, or HEIC — max 10MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            aria-label="Upload photo"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="hidden"
          />
          {fileError && <p className="text-red text-sm mt-1">{fileError}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Before image */}
          <div>
            <label className="block text-sm font-medium text-carbon mb-1">
              Before — Upload the original site photo
            </label>
            {beforePreview ? (
              <div className="relative">
                <img
                  src={beforePreview}
                  alt="Before preview"
                  className="w-full aspect-video object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeBeforeFile}
                  aria-label="Remove before image"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 transition-colors duration-150"
                >
                  <X className="h-5 w-5 text-carbon" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 hover:border-eucalypt rounded-lg cursor-pointer transition-colors duration-150">
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to select before photo</p>
                <p className="text-xs text-gray-400">JPEG, PNG, WebP, or HEIC — max 10MB</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleBeforeFile(f);
                  }}
                  className="hidden"
                />
              </label>
            )}
            {beforeError && <p className="text-red text-sm mt-1">{beforeError}</p>}
          </div>

          {/* After image */}
          <div>
            <label className="block text-sm font-medium text-carbon mb-1">
              After — Upload the cleared/restored site photo
            </label>
            {afterPreview ? (
              <div className="relative">
                <img
                  src={afterPreview}
                  alt="After preview"
                  className="w-full aspect-video object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeAfterFile}
                  aria-label="Remove after image"
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 transition-colors duration-150"
                >
                  <X className="h-5 w-5 text-carbon" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 hover:border-eucalypt rounded-lg cursor-pointer transition-colors duration-150">
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to select after photo</p>
                <p className="text-xs text-gray-400">JPEG, PNG, WebP, or HEIC — max 10MB</p>
                <input
                  ref={afterFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAfterFile(f);
                  }}
                  className="hidden"
                />
              </label>
            )}
            {afterError && <p className="text-red text-sm mt-1">{afterError}</p>}
          </div>
        </div>
      )}

      {/* Species search */}
      <div>
        <label className="block text-sm font-medium text-carbon mb-1">
          {isWeed ? "Species" : "Tag a species (optional)"}
        </label>
        <SpeciesSearch
          onSelect={(id, name) => {
            setSpeciesId(id);
            setSpeciesName(name);
          }}
          selectedId={speciesId}
        />
        {speciesName && (
          <p className="text-xs text-gray-500 mt-1">
            Selected: <span className="italic">{speciesName}</span>
          </p>
        )}
      </div>

      {/* Site description (B&A only) */}
      {!isWeed && (
        <div>
          <label htmlFor="siteDescription" className="block text-sm font-medium text-carbon mb-1">
            Describe the site{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="siteDescription"
            type="text"
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value.slice(0, 280))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
            placeholder="e.g. Backyard in Blue Mountains, cleared lantana"
          />
          <p className="text-xs text-gray-400 text-right mt-0.5">
            {siteDescription.length}/280
          </p>
          {validationError && (
            <p className="text-red text-sm mt-1">{validationError}</p>
          )}
        </div>
      )}

      {/* Caption */}
      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-carbon mb-1">
          Caption{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 280))}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none resize-none"
          placeholder={isWeed ? "Where was this weed removed? Any tips?" : "Share the story of this transformation"}
        />
        <p className="text-xs text-gray-400 text-right mt-0.5">
          {caption.length}/280
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading || !canSubmit}
        className="w-full bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-4 py-2.5 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {isWeed ? "Upload Post" : "Upload Before & After"}
          </>
        )}
      </button>
    </form>
  );
}
