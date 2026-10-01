"use client";

import { useState } from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { refundOrderAction } from "@/server/orders/admin-actions";
import { fmt } from "@/lib/core/format";

export type RefundDialogProps = {
  orderId: number;
  orderNumber: string;
  maxRefundable: number;
  isOnline: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function RefundDialog({
  orderId,
  orderNumber,
  maxRefundable,
  isOnline,
  isOpen,
  onClose,
  onSuccess,
}: RefundDialogProps): React.JSX.Element {
  const [amountInr, setAmountInr] = useState(maxRefundable.toString());
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseInt(amountInr, 10);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      setError("Please enter a valid amount of at least ₹1.");
      return;
    }

    if (parsedAmount > maxRefundable) {
      setError(`Refund amount cannot exceed ${fmt(maxRefundable)}.`);
      return;
    }

    try {
      setLoading(true);
      const res = await refundOrderAction(orderId, {
        amountInr: parsedAmount,
        reason: reason.trim() || undefined,
      });

      if (!res.ok) {
        setError(res.message || "Failed to process refund");
        toast({
          title: "Refund Failed",
          description: res.message || "Could not process refund",
          tone: "danger",
        });
        return;
      }

      toast({
        title: "Refund Processed",
        description: `Refund of ${fmt(parsedAmount)} initiated successfully (${res.data.status})`,
        tone: "ok",
      });

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Refund failed";
      setError(msg);
      toast({
        title: "Error",
        description: msg,
        tone: "danger",
      });
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
            <RadixDialog.Title className="font-serif text-lg font-bold text-sin flex items-center gap-2">
              <div className="h-4 w-4">
                <AdminIcon name="arrow-uturn-left" sw={2} />
              </div>
              Issue Refund
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button
                type="button"
                className="text-ink6 hover:text-ink cursor-pointer"
                aria-label="Close"
              >
                <div className="h-4 w-4">
                  <AdminIcon name="x" sw={2} />
                </div>
              </button>
            </RadixDialog.Close>
          </div>

          <div className="rounded-field bg-rose/10 border border-rose/30 p-3 text-xs text-ink space-y-1">
            <p>
              <strong>Order: </strong>
              <span className="font-mono">{orderNumber}</span>
            </p>
            <p>
              <strong>Max Refundable: </strong>
              <span className="font-bold text-sin">{fmt(maxRefundable)}</span>
            </p>
            <p className="text-[11px] text-ink6">
              {isOnline
                ? "This will initiate an automatic online refund via Razorpay to the customer's original payment method."
                : "This order was COD. This will record a manual/cash refund."}
            </p>
          </div>

          {error && (
            <div className="rounded-field border border-rose/40 bg-rose/15 p-2.5 text-xs text-sin">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-ink6 mb-1">
                Refund Amount (₹) *
              </label>
              <input
                type="number"
                min={1}
                max={maxRefundable}
                required
                value={amountInr}
                onChange={(e) => setAmountInr(e.target.value)}
                className="w-full rounded-field border border-s2 bg-iv px-3 py-1.5 font-sans text-sm font-bold text-ink focus:border-em7 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-ink6 mb-1">
                Reason for Refund (optional)
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="e.g. Customer cancelled before dispatch, damaged item..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-field border border-s2 bg-iv px-3 py-1.5 font-sans text-xs text-ink focus:border-em7 focus:outline-none"
              />
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
                className="rounded-btn bg-sin px-4 py-1.5 font-sans text-xs font-semibold text-iv hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Processing..." : `Process Refund of ₹${amountInr}`}
              </button>
            </div>
          </form>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
