import Link from "next/link";
import { Crown, Heart } from "lucide-react";

export interface WinnerCardProps {
  postId: string;
  imageUrl: string;
  imageUrlAfter: string | null;
  postType: "weed" | "before_after";
  speciesScientificName: string | null;
  speciesCommonName: string | null;
  siteDescription: string | null;
  displayName: string;
  profileId: string;
  voteCount: number;
  place: 1 | 2 | 3;
}

const medalConfig = {
  1: { label: "Gold", border: "border-gold", bg: "bg-gold/10", icon: "text-gold" },
  2: { label: "Silver", border: "border-silver", bg: "bg-silver/10", icon: "text-silver" },
  3: { label: "Bronze", border: "border-bronze", bg: "bg-bronze/10", icon: "text-bronze" },
} as const;

export function WinnerCard({ postId, imageUrl, imageUrlAfter, postType, speciesScientificName, speciesCommonName, siteDescription, displayName, profileId, voteCount, place }: WinnerCardProps) {
  const medal = medalConfig[place];
  const thumbnail = postType === "before_after" && imageUrlAfter ? imageUrlAfter : imageUrl;
  const isGold = place === 1;

  return (
    <Link
      href={`/post/${postId}`}
      className={`group bg-white border-2 ${medal.border} rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-150`}
    >
      <div className="relative">
        <img
          src={thumbnail}
          alt={speciesScientificName || siteDescription || "Winner"}
          className={`w-full object-cover ${isGold ? "aspect-[4/3]" : "aspect-square"}`}
        />
        {/* Medal badge */}
        <div className={`absolute top-2 left-2 ${medal.bg} backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1`}>
          <Crown className={`h-3.5 w-3.5 ${medal.icon}`} />
          <span className={`text-xs font-bold ${medal.icon}`}>{medal.label}</span>
        </div>
        {/* B&A badge */}
        {postType === "before_after" && (
          <div className="absolute top-2 right-2 bg-eucalypt/80 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full">
            B&A
          </div>
        )}
      </div>
      <div className={`${isGold ? "p-3" : "p-2.5"}`}>
        {speciesScientificName ? (
          <>
            <p className={`italic font-medium text-eucalypt leading-tight line-clamp-1 ${isGold ? "text-base" : "text-sm"}`}>
              {speciesScientificName}
            </p>
            {speciesCommonName && (
              <p className="text-xs text-gray-400 leading-tight line-clamp-1">
                {speciesCommonName}
              </p>
            )}
          </>
        ) : siteDescription ? (
          <p className={`font-medium text-carbon leading-tight line-clamp-1 ${isGold ? "text-base" : "text-sm"}`}>
            {siteDescription}
          </p>
        ) : (
          <p className={`font-medium text-carbon leading-tight ${isGold ? "text-base" : "text-sm"}`}>
            Before &amp; After
          </p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-500 line-clamp-1">
            {displayName}
          </span>
          <div className="flex items-center gap-0.5 text-gray-400 shrink-0">
            <Heart className="h-3 w-3 fill-red text-red" />
            <span className="text-xs">{voteCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
