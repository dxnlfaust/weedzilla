import Link from "next/link";
import { SpeciesBadge } from "@/components/species/SpeciesBadge";
import { VoteButton } from "@/components/voting/VoteButton";
import { formatRelativeTime } from "@/lib/utils/formatters";

export interface PostCardData {
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
  } | null;
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
  vote_count: number;
  user_has_voted: boolean;
}

interface PostCardProps {
  post: PostCardData;
}

export function PostCard({ post }: PostCardProps) {
  const isBA = post.post_type === "before_after";
  const thumbnailUrl = isBA && post.image_url_after ? post.image_url_after : post.image_url;
  const altText = post.species
    ? `${post.species.scientific_name} by ${post.profile.display_name}`
    : `Site by ${post.profile.display_name}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Link href={`/post/${post.id}`} className="relative block">
        <img
          src={thumbnailUrl}
          alt={altText}
          className="w-full aspect-square object-cover"
        />
        {isBA && (
          <span className="absolute top-2 left-2 bg-teal-600/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            B&A
          </span>
        )}
      </Link>
      <div className="p-3 space-y-2">
        {post.species ? (
          <SpeciesBadge
            speciesId={post.species.id}
            scientificName={post.species.scientific_name}
            commonName={post.species.common_names[0]}
          />
        ) : post.site_description ? (
          <p className="text-sm text-gray-600 line-clamp-1">{post.site_description}</p>
        ) : null}
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${post.profile.id}`}
            className="text-sm text-gray-500 hover:text-carbon transition-colors duration-150"
          >
            {post.profile.display_name}
          </Link>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(post.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <VoteButton
            postId={post.id}
            weekYear={post.week_year}
            initialHasVoted={post.user_has_voted}
            initialVoteCount={post.vote_count}
          />
        </div>
      </div>
    </div>
  );
}
