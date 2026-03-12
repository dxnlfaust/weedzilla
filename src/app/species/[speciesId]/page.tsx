import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/posts/PostGrid";
import type { Species } from "@/lib/types/database";

interface PostWithJoins {
  id: string;
  image_url: string;
  caption: string | null;
  week_year: string;
  created_at: string;
  species: { id: number; scientific_name: string; common_names: string[] };
  profile: { id: string; display_name: string; avatar_url: string | null };
  votes: { id: string; user_id: string }[];
}

interface SpeciesDetailPageProps {
  params: Promise<{ speciesId: string }>;
}

export default async function SpeciesDetailPage({
  params,
}: SpeciesDetailPageProps) {
  const { speciesId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch species info
  const { data: speciesData } = await supabase
    .from("species")
    .select("*")
    .eq("id", Number(speciesId))
    .single();

  const species = speciesData as Species | null;
  if (!species) notFound();

  // Fetch posts for this species
  const { data } = await supabase
    .from("posts")
    .select(
      `
      *,
      species:species_id (id, scientific_name, common_names),
      profile:user_id (id, display_name, avatar_url),
      votes (id, user_id)
    `
    )
    .eq("species_id", Number(speciesId))
    .eq("is_hidden", false)
    .eq("is_removed", false)
    .order("week_year", { ascending: false })
    .order("created_at", { ascending: false });

  const posts = (data || []) as unknown as PostWithJoins[];

  const transformedPosts = posts.map((post) => ({
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    week_year: post.week_year,
    created_at: post.created_at,
    species: post.species,
    profile: post.profile,
    vote_count: post.votes?.length || 0,
    user_has_voted: user
      ? post.votes?.some((v) => v.user_id === user.id) || false
      : false,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-carbon italic mb-1">
          {species.scientific_name}
        </h1>
        {species.common_names.length > 0 && (
          <p className="text-gray-500">{species.common_names.join(", ")}</p>
        )}
        {species.family && (
          <p className="text-sm text-gray-400 mt-0.5">
            Family: {species.family}
          </p>
        )}
      </div>
      <PostGrid posts={transformedPosts} />
    </div>
  );
}
