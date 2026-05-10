"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

interface ResetPasswordButtonProps {
  email: string;
}

export function ResetPasswordButton({ email }: ResetPasswordButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <p className="text-sm text-gray-500">
        Reset link sent to <strong>{email}</strong>. Check your inbox.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-eucalypt-dark border border-eucalypt-dark/30 hover:border-eucalypt-dark rounded-lg px-4 py-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {loading ? "Sending..." : "Send password reset email"}
    </button>
  );
}
