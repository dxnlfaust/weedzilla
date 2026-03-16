"use client";

import { useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  RadioGroup,
  Radio,
} from "@headlessui/react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const POST_REASONS = [
  { value: "nsfw", label: "NSFW / Inappropriate" },
  { value: "off_topic", label: "Off-topic" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
] as const;

const COMMENT_REASONS = [
  { value: "harassment", label: "Harassment" },
  { value: "spam", label: "Spam" },
  { value: "off_topic", label: "Off-topic" },
  { value: "other", label: "Other" },
] as const;

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetType: "post" | "comment";
  targetId: string;
  userId: string;
}

export function ReportDialog({
  open,
  onClose,
  targetType,
  targetId,
  userId,
}: ReportDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reasons = targetType === "post" ? POST_REASONS : COMMENT_REASONS;

  async function handleSubmit() {
    if (!reason) {
      toast.error("Please select a reason.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    if (targetType === "post") {
      const { error } = await supabase.from("reports").insert({
        reporter_id: userId,
        post_id: targetId,
        reason: reason as "nsfw" | "off_topic" | "spam" | "other",
        details: details || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already reported this post.");
        } else {
          toast.error("Failed to submit report.");
        }
        setSubmitting(false);
        return;
      }
    } else {
      const { error } = await supabase.from("comment_reports").insert({
        reporter_id: userId,
        comment_id: targetId,
        reason: reason as "harassment" | "spam" | "off_topic" | "other",
        details: details || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already reported this comment.");
        } else {
          toast.error("Failed to submit report.");
        }
        setSubmitting(false);
        return;
      }
    }

    toast.success("Report submitted. Thank you.");
    setReason("");
    setDetails("");
    setSubmitting(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
          <DialogTitle className="text-lg font-bold text-carbon mb-4">
            Report {targetType}
          </DialogTitle>

          <RadioGroup value={reason} onChange={setReason} className="space-y-2 mb-4">
            {reasons.map((r) => (
              <Radio
                key={r.value}
                value={r.value}
                className="group flex items-center gap-3 cursor-pointer rounded-lg border border-gray-200 px-3 py-2.5 data-[checked]:border-eucalypt data-[checked]:bg-eucalypt/5 transition-colors"
              >
                <span className="h-4 w-4 rounded-full border-2 border-gray-300 group-data-[checked]:border-eucalypt group-data-[checked]:bg-eucalypt transition-colors" />
                <span className="text-sm text-carbon">{r.label}</span>
              </Radio>
            ))}
          </RadioGroup>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none resize-none mb-4"
          />

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-carbon transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !reason}
              className="px-4 py-2 text-sm bg-red text-white rounded-lg hover:bg-red/90 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
