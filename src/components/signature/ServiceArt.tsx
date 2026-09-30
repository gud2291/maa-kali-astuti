"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { drawChart, onView, prime } from "@/components/motion/draw";
import { cn } from "@/lib/utils/cn";

/* Draw-on-view wrapper for the consultation service art (Consultation-Detail.dc.html artRef 190,
   219): the Lagna chart / palm lines ([data-cl]) are hidden before paint and drawn over 1200 ms
   (labels / planets [data-pl] pop after) once 30% of the box is visible. Tarot and Lo Shu have no
   drawable strokes and simply show. Reduced motion never primes, so the art stays complete. */
export function ServiceArt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    prime(ref.current);
  }, []);

  useEffect(() => onView(ref.current, (el) => drawChart(el, { dur: 1200 }), 0.3), []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {children}
    </div>
  );
}
