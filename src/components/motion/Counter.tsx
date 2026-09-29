"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType } from "react";
import { isReduced } from "@/lib/hooks/useReducedMotion";

/* Count-up (Home.dc.html 1263–1268): when 40% of the group is visible, every [data-count]
   inside counts 0 → value over 1600 ms, ease-out cubic, en-IN grouping. Server markup shows
   the final value (no-JS / SEO); reduced motion leaves it there.
   Usage: <CountGroup className=…><Counter value={12000} />+ seekers</CountGroup> */

type Props<T extends ElementType> = { as?: T } & Omit<ComponentPropsWithoutRef<T>, "as">;

export function CountGroup<T extends ElementType = "div">({ as, ...rest }: Props<T>) {
  const Tag: ElementType = as || "div";
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || isReduced()) return;
    const els = [...root.querySelectorAll<HTMLElement>("[data-count]")];
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / 1600);
          const k = 1 - Math.pow(1 - p, 3);
          els.forEach((el) => (el.textContent = Math.round(+el.dataset.count! * k).toLocaleString("en-IN")));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      els.forEach((el) => (el.textContent = (+el.dataset.count!).toLocaleString("en-IN")));
    };
  }, []);

  return <Tag ref={ref} {...rest} />;
}

/** A number that CountGroup animates. Renders the final value. */
export function Counter({ value, className }: { value: number; className?: string }) {
  return (
    <span data-count={value} className={className}>
      {value.toLocaleString("en-IN")}
    </span>
  );
}
