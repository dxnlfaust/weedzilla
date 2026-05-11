import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { ResetPasswordButton } from "@/components/profile/ResetPasswordButton";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";
import type { Profile } from "@/lib/types/database";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/settings");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;
  if (!profile) redirect("/login");

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-carbon mb-4">Edit Profile</h2>
        <ProfileEditForm
          userId={user.id}
          initialDisplayName={profile.display_name}
          initialAvatarUrl={profile.avatar_url}
          email={user.email || ""}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-carbon mb-1">Change password</h2>
        <p className="text-sm text-gray-500 mb-4">
          A reset link will be sent to {user.email}
        </p>
        <ResetPasswordButton email={user.email || ""} />
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-base font-semibold text-carbon mb-1">Danger zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your account and all associated data.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
