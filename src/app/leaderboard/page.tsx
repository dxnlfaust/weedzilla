import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Crown, Leaf } from "lucide-react";
import { avatarSm } from "@/lib/utils/image";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "Top users and most common species on WeedZilla",
};

interface WinnerGroupRow {
  user_id: string;
  place: number;
}

interface ProfileRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface SpeciesRow {
  id: number;
  scientific_name: string;
  common_names: string[];
  posts: { count: number }[];
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const [{ data: winnersRaw }, { data: profilesRaw }, { data: speciesRaw }] =
    await Promise.all([
      supabase
        .from("weekly_winners")
        .select("user_id, place")
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name, avatar_url"),
      supabase
        .from("species")
        .select("id, scientific_name, common_names, posts(count)")
        .eq("status", "approved")
        .order("scientific_name"),
    ]);

  const winners = (winnersRaw || []) as unknown as WinnerGroupRow[];
  const profiles = (profilesRaw || []) as unknown as ProfileRow[];

  // Aggregate medals per user
  const userMedals = new Map<
    string,
    { gold: number; silver: number; bronze: number }
  >();
  for (const w of winners) {
    if (!userMedals.has(w.user_id)) {
      userMedals.set(w.user_id, { gold: 0, silver: 0, bronze: 0 });
    }
    const m = userMedals.get(w.user_id)!;
    if (w.place === 1) m.gold++;
    else if (w.place === 2) m.silver++;
    else if (w.place === 3) m.bronze++;
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const rankedUsers = Array.from(userMedals.entries())
    .map(([userId, medals]) => ({
      userId,
      profile: profileMap.get(userId),
      ...medals,
    }))
    .filter((u) => u.profile)
    .sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze)
    .slice(0, 20);

  // Species by post count
  const speciesRows = (speciesRaw || []) as unknown as SpeciesRow[];
  const rankedSpecies = speciesRows
    .map((s) => ({
      id: s.id,
      scientific_name: s.scientific_name,
      common_names: s.common_names,
      post_count: s.posts?.[0]?.count || 0,
    }))
    .filter((s) => s.post_count > 0)
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, 20);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-carbon mb-6">Leaderboard</h1>

      <div className="space-y-8">
        {/* Top Users */}
        <section>
          <h2 className="text-lg font-bold text-carbon mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            Top Users
          </h2>
          {rankedUsers.length === 0 ? (
            <p className="text-gray-400 text-sm">No winners yet.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {rankedUsers.map((user, i) => (
                <Link
                  key={user.userId}
                  href={`/profile/${user.userId}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-400 w-6 text-right">
                    {i + 1}
                  </span>
                  {user.profile!.avatar_url ? (
                    <img
                      src={avatarSm(user.profile!.avatar_url)}
                      alt={user.profile!.display_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-eucalypt/10 flex items-center justify-center text-sm font-bold text-eucalypt">
                      {user.profile!.display_name[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-carbon flex-1">
                    {user.profile!.display_name}
                  </span>
                  <div className="flex items-center gap-3">
                    {user.gold > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Crown className="h-3.5 w-3.5 text-gold" />
                        <span className="text-xs font-medium text-gray-600">{user.gold}</span>
                      </div>
                    )}
                    {user.silver > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Crown className="h-3.5 w-3.5 text-silver" />
                        <span className="text-xs font-medium text-gray-600">{user.silver}</span>
                      </div>
                    )}
                    {user.bronze > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Crown className="h-3.5 w-3.5 text-bronze" />
                        <span className="text-xs font-medium text-gray-600">{user.bronze}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Species */}
        <section>
          <h2 className="text-lg font-bold text-carbon mb-3 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-eucalypt" />
            Most Common Species
          </h2>
          {rankedSpecies.length === 0 ? (
            <p className="text-gray-400 text-sm">No posts yet.</p>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {rankedSpecies.map((species, i) => (
                <Link
                  key={species.id}
                  href={`/species/${species.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-400 w-6 text-right">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-carbon italic">
                      {species.scientific_name}
                    </p>
                    {species.common_names[0] && (
                      <p className="text-xs text-gray-500">{species.common_names[0]}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {species.post_count} {species.post_count === 1 ? "post" : "posts"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
