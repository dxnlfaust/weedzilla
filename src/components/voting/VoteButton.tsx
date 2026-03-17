"use client";

import { Heart } from "lucide-react";
import { useVote } from "@/hooks/useVote";
import { useAuth } from "@/hooks/useAuth";

interface VoteButtonProps {
  postId: string;
  weekYear: string;
  initialHasVoted: boolean;
  initialVoteCount: number;
}

export function VoteButton({
  postId,
  weekYear,
  initialHasVoted,
  initialVoteCount,
}: VoteButtonProps) {
  const { user } = useAuth();
  const { hasVoted, voteCount, isLoading, toggleVote } = useVote({
    postId,
    weekYear,
    userId: user?.id ?? null,
    initialHasVoted,
    initialVoteCount,
  });

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleVote();
      }}
      disabled={isLoading}
      aria-label={hasVoted ? "Remove your vote" : "Vote for this post"}
      className="flex items-center gap-1.5 text-sm transition-colors duration-150 disabled:opacity-50"
    >
      <Heart
        className={`h-5 w-5 transition-colors duration-150 ${
          hasVoted ? "fill-red text-red" : "text-gray-400 hover:text-red"
        }`}
      />
      <span className={hasVoted ? "text-red font-medium" : "text-gray-500"}>
        {voteCount}
      </span>
    </button>
  );
}
