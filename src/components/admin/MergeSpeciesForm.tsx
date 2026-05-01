"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { mergeSpecies } from "@/app/admin/actions";
import { GitMerge, Loader2, X } from "lucide-react";

interface Props {
  pendingId: number;
  pendingName: string;
}

interface SpeciesResult {
  id: number;
  scientific_name: string;
  common_names: string[];
}

export function MergeSpeciesForm({ pendingId, pendingName }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpeciesResult[]>([]);
  const [selected, setSelected] = useState<SpeciesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function search(q: string) {
    setQuery(q);
    setSelected(null);
    if (q.trim().length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("species")
        .select("id, scientific_name, common_names")
        .eq("status", "approved")
        .neq("id", pendingId)
        .ilike("scientific_name", `%${q}%`)
        .limit(8);
      setResults((data as SpeciesResult[]) || []);
    }, 250);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    const fd = new FormData();
    fd.set("pending_id", String(pendingId));
    fd.set("target_id", String(selected.id));
    await mergeSpecies(fd);
    // page will revalidate — no need to reset state
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost text-sm px-3 py-1.5 flex items-center gap-1.5"
      >
        <GitMerge className="h-3.5 w-3.5" />
        Merge with existing
      </button>
    );
  }

  return (
    <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-600">
          Merge <span className="italic text-carbon">{pendingName}</span> into an existing species
        </p>
        <button
          type="button"
          onClick={() => { setOpen(false); setQuery(""); setResults([]); setSelected(null); }}
          className="text-gray-400 hover:text-carbon"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search species name…"
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none bg-white"
          autoFocus
        />
        {results.length > 0 && !selected && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => { setSelected(r); setResults([]); setQuery(r.scientific_name); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <span className="italic text-carbon">{r.scientific_name}</span>
                  {r.common_names[0] && (
                    <span className="text-gray-400 ml-1.5">— {r.common_names[0]}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs text-gray-600">
            All posts tagged as{" "}
            <span className="italic font-medium text-carbon">{pendingName}</span>{" "}
            will be re-tagged as{" "}
            <span className="italic font-medium text-eucalypt">{selected.scientific_name}</span>,
            and the duplicate entry will be rejected.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="btn-success text-sm px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitMerge className="h-3.5 w-3.5" />}
            Confirm merge
          </button>
        </form>
      )}
    </div>
  );
}
