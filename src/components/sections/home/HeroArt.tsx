"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePanditMotion } from "@/components/signature/usePanditMotion";
import { isReduced } from "@/lib/hooks/useReducedMotion";

/* Client shell around the server-rendered hero art (Home.dc.html 38–53, artRef 1403).
   Runs Pandit Ji's motion and the [data-px] parallax (frame 982–990, INV §E.1 S9):
   each layer moves by −scrollY × px while scrollY < 1.4 × vh, plus ±px × 32 toward the
   mouse on desktop (≥1024). Reduced motion: no parallax at all. */
export function HeroArt({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  usePanditMotion(ref);

  useEffect(() => {
    const root = ref.current;
    if (!root || isReduced()) return;
    const layers = [...root.querySelectorAll<HTMLElement>("[data-px]")].map((el) => ({
      el,
      d: +(el.getAttribute("data-px") || 0) || 0,
    }));
    let mx = 0;
    let my = 0;
    let rq = 0;

    const frame = () => {
      rq = 0;
      const sy = window.scrollY;
      if (sy >= window.innerHeight * 1.4) return;
      const desk = window.innerWidth >= 1024;
      const x = desk ? mx : 0;
      const y = desk ? my : 0;
      layers.forEach(({ el, d }) => {
        el.style.transform = `translate3d(${(x * d * 32).toFixed(1)}px,${(y * d * 32 - sy * d).toFixed(1)}px,0)`;
      });
    };
    const request = () => {
      if (!rq) rq = requestAnimationFrame(frame);
    };
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      request();
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    window.addEventListener("mousemove", onMove, { passive: true });
    frame();
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rq);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
