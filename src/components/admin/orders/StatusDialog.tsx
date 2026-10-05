"use client";

import { useState } from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { transitionOrderAction } from "@/server/orders/admin-actions";
import type { OrderStatus } from "@/lib/domain/enums";

export type StatusDialogProps = {
  orderId: number;
  targetStatus: OrderStatus;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  energizing: "Energizing (Scheduled)",
  packed: "Packed",
  shipped: "Shipped & Dispatched",
  delivered: "Delivered",
  pending_payment: "Pending Payment",
  cancelled: "Cancelled",
  returned: "Returned",
};

export function StatusDialog({
  orderId,
  targetStatus,
  isOpen,
  onClose,
  onSuccess,
}: StatusDialogProps): React.JSX.Element {
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [courier, setCourier] = useState("");
  const [awb, setAwb] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShipped = targetStatus === "shipped";

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (isShipped) {
      if (!courier.trim()) {
        setError("Courier name is required when marking order as shipped.");
        return;
      }
      if (!awb.trim()) {
        setError("AWB / Tracking number is required when marking order as shipped.");
        return;
      }
    }

    try {
      setLoading(true);
      const res = await transitionOrderAction(orderId, {
        to: targetStatus,
        note: note.trim() || undefined,
        notify,
        courier: isShipped ? courier.trim() : undefined,
        awb: isShipped ? awb.trim() : undefined,
        trackingUrl: isShipped && trackingUrl.trim() ? trackingUrl.trim() : undefined,
      });

      if (!res.ok) {
        setError(res.message || "Failed to update order status");
        toast.err(res.message || "Could not transition order status");
        return;
      }

      toast.ok(`Order moved to ${STATUS_LABELS[targetStatus]}`);

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setError(msg);
      toast.err(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs transition-opacity" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-field border border-s2 bg-iv p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-s2 pb-3">
            <RadixDialog.Title className="font-serif text-lg font-bold text-ink">
              Move to {STATUS_LABELS[targetStatus]}
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button
                type="button"
                className="text-ink6 hover:text-ink cursor-pointer"
                aria-label="Close"
              >
                <div className="h-4 w-4">
                  <AdminIcon name="close" sw={2} />
                </div>
              </button>
            </RadixDialog.Close>
          </div>

          {error && (
            <div className="rounded-field border border-rose/30 bg-rose/10 p-2.5 text-xs text-sin">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isShipped && (
              <div className="space-y-3 rounded-field bg-cream/40 p-3 border border-s2">
                <span className="font-sans text-xs font-bold text-ink block">
                  Shipment Tracking Details
                </span>

                <div>
                  <label className="block font-sans text-xs font-semibold text-ink6 mb-1">
                    Courier Partner *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. India Post, Bluedart, Delhivery"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full rounded-field border border-s2 bg-iv px-3 py-1.5 font-sans text-xs text-ink focus:border-em7 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-ink6 mb-1">
                    AWB / Tracking Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EW123456789IN"
                    value={awb}
                    onChange={(e) => setAwb(e.target.value)}
                    className="w-full rounded-field border border-s2 bg-iv px-3 py-1.5 font-sans text-xs text-ink font-mono focus:border-em7 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs font-semibold text-ink6 mb-1">
                    Direct Tracking URL (optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://track.courier.com/..."
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="w-full rounded-field border border-s2 bg-iv px-3 py-1.5 font-sans text-xs text-ink focus:border-em7 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-sans text-xs font-semibold text-ink6 mb-1">
                Status Note (optional)
              </label>
              <textarea
                rows={2}
                maxLength={500}
                placeholder="Add any internal or transition notes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-field border border-s2 bg-iv px-3 py-1.5 font-sans text-xs text-ink focus:border-em7 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifyCustomer"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="h-4 w-4 rounded-field border-s2 text-em7 focus:ring-em7"
              />
              <label
                htmlFor="notifyCustomer"
                className="font-sans text-xs text-ink select-none cursor-pointer"
              >
                Send notification email to customer
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-s2 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink6 hover:bg-cream cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-btn bg-em7 px-4 py-1.5 font-sans text-xs font-semibold text-iv hover:bg-em9 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Updating..." : `Move to ${STATUS_LABELS[targetStatus]}`}
              </button>
            </div>
          </form>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
