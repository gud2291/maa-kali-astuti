"use client";
import { useSyncExternalStore } from "react";

/** Behaviour-only media check (layout stays in CSS). Returns `ssr` until hydrated. */
export function useMedia(query: string, ssr = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => ssr,
  );
}

/** Design flags. Desktop behaviours (gaze, magnetic, mouse parallax) gate at ≥1024 + fine pointer. */
export const useIsMobile = () => useMedia("(max-width: 767.98px)");
export const useIsDesktop = () => useMedia("(min-width: 1024px)");
export const useFinePointer = () => useMedia("(pointer: fine)");
