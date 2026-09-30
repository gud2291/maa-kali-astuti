"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { EASE } from "@/components/motion/easing";

/**
 * Port of mka-core.js fx.pageIn (513–518): on every route change `#main` fades up 12px
 * (520 ms) and a 2px gold line sweeps across the top (scaleX over 70 % of 900 ms, then fades).
 * The first load only gets the line — fading server-rendered content out after hydration
 * would flash it. Reduced motion: nothing.
 */
const inShop = (p: string) => p === "/shop" || p.startsWith("/shop/");

export function PageTransition() {
  const pathname = usePathname();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    const initial = prev.current === null;
    // Shop category switches rewrite the path in place (ShopView): same page, like the design's
    // `#c=` hash change, so no transition.
    const changed = !initial && prev.current !== pathname && !(inShop(prev.current!) && inShop(pathname));
    prev.current = pathname;
    // Same path again = React re-running the effect (dev Strict Mode), not a navigation.
    if (isReduced() || (!initial && !changed)) return;

    if (changed) {
      document.getElementById("main")?.animate(
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 520, easing: EASE },
      );
    }

    const line = document.createElement("div");
    line.setAttribute("aria-hidden", "true");
    Object.assign(line.style, {
      position: "fixed",
      left: "0",
      top: "0",
      height: "2px",
      width: "100%",
      background: "#B8923A",
      transformOrigin: "0 50%",
      zIndex: "10000",
      pointerEvents: "none",
    });
    document.body.appendChild(line);
    const a = line.animate(
      [
        { transform: "scaleX(0)", opacity: 1 },
        { transform: "scaleX(1)", opacity: 1, offset: 0.7 },
        { transform: "scaleX(1)", opacity: 0 },
      ],
      { duration: 900, easing: EASE },
    );
    // Not cancelled on cleanup: the line always finishes its sweep and removes itself.
    a.onfinish = () => line.remove();
  }, [pathname]);

  return null;
}
