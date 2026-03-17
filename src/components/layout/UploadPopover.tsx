"use client";

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { Plus, Leaf, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

interface UploadPopoverProps {
  isLoggedIn: boolean;
  /** "above" for bottom nav (popover opens upward), "below" for top nav */
  position?: "above" | "below";
  /** Custom trigger element. If not provided, renders a Plus icon button. */
  trigger?: React.ReactNode;
}

export function UploadPopover({ isLoggedIn, position = "below", trigger }: UploadPopoverProps) {
  return (
    <Popover className="relative">
      <PopoverButton className="outline-none">
        {trigger || <Plus className="h-6 w-6" />}
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <PopoverPanel
          className={`absolute z-50 ${
            position === "above"
              ? "bottom-full mb-3 left-1/2 -translate-x-1/2"
              : "top-full mt-2 right-0"
          }`}
        >
          {({ close }) => (
            <div className="relative">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2">
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/upload?type=weed"
                      onClick={() => close()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md hover:bg-gray-50 transition-colors min-w-[120px]"
                    >
                      <Leaf className="h-4 w-4 text-eucalypt" />
                      <span className="text-sm font-medium text-carbon">Weed</span>
                    </Link>
                    <Link
                      href="/upload?type=before_after"
                      onClick={() => close()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md hover:bg-gray-50 transition-colors min-w-[120px]"
                    >
                      <ArrowRightLeft className="h-4 w-4 text-teal-600" />
                      <span className="text-sm font-medium text-carbon">B&A</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login?redirect=/upload"
                    onClick={() => close()}
                    className="px-4 py-2.5 text-sm text-gray-500 hover:text-carbon"
                  >
                    Log in to upload
                  </Link>
                )}
              </div>
              {/* Triangle caret */}
              {position === "above" && (
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45" />
              )}
              {position === "below" && (
                <div className="absolute right-6 -top-1.5 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45" />
              )}
            </div>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}
