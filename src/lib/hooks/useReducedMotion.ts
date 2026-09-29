"use client";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

/** True when the user prefers reduced motion. Server render assumes false. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}

/** Non-hook check for effects and event handlers (M.isReduced). */
export const isReduced = (): boolean =>
  typeof window !== "undefined" && window.matchMedia(QUERY).matches;
