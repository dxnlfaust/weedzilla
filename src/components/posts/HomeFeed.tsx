"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PostGrid } from "./PostGrid";
import { createClient } from "@/lib/supabase/client";
import type { PostCardData } from "./PostCard";
import { Loader2 } from "lucide-react";

interface HomeFeedProps {
  initialPosts: PostCardData[];
  olderPosts: PostCardData[];
  currentWeek: string;
  userId: string | null;
}

type PostTypeFilter = "all" | "weed" | "before_after";
type SortOrder = "top" | "newest";

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-eucalypt text-white"
          : "bg-white border border-gray-200 text-gray-500 hover:border-eucalypt hover:text-eucalypt"
      }`}
    >
      {children}
    </button>
  );
}

export function HomeFeed({ initialPosts, olderPosts, currentWeek, userId }: HomeFeedProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = (searchParams.get("type") || "all") as PostTypeFilter;
  const sortParam = (searchParams.get("sort") || "top") as SortOrder;

  const [typeFilter, setTypeFilter] = useState<PostTypeFilter>(typeParam);
  const [sortOrder, setSortOrder] = useState<SortOrder>(sortParam);
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 20);

  function updateUrl(type: PostTypeFilter, sort: SortOrder) {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (sort !== "top") params.set("sort", sort);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/", { scroll: false });
  }

  async function fetchPosts(type: PostTypeFilter, sort: SortOrder, pageNum: number = 0) {
    setLoading(true);
    const supabase = createClient();
    const pageSize = 20;

    let query = supabase
      .from("posts")
      .select(
        `*,
        species:species_id (id, scientific_name, common_names),
        profile:user_id (id, display_name, avatar_url, crown_count),
        votes (id, user_id),
        comments (count)`
      )
      .eq("is_hidden", false)
      .eq("is_removed", false)
      .eq("week_year", currentWeek)
      .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

    if (type !== "all") {
      query = query.eq("post_type", type);
    }

    query = query.order("created_at", { ascending: false });

    const { data } = await query;

    interface PostRow {
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

    const rows = (data || []) as unknown as PostRow[];

    const transformed: PostCardData[] = rows
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
        user_has_voted: userId
          ? post.votes?.some((v) => v.user_id === userId) || false
          : false,
        comment_count: post.comments?.[0]?.count || 0,
      }));

    if (sort === "top") {
      transformed.sort((a, b) => b.vote_count - a.vote_count);
    }
    // "newest" is already sorted by created_at DESC from the query

    setHasMore(transformed.length >= pageSize);

    if (pageNum === 0) {
      setPosts(transformed);
    } else {
      setPosts((prev) => [...prev, ...transformed]);
    }
    setLoading(false);
  }

  function handleTypeChange(type: PostTypeFilter) {
    setTypeFilter(type);
    setPage(0);
    updateUrl(type, sortOrder);
    fetchPosts(type, sortOrder, 0);
  }

  function handleSortChange(sort: SortOrder) {
    setSortOrder(sort);
    setPage(0);
    updateUrl(typeFilter, sort);
    fetchPosts(typeFilter, sort, 0);
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(typeFilter, sortOrder, nextPage);
  }

  // Re-fetch if URL params change (e.g., initial load with params)
  useEffect(() => {
    if (typeParam !== "all" || sortParam !== "top") {
      setTypeFilter(typeParam);
      setSortOrder(sortParam);
      fetchPosts(typeParam, sortParam, 0);
    }
  }, []);

  const hasCurrentPosts = posts.length > 0 || initialPosts.length > 0;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-2 mb-6">
        {/* Post type filter */}
        <div className="flex gap-1.5">
          <PillButton active={typeFilter === "all"} onClick={() => handleTypeChange("all")}>
            All
          </PillButton>
          <PillButton active={typeFilter === "weed"} onClick={() => handleTypeChange("weed")}>
            Weeds
          </PillButton>
          <PillButton active={typeFilter === "before_after"} onClick={() => handleTypeChange("before_after")}>
            <span className="sm:hidden">B&A</span>
            <span className="hidden sm:inline">Before &amp; After</span>
          </PillButton>
        </div>

        {/* Sort order */}
        <div className="flex gap-1.5">
          <PillButton active={sortOrder === "top"} onClick={() => handleSortChange("top")}>
            Top
          </PillButton>
          <PillButton active={sortOrder === "newest"} onClick={() => handleSortChange("newest")}>
            Newest
          </PillButton>
        </div>
      </div>

      {/* No current-week posts: show older posts as fallback */}
      {posts.length === 0 && !loading && olderPosts.length > 0 ? (
        <PostGrid posts={olderPosts} />
      ) : (
        <>
          <PostGrid posts={posts} />

          {/* Load more current-week posts */}
          {hasMore && posts.length > 0 && (
            <div className="text-center mt-6">
              <button
                type="button"
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

          {/* Older posts section with divider */}
          {posts.length > 0 && olderPosts.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Previous Weeks
                </span>
                <div className="flex-1 border-t border-gray-200" />
              </div>
              <PostGrid posts={olderPosts} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
