"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useSpeciesSearch, type SpeciesResult } from "@/hooks/useSpeciesSearch";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

interface SpeciesSearchProps {
  onSelect: (speciesId: number, scientificName: string) => void;
  selectedId?: number | null;
}

export function SpeciesSearch({ onSelect, selectedId }: SpeciesSearchProps) {
  const [query, setQuery] = useState("");
  const { results, loading } = useSpeciesSearch(query);
  const { user } = useAuth();
  const [selected, setSelected] = useState<SpeciesResult | null>(null);

  async function handleSubmitNewSpecies() {
    if (!user || query.length < 2) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("species")
      .insert({
        scientific_name: query,
        common_names: [],
        status: "pending",
        submitted_by: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to submit species. It may already exist.");
      return;
    }

    toast.success(`"${query}" submitted for review!`);
    onSelect(data.id, data.scientific_name);
    setSelected({
      id: data.id,
      scientific_name: data.scientific_name,
      common_names: [],
      family: null,
      similarity: 1,
      matched_via: "new",
    });
    setQuery("");
  }

  function handleChange(value: SpeciesResult | null) {
    setSelected(value);
    if (value) {
      onSelect(value.id, value.scientific_name);
    }
  }

  return (
    <Combobox value={selected} onChange={handleChange}>
      <div className="relative">
        <div className="relative">
          <ComboboxInput
            className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
            displayValue={(species: SpeciesResult | null) =>
              species?.scientific_name || ""
            }
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search species (e.g., 'Lantana' or 'privet')..."
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>

        {query.length >= 2 && (
          <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white border border-gray-200 py-1 shadow-lg">
            {results.length === 0 && !loading && (
              <p className="px-3 py-2 text-sm text-gray-500">No matching species found.</p>
            )}

            {results.map((species) => (
              <ComboboxOption
                key={species.id}
                value={species}
                className="group cursor-pointer select-none px-3 py-2 data-[focus]:bg-eucalypt/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="italic font-medium text-carbon">
                      {species.scientific_name}
                    </span>
                    {species.common_names.length > 0 && (
                      <span className="text-gray-500 ml-1.5 text-sm">
                        ({species.common_names[0]})
                      </span>
                    )}
                    {species.matched_via === "synonym" && (
                      <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        matched via synonym
                      </span>
                    )}
                  </div>
                  {selectedId === species.id && (
                    <Check className="h-4 w-4 text-eucalypt" />
                  )}
                </div>
                {species.family && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {species.family}
                  </p>
                )}
              </ComboboxOption>
            ))}

            {/* Always offer submitting a new species */}
            {user && !loading && (
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleSubmitNewSpecies}
                  className="flex items-center gap-1.5 w-full px-3 py-2 text-sm text-eucalypt hover:bg-eucalypt/5 transition-colors font-medium"
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  Submit &ldquo;{query}&rdquo; as a new species
                </button>
              </div>
            )}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
}
