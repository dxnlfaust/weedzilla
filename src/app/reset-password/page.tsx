"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Session established server-side by /auth/callback before redirect — check immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
        return;
      }
      // Fallback: implicit-flow token in URL hash fires this event client-side
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setSessionReady(true);
          subscription.unsubscribe();
        }
      });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated!");
      router.push("/login");
    }
  }

  if (!sessionReady) {
    return (
      <div className="max-w-md mx-auto mt-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-eucalypt mx-auto mb-4" />
        <p className="text-sm text-gray-500">Verifying reset link…</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold text-carbon mb-6 text-center">Set New Password</h1>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-carbon mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
              placeholder="At least 6 characters"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-carbon mb-1">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
              placeholder="Repeat your new password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-4 py-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
