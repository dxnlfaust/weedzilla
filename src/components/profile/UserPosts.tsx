"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PostGrid } from "@/components/posts/PostGrid";
import type { PostCardData } from "@/components/posts/PostCard";
import { CompareSlider } from "@/components/posts/CompareSlider";
import { EditPostModal } from "@/components/posts/EditPostModal";
import { toast } from "sonner";
import { Trash2, Pencil } from "lucide-react";

interface UserPostsProps {
  posts: PostCardData[];
  isOwner?: boolean;
}

export function UserPosts({ posts: initialPosts, isOwner }: UserPostsProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [editingPost, setEditingPost] = useState<PostCardData | null>(null);
  const router = useRouter();

  async function handleDelete(postId: string, imageUrl: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This cannot be undone."
    );
    if (!confirmed) return;

    const supabase = createClient();

    const urlParts = imageUrl.split("/post-images/");
    if (urlParts[1]) {
      await supabase.storage.from("post-images").remove([urlParts[1]]);
    }

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      toast.error("Failed to delete post.");
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast.success("Post deleted.");
    router.refresh();
  }

  function handleSaved(postId: string, updated: Partial<PostCardData>) {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updated } : p))
    );
    toast.success("Post updated.");
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No posts yet.</p>
      </div>
    );
  }

  if (!isOwner) {
    return <PostGrid posts={posts} />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div key={post.id} className="relative group">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative">
                {post.post_type === "before_after" && post.image_url_after ? (
                  <CompareSlider
                    beforeSrc={post.thumbnail_url ?? post.image_url}
                    afterSrc={post.thumbnail_url_after ?? post.image_url_after}
                    alt={post.species?.scientific_name || post.site_description || "Post"}
                    compact
                  />
                ) : (
                  <img
                    src={post.thumbnail_url ?? post.image_url}
                    alt={post.species?.scientific_name || post.site_description || "Post"}
                    className="w-full aspect-square object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <p className="italic text-sm text-eucalypt font-medium">
                  {post.species?.scientific_name || post.site_description || "Before & After"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {post.vote_count} vote{post.vote_count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Action buttons — always visible on mobile, hover on desktop */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-150">
              <button
                type="button"
                onClick={() => setEditingPost(post)}
                className="bg-white/90 hover:bg-eucalypt hover:text-white text-gray-500 rounded-full p-1.5 transition-all duration-150"
                aria-label="Edit post"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(post.id, post.image_url)}
                className="bg-white/90 hover:bg-red hover:text-white text-gray-500 rounded-full p-1.5 transition-all duration-150"
                aria-label="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={(updated) => {
            handleSaved(editingPost.id, updated);
            setEditingPost(null);
          }}
        />
      )}
    </>
  );
}
