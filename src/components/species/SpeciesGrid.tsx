"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface SpeciesItem {
  id: number;
  scientific_name: string;
  common_names: string[];
  family: string | null;
  post_count: number;
}

interface SpeciesGridProps {
  species: SpeciesItem[];
}

type SortMode = "alphabetical" | "most_common";

export function SpeciesGrid({ species }: SpeciesGridProps) {
  const [sort, setSort] = useState<SortMode>("alphabetical");

  const sorted = useMemo(() => {
    if (sort === "most_common") {
      return [...species].sort((a, b) => b.post_count - a.post_count || a.scientific_name.localeCompare(b.scientific_name));
    }
    return species; // already alphabetical from server
  }, [species, sort]);

  if (species.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No species found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sort toggle */}
      <div className="flex gap-1.5 mb-4">
        <button
          type="button"
          onClick={() => setSort("alphabetical")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            sort === "alphabetical"
              ? "bg-eucalypt text-white"
              : "bg-white border border-gray-200 text-gray-500 hover:border-eucalypt hover:text-eucalypt"
          }`}
        >
          A–Z
        </button>
        <button
          type="button"
          onClick={() => setSort("most_common")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
            sort === "most_common"
              ? "bg-eucalypt text-white"
              : "bg-white border border-gray-200 text-gray-500 hover:border-eucalypt hover:text-eucalypt"
          }`}
        >
          Most Common
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((s) => (
          <Link
            key={s.id}
            href={`/species/${s.id}`}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-eucalypt transition-colors duration-150"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="italic font-medium text-carbon">
                  {s.scientific_name}
                </p>
                {s.common_names.length > 0 && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {s.common_names.join(", ")}
                  </p>
                )}
                {s.family && (
                  <p className="text-xs text-gray-400 mt-1">{s.family}</p>
                )}
              </div>
              {s.post_count > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 shrink-0">
                  {s.post_count} {s.post_count === 1 ? "post" : "posts"}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
