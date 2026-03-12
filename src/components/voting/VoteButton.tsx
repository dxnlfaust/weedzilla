"use client";

import { Heart } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useVote } from "@/hooks/useVote";
import { useAuth } from "@/hooks/useAuth";

interface VoteButtonProps {
  postId: string;
  speciesId: number;
  weekYear: string;
  initialHasVoted: boolean;
  initialVoteCount: number;
}

export function VoteButton({
  postId,
  speciesId,
  weekYear,
  initialHasVoted,
  initialVoteCount,
}: VoteButtonProps) {
  const { user } = useAuth();
  const {
    hasVoted,
    voteCount,
    isLoading,
    toggleVote,
    showSwapDialog,
    confirmSwap,
    cancelSwap,
  } = useVote({
    postId,
    speciesId,
    weekYear,
    userId: user?.id ?? null,
    initialHasVoted,
    initialVoteCount,
  });

  return (
    <>
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

      <Dialog open={showSwapDialog} onClose={cancelSwap} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <DialogTitle className="text-lg font-bold text-carbon mb-2">
              Move your vote?
            </DialogTitle>
            <p className="text-sm text-gray-500 mb-6">
              You&apos;ve already voted for another post in this species this
              week. Moving your vote here will remove your previous vote.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelSwap}
                className="px-4 py-2 text-sm text-gray-600 hover:text-carbon transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSwap}
                className="px-4 py-2 text-sm bg-eucalypt text-white rounded-lg hover:bg-eucalypt-light transition-colors"
              >
                Move my vote
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
