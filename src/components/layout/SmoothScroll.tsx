"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useMedia } from "@/lib/hooks/useMedia";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useUi } from "@/stores/ui";
import { setLenis } from "./scroll";

/**
 * Lenis smooth wheel scrolling — desktop (≥1024), fine pointer and no reduced motion only
 * (TECH-STACK). Touch devices keep native scrolling. Stops while any overlay is open, and
 * never hijacks wheel events inside a dialog (drawer, search, menu, quick-add), so their own
 * lists scroll natively.
 */
export function SmoothScroll() {
  const desktop = useMedia("(min-width: 1024px) and (pointer: fine)");
  const reduced = useReducedMotion();
  const enabled = desktop && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      autoRaf: true,
      prevent: (node) =>
        node.getAttribute("role") === "dialog" || node.hasAttribute("data-radix-popper-content-wrapper"),
    });
    setLenis(lenis);
    const sync = (s: ReturnType<typeof useUi.getState>) => {
      if (s.cartOpen || s.searchOpen || s.menuOpen || s.quick) lenis.stop();
      else lenis.start();
    };
    sync(useUi.getState());
    const unsub = useUi.subscribe(sync);
    return () => {
      unsub();
      setLenis(null);
      lenis.destroy();
    };
  }, [enabled]);

  return null;
}
