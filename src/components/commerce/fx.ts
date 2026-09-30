/* Commerce micro-interactions ported from mka-core.js fx (490–507): fly-to-cart arc, cart badge
   bump and the wishlist burst. Client-only; reduced motion skips the flight and the bumps. */
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { EASE, FLY } from "@/components/motion/easing";

/** First visible `[data-cart-target]` (on mobile that is the compact header cart, not the tab bar). */
export function cartTarget(): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>("[data-cart-target]")].find((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight;
  });
}

/** Bounce every `[data-cart-badge]`: 1 → 1.5 → .9 → 1.05 → 1 in 560 ms. */
export function bump(el: Element | null) {
  if (!el || isReduced()) return;
  el.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.5)", offset: 0.35 },
      { transform: "scale(.9)", offset: 0.65 },
      { transform: "scale(1.05)", offset: 0.85 },
      { transform: "scale(1)" },
    ],
    { duration: 560, easing: "ease-out" },
  );
}

export function bumpCart() {
  document.querySelectorAll("[data-cart-badge]").forEach(bump);
}

/**
 * Clone `src` (the product image) and arc it into the cart icon: up 90 px at the midpoint,
 * shrinking to a 26 px dot, 620 ms. Then bump the badge. No target / reduced motion → bump only.
 */
export function flyToCart(src: HTMLElement | null) {
  const t = cartTarget();
  if (!src || !t || isReduced()) {
    bumpCart();
    return;
  }
  const a = src.getBoundingClientRect();
  const b = t.getBoundingClientRect();
  const c = src.cloneNode(true) as HTMLElement;
  c.setAttribute("aria-hidden", "true");
  Object.assign(c.style, {
    // The clone keeps its classes (e.g. `absolute inset-0`); reset the box before placing it.
    inset: "auto",
    position: "fixed",
    left: a.left + "px",
    top: a.top + "px",
    width: a.width + "px",
    height: a.height + "px",
    zIndex: "9999",
    pointerEvents: "none",
    borderRadius: "4px",
    overflow: "hidden",
    background: "#F4EDDD",
    boxShadow: "0 12px 32px -12px rgba(14,59,48,.4)",
    margin: "0",
    transformOrigin: "center",
  });
  document.body.appendChild(c);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = Math.max(0.06, 26 / a.width);
  const an = c.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1, borderRadius: "4px" },
      {
        transform: `translate(${dx * 0.45}px,${Math.min(dy, 0) * 0.45 - 90}px) scale(${(0.5 + s) / 1.6})`,
        opacity: 1,
        offset: 0.5,
        borderRadius: "40px",
      },
      { transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: 0.4, borderRadius: "999px" },
    ],
    { duration: 620, easing: FLY },
  );
  an.onfinish = () => {
    c.remove();
    bumpCart();
  };
}

/** Wishlist heart: six gold dots burst 20 px outwards (520 ms) and the heart pops to 1.3×. */
export function burst(el: HTMLElement | null) {
  if (!el || isReduced()) return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    const d = document.createElement("span");
    const ang = (i / 6) * Math.PI * 2 - Math.PI / 2;
    Object.assign(d.style, {
      position: "fixed",
      left: r.left + r.width / 2 - 2.5 + "px",
      top: r.top + r.height / 2 - 2.5 + "px",
      width: "5px",
      height: "5px",
      borderRadius: "50%",
      background: "#B8923A",
      zIndex: "9999",
      pointerEvents: "none",
    });
    d.setAttribute("aria-hidden", "true");
    document.body.appendChild(d);
    d.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${Math.cos(ang) * 20}px,${Math.sin(ang) * 20}px) scale(.3)`, opacity: 0 },
      ],
      { duration: 520, easing: EASE },
    ).onfinish = () => d.remove();
  }
  el.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)", offset: 0.4 }, { transform: "scale(1)" }], {
    duration: 380,
    easing: "ease-out",
  });
}
