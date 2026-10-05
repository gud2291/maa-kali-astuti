"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { setEnergizationDateAction } from "@/server/orders/admin-actions";

export type EnergizationBulkProps = {
  placedCount: number;
};

export function EnergizationBulk({ placedCount }: EnergizationBulkProps): React.JSX.Element {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (placedCount === 0) return <></>;

  const handleApply = async (): Promise<void> => {
    if (!date) {
      toast.info("Please select an energization date");
      return;
    }

    try {
      setLoading(true);
      const res = await setEnergizationDateAction({ date, scope: "placed" });
      if (!res.ok) {
        toast.err(res.message || "Could not schedule energization");
        return;
      }

      toast.ok(`Scheduled Mahapuja on ${date} for ${res.data.count} new orders`);
      setShowConfirm(false);
      setDate("");
      router.refresh();
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-field border border-g3/30 bg-g1/40 p-3.5 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-5 w-5 text-g7 shrink-0">
            <AdminIcon name="flame" sw={2} />
          </div>
          <div>
            <h4 className="font-sans text-xs font-bold text-ink">
              Bulk Energization Scheduler
            </h4>
            <p className="font-sans text-[11px] text-ink6">
              Assign a Mahapuja date for all <strong>{placedCount}</strong> new placed orders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-field border border-s2 bg-iv px-2.5 py-1.5 font-sans text-xs text-ink focus:border-em7 focus:outline-none"
          />

          {!showConfirm ? (
            <button
              type="button"
              disabled={!date || loading}
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center rounded-btn bg-em7 px-3 py-1.5 font-sans text-xs font-semibold text-iv hover:bg-em9 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Schedule All
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleApply}
                className="inline-flex items-center rounded-btn bg-ok px-3 py-1.5 font-sans text-xs font-semibold text-iv hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Scheduling..." : "Confirm"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowConfirm(false)}
                className="inline-flex items-center rounded-btn border border-s2 bg-iv px-2.5 py-1.5 font-sans text-xs text-ink6 hover:bg-cream cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
