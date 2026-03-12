import Link from "next/link";

interface SpeciesBadgeProps {
  speciesId: number;
  scientificName: string;
  commonName?: string;
}

export function SpeciesBadge({
  speciesId,
  scientificName,
  commonName,
}: SpeciesBadgeProps) {
  return (
    <Link
      href={`/species/${speciesId}`}
      className="inline-flex items-center gap-1 text-sm hover:opacity-80 transition-colors duration-150"
    >
      <span className="italic text-eucalypt font-medium">{scientificName}</span>
      {commonName && <span className="text-gray-500">({commonName})</span>}
    </Link>
  );
}
