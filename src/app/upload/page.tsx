import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/posts/UploadForm";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/upload");

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-carbon mb-6">Upload a Weed</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <UploadForm userId={user.id} />
      </div>
    </div>
  );
}
