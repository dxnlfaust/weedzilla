"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    toast.success("Welcome back!");
    router.push(redirect);
    router.refresh();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setResetSent(true);
    }
  }

  if (showReset) {
    return (
      <div className="space-y-4">
        {resetSent ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A password reset link has been sent to <strong>{resetEmail}</strong>. Check your inbox.
            </p>
            <button
              type="button"
              onClick={() => { setShowReset(false); setResetSent(false); }}
              className="text-sm text-eucalypt hover:text-eucalypt-light font-medium"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="resetEmail" className="block text-sm font-medium text-carbon mb-1">
                Your email address
              </label>
              <input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
                placeholder="you@example.com"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-4 py-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resetLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {resetLoading ? "Sending..." : "Send reset link"}
            </button>
            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="w-full text-sm text-gray-500 hover:text-carbon"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red/10 border border-red/20 rounded-lg px-4 py-3 text-red text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-carbon mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-carbon">
            Password
          </label>
          <button
            type="button"
            onClick={() => { setShowReset(true); setResetEmail(email); }}
            className="text-xs text-eucalypt hover:text-eucalypt-light"
          >
            Forgot password?
          </button>
        </div>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
          placeholder="Your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-4 py-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Logging in..." : "Log In"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-eucalypt hover:text-eucalypt-light font-medium">
          Sign up
        </Link>
      </p>
    </form>
  );
}
