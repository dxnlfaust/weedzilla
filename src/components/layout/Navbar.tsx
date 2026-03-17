"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { CrownBadge } from "@/components/profile/CrownBadge";
import { UploadPopover } from "./UploadPopover";
import { Trophy, Leaf, Home, Upload, LogOut, User, LogIn, UserPlus, Info } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { Fragment } from "react";

export function Navbar() {
  const { user, crownCount, avatarUrl, displayName, loading, signOut } = useAuth();

  return (
    <nav className="bg-white text-eucalypt-dark border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight text-eucalypt-dark">
            WeedZilla
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-eucalypt-dark hover:text-eucalypt transition-colors duration-150 flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/species"
              className="text-sm font-medium text-eucalypt-dark hover:text-eucalypt transition-colors duration-150 flex items-center gap-1"
            >
              <Leaf className="h-4 w-4" />
              Species
            </Link>
            <Link
              href="/winners"
              className="text-sm font-medium text-eucalypt-dark hover:text-eucalypt transition-colors duration-150 flex items-center gap-1"
            >
              <Trophy className="h-4 w-4" />
              Winners
            </Link>
            <UploadPopover
              isLoggedIn={!!user}
              position="below"
              trigger={
                <span className="text-sm font-medium text-eucalypt-dark hover:text-eucalypt transition-colors duration-150 flex items-center gap-1">
                  <Upload className="h-4 w-4" />
                  Upload
                </span>
              }
            />
          </div>

          {/* Desktop + Mobile: avatar dropdown (right side) */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-8 bg-eucalypt-dark/10 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {crownCount > 0 && (
                  <span className="hidden md:inline">
                    <CrownBadge count={crownCount} />
                  </span>
                )}
                <Menu as="div" className="relative">
                  <MenuButton className="outline-none">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName || "Profile"}
                        className="h-8 w-8 rounded-full object-cover border-2 border-eucalypt-dark/20 hover:border-eucalypt-dark/50 transition-colors"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-eucalypt-dark flex items-center justify-center text-sm font-bold text-white border-2 border-eucalypt-dark/20 hover:border-eucalypt-dark/50 transition-colors">
                        {displayName?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </MenuButton>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 outline-none">
                      <MenuItem>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-carbon hover:bg-gray-50 data-[focus]:bg-gray-50"
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          Profile
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link
                          href="/about"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-carbon hover:bg-gray-50 data-[focus]:bg-gray-50"
                        >
                          <Info className="h-4 w-4 text-gray-400" />
                          About
                        </Link>
                      </MenuItem>
                      <div className="border-t border-gray-100 my-1" />
                      <MenuItem>
                        <button
                          type="button"
                          onClick={signOut}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-carbon hover:bg-gray-50 data-[focus]:bg-gray-50 w-full text-left"
                        >
                          <LogOut className="h-4 w-4 text-gray-400" />
                          Log out
                        </button>
                      </MenuItem>
                    </MenuItems>
                  </Transition>
                </Menu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-1 text-sm font-medium text-eucalypt-dark hover:text-eucalypt transition-colors duration-150"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:inline-block bg-eucalypt-dark text-white hover:bg-eucalypt rounded-lg px-4 py-1.5 text-sm font-medium transition-colors duration-150"
                >
                  Sign Up
                </Link>
                {/* Mobile: just show login icon */}
                <Link
                  href="/login"
                  className="md:hidden flex items-center gap-1 text-sm text-eucalypt-dark"
                  aria-label="Log in"
                >
                  <UserPlus className="h-5 w-5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
