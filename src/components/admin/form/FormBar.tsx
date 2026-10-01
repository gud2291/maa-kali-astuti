"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export type FormBarProps = {
  pending: boolean;
  dirty: boolean;
  cancelHref: string;
  saveLabel?: string;
  className?: string;
};

export function FormBar({
  pending,
  dirty,
  cancelHref,
  saveLabel = "Save",
  className,
}: FormBarProps): React.JSX.Element {
  return (
    <div
      className={cn(
        // Mobile fixed bar above bottom nav (which is h-14 + safe area, bottom nav uses fixed bottom-0 lg:hidden)
        "fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 flex items-center justify-between border-t border-s2 bg-cream/95 px-4 py-3 shadow-fly backdrop-blur-xs",
        // Desktop static right-aligned row
        "lg:static lg:bottom-auto lg:z-auto lg:flex-row lg:items-center lg:justify-end lg:gap-3 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none",
        className,
      )}
    >
      {/* Mobile status indicator */}
      <div className="flex items-center gap-2 lg:hidden">
        {dirty && (
          <span className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-g7">
            <span className="size-2 rounded-full bg-g5 flex-none animate-pulse" />
            <span>Unsaved changes</span>
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2.5">
        <Link
          href={cancelHref}
          className={cn(buttonClass("outline", "xs"), "h-9 px-4 text-[13.5px]")}
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            buttonClass("primary", "xs"),
            "h-9 px-5 text-[13.5px] flex items-center gap-2 cursor-pointer",
          )}
        >
          {pending && (
            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          <span>{pending ? "Saving..." : saveLabel}</span>
        </button>
      </div>
    </div>
  );
}
