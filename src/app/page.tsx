import { createClient } from "@/lib/supabase/server";
import { HomeFeed } from "@/components/posts/HomeFeed";
import {
  WinnersBanner,
  type WinnerCardData,
} from "@/components/winners/WinnersBanner";

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

interface WinnerRow {
  post_id: string;
  vote_count: number;
  post: { image_url: string; thumbnail_url: string | null } | null;
  species: { scientific_name: string; common_names: string[] } | null;
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
        `post_id, vote_count,
        post:post_id (image_url, thumbnail_url),
        species:species_id (scientific_name, common_names),
        profile:user_id (display_name)`
      )
      .eq("week_year", prevWeek || "")
      .order("vote_count", { ascending: false }),
  ]);

  const posts = (data || []) as unknown as PostWithJoins[];
  const winners = (winnersRaw || []) as unknown as WinnerRow[];

  const transformedPosts = posts
    .filter((post) => post.species != null && post.profile != null)
    .map((post) => ({
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

  transformedPosts.sort((a, b) => b.vote_count - a.vote_count);

  const transformedWinners: WinnerCardData[] = winners
    .filter((w) => w.post != null && w.species != null && w.profile != null)
    .map((w) => ({
      postId: w.post_id,
      imageUrl: w.post!.thumbnail_url || w.post!.image_url,
      speciesScientificName: w.species!.scientific_name,
      speciesCommonName: w.species!.common_names[0] ?? null,
      displayName: w.profile!.display_name,
      voteCount: w.vote_count,
    }));

  return (
    <div>
      <WinnersBanner winners={transformedWinners} weekYear={prevWeek || ""} />
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
