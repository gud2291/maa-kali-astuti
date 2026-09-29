"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False during SSR and the hydration pass, true afterwards. Guards persisted stores. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
