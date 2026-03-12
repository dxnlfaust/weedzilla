import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/posts/PostDetail";

interface PostWithJoins {
  id: string;
  image_url: string;
  caption: string | null;
  week_year: string;
  created_at: string;
  species: {
    id: number;
    scientific_name: string;
    common_names: string[];
    family: string | null;
  };
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

  const transformedPost = {
    id: post.id,
    image_url: post.image_url,
    caption: post.caption,
    week_year: post.week_year,
    created_at: post.created_at,
    species: post.species,
    profile: post.profile,
    vote_count: post.votes?.length || 0,
    user_has_voted: user
      ? post.votes?.some((v) => v.user_id === user.id) || false
      : false,
  };

  return <PostDetail post={transformedPost} />;
}
