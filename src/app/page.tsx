import { createClient } from "@/lib/supabase/server";
import { HomeFeed } from "@/components/posts/HomeFeed";

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

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current week from the server (AEST)
  const { data: currentWeek } = await supabase.rpc("current_week_year");

  // Fetch this week's posts, sorted by vote count
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
    .eq("week_year", currentWeek || "")
    .eq("is_hidden", false)
    .eq("is_removed", false)
    .order("created_at", { ascending: false });

  const posts = (data || []) as unknown as PostWithJoins[];

  const transformedPosts = posts.filter((post) => post.species != null && post.profile != null).map((post) => ({
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

  // Sort by vote count descending
  transformedPosts.sort((a, b) => b.vote_count - a.vote_count);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-carbon mb-1">
          This Week&apos;s Weeds
        </h1>
        <p className="text-gray-500">
          Vote for the best weed removal of the week!
        </p>
      </div>
      <HomeFeed
        initialPosts={transformedPosts}
        currentWeek={currentWeek || ""}
        userId={user?.id || null}
      />
    </div>
  );
}
