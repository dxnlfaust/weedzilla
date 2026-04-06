"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { CrownBadge } from "@/components/profile/CrownBadge";
import { UploadPopover } from "./UploadPopover";
import { Upload, LogOut, User, LogIn, UserPlus, Info, BarChart3, Bell } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { avatarSm } from "@/lib/utils/image";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Weed Feed";
  if (pathname === "/upload" || pathname.startsWith("/upload?")) return "Upload";
  if (pathname === "/species") return "Species";
  if (pathname.startsWith("/species/")) return "Species";
  if (pathname === "/winners") return "Winners";
  if (pathname === "/leaderboard") return "Leaderboard";
  if (pathname === "/profile") return "Profile";
  if (pathname.startsWith("/profile/")) return "Profile";
  if (pathname === "/notifications") return "Notifications";
  if (pathname === "/about") return "About";
  if (pathname === "/login") return "Log In";
  if (pathname === "/signup") return "Sign Up";
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "Admin";
  return "";
}

export function Navbar() {
  const pathname = usePathname();
  const { user, crownCount, avatarUrl, displayName, unreadCount, loading, signOut } = useAuth();
  const pageTitle = getPageTitle(pathname);

  return (
    <nav className="fixed top-0 inset-x-0 bg-white text-eucalypt-dark z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Left: WeedZilla | Page Title */}
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/" className="text-lg font-bold tracking-tight text-eucalypt-dark shrink-0">
              WeedZilla
            </Link>
            {pageTitle && (
              <>
                <span className="text-lg text-eucalypt-dark/40 shrink-0">|</span>
                <span className="text-lg text-eucalypt-dark truncate">{pageTitle}</span>
              </>
            )}
          </div>

          {/* Right: user avatar / login */}
          <div className="flex items-center gap-3 shrink-0">
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
                  <MenuButton className="outline-none relative">
                    {avatarUrl ? (
                      <img
                        src={avatarSm(avatarUrl)}
                        alt={displayName || "Profile"}
                        className="h-8 w-8 rounded-full object-cover border-2 border-eucalypt-dark/20 hover:border-eucalypt-dark/50 transition-colors"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-eucalypt-dark flex items-center justify-center text-sm font-bold text-white border-2 border-eucalypt-dark/20 hover:border-eucalypt-dark/50 transition-colors">
                        {displayName?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
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
                          href="/notifications"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-carbon hover:bg-gray-50 data-[focus]:bg-gray-50"
                        >
                          <Bell className="h-4 w-4 text-gray-400" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-auto bg-red text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link
                          href="/leaderboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-carbon hover:bg-gray-50 data-[focus]:bg-gray-50"
                        >
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                          Leaderboard
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <UploadPopover
                          isLoggedIn={true}
                          position="below"
                          trigger={
                            <span className="flex items-center gap-2 px-4 py-2 text-sm text-carbon hover:bg-gray-50 w-full">
                              <Upload className="h-4 w-4 text-gray-400" />
                              Upload
                            </span>
                          }
                        />
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
