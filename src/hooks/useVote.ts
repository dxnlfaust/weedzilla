"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UseVoteOptions {
  postId: string;
  weekYear: string;
  userId: string | null;
  initialHasVoted: boolean;
  initialVoteCount: number;
}

export function useVote({
  postId,
  weekYear,
  userId,
  initialHasVoted,
  initialVoteCount,
}: UseVoteOptions) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isLoading, setIsLoading] = useState(false);

  async function toggleVote() {
    if (!userId) {
      toast.error("Please log in to vote.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      if (hasVoted) {
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("user_id", userId)
          .eq("post_id", postId);

        if (error) throw error;

        setHasVoted(false);
        setVoteCount((c) => c - 1);
      } else {
        const { error } = await supabase.from("votes").insert({
          user_id: userId,
          post_id: postId,
          week_year: weekYear,
        });

        if (error) throw error;

        setHasVoted(true);
        setVoteCount((c) => c + 1);
      }
    } catch {
      toast.error("Failed to vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    hasVoted,
    voteCount,
    isLoading,
    toggleVote,
  };
}
