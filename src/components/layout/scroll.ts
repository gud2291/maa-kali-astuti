/* Shared handle to the Lenis instance (created by <SmoothScroll/> on desktop only) so chrome
   actions scroll through Lenis when it runs and natively otherwise. Client-only. */
import type Lenis from "lenis";
import { isReduced } from "@/lib/hooks/useReducedMotion";

let lenis: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

/** Back-to-top / logo-on-Home (SiteChrome 474, 540): smooth unless reduced motion. */
export function scrollToTop() {
  if (lenis && !isReduced()) {
    lenis.scrollTo(0);
    return;
  }
  window.scrollTo({ top: 0, behavior: isReduced() ? "auto" : "smooth" });
}

/** In-page anchor jump (Consultations "Compare the four" 45, Consultation-Detail "Compare packages"
 *  47): the section's top minus `offset` (the design uses 60), smooth unless reduced motion. */
export function scrollToId(id: string, offset = 60) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - offset;
  if (lenis && !isReduced()) {
    lenis.scrollTo(top);
    return;
  }
  window.scrollTo({ top, behavior: isReduced() ? "auto" : "smooth" });
}

/** Scroll to an absolute page offset: smooth unless reduced motion (Booking error focus 518). */
export function scrollToY(top: number) {
  const y = Math.max(0, top);
  if (lenis && !isReduced()) {
    lenis.scrollTo(y);
    return;
  }
  window.scrollTo({ top: y, behavior: isReduced() ? "auto" : "smooth" });
}

/** Instant jump to the top (Booking confirmation 521: `window.scrollTo(0, 0)`). */
export function jumpToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}
