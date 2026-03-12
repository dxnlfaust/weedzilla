"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SpeciesResult {
  id: number;
  scientific_name: string;
  common_names: string[];
  family: string | null;
  similarity: number;
  matched_via: string;
}

export function useSpeciesSearch(query: string) {
  const [results, setResults] = useState<SpeciesResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("search_species", {
        query,
        max_results: 10,
      });

      if (!error && data) {
        setResults(data as SpeciesResult[]);
      }
      setLoading(false);
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      setLoading(false);
    };
  }, [query]);

  return { results, loading };
}
