"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UseVoteOptions {
  postId: string;
  speciesId: number;
  weekYear: string;
  userId: string | null;
  initialHasVoted: boolean;
  initialVoteCount: number;
}

export function useVote({
  postId,
  speciesId,
  weekYear,
  userId,
  initialHasVoted,
  initialVoteCount,
}: UseVoteOptions) {
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isLoading, setIsLoading] = useState(false);
  const [showSwapDialog, setShowSwapDialog] = useState(false);

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
        const { data: existingVote } = await supabase
          .from("votes")
          .select("id, post_id")
          .eq("user_id", userId)
          .eq("species_id", speciesId)
          .eq("week_year", weekYear)
          .maybeSingle();

        if (existingVote && existingVote.post_id !== postId) {
          setIsLoading(false);
          setShowSwapDialog(true);
          return;
        }

        const { error } = await supabase.from("votes").insert({
          user_id: userId,
          post_id: postId,
          species_id: speciesId,
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

  async function confirmSwap() {
    if (!userId) return;
    setIsLoading(true);
    setShowSwapDialog(false);
    const supabase = createClient();

    try {
      const { error } = await supabase.rpc("swap_vote", {
        p_user_id: userId,
        p_new_post_id: postId,
        p_species_id: speciesId,
        p_week_year: weekYear,
      });

      if (error) throw error;

      setHasVoted(true);
      setVoteCount((c) => c + 1);
    } catch {
      toast.error("Failed to move vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function cancelSwap() {
    setShowSwapDialog(false);
  }

  return {
    hasVoted,
    voteCount,
    isLoading,
    toggleVote,
    showSwapDialog,
    confirmSwap,
    cancelSwap,
  };
}
