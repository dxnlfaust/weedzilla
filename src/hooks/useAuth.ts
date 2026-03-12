"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [crownCount, setCrownCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function fetchCrownCount(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("crown_count")
      .eq("id", userId)
      .single();
    setCrownCount(data?.crown_count ?? 0);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchCrownCount(user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchCrownCount(u.id);
      } else {
        setCrownCount(0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, crownCount, loading, signOut };
}
