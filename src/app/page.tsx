import { createClient } from "@/lib/supabase/server";
import { HomeFeed } from "@/components/posts/HomeFeed";
import {
  LastWeekWinners,
  type LastWeekWinnerData,
} from "@/components/winners/LastWeekWinners";

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
  profile: { id: string; display_name: string; avatar_url: string | null };
  votes: { id: string; user_id: string }[];
}

interface WinnerRow {
  post_id: string;
  post_type: string;
  vote_count: number;
  post: {
    image_url: string;
    thumbnail_url: string | null;
    image_url_after: string | null;
    post_type: string;
    site_description: string | null;
    species: { scientific_name: string; common_names: string[] } | null;
  } | null;
  profile: { display_name: string } | null;
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current and previous week from the server (AEST)
  const [{ data: currentWeek }, { data: prevWeek }] = await Promise.all([
    supabase.rpc("current_week_year"),
    supabase.rpc("get_previous_week_year"),
  ]);

  // Fetch this week's posts and last week's winners in parallel
  const [{ data }, { data: winnersRaw }] = await Promise.all([
    supabase
      .from("posts")
      .select(
        `*,
        species:species_id (id, scientific_name, common_names),
        profile:user_id (id, display_name, avatar_url),
        votes (id, user_id)`
      )
      .eq("week_year", currentWeek || "")
      .eq("is_hidden", false)
      .eq("is_removed", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("weekly_winners")
      .select(
        `post_id, post_type, vote_count,
        post:post_id (image_url, thumbnail_url, image_url_after, post_type, site_description,
          species:species_id (scientific_name, common_names)),
        profile:user_id (display_name)`
      )
      .eq("week_year", prevWeek || "")
      .eq("place", 1)
      .order("vote_count", { ascending: false }),
  ]);

  const posts = (data || []) as unknown as PostWithJoins[];
  const winners = (winnersRaw || []) as unknown as WinnerRow[];

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
    }));

  transformedPosts.sort((a, b) => b.vote_count - a.vote_count);

  const transformedWinners: LastWeekWinnerData[] = winners
    .filter((w) => w.post != null && w.profile != null)
    .map((w) => ({
      postId: w.post_id,
      imageUrl: w.post!.thumbnail_url || w.post!.image_url,
      imageUrlAfter: w.post!.image_url_after ?? null,
      postType: w.post_type as "weed" | "before_after",
      speciesScientificName: w.post!.species?.scientific_name ?? null,
      speciesCommonName: w.post!.species?.common_names?.[0] ?? null,
      siteDescription: w.post!.site_description ?? null,
      displayName: w.profile!.display_name,
      voteCount: w.vote_count,
    }));

  const weedWinner = transformedWinners.find((w) => w.postType === "weed") || null;
  const baWinner = transformedWinners.find((w) => w.postType === "before_after") || null;

  return (
    <div>
      <LastWeekWinners weedWinner={weedWinner} baWinner={baWinner} weekYear={prevWeek || ""} />
      <HomeFeed
        initialPosts={transformedPosts}
        currentWeek={currentWeek || ""}
        userId={user?.id || null}
      />
    </div>
  );
}
