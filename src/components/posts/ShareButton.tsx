"use client";

import { useState } from "react";
import { Share2, Link as LinkIcon, X as XIcon } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
  title: string;
  text?: string;
}

export function ShareButton({ url, title, text }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url, title, text });
      } catch {
        // User cancelled — ignore
      }
      return;
    }
    setOpen((prev) => !prev);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied!");
    setOpen(false);
  }

  function shareTwitter() {
    const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || title)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function shareFacebook() {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        className="text-gray-400 hover:text-eucalypt transition-colors duration-150"
        aria-label="Share this post"
      >
        <Share2 className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 w-44">
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-2 text-sm text-carbon hover:bg-gray-50 w-full text-left"
            >
              <LinkIcon className="h-4 w-4 text-gray-400" />
              Copy link
            </button>
            <button
              type="button"
              onClick={shareTwitter}
              className="flex items-center gap-2 px-3 py-2 text-sm text-carbon hover:bg-gray-50 w-full text-left"
            >
              <XIcon className="h-4 w-4 text-gray-400" />
              Share on X
            </button>
            <button
              type="button"
              onClick={shareFacebook}
              className="flex items-center gap-2 px-3 py-2 text-sm text-carbon hover:bg-gray-50 w-full text-left"
            >
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Share on Facebook
            </button>
          </div>
        </>
      )}
    </div>
  );
}
