import { CrownBadge } from "./CrownBadge";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { avatarMd } from "@/lib/utils/image";
import { Crown } from "lucide-react";

interface ProfileHeaderProps {
  displayName: string;
  avatarUrl: string | null;
  crownCount: number;
  silverCount: number;
  bronzeCount: number;
  createdAt: string;
}

export function ProfileHeader({
  displayName,
  avatarUrl,
  crownCount,
  silverCount,
  bronzeCount,
  createdAt,
}: ProfileHeaderProps) {
  const hasMedals = crownCount > 0 || silverCount > 0 || bronzeCount > 0;

  return (
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarMd(avatarUrl)}
          alt={displayName}
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="h-16 w-16 rounded-full bg-eucalypt/10 flex items-center justify-center text-2xl font-bold text-eucalypt">
          {displayName[0]?.toUpperCase()}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-carbon">{displayName}</h2>
          <CrownBadge count={crownCount} />
        </div>
        {hasMedals && (
          <div className="flex items-center gap-3 mt-0.5">
            {crownCount > 0 && (
              <div className="flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-medium text-gray-600">{crownCount}</span>
              </div>
            )}
            {silverCount > 0 && (
              <div className="flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-silver" />
                <span className="text-xs font-medium text-gray-600">{silverCount}</span>
              </div>
            )}
            {bronzeCount > 0 && (
              <div className="flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-bronze" />
                <span className="text-xs font-medium text-gray-600">{bronzeCount}</span>
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-gray-500">
          Joined {formatRelativeTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
