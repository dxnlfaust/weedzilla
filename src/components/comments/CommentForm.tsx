"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface CommentFormProps {
  postId: string;
  userId: string;
  onCommentAdded: (comment: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profile: { id: string; display_name: string; avatar_url: string | null };
  }) => void;
}

export function CommentForm({ postId, userId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const maxLength = 500;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: trimmed,
      })
      .select(
        `id, content, created_at, user_id,
        profile:user_id (id, display_name, avatar_url)`
      )
      .single();

    if (error) {
      toast.error("Failed to post comment.");
      setSubmitting(false);
      return;
    }

    const row = data as unknown as {
      id: string;
      content: string;
      created_at: string;
      user_id: string;
      profile: { id: string; display_name: string; avatar_url: string | null };
    };

    onCommentAdded(row);
    setContent("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
          placeholder="Add a comment..."
          rows={1}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-12 text-sm focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none resize-none"
        />
        <span className="absolute bottom-2 right-3 text-xs text-gray-300">
          {content.length}/{maxLength}
        </span>
      </div>
      <button
        type="submit"
        disabled={submitting || !content.trim()}
        className="shrink-0 bg-eucalypt text-white rounded-lg px-3 py-2 hover:bg-eucalypt-light transition-colors disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
