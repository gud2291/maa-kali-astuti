"use client";

import { useRef } from "react";
import { Icon } from "@/components/icons/Icon";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";

/* Quantity stepper (SiteChrome.dc.html 275–279): 34px, cream, sand ring; 32px buttons with
   14px icons; 26px number (700 14px tabular). The number rolls in from the direction of the
   change (M.fx.roll: translateY ±70% → 0 with opacity, 240 ms, EASE). */
export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  onLimit,
  labels = { dec: "Decrease quantity", inc: "Increase quantity" },
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Called when + is pressed at max (the design toasts "Maximum 10 per order line"). */
  onLimit?: () => void;
  labels?: { dec: string; inc: string };
  className?: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);

  const roll = (dir: 1 | -1) => {
    const el = numRef.current;
    if (!el || isReduced()) return;
    requestAnimationFrame(() =>
      el.animate(
        [
          { transform: `translateY(${dir > 0 ? 70 : -70}%)`, opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        { duration: 240, easing: "cubic-bezier(0.22,1,0.36,1)" },
      ),
    );
  };

  const btn = "grid h-[34px] w-8 place-items-center border-0 bg-transparent text-em7";

  return (
    <div className={cn("flex h-[34px] items-center rounded-btn bg-cream shadow-ring-sand", className)}>
      <button
        type="button"
        aria-label={labels.dec}
        className={btn}
        onClick={() => {
          if (value <= min) return;
          onChange(value - 1);
          roll(-1);
        }}
      >
        <span className="block size-[14px]">
          <Icon name="minus" />
        </span>
      </button>
      <span className="grid h-[34px] w-[26px] place-items-center overflow-hidden">
        <span ref={numRef} aria-live="polite" className="block font-sans text-[14px] leading-none font-bold text-ink tabular">
          {value}
        </span>
      </span>
      <button
        type="button"
        aria-label={labels.inc}
        className={btn}
        onClick={() => {
          if (value >= max) {
            onLimit?.();
            return;
          }
          onChange(value + 1);
          roll(1);
        }}
      >
        <span className="block size-[14px]">
          <Icon name="plus" />
        </span>
      </button>
    </div>
  );
}
