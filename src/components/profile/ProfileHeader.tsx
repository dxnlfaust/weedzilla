import { CrownBadge } from "./CrownBadge";
import { formatRelativeTime } from "@/lib/utils/formatters";

interface ProfileHeaderProps {
  displayName: string;
  avatarUrl: string | null;
  crownCount: number;
  createdAt: string;
}

export function ProfileHeader({
  displayName,
  avatarUrl,
  crownCount,
  createdAt,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
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
        <p className="text-sm text-gray-500">
          Joined {formatRelativeTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
