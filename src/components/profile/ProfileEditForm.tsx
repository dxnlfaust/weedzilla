"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileEditFormProps {
  userId: string;
  initialDisplayName: string;
  initialAvatarUrl: string | null;
  email: string;
}

export function ProfileEditForm({
  userId,
  initialDisplayName,
  initialAvatarUrl,
  email,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      toast.error("Failed to upload avatar.");
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    setAvatarUrl(data.publicUrl);
    setUploadingAvatar(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (displayName.length < 2 || displayName.length > 30) {
      toast.error("Display name must be 2–30 characters.");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, avatar_url: avatarUrl })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      toast.error("Failed to update profile.");
      return;
    }

    toast.success("Profile updated!");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Your avatar"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-eucalypt/10 flex items-center justify-center text-2xl font-bold text-eucalypt">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-eucalypt text-white rounded-full p-1.5 cursor-pointer hover:bg-eucalypt-light transition-colors duration-150">
            {uploadingAvatar ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-carbon">Profile Photo</p>
          <p className="text-xs text-gray-500">Click the camera to change</p>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-carbon mb-1"
        >
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm font-medium text-carbon mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-4 py-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
