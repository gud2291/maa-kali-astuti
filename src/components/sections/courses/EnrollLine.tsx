"use client";

import { useEffect, useRef } from "react";
import { EASE } from "@/components/motion/easing";
import { isReduced } from "@/lib/hooks/useReducedMotion";

/* Enrollment gold line (Sadhana-Courses 103, lineRef 188): from 1024px, once 40% of it is visible,
   it grows left → right (scaleX 0 → 1, 1600 ms EASE). Hidden below 1024 (the steps stack with
   their own vertical rules). Reduced motion: shown complete. The server renders it complete, so
   it only starts at scaleX(0) once the effect runs. */
export function EnrollLine() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || isReduced()) return;
    el.style.transform = "scaleX(0)";
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
          duration: 1600,
          easing: EASE,
          fill: "forwards",
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="absolute top-6 right-6 left-6 hidden h-px origin-left bg-g3 lg:block"
    />
  );
}
