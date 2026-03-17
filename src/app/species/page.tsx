import { createClient } from "@/lib/supabase/server";
import { SpeciesGrid } from "@/components/species/SpeciesGrid";

export default async function SpeciesPage() {
  const supabase = await createClient();

  const { data: species } = await supabase
    .from("species")
    .select("id, scientific_name, common_names, family, posts(count)")
    .eq("status", "approved")
    .order("scientific_name");

  interface SpeciesRow {
    id: number;
    scientific_name: string;
    common_names: string[];
    family: string | null;
    posts: { count: number }[];
  }

  const rows = (species || []) as unknown as SpeciesRow[];

  const speciesWithCounts = rows.map((s) => ({
    id: s.id,
    scientific_name: s.scientific_name,
    common_names: s.common_names,
    family: s.family,
    post_count: s.posts?.[0]?.count || 0,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-carbon mb-1">
          Species Categories
        </h1>
        <p className="text-gray-500">
          Browse weeds by species. Click to see all posts.
        </p>
      </div>
      <SpeciesGrid species={speciesWithCounts} />
    </div>
  );
}
