"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";
import { EASE } from "./easing";

/* Heading mask-up (Home.dc.html 966–981, HANDOFF "section headings mask up once, at 25%").
   <MaskText> is the [data-mask] root; each <MaskLine> is one clipped line ([data-ln]).
   Lines already within 90% of the viewport on mount are left visible; the rest start at
   translateY(110%) and rise 900 ms, 60 ms apart, EASE, when 25% of the root is visible. */

type Props<T extends ElementType> = { as?: T } & Omit<ComponentPropsWithoutRef<T>, "as">;

export function MaskText<T extends ElementType = "div">({ as, ...rest }: Props<T>) {
  const Tag: ElementType = as || "div";
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || isReduced() || root.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    const lines = [...root.querySelectorAll<HTMLElement>("[data-ln]")];
    lines.forEach((l) => (l.style.transform = "translateY(110%)"));
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        maskIn(root);
      },
      { threshold: 0.25 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      lines.forEach((l) => (l.style.transform = ""));
    };
  }, []);

  return <Tag ref={ref} data-mask="" {...rest} />;
}

/** Animate every [data-ln] in root up into place (also used by the hero slider). */
export function maskIn(root: ParentNode, { delay = 0, step = 60 }: { delay?: number; step?: number } = {}) {
  root.querySelectorAll<HTMLElement>("[data-ln]").forEach((l, i) => {
    const a = l.animate([{ transform: "translateY(110%)" }, { transform: "translateY(0)" }], {
      duration: 900,
      delay: delay + i * step,
      easing: EASE,
      fill: "forwards",
    });
    a.onfinish = () => {
      l.style.transform = "";
      a.cancel();
    };
  });
}

/** One masked line: overflow-hidden block (with .12em descender room) around a [data-ln] block. */
export function MaskLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className="-mb-[.12em] block overflow-hidden pb-[.12em]">
      <span data-ln="" className={cn("block", className)}>
        {children}
      </span>
    </span>
  );
}
