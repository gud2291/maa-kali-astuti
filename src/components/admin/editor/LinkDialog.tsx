"use client";

import { useState, useEffect } from "react";
import { Dialog } from "radix-ui";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { buttonClass } from "@/components/ui/Button";

export type LinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHref?: string;
  onSave: (href: string) => void;
  onRemove?: () => void;
};

export function LinkDialog({
  open,
  onOpenChange,
  initialHref = "",
  onSave,
  onRemove,
}: LinkDialogProps): React.JSX.Element {
  const [href, setHref] = useState(initialHref);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setHref(initialHref);
      setError(null);
    }
  }, [open, initialHref]);

  const handleSubmit = (e?: React.FormEvent): void => {
    if (e) e.preventDefault();
    const trimmed = href.trim();
    if (!trimmed) {
      if (onRemove) onRemove();
      onOpenChange(false);
      return;
    }

    let validHref = trimmed;
    if (
      !validHref.startsWith("https://") &&
      !validHref.startsWith("http://") &&
      !validHref.startsWith("mailto:") &&
      !validHref.startsWith("/")
    ) {
      validHref = `https://${validHref}`;
    }

    onSave(validHref);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-n9/60 backdrop-blur-xs transition-opacity" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-btn bg-cream p-6 shadow-card border border-s2 outline-none">
          <div className="flex items-center justify-between pb-3 border-b border-s2">
            <Dialog.Title className="font-display text-[18px] font-semibold text-ink leading-tight">
              {initialHref ? "Edit Link" : "Insert Link"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-btn text-ink6 hover:text-ink hover:bg-em1 transition-colors"
                aria-label="Close"
              >
                <AdminIcon name="close" className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="link-href-input"
                className="block font-sans text-[13px] font-medium text-ink6 mb-1.5"
              >
                URL (starts with https://, http://, mailto:, or /)
              </label>
              <input
                id="link-href-input"
                type="text"
                value={href}
                onChange={(e) => {
                  setHref(e.target.value);
                  setError(null);
                }}
                placeholder="https://example.com"
                className="w-full h-11 px-3.5 rounded-field border border-s2 bg-iv font-sans text-[14px] text-ink placeholder:text-ink6/50 focus:border-em5 focus:outline-none"
                autoFocus
              />
              {error ? (
                <p className="mt-1 font-sans text-[12px] text-sin" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between pt-2">
              {initialHref && onRemove ? (
                <button
                  type="button"
                  onClick={() => {
                    onRemove();
                    onOpenChange(false);
                  }}
                  className="font-sans text-[13px] font-medium text-sin hover:underline py-2"
                >
                  Remove link
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-btn border border-s2 font-sans text-[14px] font-medium text-ink hover:bg-em1 transition-colors"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button type="submit" className={buttonClass("primary", "xs")}>
                  Save
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
