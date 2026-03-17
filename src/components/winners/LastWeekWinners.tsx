"use client";

import Link from "next/link";
import { Crown, Heart } from "lucide-react";
import { CompareSlider } from "@/components/posts/CompareSlider";

export interface LastWeekWinnerData {
  postId: string;
  imageUrl: string;
  imageUrlAfter: string | null;
  postType: "weed" | "before_after";
  speciesScientificName: string | null;
  speciesCommonName: string | null;
  siteDescription: string | null;
  displayName: string;
  voteCount: number;
}

interface LastWeekWinnersProps {
  weedWinner: LastWeekWinnerData | null;
  baWinner: LastWeekWinnerData | null;
  weekYear: string;
}

function formatWeekLabel(weekYear: string): string {
  const match = weekYear.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekYear;
  return `Week ${parseInt(match[2], 10)}, ${match[1]}`;
}

function WinnerSlot({ winner, categoryLabel }: { winner: LastWeekWinnerData; categoryLabel: string }) {
  const isBA = winner.postType === "before_after" && winner.imageUrlAfter;

  return (
    <div className="bg-white/10 hover:bg-white/20 rounded-lg overflow-hidden transition-colors duration-150">
      {isBA ? (
        <CompareSlider
          beforeSrc={winner.imageUrl}
          afterSrc={winner.imageUrlAfter!}
          alt={winner.speciesScientificName || winner.siteDescription || categoryLabel}
          compact
        />
      ) : (
        <Link href={`/post/${winner.postId}`}>
          <img
            src={winner.imageUrl}
            alt={winner.speciesScientificName || winner.siteDescription || categoryLabel}
            className="w-full aspect-square object-cover"
          />
        </Link>
      )}
      <Link href={`/post/${winner.postId}`} className="block p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Crown className="h-4 w-4 text-gold" />
          <span className="text-white/70 text-xs font-medium">{categoryLabel}</span>
        </div>
        {winner.speciesScientificName ? (
          <>
            <p className="text-white text-sm italic font-medium leading-tight line-clamp-1">
              {winner.speciesScientificName}
            </p>
            {winner.speciesCommonName && (
              <p className="text-eucalypt-light text-xs leading-tight line-clamp-1">
                {winner.speciesCommonName}
              </p>
            )}
          </>
        ) : winner.siteDescription ? (
          <p className="text-white text-sm font-medium leading-tight line-clamp-1">
            {winner.siteDescription}
          </p>
        ) : (
          <p className="text-white text-sm font-medium leading-tight">
            Before &amp; After
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-white/60 text-xs line-clamp-1">{winner.displayName}</span>
          <div className="flex items-center gap-0.5 shrink-0">
            <Heart className="h-3 w-3 text-red fill-red" />
            <span className="text-white/60 text-xs">{winner.voteCount}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export function LastWeekWinners({ weedWinner, baWinner, weekYear }: LastWeekWinnersProps) {
  if (!weedWinner && !baWinner) return null;

  const hasBoth = weedWinner && baWinner;

  return (
    <div className="mb-8 bg-eucalypt-dark rounded-xl overflow-hidden">
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-gold" />
          <span className="text-white font-semibold text-sm">
            Last Week&apos;s Winners
          </span>
        </div>
        <span className="text-eucalypt-light text-sm">
          {formatWeekLabel(weekYear)}
        </span>
      </div>
      <div className={`px-5 pb-5 grid gap-3 ${hasBoth ? "grid-cols-2" : "grid-cols-1 max-w-sm mx-auto"}`}>
        {weedWinner && <WinnerSlot winner={weedWinner} categoryLabel="Weed of the Week" />}
        {baWinner && <WinnerSlot winner={baWinner} categoryLabel="B&A of the Week" />}
      </div>
    </div>
  );
}
