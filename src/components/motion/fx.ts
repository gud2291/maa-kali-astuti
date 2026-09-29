/* WAAPI helpers ported from mka-core.js 508–512 (fx.roll / shimmer / drawIn / enter / stagger).
   Every helper is a no-op (or jumps to the end state) under reduced motion. Client-only. */
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { EASE } from "./easing";

/** Number roll (qty steppers): slides in from below (dir > 0) or above. 240 ms. */
export function roll(el: Element | null, dir: number) {
  if (!el || isReduced()) return;
  el.animate(
    [
      { transform: `translateY(${dir > 0 ? 70 : -70}%)`, opacity: 0 },
      { transform: "translateY(0)", opacity: 1 },
    ],
    { duration: 240, easing: EASE },
  );
}

const shimmering = new WeakMap<Element, Animation>();
/** Skeleton shimmer: background-position 150% → −50%, 1.4 s linear, infinite. Returns a stop fn. */
export function shimmer(el: Element | null): () => void {
  if (!el || isReduced()) return () => {};
  let a = shimmering.get(el);
  if (!a) {
    a = el.animate([{ backgroundPosition: "150% 0" }, { backgroundPosition: "-50% 0" }], {
      duration: 1400,
      iterations: Infinity,
      easing: "linear",
    });
    shimmering.set(el, a);
  }
  return () => {
    a?.cancel();
    shimmering.delete(el);
  };
}

/** Stroke draw for `pathLength=1` elements. Reduced motion shows the finished line. */
export function drawIn(el: SVGElement | null, dur = 900, delay = 0) {
  if (!el) return;
  el.style.strokeDasharray = "1";
  if (isReduced()) {
    el.style.strokeDashoffset = "0";
    return;
  }
  el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, delay, easing: EASE, fill: "both" });
}

type EnterOpts = { y?: number; dur?: number; delay?: number };
/** Small fade-up entrance (default 8px, 300 ms). */
export function enter(el: Element | null, o: EnterOpts = {}) {
  if (!el || isReduced()) return;
  el.animate(
    [
      { opacity: 0, transform: `translateY(${o.y ?? 8}px)` },
      { opacity: 1, transform: "none" },
    ],
    { duration: o.dur || 300, delay: o.delay || 0, easing: EASE, fill: "backwards" },
  );
}

/** `enter` each match of `sel` inside root with a `step` ms stagger (default 60). */
export function stagger(root: ParentNode | null, sel: string, o: EnterOpts & { step?: number } = {}) {
  if (!root) return;
  root.querySelectorAll(sel).forEach((e, i) => enter(e, { ...o, delay: (o.delay || 0) + i * (o.step || 60) }));
}
