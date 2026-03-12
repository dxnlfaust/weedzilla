import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserPosts } from "@/components/profile/UserPosts";
import type { Profile } from "@/lib/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;
  if (!profile) redirect("/login");

  const { data: postsData } = await supabase
    .from("posts")
    .select(
      `
      *,
      species:species_id (id, scientific_name, common_names),
      votes (id, user_id)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const posts = (postsData || []) as unknown as {
    id: string;
    image_url: string;
    caption: string | null;
    week_year: string;
    created_at: string;
    species: { id: number; scientific_name: string; common_names: string[] };
    votes: { id: string; user_id: string }[];
  }[];

  const transformedPosts = posts.map((post) => ({
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    week_year: post.week_year,
    created_at: post.created_at,
    species: post.species,
    profile: {
      id: profile.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
    },
    vote_count: post.votes?.length || 0,
    user_has_voted:
      post.votes?.some((v) => v.user_id === user.id) || false,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <ProfileHeader
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        crownCount={profile.crown_count}
        createdAt={profile.created_at}
      />

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-carbon mb-4">Edit Profile</h2>
        <ProfileEditForm
          userId={user.id}
          initialDisplayName={profile.display_name}
          initialAvatarUrl={profile.avatar_url}
          email={user.email || ""}
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-carbon mb-4">Your Posts</h2>
        <UserPosts posts={transformedPosts} isOwner />
      </div>
    </div>
  );
}
