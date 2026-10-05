"use client";

import { useState } from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { createInquiryLinkAction } from "@/server/inquiries/admin-actions";
import type { PaymentLinkRow } from "@/server/inquiries/links";

export type PaymentLinkDialogProps = {
  inquiryId: number;
  customerName: string;
  customerPhone: string;
  defaultAmount?: number;
  defaultPurpose?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (link: PaymentLinkRow) => void;
};

export function PaymentLinkDialog({
  inquiryId,
  customerName,
  customerPhone,
  defaultAmount = 16667,
  defaultPurpose = "Course Fee Payment",
  isOpen,
  onClose,
  onSuccess,
}: PaymentLinkDialogProps): React.JSX.Element {
  const [amount, setAmount] = useState(String(defaultAmount));
  const [purpose, setPurpose] = useState(defaultPurpose);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      setError("Please enter a valid amount of at least ₹1.");
      return;
    }

    const trimmedPurpose = purpose.trim();
    if (trimmedPurpose.length < 3) {
      setError("Please enter a purpose of at least 3 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await createInquiryLinkAction(inquiryId, {
        amountInr: parsedAmount,
        purpose: trimmedPurpose,
      });

      if (!res.ok) {
        setError(res.message || "Failed to create payment link");
        toast.err(res.message || "Could not generate Razorpay payment link");
        return;
      }

      toast.ok(`Link generated for ₹${parsedAmount}`);

      onSuccess(res.data);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error creating link";
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
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-btn border border-s2 bg-cream p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-s2 pb-3">
            <RadixDialog.Title className="font-display text-[18px] font-bold text-em9 flex items-center gap-2">
              <div className="size-5 text-em7">
                <AdminIcon name="link" sw={2} />
              </div>
              Create Payment Link
            </RadixDialog.Title>
            <RadixDialog.Close asChild>
              <button
                type="button"
                className="text-ink6 hover:text-ink cursor-pointer p-1 rounded-sm"
                aria-label="Close"
              >
                <div className="size-4">
                  <AdminIcon name="close" sw={2} />
                </div>
              </button>
            </RadixDialog.Close>
          </div>

          <div className="text-[13px] text-ink6">
            Recipient: <strong className="text-ink">{customerName}</strong> (+91 {customerPhone})
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-btn bg-rose p-3 text-[13px] text-sin font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="link-amount" className="block text-[13px] font-semibold text-ink mb-1">
                Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink6 font-semibold text-[14px]">
                  ₹
                </span>
                <input
                  id="link-amount"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 16667"
                  className="h-10 w-full rounded-field border border-s2 bg-white pl-8 pr-3 font-sans text-[14px] text-ink outline-none focus:border-em7 focus:ring-1 focus:ring-em7"
                />
              </div>
            </div>

            <div>
              <label htmlFor="link-purpose" className="block text-[13px] font-semibold text-ink mb-1">
                Purpose / Description
              </label>
              <input
                id="link-purpose"
                type="text"
                required
                maxLength={200}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Course Fee - Instalment 1/3"
                className="h-10 w-full rounded-field border border-s2 bg-white px-3 font-sans text-[14px] text-ink outline-none focus:border-em7 focus:ring-1 focus:ring-em7"
              />
              <span className="text-[11.5px] text-ink6 mt-1 block">
                The seeker will see this description on the Razorpay payment page.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-s2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-10 rounded-btn border border-s2 px-4 font-sans text-[13px] font-semibold text-ink hover:bg-s1 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex h-10 items-center justify-center gap-2 rounded-btn bg-em7 px-5 font-sans text-[13px] font-semibold text-iv shadow-ring-gold hover:bg-em9 transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading && (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>Generate Link</span>
              </button>
            </div>
          </form>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
