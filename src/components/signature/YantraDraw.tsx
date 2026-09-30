"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { drawYantra, onView, prime } from "@/components/motion/draw";
import { isReduced } from "@/lib/hooks/useReducedMotion";

/* S11 yantra draw for a group of yantras (Sadhana-Courses 185–186, Course-Detail drawY 206 + hover 229).
   Every [data-yantra] inside is primed, then draws over `dur` once `threshold` of it is visible.
   Hover (and, with `focus`, keyboard focus) on the closest [data-yantra-hover] — the card, or the
   yantra itself — redraws it over `redrawDur`, at most once per `throttle` ms. Reduced motion: the
   yantras are never primed, so they render complete (glow at .4 once in view). */
export function YantraDraw({
  threshold = 0.35,
  dur = 1600,
  redrawDur = 1600,
  throttle = 1800,
  focus = true,
  className,
  children,
}: {
  threshold?: number;
  dur?: number;
  redrawDur?: number;
  throttle?: number;
  focus?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ys = [...el.querySelectorAll<HTMLElement>("[data-yantra]")];
    ys.forEach((y) => prime(y));
    const offs = ys.map((y) => onView(y, () => drawYantra(y, dur), threshold));
    const until = new WeakMap<Element, number>();
    const redraw = (e: Event) => {
      const host = (e.target as Element | null)?.closest<HTMLElement>("[data-yantra-hover]");
      if (!host || !el.contains(host) || isReduced()) return;
      // mouseover bubbles: ignore moves between elements inside the same host.
      const from = (e as MouseEvent).relatedTarget as Node | null;
      if (e.type === "mouseover" && from && host.contains(from)) return;
      const now = Date.now();
      if ((until.get(host) || 0) > now) return;
      until.set(host, now + throttle);
      drawYantra(host.matches("[data-yantra]") ? host : host.querySelector("[data-yantra]"), redrawDur);
    };
    el.addEventListener("mouseover", redraw);
    if (focus) el.addEventListener("focusin", redraw);
    return () => {
      offs.forEach((off) => off());
      el.removeEventListener("mouseover", redraw);
      el.removeEventListener("focusin", redraw);
    };
  }, [threshold, dur, redrawDur, throttle, focus]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
