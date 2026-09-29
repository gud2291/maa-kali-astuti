"use client";

import type { MouseEvent, ReactNode } from "react";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";

/* Magnetic pull for hero CTAs (Home.dc.html 1409–1410): desktop (≥1024) only, off under
   reduced motion; up to 6px × 4px toward the cursor; released on leave. The button's own
   `transition: transform 250ms EASE` smooths it. */

const onMove = (e: MouseEvent<HTMLElement>) => {
  if (window.innerWidth < 1024 || isReduced()) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
  const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  el.style.transform = `translate(${(x * 6).toFixed(1)}px,${(y * 4).toFixed(1)}px)`;
};
const onLeave = (e: MouseEvent<HTMLElement>) => {
  e.currentTarget.style.transform = "";
};

/** Spread onto the element that should move (keeps the design's single-element structure). */
export const magneticHandlers = { onMouseMove: onMove, onMouseLeave: onLeave };

/** Wrapper form, for server-rendered children. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn("inline-flex transition-transform duration-[250ms] ease-mka", className)}
      {...magneticHandlers}
    >
      {children}
    </span>
  );
}
