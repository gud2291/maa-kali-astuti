"use client";

import { useState, useTransition } from "react";
import { Dialog } from "radix-ui";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { adjustStockAction } from "@/server/catalog/admin-actions";
import { toast } from "@/components/admin/ui/toast";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export type StockAdjustProps = {
  productId: string;
  productName: string;
  currentStock: number;
  onStockAdjusted?: (newStock: number) => void;
  disabled?: boolean;
};

export function StockAdjust({
  productId,
  productName,
  currentStock,
  onStockAdjusted,
  disabled = false,
}: StockAdjustProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [qty, setQty] = useState<number>(1);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  const delta = mode === "add" ? qty : -qty;
  const projectedStock = Math.max(0, currentStock + delta);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for the stock adjustment");
      return;
    }
    if (qty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    startTransition(async () => {
      const res = await adjustStockAction({
        id: productId,
        delta,
        reason: reason.trim(),
      });

      if (res.ok) {
        toast.success(`Stock updated to ${res.data.stock}`);
        onStockAdjusted?.(res.data.stock);
        setOpen(false);
        setReason("");
        setQty(1);
      } else {
        toast.error(res.error || "Failed to adjust stock");
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-8 items-center gap-1.5 rounded-btn border border-s2 bg-cream px-2.5 font-sans text-[12.5px] font-semibold text-ink hover:bg-s1 disabled:opacity-50 cursor-pointer"
        >
          <span className="size-3.5 text-ink6">
            <AdminIcon name="plus" />
          </span>
          <span>Adjust stock</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-n9/60 backdrop-blur-xs transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-btn border border-s2 bg-cream p-6 shadow-card outline-none">
          <div className="flex items-center justify-between pb-3 border-b border-s2">
            <div>
              <Dialog.Title className="font-display text-[18px] font-semibold text-ink">
                Adjust stock
              </Dialog.Title>
              <Dialog.Description className="font-sans text-[13px] text-ink6">
                {productName}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-field text-ink6 hover:bg-s1 hover:text-ink cursor-pointer"
              >
                <span className="size-4">
                  <AdminIcon name="close" />
                </span>
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Current vs Projected preview */}
            <div className="flex items-center justify-between rounded-btn bg-s1/50 p-3 font-sans text-[13px]">
              <div>
                <span className="text-ink6">Current stock: </span>
                <span className="font-semibold text-ink">{currentStock}</span>
              </div>
              <div>
                <span className="text-ink6">New stock: </span>
                <span className="font-bold text-em7">{projectedStock}</span>
              </div>
            </div>

            {/* Adjustment mode: Add or Remove */}
            <div className="flex rounded-field border border-s2 bg-s1 p-0.5">
              <button
                type="button"
                onClick={() => setMode("add")}
                className={cn(
                  "flex-1 rounded-field py-1.5 font-sans text-[13px] font-semibold transition-all cursor-pointer",
                  mode === "add" ? "bg-cream text-ink shadow-xs" : "text-ink6 hover:text-ink",
                )}
              >
                Add units (+)
              </button>
              <button
                type="button"
                onClick={() => setMode("remove")}
                className={cn(
                  "flex-1 rounded-field py-1.5 font-sans text-[13px] font-semibold transition-all cursor-pointer",
                  mode === "remove" ? "bg-cream text-ink shadow-xs" : "text-ink6 hover:text-ink",
                )}
              >
                Remove units (−)
              </button>
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="block font-sans text-[13px] font-medium text-ink">
                Units {mode === "add" ? "to add" : "to remove"}
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13.5px] font-medium text-ink outline-none focus:border-em7"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label className="block font-sans text-[13px] font-medium text-ink">
                Reason for adjustment *
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Received new inventory from supplier"
                className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13.5px] text-ink outline-none focus:border-em7"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={pending}
                  className={cn(buttonClass("outline", "xs"), "cursor-pointer")}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className={cn(
                  buttonClass("primary", "xs"),
                  "flex items-center gap-1.5 cursor-pointer",
                )}
              >
                {pending && (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                <span>Save adjustment</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
