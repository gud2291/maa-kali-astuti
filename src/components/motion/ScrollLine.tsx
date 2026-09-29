"use client";

import { useEffect, useRef } from "react";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";

/* Scroll-filled process line (Home.dc.html frame2 1269–1275; Rituals page):
   p = clamp((0.62·vh − top) / height, 0, 1) → fill scaleY(p) (or scaleX).
   Skips work while more than 100px outside the viewport; reduced motion = full line.
   `onProgress` lets the section light its steps (design: n = min(steps, floor(p·steps + .35))). */
export function ScrollLine({
  axis = "y",
  className,
  fillClassName,
  onProgress,
}: {
  axis?: "x" | "y";
  /** Track: position/size it like the design's rail. */
  className?: string;
  /** Fill colour etc. */
  fillClassName?: string;
  onProgress?: (p: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const el = track.current;
    const f = fill.current;
    if (!el || !f) return;
    const set = (p: number) => {
      f.style.transform = axis === "y" ? `scaleY(${p})` : `scaleX(${p})`;
      cb.current?.(p);
    };
    if (isReduced()) {
      set(1);
      return;
    }
    let raf = 0;
    let last = -1;
    const frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const size = axis === "y" ? r.height : r.width;
      const p = Math.max(0, Math.min(1, (vh * 0.62 - r.top) / Math.max(1, size)));
      if (p !== last) {
        last = p;
        set(p);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    frame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [axis]);

  return (
    <div ref={track} aria-hidden="true" className={cn("relative overflow-hidden", className)}>
      <div
        ref={fill}
        className={cn("absolute inset-0", axis === "y" ? "origin-top" : "origin-left", fillClassName)}
        style={{ transform: axis === "y" ? "scaleY(0)" : "scaleX(0)" }}
      />
    </div>
  );
}
