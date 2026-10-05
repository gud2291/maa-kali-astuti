"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { StatusDialog } from "./StatusDialog";
import { RefundDialog } from "./RefundDialog";
import {
  transitionOrderAction,
  markCodCollectedAction,
  addOrderNoteAction,
  updateTrackingAction,
  resolveAttentionAction,
} from "@/server/orders/admin-actions";
import { ORDER_FLOW } from "@/lib/domain/flows";
import { fmt } from "@/lib/core/format";
import type { OrderStatus, PaymentStatus, PaymentMethod } from "@/lib/domain/enums";

export function AttentionBanner({
  orderId,
  reason,
}: {
  orderId: number;
  reason: string | null;
}): React.JSX.Element {
  const router = useRouter();
  const [resolving, setResolving] = useState(false);

  const handleResolve = async (): Promise<void> => {
    try {
      setResolving(true);
      const res = await resolveAttentionAction(orderId);
      if (!res.ok) {
        toast.err(res.message || "Could not resolve attention flag");
        return;
      }
      toast.ok("Attention flag has been cleared");
      router.refresh();
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Action failed");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-field border border-rose/40 bg-rose/15 p-4 text-sin">
      <div className="flex items-center gap-2.5">
        <div className="h-5 w-5 shrink-0 text-sin">
          <AdminIcon name="alert" sw={2} />
        </div>
        <div>
          <h4 className="font-sans text-xs font-bold text-sin uppercase tracking-wider">
            Order Requires Attention
          </h4>
          <p className="font-sans text-xs text-ink mt-0.5">
            {reason || "An issue was flagged on this order (e.g. oversold inventory or payment mismatch)."}
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={resolving}
        onClick={handleResolve}
        className="self-start sm:self-auto rounded-btn bg-sin px-3 py-1.5 font-sans text-xs font-semibold text-iv hover:opacity-90 disabled:opacity-50 cursor-pointer shrink-0"
      >
        {resolving ? "Resolving..." : "Resolve Flag"}
      </button>
    </div>
  );
}

export type OrderActionsProps = {
  order: {
    id: number;
    number: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    totalInr: number;
    refundedInr: number;
    courier?: string | null;
    awb?: string | null;
    trackingUrl?: string | null;
  };
  canRefund: boolean;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Placed",
  energizing: "Energizing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  pending_payment: "Pending Payment",
  cancelled: "Cancelled",
  returned: "Returned",
};

export function OrderActions({ order, canRefund }: OrderActionsProps): React.JSX.Element {
  const router = useRouter();
  const [activeDialogStatus, setActiveDialogStatus] = useState<OrderStatus | null>(null);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);

  const [note, setNote] = useState("");
  const [notePending, setNotePending] = useState(false);

  const [courier, setCourier] = useState(order.courier || "");
  const [awb, setAwb] = useState(order.awb || "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [trackingPending, setTrackingPending] = useState(false);

  const possibleTransitions = ORDER_FLOW[order.status] ?? [];
  const nonCancelTransitions = possibleTransitions.filter((s) => s !== "cancelled");
  const canCancel = possibleTransitions.includes("cancelled");

  const isOnline = order.paymentMethod !== "cod";
  // Money received: online = paid, COD = cash collected (same rule as refundOrder).
  const isPaid =
    order.paymentStatus === "paid" ||
    order.paymentStatus === "cod_collected" ||
    order.paymentStatus === "partially_refunded";
  const refundableBalance = Math.max(0, order.totalInr - (order.refundedInr || 0));

  const handleCancel = async (): Promise<boolean> => {
    try {
      const res = await transitionOrderAction(order.id, {
        to: "cancelled",
        notify: true,
        note: "Order cancelled via admin panel",
      });

      if (!res.ok) {
        toast.err(res.message || "Could not cancel order");
        return false;
      }

      toast.ok("Order cancelled and inventory restored where applicable");
      router.refresh();
      return true;
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Cancellation failed");
      return false;
    }
  };

  const handleMarkCodCollected = async (): Promise<boolean> => {
    try {
      const res = await markCodCollectedAction(order.id);
      if (!res.ok) {
        toast.err(res.message || "Could not mark COD collected");
        return false;
      }

      toast.ok(`Marked ₹${order.totalInr} collected in cash`);
      router.refresh();
      return true;
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Failed to record COD collection");
      return false;
    }
  };

  const handleAddNote = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!note.trim()) return;

    try {
      setNotePending(true);
      const res = await addOrderNoteAction(order.id, { note: note.trim() });
      if (!res.ok) {
        toast.err(res.message || "Could not add note");
        return;
      }

      toast.ok("Internal note saved to timeline");
      setNote("");
      setShowNoteDialog(false);
      router.refresh();
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Note failed");
    } finally {
      setNotePending(false);
    }
  };

  const handleUpdateTracking = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!courier.trim() || !awb.trim()) {
      toast.info("Courier and AWB are required");
      return;
    }

    try {
      setTrackingPending(true);
      const res = await updateTrackingAction(order.id, {
        courier: courier.trim(),
        awb: awb.trim(),
        trackingUrl: trackingUrl.trim() || undefined,
      });

      if (!res.ok) {
        toast.err(res.message || "Could not update tracking");
        return;
      }

      toast.ok(`${courier} (AWB: ${awb}) saved`);
      setShowTrackingDialog(false);
      router.refresh();
    } catch (err) {
      toast.err(err instanceof Error ? err.message : "Tracking update failed");
    } finally {
      setTrackingPending(false);
    }
  };

  return (
    <div className="rounded-field border border-s2 bg-iv p-5 shadow-sm space-y-5">
      <h3 className="font-sans text-sm font-bold text-ink flex items-center gap-2 border-b border-s2 pb-3">
        <div className="h-4 w-4 text-em7">
          <AdminIcon name="truck" sw={2} />
        </div>
        Order Management Actions
      </h3>

      {/* Next pipeline status buttons */}
      {nonCancelTransitions.length > 0 && (
        <div className="space-y-2">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink6 block">
            Progress Pipeline
          </span>
          <div className="flex flex-wrap gap-2">
            {nonCancelTransitions.map((nextStatus) => (
              <button
                key={nextStatus}
                type="button"
                onClick={() => setActiveDialogStatus(nextStatus)}
                className="inline-flex items-center gap-1.5 rounded-btn bg-em7 px-3 py-1.5 font-sans text-xs font-semibold text-iv shadow-xs hover:bg-em9 transition-colors cursor-pointer"
              >
                <span>Move to {STATUS_LABELS[nextStatus]}</span>
                <span>&rarr;</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Operational actions */}
      <div className="space-y-2 border-t border-s2 pt-4">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink6 block">
          Order Operations
        </span>
        <div className="flex flex-wrap gap-2">
          {/* Tracking */}
          <button
            type="button"
            onClick={() => setShowTrackingDialog(true)}
            className="inline-flex items-center gap-1.5 rounded-btn border border-s2 bg-cream/50 px-3 py-1.5 font-sans text-xs font-semibold text-ink hover:bg-cream cursor-pointer"
          >
            <div className="h-3.5 w-3.5 text-em7">
              <AdminIcon name="truck" sw={2} />
            </div>
            {order.awb ? "Edit Tracking" : "Add Tracking"}
          </button>

          {/* Private Note */}
          <button
            type="button"
            onClick={() => setShowNoteDialog(true)}
            className="inline-flex items-center gap-1.5 rounded-btn border border-s2 bg-cream/50 px-3 py-1.5 font-sans text-xs font-semibold text-ink hover:bg-cream cursor-pointer"
          >
            <div className="h-3.5 w-3.5 text-ink6">
              <AdminIcon name="tag" sw={2} />
            </div>
            Add Note
          </button>

          {/* COD Mark Collected */}
          {order.paymentMethod === "cod" && order.paymentStatus === "cod_pending" && (
            <ConfirmDialog
              title="Collect COD Payment?"
              body={
                <span>
                  Confirm that the cash amount of <strong>{fmt(order.totalInr)}</strong> has been collected from the customer or delivery partner. This will mark the order as paid.
                </span>
              }
              confirmLabel="Confirm Collection"
              onConfirm={handleMarkCodCollected}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-btn border border-ok/40 bg-em1 px-3 py-1.5 font-sans text-xs font-semibold text-ok hover:bg-ok hover:text-iv cursor-pointer transition-colors"
                >
                  <div className="h-3.5 w-3.5">
                    <AdminIcon name="card" sw={2} />
                  </div>
                  Mark COD Collected ({fmt(order.totalInr)})
                </button>
              }
            />
          )}

          {/* Issue Refund */}
          {canRefund && isPaid && refundableBalance > 0 && (
            <button
              type="button"
              onClick={() => setShowRefundDialog(true)}
              className="inline-flex items-center gap-1.5 rounded-btn border border-rose/40 bg-rose/10 px-3 py-1.5 font-sans text-xs font-semibold text-sin hover:bg-rose/20 cursor-pointer"
            >
              <div className="h-3.5 w-3.5">
                <AdminIcon name="returns" sw={2} />
              </div>
              Issue Refund ({fmt(refundableBalance)} avail.)
            </button>
          )}

          {/* Cancel Order */}
          {canCancel && (
            <ConfirmDialog
              title="Cancel this order?"
              tone="danger"
              body={
                <span>
                  Are you sure you want to cancel order <strong>{order.number}</strong>? Any reserved inventory items will be automatically returned to available stock.
                </span>
              }
              confirmLabel="Cancel Order"
              onConfirm={handleCancel}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-btn border border-rose/30 px-3 py-1.5 font-sans text-xs font-semibold text-sin hover:bg-rose/10 cursor-pointer"
                >
                  Cancel Order
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Printing & Documents */}
      <div className="space-y-2 border-t border-s2 pt-4">
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-ink6 block">
          Documents & Printing
        </span>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/orders/${order.id}/invoice`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-xs hover:bg-cream transition-colors"
          >
            <div className="h-3.5 w-3.5 text-em7">
              <AdminIcon name="download" sw={2} />
            </div>
            Print Tax Invoice
          </Link>

          <Link
            href={`/admin/orders/${order.id}/packing-slip`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-xs hover:bg-cream transition-colors"
          >
            <div className="h-3.5 w-3.5 text-g7">
              <AdminIcon name="package" sw={2} />
            </div>
            Print Packing Slip
          </Link>
        </div>
      </div>

      {/* Status Transition Dialog */}
      {activeDialogStatus && (
        <StatusDialog
          orderId={order.id}
          targetStatus={activeDialogStatus}
          isOpen={Boolean(activeDialogStatus)}
          onClose={() => setActiveDialogStatus(null)}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Refund Dialog */}
      {showRefundDialog && (
        <RefundDialog
          orderId={order.id}
          orderNumber={order.number}
          maxRefundable={refundableBalance}
          isOnline={isOnline}
          isOpen={showRefundDialog}
          onClose={() => setShowRefundDialog(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Note Dialog */}
      {showNoteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-field border border-s2 bg-iv p-5 shadow-xl space-y-4">
            <h4 className="font-serif text-base font-bold text-ink">
              Add Internal Order Note
            </h4>
            <form onSubmit={handleAddNote} className="space-y-4">
              <textarea
                rows={3}
                required
                maxLength={2000}
                placeholder="Write an internal operational note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-field border border-s2 bg-iv p-2.5 font-sans text-xs text-ink focus:border-em7 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteDialog(false)}
                  disabled={notePending}
                  className="rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink6 hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={notePending || !note.trim()}
                  className="rounded-btn bg-em7 px-3 py-1.5 font-sans text-xs font-semibold text-iv hover:bg-em9 disabled:opacity-50"
                >
                  {notePending ? "Saving..." : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Dialog */}
      {showTrackingDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-field border border-s2 bg-iv p-5 shadow-xl space-y-4">
            <h4 className="font-serif text-base font-bold text-ink">
              Update Courier & Tracking
            </h4>
            <form onSubmit={handleUpdateTracking} className="space-y-3">
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
                  className="w-full rounded-field border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-mono text-ink focus:border-em7 focus:outline-none"
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

              <div className="flex justify-end gap-2 pt-2 border-t border-s2">
                <button
                  type="button"
                  onClick={() => setShowTrackingDialog(false)}
                  disabled={trackingPending}
                  className="rounded-btn border border-s2 bg-iv px-3 py-1.5 font-sans text-xs font-semibold text-ink6 hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={trackingPending}
                  className="rounded-btn bg-em7 px-3 py-1.5 font-sans text-xs font-semibold text-iv hover:bg-em9 disabled:opacity-50"
                >
                  {trackingPending ? "Saving..." : "Save Tracking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
