"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type SheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  side?: "right" | "bottom";
  children: ReactNode;
  className?: string;
};

export function Sheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  side = "right",
  children,
  className,
}: SheetProps): React.JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-n9/60 backdrop-blur-xs transition-opacity" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col bg-cream shadow-fly border-s2 outline-none",
            // Mobile: automatically bottom sheet (< 768px)
            "inset-x-0 bottom-0 max-h-[90vh] rounded-t-xl border-t",
            // Desktop: side prop chooses right drawer or bottom sheet
            side === "right"
              ? "md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l"
              : "md:inset-x-0 md:bottom-0 md:max-h-[85vh] md:rounded-t-xl md:border-t",
            className,
          )}
        >
          {/* Header */}
          <div className="flex flex-none items-center justify-between border-b border-s2 px-5 py-4">
            <div className="min-w-0 pr-4">
              <Dialog.Title className="truncate font-display text-[20px] font-semibold leading-tight text-ink">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 truncate font-sans text-[12.5px] text-ink6">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close sheet"
                className="flex size-8 items-center justify-center rounded-full text-ink6 transition-colors hover:bg-s1 hover:text-ink cursor-pointer"
              >
                <span className="size-4">
                  <AdminIcon name="close" />
                </span>
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
