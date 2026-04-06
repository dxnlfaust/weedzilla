import Link from "next/link";
import { MessageCircle, Crown } from "lucide-react";
import { SpeciesBadge } from "@/components/species/SpeciesBadge";
import { VoteButton } from "@/components/voting/VoteButton";
import { CompareSlider } from "./CompareSlider";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { thumbnail } from "@/lib/utils/image";

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
    crown_count: number;
  };
  vote_count: number;
  user_has_voted: boolean;
  comment_count: number;
}

interface PostCardProps {
  post: PostCardData;
}

export function PostCard({ post }: PostCardProps) {
  const isBA = post.post_type === "before_after" && post.image_url_after;
  const altText = post.species
    ? `${post.species.scientific_name} by ${post.profile.display_name}`
    : `Site by ${post.profile.display_name}`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {isBA ? (
        <CompareSlider
          beforeSrc={thumbnail(post.image_url)}
          afterSrc={thumbnail(post.image_url_after)}
          alt={altText}
          compact
        />
      ) : (
        <Link href={`/post/${post.id}`} className="block">
          <img
            src={thumbnail(post.image_url)}
            alt={altText}
            className="w-full aspect-square object-cover"
          />
        </Link>
      )}
      <div className="p-3 space-y-2">
        <Link href={`/post/${post.id}`} className="block">
          {post.species ? (
            <SpeciesBadge
              speciesId={post.species.id}
              scientificName={post.species.scientific_name}
              commonName={post.species.common_names[0]}
            />
          ) : post.site_description ? (
            <p className="text-sm text-gray-600 line-clamp-1">{post.site_description}</p>
          ) : null}
        </Link>
        <div className="flex items-center justify-between">
          <Link
            href={`/profile/${post.profile.id}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-carbon transition-colors duration-150"
          >
            {post.profile.display_name}
            {post.profile.crown_count > 0 && (
              <span className="inline-flex items-center gap-0.5 text-gold">
                <Crown className="h-3 w-3" />
                <span className="text-xs font-medium">{post.profile.crown_count}</span>
              </span>
            )}
          </Link>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(post.created_at)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <VoteButton
              postId={post.id}
              weekYear={post.week_year}
              initialHasVoted={post.user_has_voted}
              initialVoteCount={post.vote_count}
            />
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-eucalypt transition-colors duration-150"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.comment_count}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
