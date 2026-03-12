"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (displayName.length < 2 || displayName.length > 30) {
      errs.displayName = "Display name must be 2–30 characters.";
    }
    if (!email.includes("@")) {
      errs.email = "Please enter a valid email address.";
    }
    if (password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Check your email to verify your account!");
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-carbon mb-1">
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
          placeholder="Your display name"
        />
        {errors.displayName && (
          <p className="text-red text-sm mt-1">{errors.displayName}</p>
        )}
      </div>

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
        {errors.email && (
          <p className="text-red text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-carbon mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
          placeholder="At least 6 characters"
        />
        {errors.password && (
          <p className="text-red text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-carbon mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
          placeholder="Re-enter your password"
        />
        {errors.confirmPassword && (
          <p className="text-red text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-4 py-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-eucalypt hover:text-eucalypt-light font-medium">
          Log in
        </Link>
      </p>
    </form>
  );
}
