"use client";

import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentItem, type CommentData } from "./CommentItem";
import { MessageCircle } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  initialComments: CommentData[];
  userId: string | null;
}

export function CommentSection({
  postId,
  initialComments,
  userId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  function handleCommentAdded(comment: CommentData) {
    setComments((prev) => [...prev, comment]);
  }

  function handleDeleted(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-carbon">
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="divide-y divide-gray-100 mb-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              userId={userId}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Form */}
      {userId ? (
        <CommentForm
          postId={postId}
          userId={userId}
          onCommentAdded={handleCommentAdded}
        />
      ) : (
        <p className="text-sm text-gray-400 text-center py-3">
          Log in to leave a comment.
        </p>
      )}
    </div>
  );
}
