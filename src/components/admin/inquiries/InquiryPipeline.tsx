"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { setInquiryStatusAction } from "@/server/inquiries/admin-actions";
import { INQUIRY_STATUS, type InquiryStatus } from "@/lib/domain/enums";
import { cn } from "@/lib/utils/cn";

export const PIPELINE_STAGES: InquiryStatus[] = [
  "new",
  "contacted",
  "call_scheduled",
  "approved",
  "enrolled",
];

export const OTHER_STAGES: InquiryStatus[] = ["declined", "closed"];

export function statusTone(status: InquiryStatus): BadgeTone {
  switch (status) {
    case "new":
      return "warn";
    case "contacted":
      return "info";
    case "call_scheduled":
      return "info";
    case "approved":
      return "ok";
    case "enrolled":
      return "ok";
    case "declined":
      return "danger";
    case "closed":
      return "muted";
    default:
      return "muted";
  }
}

export function statusLabel(status: InquiryStatus): string {
  switch (status) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "call_scheduled":
      return "Call Scheduled";
    case "approved":
      return "Approved";
    case "enrolled":
      return "Enrolled";
    case "declined":
      return "Declined";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

export type InquiryPipelineProps = {
  inquiryId: number;
  currentStatus: InquiryStatus;
  editable?: boolean;
};

export function InquiryPipeline({
  inquiryId,
  currentStatus,
  editable = true,
}: InquiryPipelineProps): React.JSX.Element {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleStatusChange = async (nextStatus: InquiryStatus): Promise<void> => {
    if (nextStatus === currentStatus || pending || !editable) return;

    setPending(true);
    try {
      const res = await setInquiryStatusAction(inquiryId, nextStatus);
      if (!res.ok) {
        toast.err(res.message || "Could not update status");
        return;
      }

      toast.ok(`Inquiry status changed to ${statusLabel(nextStatus)}`);
      router.refresh();
    } catch {
      toast.err("An unexpected error occurred");
    } finally {
      setPending(false);
    }
  };

  const currentIndex = PIPELINE_STAGES.indexOf(currentStatus);
  const isTerminal = OTHER_STAGES.includes(currentStatus);

  return (
    <div className="flex flex-col gap-3 rounded-btn border border-s2 bg-cream p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-sans text-[12px] font-semibold uppercase tracking-wider text-ink6">
          Inquiry Pipeline Stage
        </span>
        <StatusBadge tone={statusTone(currentStatus)}>
          {statusLabel(currentStatus)}
        </StatusBadge>
      </div>

      {/* Stepper Pipeline */}
      <div className="relative flex items-center justify-between gap-1 pt-2 overflow-x-auto no-scrollbar">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isCurrent = currentStatus === stage;
          const isPassed = !isTerminal && currentIndex > idx;
          const isFuture = isTerminal || currentIndex < idx;

          return (
            <div key={stage} className="flex flex-1 items-center">
              <button
                type="button"
                disabled={pending || !editable}
                onClick={() => handleStatusChange(stage)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 flex-1 min-w-[70px] border-0 bg-transparent p-1 text-center outline-none transition-opacity",
                  editable && !isCurrent ? "cursor-pointer hover:opacity-80" : "cursor-default",
                  pending && "opacity-50",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[12px] font-bold transition-all",
                    isCurrent && "bg-em7 text-iv ring-4 ring-em1",
                    isPassed && "bg-em5 text-iv",
                    isFuture && "border-2 border-s2 bg-white text-ink6",
                  )}
                >
                  {isPassed ? (
                    <div className="size-3.5">
                      <AdminIcon name="check" sw={2.5} />
                    </div>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "font-sans text-[11px] leading-tight font-medium whitespace-nowrap",
                    isCurrent && "font-bold text-em9",
                    isPassed && "text-em7",
                    isFuture && "text-ink6",
                  )}
                >
                  {statusLabel(stage)}
                </span>
              </button>

              {idx < PIPELINE_STAGES.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 -mt-4 transition-colors",
                    isPassed ? "bg-em5" : "bg-s2",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Alternative actions */}
      {editable && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-s2 mt-1">
          <span className="text-[12px] text-ink6 mr-auto">Other actions:</span>
          {OTHER_STAGES.map((stage) => {
            const isCurrent = currentStatus === stage;
            return (
              <button
                key={stage}
                type="button"
                disabled={pending || isCurrent}
                onClick={() => handleStatusChange(stage)}
                className={cn(
                  "px-3 py-1 text-[12px] font-semibold rounded-btn border transition-colors cursor-pointer disabled:cursor-not-allowed",
                  isCurrent
                    ? "border-transparent bg-s1 text-ink6 cursor-default"
                    : stage === "declined"
                      ? "border-sin/30 text-sin hover:bg-rose"
                      : "border-s2 text-ink6 hover:bg-s1 hover:text-ink",
                )}
              >
                Mark as {statusLabel(stage)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
