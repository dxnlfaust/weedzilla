import { Crown } from "lucide-react";

interface CrownBadgeProps {
  count: number;
}

export function CrownBadge({ count }: CrownBadgeProps) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-gold">
      <Crown className="h-4 w-4" />
      <span className="text-sm font-medium">{count}</span>
    </span>
  );
}
