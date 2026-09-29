"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

type Opts = { threshold?: number; rootMargin?: string; once?: boolean };

/**
 * Observe an element. `once` (default) stops after the first intersection — the design's
 * one-shot `A.onView(el, fn, threshold)` (mka-astro.js 134–151).
 */
export function useInView<T extends Element>({ threshold = 0, rootMargin = "0px", once = true }: Opts = {}): [
  RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);
  return [ref, inView];
}
