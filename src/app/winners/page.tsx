"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Crown, Loader2 } from "lucide-react";
import { WinnerCard, type WinnerCardProps } from "@/components/winners/WinnerCard";

type Category = "weed" | "before_after";

interface WinnerRow {
  week_year: string;
  post_type: string;
  place: number;
  vote_count: number;
  post: {
    id: string;
    image_url: string;
    image_url_after: string | null;
    post_type: string;
    site_description: string | null;
    species: { scientific_name: string; common_names: string[] } | null;
  } | null;
  profile: { id: string; display_name: string } | null;
}

interface WeekData {
  weekYear: string;
  winners: WinnerCardProps[];
  postCount: number;
  totalVotes: number;
}

function formatWeekLabel(weekYear: string): string {
  const match = weekYear.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekYear;
  return `Week ${parseInt(match[2], 10)}, ${match[1]}`;
}

export default function WinnersPage() {
  const [category, setCategory] = useState<Category>("weed");
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function fetchWeeks(cat: Category, existingWeeks: string[] = []) {
    const supabase = createClient();
    const pageSize = 12; // fetch enough rows to cover 4 weeks × 3 places

    let query = supabase
      .from("weekly_winners")
      .select(
        `week_year, post_type, place, vote_count,
        post:post_id (id, image_url, image_url_after, post_type, site_description,
          species:species_id (scientific_name, common_names)),
        profile:user_id (id, display_name)`
      )
      .eq("post_type", cat)
      .order("week_year", { ascending: false })
      .order("place", { ascending: true })
      .limit(pageSize);

    // Skip already-loaded weeks
    if (existingWeeks.length > 0) {
      query = query.lt("week_year", existingWeeks[existingWeeks.length - 1]);
    }

    const { data } = await query;
    const rows = (data || []) as unknown as WinnerRow[];

    // Group by week
    const grouped = new Map<string, WinnerRow[]>();
    for (const row of rows) {
      if (!grouped.has(row.week_year)) grouped.set(row.week_year, []);
      grouped.get(row.week_year)!.push(row);
    }

    const newWeeks: WeekData[] = [];
    for (const [weekYear, winners] of grouped) {
      const cards: WinnerCardProps[] = winners
        .filter((w) => w.post != null && w.profile != null)
        .map((w) => ({
          postId: w.post!.id,
          imageUrl: w.post!.image_url,
          imageUrlAfter: w.post!.image_url_after,
          postType: w.post!.post_type as "weed" | "before_after",
          speciesScientificName: w.post!.species?.scientific_name || null,
          speciesCommonName: w.post!.species?.common_names?.[0] || null,
          siteDescription: w.post!.site_description,
          displayName: w.profile!.display_name,
          profileId: w.profile!.id,
          voteCount: w.vote_count,
          place: w.place as 1 | 2 | 3,
        }));

      const totalVotes = winners.reduce((s, w) => s + w.vote_count, 0);
      newWeeks.push({ weekYear, winners: cards, postCount: cards.length, totalVotes });
    }

    setHasMore(rows.length >= pageSize);
    return newWeeks;
  }

  async function loadInitial(cat: Category) {
    setLoading(true);
    const data = await fetchWeeks(cat);
    setWeeks(data);
    setLoading(false);
  }

  async function loadMore() {
    setLoadingMore(true);
    const existingWeeks = weeks.map((w) => w.weekYear);
    const moreData = await fetchWeeks(category, existingWeeks);
    setWeeks((prev) => [...prev, ...moreData]);
    setLoadingMore(false);
  }

  useEffect(() => {
    loadInitial(category);
  }, [category]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-6 w-6 text-gold" />
          <h1 className="text-2xl font-bold text-carbon">Winners</h1>
        </div>
      </div>

      {/* Category toggle */}
      <div className="flex gap-2 mb-8">
        <button
          type="button"
          onClick={() => setCategory("weed")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
            category === "weed"
              ? "bg-eucalypt text-white"
              : "bg-white border border-gray-200 text-gray-500 hover:border-eucalypt hover:text-eucalypt"
          }`}
        >
          Weed of the Week
        </button>
        <button
          type="button"
          onClick={() => setCategory("before_after")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
            category === "before_after"
              ? "bg-eucalypt text-white"
              : "bg-white border border-gray-200 text-gray-500 hover:border-eucalypt hover:text-eucalypt"
          }`}
        >
          B&A of the Week
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-eucalypt" />
        </div>
      ) : weeks.length === 0 ? (
        <div className="text-center py-16">
          <Crown className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No winners yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Winners are announced every Monday.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {weeks.map((week) => {
            const gold = week.winners.find((w) => w.place === 1);
            const silver = week.winners.find((w) => w.place === 2);
            const bronze = week.winners.find((w) => w.place === 3);

            return (
              <section key={week.weekYear}>
                {/* Week header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-carbon">
                    {formatWeekLabel(week.weekYear)}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {week.postCount} winners &middot; {week.totalVotes} total votes
                  </span>
                </div>

                {/* Gold — full width */}
                {gold && (
                  <div className="mb-3">
                    <WinnerCard {...gold} />
                  </div>
                )}

                {/* Silver + Bronze — two columns */}
                {(silver || bronze) && (
                  <div className="grid grid-cols-2 gap-3">
                    {silver && <WinnerCard {...silver} />}
                    {bronze && <WinnerCard {...bronze} />}
                  </div>
                )}
              </section>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <div className="text-center pb-4">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="border border-eucalypt text-eucalypt hover:bg-eucalypt hover:text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Load More Weeks"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
