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
