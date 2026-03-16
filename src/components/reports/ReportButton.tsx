"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { ReportDialog } from "./ReportDialog";

interface ReportButtonProps {
  targetType: "post" | "comment";
  targetId: string;
  userId: string;
}

export function ReportButton({ targetType, targetId, userId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-red transition-colors p-1"
        aria-label={`Report ${targetType}`}
      >
        <Flag className="h-4 w-4" />
      </button>
      <ReportDialog
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
        userId={userId}
      />
    </>
  );
}
