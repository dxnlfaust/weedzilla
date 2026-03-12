import { createClient } from "@/lib/supabase/server";
import { SpeciesGrid } from "@/components/species/SpeciesGrid";

export default async function SpeciesPage() {
  const supabase = await createClient();

  const { data: species } = await supabase
    .from("species")
    .select("id, scientific_name, common_names, family")
    .eq("status", "approved")
    .order("scientific_name");

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
      <SpeciesGrid species={species || []} />
    </div>
  );
}
