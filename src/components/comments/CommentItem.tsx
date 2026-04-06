"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Flag, Crown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ReportDialog } from "@/components/reports/ReportDialog";
import { formatRelativeTime } from "@/lib/utils/formatters";

export interface CommentData {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    crown_count: number;
  };
}

interface CommentItemProps {
  comment: CommentData;
  userId: string | null;
  onDeleted: (commentId: string) => void;
}

export function CommentItem({ comment, userId, onDeleted }: CommentItemProps) {
  const [showReport, setShowReport] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwn = userId === comment.user_id;

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id);

    if (error) {
      toast.error("Failed to delete comment.");
      setDeleting(false);
      return;
    }

    onDeleted(comment.id);
  }

  return (
    <div className="flex gap-3 py-3">
      {/* Avatar */}
      <Link href={`/profile/${comment.profile.id}`} className="shrink-0">
        {comment.profile.avatar_url ? (
          <img
            src={comment.profile.avatar_url}
            alt={comment.profile.display_name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-eucalypt/10 flex items-center justify-center text-xs font-bold text-eucalypt">
            {comment.profile.display_name[0]?.toUpperCase()}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/profile/${comment.profile.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-carbon hover:text-eucalypt transition-colors"
          >
            {comment.profile.display_name}
            {comment.profile.crown_count > 0 && (
              <span className="inline-flex items-center gap-0.5 text-gold">
                <Crown className="h-3 w-3" />
                <span className="text-xs font-medium">{comment.profile.crown_count}</span>
              </span>
            )}
          </Link>
          <span className="text-xs text-gray-400">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-700 mt-0.5 break-words">
          {comment.content}
        </p>
      </div>

      {/* Actions */}
      {userId && (
        <div className="shrink-0 pt-1">
          {isOwn ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-gray-400 hover:text-red transition-colors p-1"
              aria-label="Delete comment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowReport(true)}
              className="text-gray-400 hover:text-red transition-colors p-1"
              aria-label="Report comment"
            >
              <Flag className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {showReport && userId && (
        <ReportDialog
          open={showReport}
          onClose={() => setShowReport(false)}
          targetType="comment"
          targetId={comment.id}
          userId={userId}
        />
      )}
    </div>
  );
}
