import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/PostDetail";
import { display } from "@/lib/utils/image";

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

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("image_url, caption, site_description, species:species_id (scientific_name, common_names)")
    .eq("id", postId)
    .single();

  const post = data as unknown as {
    image_url: string;
    caption: string | null;
    site_description: string | null;
    species: { scientific_name: string; common_names: string[] } | null;
  } | null;

  if (!post) return { title: "Post Not Found" };

  const title = post.species?.scientific_name || post.site_description || "Post";
  const description = post.caption || `${title} on WeedZilla`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | WeedZilla`,
      description,
      images: [{ url: display(post.image_url), width: 1200 }],
      type: "article",
    },
    twitter: { card: "summary_large_image" },
  };
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://weedzilla.app";

  return (
    <PostDetail
      post={transformedPost}
      userId={user?.id ?? null}
      postUrl={`${siteUrl}/post/${postId}`}
      comments={comments}
    />
  );
}
