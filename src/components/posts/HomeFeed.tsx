"use client";

import { useState } from "react";
import { PostGrid } from "./PostGrid";
import { createClient } from "@/lib/supabase/client";
import type { PostCardData } from "./PostCard";
import { Loader2 } from "lucide-react";

interface HomeFeedProps {
  initialPosts: PostCardData[];
  currentWeek: string;
  userId: string | null;
}

export function HomeFeed({ initialPosts, currentWeek, userId }: HomeFeedProps) {
  const [filter, setFilter] = useState<"week" | "all">("week");
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20);

  async function fetchPosts(mode: "week" | "all", pageNum: number = 0) {
    setLoading(true);
    const supabase = createClient();
    const pageSize = 20;

    let query = supabase
      .from("posts")
      .select(
        `
        *,
        species:species_id (id, scientific_name, common_names),
        profile:user_id (id, display_name, avatar_url),
        votes (id, user_id)
      `
      )
      .eq("is_hidden", false)
      .eq("is_removed", false)
      .order("created_at", { ascending: false })
      .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

    if (mode === "week") {
      query = query.eq("week_year", currentWeek);
    }

    const { data } = await query;

    interface PostRow {
      id: string;
      image_url: string;
      caption: string | null;
      week_year: string;
      created_at: string;
      species: { id: number; scientific_name: string; common_names: string[] };
      profile: { id: string; display_name: string; avatar_url: string | null };
      votes: { id: string; user_id: string }[];
    }

    const rows = (data || []) as unknown as PostRow[];

    const transformed = rows.map((post) => ({
      id: post.id,
      image_url: post.image_url,
      caption: post.caption,
      week_year: post.week_year,
      created_at: post.created_at,
      species: post.species,
      profile: post.profile,
      vote_count: post.votes?.length || 0,
      user_has_voted: userId
        ? post.votes?.some((v) => v.user_id === userId) || false
        : false,
    }));

    transformed.sort((a, b) => b.vote_count - a.vote_count);

    setHasMore(transformed.length >= pageSize);

    if (pageNum === 0) {
      setPosts(transformed);
    } else {
      setPosts((prev) => [...prev, ...transformed]);
    }
    setLoading(false);
  }

  function handleFilterChange(mode: "week" | "all") {
    setFilter(mode);
    setPage(0);
    fetchPosts(mode, 0);
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(filter, nextPage);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleFilterChange("week")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            filter === "week"
              ? "bg-eucalypt text-white"
              : "bg-white border border-gray-200 text-gray-500 hover:border-eucalypt hover:text-eucalypt"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => handleFilterChange("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            filter === "all"
              ? "bg-eucalypt text-white"
              : "bg-white border border-gray-200 text-gray-500 hover:border-eucalypt hover:text-eucalypt"
          }`}
        >
          All Time
        </button>
      </div>

      <PostGrid posts={posts} />

      {/* Load more */}
      {hasMore && posts.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="border border-eucalypt text-eucalypt hover:bg-eucalypt hover:text-white rounded-lg px-6 py-2 text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
