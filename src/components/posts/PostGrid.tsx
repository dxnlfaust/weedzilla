import { PostCard, type PostCardData } from "./PostCard";

interface PostGridProps {
  posts: PostCardData[];
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No posts yet. Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
