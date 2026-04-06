"use client";

import { useEffect, useState } from "react";
import { Share, X } from "lucide-react";

// Not in standard lib — declare locally
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pwa_banner_dismissed_at";
const DISMISS_DAYS = 14;

type Mode = "android" | "ios" | "ios-instructions";

export function PWAInstallBanner() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already installed (standalone mode)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone === true)
    ) {
      return;
    }

    // Desktop — don't show
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    // Check dismiss cooldown
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - Number(dismissedAt);
      if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    // iOS Safari — no install prompt API
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    if (isIOS) {
      setMode("ios");
      return;
    }

    // Android/Chrome — listen for beforeinstallprompt
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode("android");
    };

    const handleInstalled = () => setMode(null);

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setMode(null);
  }

  async function handleInstall() {
    if (mode === "ios") {
      setMode("ios-instructions");
      return;
    }
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setMode(null);
    setDeferredPrompt(null);
  }

  if (!mode) return null;

  return (
    <div
      className="fixed inset-x-0 z-30 px-3"
      style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom) + 0.5rem)" }}
    >
      <div className="bg-white border border-eucalypt text-eucalypt-dark rounded-xl shadow-lg px-4 py-3">
        {mode === "ios-instructions" ? (
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm leading-snug">
              Tap{" "}
              <Share className="h-4 w-4 inline-block mx-0.5 align-middle text-eucalypt" />
              {" "}then <strong>Add to Home Screen</strong>
            </p>
            <button
              type="button"
              onClick={dismiss}
              className="text-eucalypt hover:text-eucalypt-dark shrink-0 p-1 -mt-0.5 -mr-1 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Install the WeedZilla app!</p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstall}
                className="bg-eucalypt text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-eucalypt-dark transition-colors"
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="text-eucalypt hover:text-eucalypt-dark p-1 -mr-1 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
