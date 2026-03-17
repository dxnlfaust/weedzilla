"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";
import { formatWeekLabel } from "@/lib/utils/formatters";
import { toast } from "sonner";

const placeLabels: Record<number, string> = {
  1: "Gold",
  2: "Silver",
  3: "Bronze",
};

const typeLabels: Record<string, string> = {
  weed: "Weed of the Week",
  before_after: "B&A of the Week",
};

export function useWinNotification() {
  const { user } = useAuth();
  const checked = useRef(false);

  useEffect(() => {
    if (!user || checked.current) return;
    checked.current = true;

    async function checkWins() {
      const supabase = createClient();
      const { data } = await supabase.rpc("get_unseen_wins", {
        p_user_id: user!.id,
      });

      if (!data || data.length === 0) return;

      // Show a toast for each win
      for (const win of data) {
        const place = placeLabels[win.place] || `Place ${win.place}`;
        const type = typeLabels[win.post_type] || win.post_type;
        const week = formatWeekLabel(win.week_year);

        toast.success(`${place} — ${type}!`, {
          description: `Congratulations! You placed ${place.toLowerCase()} for ${week}.`,
          duration: 8000,
        });
      }

      // Mark as seen
      await supabase
        .from("profiles")
        .update({ last_notified_win_at: new Date().toISOString() })
        .eq("id", user!.id);
    }

    // Slight delay so it doesn't fire during initial page load
    const timer = setTimeout(checkWins, 2000);
    return () => clearTimeout(timer);
  }, [user]);
}
