import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Crown, Heart } from "lucide-react";

interface WinnerRow {
  week_year: string;
  post_id: string;
  vote_count: number;
  post: { image_url: string; thumbnail_url: string | null } | null;
  species: { scientific_name: string; common_names: string[] } | null;
  profile: { id: string; display_name: string } | null;
}

function formatWeekLabel(weekYear: string): string {
  const match = weekYear.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekYear;
  return `Week ${parseInt(match[2], 10)}, ${match[1]}`;
}

export default async function WinnersPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("weekly_winners")
    .select(
      `week_year, post_id, vote_count,
      post:post_id (image_url, thumbnail_url),
      species:species_id (scientific_name, common_names),
      profile:user_id (id, display_name)`
    )
    .order("week_year", { ascending: false })
    .order("vote_count", { ascending: false })
    .limit(500);

  const rows = (data || []) as unknown as WinnerRow[];

  // Group by week_year
  const grouped = new Map<string, WinnerRow[]>();
  for (const row of rows) {
    if (!grouped.has(row.week_year)) grouped.set(row.week_year, []);
    grouped.get(row.week_year)!.push(row);
  }

  const weeks = Array.from(grouped.entries());

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-6 w-6 text-gold" />
          <h1 className="text-2xl font-bold text-carbon">Winners Archive</h1>
        </div>
        <p className="text-gray-500">
          Weekly winners by species — one crown awarded per species per week.
        </p>
      </div>

      {weeks.length === 0 ? (
        <div className="text-center py-16">
          <Crown className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No winners yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Winners are announced every Monday.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {weeks.map(([weekYear, winners]) => {
            const totalVotes = winners.reduce((s, w) => s + w.vote_count, 0);
            return (
              <section key={weekYear}>
                {/* Week header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-carbon">
                    {formatWeekLabel(weekYear)}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {winners.length} species &middot; {totalVotes} total votes
                  </span>
                </div>

                {/* Winner cards grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {winners
                    .filter(
                      (w) =>
                        w.post != null &&
                        w.species != null &&
                        w.profile != null
                    )
                    .map((winner) => (
                      <Link
                        key={winner.post_id}
                        href={`/post/${winner.post_id}`}
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-eucalypt transition-colors duration-150"
                      >
                        <img
                          src={
                            winner.post!.thumbnail_url ||
                            winner.post!.image_url
                          }
                          alt={winner.species!.scientific_name}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-2.5">
                          <p className="italic text-sm font-medium text-eucalypt leading-tight line-clamp-1">
                            {winner.species!.scientific_name}
                          </p>
                          {winner.species!.common_names[0] && (
                            <p className="text-xs text-gray-400 leading-tight line-clamp-1">
                              {winner.species!.common_names[0]}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1.5">
                            <Link
                              href={`/profile/${winner.profile!.id}`}
                              className="text-xs text-gray-500 hover:text-carbon transition-colors line-clamp-1"
                            >
                              {winner.profile!.display_name}
                            </Link>
                            <div className="flex items-center gap-0.5 text-gray-400 shrink-0">
                              <Heart className="h-3 w-3 fill-red text-red" />
                              <span className="text-xs">{winner.vote_count}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
