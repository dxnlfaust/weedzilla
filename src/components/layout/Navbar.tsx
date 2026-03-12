"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { MobileNav } from "./MobileNav";
import { Menu, X, Upload, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-eucalypt-dark text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            WeedZilla
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium hover:text-white/80 transition-colors duration-150"
            >
              Home
            </Link>
            <Link
              href="/species"
              className="text-sm font-medium hover:text-white/80 transition-colors duration-150"
            >
              Species
            </Link>
            {user && (
              <Link
                href="/upload"
                className="text-sm font-medium hover:text-white/80 transition-colors duration-150 flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Link>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="h-8 w-20 bg-white/10 rounded-lg animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium hover:text-white/80 transition-colors duration-150"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 text-sm font-medium hover:text-white/80 transition-colors duration-150"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium hover:text-white/80 transition-colors duration-150"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-eucalypt text-white hover:bg-eucalypt-light rounded-lg px-4 py-1.5 text-sm font-medium transition-colors duration-150"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <MobileNav
          user={user}
          onSignOut={signOut}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </nav>
  );
}
