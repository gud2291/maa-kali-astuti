"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { EASE } from "@/components/motion/easing";
import { onView } from "@/components/motion/draw";
import { stagger } from "@/components/motion/fx";
import { isReduced } from "@/lib/hooks/useReducedMotion";

/* "How it works" steps motion (Consultations.dc.html stepsRef 276): once 25% of the list is visible,
   the gold rail grows (scaleX from 900px, else scaleY; 1400 ms EASE) and the four [data-step] items
   fade up one after another (y 16, 600 ms, 180 ms apart). Reduced motion: the rail is simply shown.
   The rail sits behind the numbered circles: left 28/27.5px, top 28px; horizontal (right 0) from
   900px, vertical (bottom 28px) below. */
export function StepsReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    return onView(
      el,
      () => {
        const ln = line.current;
        if (ln && !isReduced()) {
          const wide = window.matchMedia("(min-width: 900px)").matches;
          ln.animate([{ transform: wide ? "scaleX(0)" : "scaleY(0)" }, { transform: "none" }], {
            duration: 1400,
            easing: EASE,
            fill: "forwards",
          });
        } else if (ln) ln.style.transform = "none";
        stagger(el, "[data-step]", { y: 16, dur: 600, step: 180 });
      },
      0.25,
    );
  }, []);

  return (
    <div ref={root} className="relative">
      <span
        ref={line}
        aria-hidden="true"
        className="absolute top-7 bottom-7 left-[27.5px] w-px origin-top-left [transform:scaleY(0)] bg-[rgba(217,185,106,.55)] w900:right-0 w900:bottom-auto w900:left-7 w900:h-px w900:w-auto w900:[transform:scaleX(0)]"
      />
      {children}
    </div>
  );
}
