"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/* Trust marquee (Home.dc.html 1421–1422): the content is rendered twice and the track moves
   translate3d(0 → −50%) over 56 s, linear, forever. Pauses on hover (design marqPause/Play),
   while offscreen, and while the tab is hidden; reduced motion keeps it still (globals.css). */
export function Marquee({
  children,
  className,
  trackClassName,
  duration = 56,
}: {
  /** One copy of the items; the component duplicates it for the seamless loop. */
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.removeAttribute("data-amb-paused");
      else el.setAttribute("data-amb-paused", "");
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className={cn("group overflow-hidden", className)}>
      <div
        ref={ref}
        data-loop=""
        className={cn(
          "flex w-max animate-marquee will-change-transform group-hover:[animation-play-state:paused]",
          trackClassName,
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        <div className="flex flex-none">{children}</div>
        <div className="flex flex-none" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
