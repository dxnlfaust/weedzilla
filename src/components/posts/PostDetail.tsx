import Link from "next/link";
import { SpeciesBadge } from "@/components/species/SpeciesBadge";
import { VoteButton } from "@/components/voting/VoteButton";
import { ReportButton } from "@/components/reports/ReportButton";
import { CommentSection } from "@/components/comments/CommentSection";
import { CompareSlider } from "@/components/posts/CompareSlider";
import type { CommentData } from "@/components/comments/CommentItem";
import { formatRelativeTime } from "@/lib/utils/formatters";

interface PostDetailProps {
  post: {
    id: string;
    image_url: string;
    image_url_after?: string | null;
    caption: string | null;
    site_description?: string | null;
    post_type: "weed" | "before_after";
    week_year: string;
    created_at: string;
    species: {
      id: number;
      scientific_name: string;
      common_names: string[];
      family: string | null;
    } | null;
    profile: {
      id: string;
      display_name: string;
      avatar_url: string | null;
    };
    vote_count: number;
    user_has_voted: boolean;
  };
  userId?: string | null;
  comments?: CommentData[];
}

export function PostDetail({ post, userId, comments }: PostDetailProps) {
  const isBA = post.post_type === "before_after";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isBA && post.image_url_after ? (
          <CompareSlider
            beforeSrc={post.image_url}
            afterSrc={post.image_url_after}
            alt={post.species?.scientific_name || post.site_description || "Before & After"}
          />
        ) : (
          <img
            src={post.image_url}
            alt={
              post.species
                ? `${post.species.scientific_name} removed by ${post.profile.display_name}`
                : `Post by ${post.profile.display_name}`
            }
            className="w-full object-contain max-h-[600px]"
          />
        )}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            {post.species ? (
              <SpeciesBadge
                speciesId={post.species.id}
                scientificName={post.species.scientific_name}
                commonName={post.species.common_names[0]}
              />
            ) : post.site_description ? (
              <p className="text-sm font-medium text-gray-600">{post.site_description}</p>
            ) : (
              <span />
            )}
            {post.species?.family && (
              <span className="text-xs text-gray-400">{post.species.family}</span>
            )}
          </div>

          {post.caption && (
            <p className="text-sm text-carbon">{post.caption}</p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${post.profile.id}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-carbon transition-colors duration-150"
              >
                {post.profile.avatar_url ? (
                  <img
                    src={post.profile.avatar_url}
                    alt={post.profile.display_name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-eucalypt/10 flex items-center justify-center text-xs font-medium text-eucalypt">
                    {post.profile.display_name[0]?.toUpperCase()}
                  </div>
                )}
                {post.profile.display_name}
              </Link>
              <span className="text-xs text-gray-400">
                {formatRelativeTime(post.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {userId && userId !== post.profile.id && (
                <ReportButton
                  targetType="post"
                  targetId={post.id}
                  userId={userId}
                />
              )}
              <VoteButton
                postId={post.id}
                weekYear={post.week_year}
                initialHasVoted={post.user_has_voted}
                initialVoteCount={post.vote_count}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      {comments && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
          <CommentSection
            postId={post.id}
            initialComments={comments}
            userId={userId ?? null}
          />
        </div>
      )}
    </div>
  );
}
