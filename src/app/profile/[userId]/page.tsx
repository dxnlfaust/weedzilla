import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/posts/PostGrid";
import type { Profile } from "@/lib/types/database";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const profile = profileData as Profile | null;
  if (!profile) notFound();

  const { data: postsData } = await supabase
    .from("posts")
    .select(
      `
      *,
      species:species_id (id, scientific_name, common_names),
      votes (id, user_id)
    `
    )
    .eq("user_id", userId)
    .eq("is_hidden", false)
    .eq("is_removed", false)
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
    user_has_voted: user
      ? post.votes?.some((v) => v.user_id === user.id) || false
      : false,
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <ProfileHeader
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        crownCount={profile.crown_count}
        createdAt={profile.created_at}
      />

      <div>
        <h2 className="text-lg font-bold text-carbon mb-4">Posts</h2>
        <PostGrid posts={transformedPosts} />
      </div>
    </div>
  );
}
