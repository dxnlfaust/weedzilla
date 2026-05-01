"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { SpeciesSearch } from "@/components/species/SpeciesSearch";
import { updatePost } from "@/app/profile/actions";
import type { PostCardData } from "./PostCard";

interface Props {
  post: PostCardData;
  onClose: () => void;
  onSaved: (updated: Partial<PostCardData>) => void;
}

export function EditPostModal({ post, onClose, onSaved }: Props) {
  const isBA = post.post_type === "before_after";

  const [speciesId, setSpeciesId] = useState<number | null>(post.species?.id ?? null);
  const [speciesName, setSpeciesName] = useState(post.species?.scientific_name ?? "");
  const [caption, setCaption] = useState(post.caption ?? "");
  const [siteDescription, setSiteDescription] = useState(post.site_description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.set("post_id", post.id);
    if (speciesId) fd.set("species_id", String(speciesId));
    fd.set("caption", caption);
    if (isBA) fd.set("site_description", siteDescription);

    const result = await updatePost(fd);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onSaved({
      caption: caption.trim() || null,
      site_description: siteDescription.trim() || null,
      species: speciesId
        ? { id: speciesId, scientific_name: speciesName, common_names: [] }
        : null,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-carbon">Edit post</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-carbon transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Species */}
          <div>
            <label className="block text-sm font-medium text-carbon mb-1">
              {isBA ? "Species (optional)" : "Species"}
            </label>
            <SpeciesSearch
              onSelect={(id, name) => { setSpeciesId(id); setSpeciesName(name); }}
              selectedId={speciesId}
            />
            {speciesName && (
              <p className="text-xs text-gray-400 mt-1">
                Selected: <span className="italic">{speciesName}</span>
              </p>
            )}
          </div>

          {/* Site description — B&A only */}
          {isBA && (
            <div>
              <label htmlFor="edit-site-desc" className="block text-sm font-medium text-carbon mb-1">
                Site description{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="edit-site-desc"
                type="text"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value.slice(0, 280))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
                placeholder="e.g. Backyard in Blue Mountains, cleared lantana"
              />
              <p className="text-xs text-gray-400 text-right mt-0.5">
                {siteDescription.length}/280
              </p>
            </div>
          )}

          {/* Caption */}
          <div>
            <label htmlFor="edit-caption" className="block text-sm font-medium text-carbon mb-1">
              Caption{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="edit-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 280))}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none resize-none"
              placeholder="Add a caption…"
            />
            <p className="text-xs text-gray-400 text-right mt-0.5">
              {caption.length}/280
            </p>
          </div>

          {error && <p className="text-sm text-red">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border border-gray-200 text-carbon text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-eucalypt text-white text-sm font-medium py-2 rounded-lg hover:bg-eucalypt-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
