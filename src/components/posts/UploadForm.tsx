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
}

export function UploadForm({ userId }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [speciesId, setSpeciesId] = useState<number | null>(null);
  const [speciesName, setSpeciesName] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  function handleFile(f: File) {
    const validation = validateImageFile(f);
    if (!validation.valid) {
      setFileError(validation.error);
      return;
    }
    setFileError("");
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      toast.error("Please select an image.");
      return;
    }
    if (!speciesId) {
      toast.error("Please select a species.");
      return;
    }

    setUploading(true);

    try {
      const imageUrl = await uploadPostImage(file, userId);
      const weekYear = getCurrentWeekYear();

      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          species_id: speciesId,
          image_url: imageUrl,
          caption: caption || null,
          week_year: weekYear,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast.success("Post uploaded!");
      router.push(`/post/${data.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image upload zone */}
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
          onChange={handleFileChange}
          className="hidden"
        />
        {fileError && <p className="text-red text-sm mt-1">{fileError}</p>}
      </div>

      {/* Species search */}
      <div>
        <label className="block text-sm font-medium text-carbon mb-1">
          Species
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
          placeholder="Where was this weed removed? Any tips?"
        />
        <p className="text-xs text-gray-400 text-right mt-0.5">
          {caption.length}/280
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading || !file || !speciesId}
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
            Upload Post
          </>
        )}
      </button>
    </form>
  );
}
