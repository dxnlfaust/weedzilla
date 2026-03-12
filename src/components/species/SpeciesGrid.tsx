import Link from "next/link";

interface SpeciesItem {
  id: number;
  scientific_name: string;
  common_names: string[];
  family: string | null;
}

interface SpeciesGridProps {
  species: SpeciesItem[];
}

export function SpeciesGrid({ species }: SpeciesGridProps) {
  if (species.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No species found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {species.map((s) => (
        <Link
          key={s.id}
          href={`/species/${s.id}`}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-eucalypt transition-colors duration-150"
        >
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
        </Link>
      ))}
    </div>
  );
}
