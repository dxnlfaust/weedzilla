"use client";

import { useWinNotification } from "@/hooks/useWinNotification";

export function WinNotifier() {
  useWinNotification();
  return null;
}
