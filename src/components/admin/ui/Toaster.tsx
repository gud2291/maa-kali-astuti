"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/icons/Icon";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { EASE } from "@/components/motion/easing";
import { useAdminToast, type AdminToast } from "./toast";
import { cn } from "@/lib/utils/cn";

export function Toaster(): React.JSX.Element {
  const toasts = useAdminToast((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed z-[9999] flex w-max max-w-[calc(100vw-32px)] flex-col gap-2.5",
        "bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 items-center",
        "lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0 lg:items-end",
      )}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}

function ToastItem({ t }: { t: AdminToast }): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && !isReduced()) {
      ref.current.animate(
        [
          { opacity: 0, transform: "translateY(12px) scale(0.97)" },
          { opacity: 1, transform: "none" },
        ],
        {
          duration: 250,
          easing: EASE,
        },
      );
    }
  }, []);

  useEffect(() => {
    if (t.leaving && ref.current && !isReduced()) {
      ref.current.animate(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: "translateY(8px) scale(0.97)" },
        ],
        {
          duration: 200,
          easing: "ease-in",
          fill: "forwards",
        },
      );
    }
  }, [t.leaving]);

  const dismiss = () => useAdminToast.getState().dismiss(t.id);

  const toneConfig = {
    ok: {
      icon: "checkc" as const,
      iconClass: "text-ok",
      borderClass: "border-ok/30",
    },
    err: {
      icon: "alert" as const,
      iconClass: "text-sin",
      borderClass: "border-sin/30",
    },
    info: {
      icon: "info" as const,
      iconClass: "text-em5",
      borderClass: "border-em5/30",
    },
  }[t.tone];

  return (
    <div
      ref={ref}
      role="status"
      className={cn(
        "pointer-events-auto flex max-w-md min-w-[280px] items-center gap-3 rounded-btn bg-cream px-4 py-3 font-sans text-[14px] leading-snug font-medium text-ink",
        "border shadow-fly",
        toneConfig.borderClass,
      )}
    >
      <span className={cn("block size-5 flex-none", toneConfig.iconClass)}>
        <Icon name={toneConfig.icon} />
      </span>
      <span className="flex-1 break-words">{t.msg}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss toast"
        className="grid size-7 flex-none cursor-pointer place-items-center rounded border-0 bg-transparent text-ink6 transition-colors hover:bg-s1 hover:text-ink"
      >
        <span className="block size-3.5">
          <Icon name="close" />
        </span>
      </button>
    </div>
  );
}
