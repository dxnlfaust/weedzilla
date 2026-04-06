import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin layout — auth gate.
 * Returns 404 (not a redirect) so the route appears not to exist for non-admins.
 * Every admin action also independently re-verifies the session.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") notFound();

  return <>{children}</>;
}
