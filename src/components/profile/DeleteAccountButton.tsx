"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteAccount } from "@/app/profile/actions";

export function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");
    const result = await deleteAccount();
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-red hover:text-red/80 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
        Delete account
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-carbon">
              Delete your account?
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              This will permanently delete your account, profile, and all your
              posts. This cannot be undone.
            </p>
            {error && (
              <p className="text-sm text-red">{error}</p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setOpen(false); setError(""); }}
                disabled={loading}
                className="flex-1 border border-gray-200 text-carbon text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red text-white text-sm font-medium py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
