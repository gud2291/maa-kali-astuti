"use client";

import { useEffect } from "react";
import { rng } from "@/lib/core/rng";
import { EASE } from "./easing";

/* Page-wide motion driver — the port of mka-core.js auto() (554) + fx.scan (465–481) + fx.reveal (482–489).
   Mounted once in the locale layout. It watches the DOM (MutationObserver, 80 ms debounce) for:

   [data-amb="kind:n0:n1:…"]  ambient loops. Parses the params into CSS variables and sets
       data-amb-on, so the matching @keyframes in globals.css start. Plays only while within
       120px of the viewport (else data-amb-paused) and while the tab is visible
       (html[data-tab-hidden]). Random durations/phases come from a seeded rng, never Math.random.

   [data-reveal="i"]  fade-up 24px, 700 ms, delay i × 80 ms, EASE, once at 12% visibility.
       Only elements that start below 92% of the viewport are hidden first (no flash above the fold).

   Reduced motion: ambient elements are never bound (CSS keeps them still) and reveals stay visible. */

const REDUCED = "(prefers-reduced-motion: reduce)";

type AmbEl = (HTMLElement | SVGElement) & { __rv?: 1 };

function bindAmb(el: AmbEl, R: () => number) {
  const [kind, ...a] = (el.getAttribute("data-amb") || "").split(":");
  const n = a.map(Number);
  const s = el.style;
  const ms = (v: number) => `${Math.round(v)}ms`;
  switch (kind) {
    case "spin":
      s.setProperty("--amb-dur", ms(Math.abs(n[0] || 60) * 1000));
      s.setProperty("--amb-dir", n[0] < 0 ? "reverse" : "normal");
      break;
    case "float": {
      const du = (n[0] || 8) * 1000;
      s.setProperty("--amb-dur", ms(du));
      s.setProperty("--amb-y", `${n[1] || 12}px`);
      s.setProperty("--amb-r", `${n[2] || 4}deg`);
      s.setProperty("--amb-delay", ms(-(Number.isNaN(n[3]) || n[3] === undefined ? R() : n[3]) * du));
      break;
    }
    case "twinkle": {
      const du = 2000 + R() * 4000;
      s.setProperty("--amb-dur", ms(du));
      s.setProperty("--amb-delay", ms(-R() * du));
      break;
    }
    case "glow":
      s.setProperty("--amb-dur", ms((n[0] || 3) * 1000));
      break;
    case "flicker":
      s.setProperty("--amb-dur", ms(1600 + R() * 500));
      break;
    case "smoke":
      s.setProperty("--amb-dur", ms((n[0] || 8) * 1000));
      s.setProperty("--amb-delay", ms(-(n[1] || 0) * 1000));
      break;
    case "pulse":
      s.setProperty("--amb-dur", ms((n[0] || 8) * 1000));
      break;
    case "shoot":
      s.setProperty("--amb-dur", ms((n[0] || 12) * 1000));
      s.setProperty("--amb-delay", ms((n[1] || 0) * 1000));
      break;
    case "draw":
      s.setProperty("--amb-dur", ms((n[0] || 16) * 1000));
      s.setProperty("--amb-delay", ms((n[1] || 0) * 1000));
      break;
    default:
      return false;
  }
  el.setAttribute("data-amb-on", "");
  return true;
}

export function AmbientRoot() {
  useEffect(() => {
    const html = document.documentElement;
    const reduced = () => window.matchMedia(REDUCED).matches;
    const R = rng("mka-amb");
    const bound = new WeakSet<Element>();

    const ambIO = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) e.target.removeAttribute("data-amb-paused");
          else e.target.setAttribute("data-amb-paused", "");
        }),
      { rootMargin: "120px" },
    );

    const revealIO = new IntersectionObserver(
      (es) =>
        es.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          revealIO.unobserve(el);
          const i = +(el.getAttribute("data-reveal") || 0) || 0;
          el.style.opacity = "";
          el.animate(
            [
              { opacity: 0, transform: "translateY(24px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 700, delay: i * 80, easing: EASE, fill: "backwards" },
          );
        }),
      { threshold: 0.12 },
    );

    const scan = () => {
      const noMotion = reduced();
      if (!noMotion) {
        document.querySelectorAll<AmbEl>("[data-amb]").forEach((el) => {
          if (bound.has(el)) return;
          bound.add(el);
          if (bindAmb(el, R)) ambIO.observe(el);
        });
      }
      const vh = window.innerHeight;
      document.querySelectorAll<AmbEl>("[data-reveal]").forEach((el) => {
        if (el.__rv) return;
        el.__rv = 1;
        if (noMotion) return;
        if (el.getBoundingClientRect().top > vh * 0.92) el.style.opacity = "0";
        revealIO.observe(el);
      });
    };

    let t: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      clearTimeout(t);
      t = setTimeout(scan, 80);
    };
    const mo = new MutationObserver(run);
    mo.observe(document.body, { childList: true, subtree: true });
    scan();

    const onVis = () => {
      if (document.hidden) html.setAttribute("data-tab-hidden", "");
      else html.removeAttribute("data-tab-hidden");
    };
    document.addEventListener("visibilitychange", onVis);
    onVis();

    return () => {
      clearTimeout(t);
      mo.disconnect();
      ambIO.disconnect();
      revealIO.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
