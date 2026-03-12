import Link from "next/link";
import { Heart, Crown } from "lucide-react";

export interface WinnerCardData {
  postId: string;
  imageUrl: string;
  speciesScientificName: string;
  speciesCommonName: string | null;
  displayName: string;
  voteCount: number;
}

interface WinnersBannerProps {
  winners: WinnerCardData[];
  weekYear: string;
}

function formatWeekLabel(weekYear: string): string {
  // "2026-W11" → "Week 11, 2026"
  const match = weekYear.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekYear;
  return `Week ${parseInt(match[2], 10)}, ${match[1]}`;
}

export function WinnersBanner({ winners, weekYear }: WinnersBannerProps) {
  if (winners.length === 0) return null;

  return (
    <div className="mb-8 bg-eucalypt-dark rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-2">
        <Crown className="h-4 w-4 text-gold" />
        <span className="text-white font-semibold text-sm">
          Last Week&apos;s Winners
        </span>
        <span className="text-eucalypt-light text-sm">
          — {formatWeekLabel(weekYear)}
        </span>
      </div>

      {/* Scrollable cards */}
      <div className="flex gap-3 overflow-x-auto px-5 pb-5 scrollbar-hide">
        {winners.map((winner) => (
          <Link
            key={winner.postId}
            href={`/post/${winner.postId}`}
            className="flex-none w-36 group"
          >
            <div className="rounded-lg overflow-hidden bg-white/10 hover:bg-white/20 transition-colors duration-150">
              <img
                src={winner.imageUrl}
                alt={winner.speciesScientificName}
                className="w-full aspect-square object-cover"
              />
              <div className="p-2">
                <p className="text-white text-xs italic font-medium leading-tight line-clamp-1">
                  {winner.speciesScientificName}
                </p>
                {winner.speciesCommonName && (
                  <p className="text-eucalypt-light text-xs leading-tight line-clamp-1">
                    {winner.speciesCommonName}
                  </p>
                )}
                <p className="text-white/70 text-xs mt-1 leading-tight line-clamp-1">
                  {winner.displayName}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Heart className="h-3 w-3 text-red fill-red" />
                  <span className="text-white/70 text-xs">{winner.voteCount}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
