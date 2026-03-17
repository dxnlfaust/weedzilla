import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/PostDetail";

interface PostWithJoins {
  id: string;
  image_url: string;
  image_url_after: string | null;
  caption: string | null;
  site_description: string | null;
  post_type: "weed" | "before_after";
  week_year: string;
  created_at: string;
  species: {
    id: number;
    scientific_name: string;
    common_names: string[];
    family: string | null;
  } | null;
  profile: { id: string; display_name: string; avatar_url: string | null };
  votes: { id: string; user_id: string }[];
}

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select(
      `
      *,
      species:species_id (id, scientific_name, common_names, family),
      profile:user_id (id, display_name, avatar_url),
      votes (id, user_id)
    `
    )
    .eq("id", postId)
    .single();

  const post = data as unknown as PostWithJoins | null;
  if (!post) notFound();

  // Increment view count (fire-and-forget)
  supabase.rpc("increment_view_count", { p_post_id: postId });

  // Fetch comments for this post
  const { data: commentsRaw } = await supabase
    .from("comments")
    .select(
      `id, content, created_at, user_id,
      profile:user_id (id, display_name, avatar_url)`
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const comments = (commentsRaw || []) as unknown as {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profile: { id: string; display_name: string; avatar_url: string | null };
  }[];

  const transformedPost = {
    id: post.id,
    image_url: post.image_url,
    image_url_after: post.image_url_after,
    caption: post.caption,
    site_description: post.site_description,
    post_type: post.post_type,
    week_year: post.week_year,
    created_at: post.created_at,
    species: post.species,
    profile: post.profile,
    vote_count: post.votes?.length || 0,
    user_has_voted: user
      ? post.votes?.some((v) => v.user_id === user.id) || false
      : false,
  };

  return (
    <PostDetail
      post={transformedPost}
      userId={user?.id ?? null}
      comments={comments}
    />
  );
}
