"use client";

import { useState, type ReactNode } from "react";
import { AlertDialog } from "radix-ui";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export type ConfirmDialogProps = {
  /** Omit when opening from elsewhere (e.g. a dropdown item) and pass `open`/`onOpenChange`. */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  tone?: "danger" | "default";
  onConfirm: () => Promise<boolean>;
};

export function ConfirmDialog({
  trigger,
  title,
  body,
  confirmLabel,
  tone = "default",
  onConfirm,
  open: openProp,
  onOpenChange,
}: ConfirmDialogProps): React.JSX.Element {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean): void => {
    setOpenState(v);
    onOpenChange?.(v);
  };
  const [pending, setPending] = useState(false);

  const handleConfirm = async (): Promise<void> => {
    setPending(true);
    try {
      const ok = await onConfirm();
      if (ok) {
        setOpen(false);
      }
    } finally {
      setPending(false);
    }
  };

  const confirmBtnClass =
    tone === "danger"
      ? "bg-sin text-white hover:bg-sin/90 shadow-none font-sans font-semibold text-[14px] h-10 px-4 rounded-btn"
      : buttonClass("primary", "xs");

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      {trigger && <AlertDialog.Trigger asChild>{trigger}</AlertDialog.Trigger>}
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-n9/60 backdrop-blur-xs transition-opacity" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-btn bg-cream p-6 shadow-card border border-s2 outline-none">
          <AlertDialog.Title className="font-display text-[20px] font-semibold text-ink leading-tight">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 font-sans text-[14px] leading-relaxed text-ink6">
            {body}
          </AlertDialog.Description>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                disabled={pending}
                className={cn(buttonClass("outline", "xs"), "w-full sm:w-auto cursor-pointer")}
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <button
              type="button"
              disabled={pending}
              onClick={handleConfirm}
              className={cn(
                confirmBtnClass,
                "w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer",
              )}
            >
              {pending && (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              <span>{confirmLabel}</span>
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
