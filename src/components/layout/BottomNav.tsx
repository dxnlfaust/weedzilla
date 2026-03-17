"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Leaf, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UploadPopover } from "./UploadPopover";

const tabs = [
  { href: "/", icon: Home, label: "Home" },
  { href: "__upload__", icon: Plus, label: "Upload" },
  { href: "/winners", icon: Trophy, label: "Winners" },
  { href: "/species", icon: Leaf, label: "Species" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-eucalypt-dark md:hidden z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          if (tab.href === "__upload__") {
            return (
              <UploadPopover
                key="upload"
                isLoggedIn={!!user}
                position="above"
                trigger={
                  <div className="flex flex-col items-center gap-0.5 text-nav-inactive">
                    <Plus className="h-6 w-6" />
                    <span className="text-[10px]">Upload</span>
                  </div>
                }
              />
            );
          }

          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 transition-colors ${
                isActive ? "text-white" : "text-nav-inactive"
              }`}
            >
              <tab.icon className="h-6 w-6" />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
