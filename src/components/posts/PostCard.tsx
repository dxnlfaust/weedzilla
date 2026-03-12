import Link from "next/link";
import { SpeciesBadge } from "@/components/species/SpeciesBadge";
import { VoteButton } from "@/components/voting/VoteButton";
import { formatRelativeTime } from "@/lib/utils/formatters";

export interface PostCardData {
  id: string;
  image_url: string;
  caption: string | null;
  week_year: string;
  created_at: string;
  species: {
    id: number;
    scientific_name: string;
    common_names: string[];
  };
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
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <Link href={`/post/${post.id}`}>
        <img
          src={post.image_url}
          alt={`${post.species.scientific_name} removed by ${post.profile.display_name}`}
          className="w-full aspect-square object-cover"
        />
      </Link>
      <div className="p-3 space-y-2">
        <SpeciesBadge
          speciesId={post.species.id}
          scientificName={post.species.scientific_name}
          commonName={post.species.common_names[0]}
        />
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
            speciesId={post.species.id}
            weekYear={post.week_year}
            initialHasVoted={post.user_has_voted}
            initialVoteCount={post.vote_count}
          />
        </div>
      </div>
    </div>
  );
}
