import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/posts/UploadForm";

interface UploadPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function UploadPage({ searchParams }: UploadPageProps) {
  const { type } = await searchParams;
  const postType = type === "before_after" ? "before_after" : "weed";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/upload");

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <UploadForm
          userId={user.id}
          accountCreatedAt={user.created_at}
          postType={postType}
        />
      </div>
    </div>
  );
}
