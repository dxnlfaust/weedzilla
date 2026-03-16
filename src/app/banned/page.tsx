"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BannedPage() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-carbon mb-3">
          Account Suspended
        </h1>
        <p className="text-gray-500 mb-6">
          Your account has been suspended due to a violation of our community
          guidelines. If you believe this is a mistake, please contact us at{" "}
          <a
            href="mailto:support@weedzilla.app"
            className="text-eucalypt hover:underline"
          >
            support@weedzilla.app
          </a>
          .
        </p>
        <button
          onClick={handleSignOut}
          className="bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-6 py-2.5 font-medium transition-colors duration-150"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
