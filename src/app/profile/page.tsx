import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserPosts } from "@/components/profile/UserPosts";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";
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

  // Medal counts
  const [{ count: silverCount }, { count: bronzeCount }] = await Promise.all([
    supabase
      .from("weekly_winners")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("place", 2),
    supabase
      .from("weekly_winners")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("place", 3),
  ]);

  const { data: postsData } = await supabase
    .from("posts")
    .select(
      `
      *,
      species:species_id (id, scientific_name, common_names),
      votes (id, user_id),
      comments (count)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const posts = (postsData || []) as unknown as {
    id: string;
    image_url: string;
    thumbnail_url: string | null;
    image_url_after: string | null;
    thumbnail_url_after: string | null;
    caption: string | null;
    site_description: string | null;
    post_type: "weed" | "before_after";
    week_year: string;
    created_at: string;
    species: { id: number; scientific_name: string; common_names: string[] } | null;
    votes: { id: string; user_id: string }[];
    comments: { count: number }[];
  }[];

  const transformedPosts = posts.map((post) => ({
    id: post.id,
    image_url: post.image_url,
    thumbnail_url: post.thumbnail_url,
    image_url_after: post.image_url_after,
    thumbnail_url_after: post.thumbnail_url_after,
    caption: post.caption,
    site_description: post.site_description,
    post_type: post.post_type,
    week_year: post.week_year,
    created_at: post.created_at,
    species: post.species,
    profile: {
      id: profile.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      crown_count: profile.crown_count,
    },
    vote_count: post.votes?.length || 0,
    user_has_voted:
      post.votes?.some((v) => v.user_id === user.id) || false,
    comment_count: post.comments?.[0]?.count || 0,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <ProfileHeader
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        crownCount={profile.crown_count}
        silverCount={silverCount || 0}
        bronzeCount={bronzeCount || 0}
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
