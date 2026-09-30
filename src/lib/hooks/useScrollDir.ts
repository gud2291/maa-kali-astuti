"use client";
import { useEffect, useRef, useState } from "react";

export type ScrollFlags = {
  /** y > stuckAt: the header compacts and the announcement bar slides away. */
  stuck: boolean;
  /** Scrolling down past hideAfter (dy > 4); cleared on scroll up (dy < −4). */
  hidden: boolean;
  /** y > farAt: back-to-top button. */
  far: boolean;
};

/**
 * Chrome scroll state — port of SiteChrome.dc.html scrolled() 414–420: one passive listener,
 * one rAF per frame, and a re-render only when a flag flips.
 */
export function useScrollDir({ stuckAt = 28, hideAfter = 160, farAt = 700 } = {}): ScrollFlags {
  const [flags, setFlags] = useState<ScrollFlags>({ stuck: false, hidden: false, far: false });
  const cur = useRef(flags);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const frame = () => {
      raf = 0;
      const y = window.scrollY;
      const dy = y - last;
      last = y;
      const prev = cur.current;
      const next: ScrollFlags = {
        stuck: y > stuckAt,
        hidden: y > hideAfter && dy > 4 ? true : dy < -4 ? false : prev.hidden,
        far: y > farAt,
      };
      if (next.stuck !== prev.stuck || next.hidden !== prev.hidden || next.far !== prev.far) {
        cur.current = next;
        setFlags(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(frame); // initial state (e.g. reload mid-page)
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [stuckAt, hideAfter, farAt]);

  return flags;
}
