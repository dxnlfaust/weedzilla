"use client";

import Link from "next/link";
import { Upload, User, LogOut, Trophy } from "lucide-react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { CrownBadge } from "@/components/profile/CrownBadge";

interface MobileNavProps {
  user: AuthUser | null;
  crownCount: number;
  onSignOut: () => void;
  onClose: () => void;
}

export function MobileNav({ user, crownCount, onSignOut, onClose }: MobileNavProps) {
  return (
    <div className="md:hidden border-t border-white/10">
      <div className="px-4 py-3 space-y-1">
        <Link
          href="/"
          onClick={onClose}
          className="block py-2 text-sm font-medium hover:text-white/80 transition-colors duration-150"
        >
          Home
        </Link>
        <Link
          href="/species"
          onClick={onClose}
          className="block py-2 text-sm font-medium hover:text-white/80 transition-colors duration-150"
        >
          Species
        </Link>
        <Link
          href="/winners"
          onClick={onClose}
          className="flex items-center gap-2 py-2 text-sm font-medium hover:text-white/80 transition-colors duration-150"
        >
          <Trophy className="h-4 w-4" />
          Winners
        </Link>

        {user ? (
          <>
            <Link
              href="/upload"
              onClick={onClose}
              className="flex items-center gap-2 py-2 text-sm font-medium hover:text-white/80 transition-colors duration-150"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-2 py-2 text-sm font-medium hover:text-white/80 transition-colors duration-150"
            >
              <User className="h-4 w-4" />
              Profile
              {crownCount > 0 && <CrownBadge count={crownCount} />}
            </Link>
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="flex items-center gap-2 py-2 text-sm font-medium hover:text-white/80 transition-colors duration-150 w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={onClose}
              className="block py-2 text-sm font-medium hover:text-white/80 transition-colors duration-150"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={onClose}
              className="block py-2 text-sm font-medium hover:text-white/80 transition-colors duration-150"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
