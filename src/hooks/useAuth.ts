"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [crownCount, setCrownCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchProfile(userId: string) {
    const [{ data }, { data: notifCount }] = await Promise.all([
      supabase
        .from("profiles")
        .select("crown_count, avatar_url, display_name")
        .eq("id", userId)
        .single(),
      supabase.rpc("get_unread_notification_count", { p_user_id: userId }),
    ]);
    setCrownCount(data?.crown_count ?? 0);
    setAvatarUrl(data?.avatar_url ?? null);
    setDisplayName(data?.display_name ?? null);
    setUnreadCount(notifCount ?? 0);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile(user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id);
      } else {
        setCrownCount(0);
        setAvatarUrl(null);
        setDisplayName(null);
        setUnreadCount(0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, crownCount, avatarUrl, displayName, unreadCount, setUnreadCount, loading, signOut };
}
