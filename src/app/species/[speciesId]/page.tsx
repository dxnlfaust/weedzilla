import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/posts/PostGrid";
import type { Species } from "@/lib/types/database";

interface PostWithJoins {
  id: string;
  image_url: string;
  image_url_after: string | null;
  caption: string | null;
  site_description: string | null;
  post_type: "weed" | "before_after";
  week_year: string;
  created_at: string;
  species: { id: number; scientific_name: string; common_names: string[] } | null;
  profile: { id: string; display_name: string; avatar_url: string | null; crown_count: number };
  votes: { id: string; user_id: string }[];
  comments: { count: number }[];
}

interface SpeciesDetailPageProps {
  params: Promise<{ speciesId: string }>;
}

export async function generateMetadata({ params }: SpeciesDetailPageProps): Promise<Metadata> {
  const { speciesId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("species")
    .select("scientific_name, common_names")
    .eq("id", Number(speciesId))
    .single();

  if (!data) return { title: "Species Not Found" };

  const commonName = data.common_names?.[0];
  const title = commonName ? `${data.scientific_name} (${commonName})` : data.scientific_name;

  return {
    title,
    description: `Browse posts of ${data.scientific_name} removal on WeedZilla`,
  };
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
      profile:user_id (id, display_name, avatar_url, crown_count),
      votes (id, user_id),
      comments (count)
    `
    )
    .eq("species_id", Number(speciesId))
    .eq("is_hidden", false)
    .eq("is_removed", false)
    .order("week_year", { ascending: false })
    .order("created_at", { ascending: false });

  const posts = (data || []) as unknown as PostWithJoins[];

  const transformedPosts = posts
    .filter((post) => post.profile != null)
    .map((post) => ({
      id: post.id,
      image_url: post.image_url,
      image_url_after: post.image_url_after,
      caption: post.caption,
      site_description: post.site_description,
      post_type: post.post_type,
      week_year: post.week_year,
      created_at: post.created_at,
      species: post.species,
      profile: post.profile,
      vote_count: post.votes?.length || 0,
      user_has_voted: user
        ? post.votes?.some((v) => v.user_id === user.id) || false
        : false,
      comment_count: post.comments?.[0]?.count || 0,
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
