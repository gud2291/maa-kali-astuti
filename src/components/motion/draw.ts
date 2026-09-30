/* Line-art draw helpers, ported from mka-astro.js 134–151 (A.prime / A.drawChart / A.onView).
   Markup contract: strokes to draw carry `pathLength="1" data-cl` (or `data-d` for yantras),
   labels / planets that pop in carry `data-pl`. Client-only. Reduced motion never primes, so the
   art stays complete. */
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { EASE } from "./easing";

/** Hide every stroke and label under root, ready for drawChart. */
export function prime(root: ParentNode | null) {
  if (!root || isReduced()) return;
  root.querySelectorAll<SVGElement>("[data-cl],[data-d]").forEach((e) => {
    e.style.strokeDasharray = "1";
    e.style.strokeDashoffset = "1";
  });
  root.querySelectorAll<SVGElement>("[data-pl]").forEach((e) => (e.style.opacity = "0"));
}

/** S12: strokes draw one after another over `dur` (EASE), then labels pop .4 → 1.12 → 1 (420 ms, +45 ms each). */
export function drawChart(root: ParentNode | null, o: { dur?: number; delay?: number } = {}) {
  if (!root) return;
  const ls = [...root.querySelectorAll<SVGElement>("[data-cl]")];
  const ps = [...root.querySelectorAll<SVGElement>("[data-pl]")];
  const dur = o.dur || 1200;
  const dl = o.delay || 0;
  if (isReduced()) {
    ls.forEach((e) => {
      e.style.strokeDasharray = "";
      e.style.strokeDashoffset = "";
    });
    ps.forEach((e) => (e.style.opacity = ""));
    return;
  }
  const per = dur / Math.max(1, ls.length);
  ls.forEach((e, i) => {
    e.getAnimations().forEach((a) => a.cancel());
    e.style.strokeDasharray = "1";
    e.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
      duration: per * 1.3,
      delay: dl + i * per,
      easing: EASE,
      fill: "both",
    });
  });
  ps.forEach((e, i) => {
    e.getAnimations().forEach((a) => a.cancel());
    e.animate(
      [
        { opacity: 0, transform: "scale(.4)" },
        { opacity: 1, transform: "scale(1.12)", offset: 0.7 },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 420, delay: dl + dur + 60 + i * 45, easing: "ease-out", fill: "both" },
    );
  });
}

/** One-shot: run fn the first time `threshold` of el is visible. Returns a disconnect fn. */
export function onView(el: Element | null, fn: (el: Element) => void, threshold = 0.3): () => void {
  if (!el) return () => {};
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        fn(el);
      }),
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}
