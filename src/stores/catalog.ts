"use client";
import { create } from "zustand";
import { SETTINGS_DEFAULTS } from "@/lib/validation/settings";
import type { CatalogSnapshot, ProductLite } from "@/lib/domain/types";

export type CatalogStatus = "idle" | "loading" | "ready" | "error";

export type CatalogState = {
  snap: CatalogSnapshot | null;
  byId: Map<string, ProductLite>;
  status: CatalogStatus;
  load: () => Promise<void>;
};

export const DEFAULT_FEES: CatalogSnapshot["fees"] = {
  freeShippingInr: SETTINGS_DEFAULTS.store.freeShippingInr,
  shippingInr: SETTINGS_DEFAULTS.store.shippingInr,
  expressInr: SETTINGS_DEFAULTS.store.expressInr,
  codFeeInr: SETTINGS_DEFAULTS.store.codFeeInr,
  codEnabled: SETTINGS_DEFAULTS.store.codEnabled,
  giftWrapInr: SETTINGS_DEFAULTS.store.giftWrapInr,
  energizationInr: SETTINGS_DEFAULTS.store.energizationInr,
  maxLineQty: SETTINGS_DEFAULTS.store.maxLineQty,
};

async function fetchCatalogApi(): Promise<CatalogSnapshot> {
  const res = await fetch("/api/catalog");
  if (!res.ok) {
    throw new Error(`Failed to load catalog: ${res.status}`);
  }
  return (await res.json()) as CatalogSnapshot;
}

export const useCatalog = create<CatalogState>()((set, get) => ({
  snap: null,
  byId: new Map(),
  status: "idle",
  load: async () => {
    const { status } = get();
    if (status === "loading" || status === "ready") return;
    set({ status: "loading" });
    try {
      const snap = await fetchCatalogApi();
      const byId = new Map<string, ProductLite>(snap.products.map((p) => [p.id, p]));
      set({ snap, byId, status: "ready" });
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        const snap = await fetchCatalogApi();
        const byId = new Map<string, ProductLite>(snap.products.map((p) => [p.id, p]));
        set({ snap, byId, status: "ready" });
      } catch {
        set({ status: "error" });
      }
    }
  },
}));

export function useProductLite(id: string): ProductLite | undefined {
  return useCatalog((s) => s.byId.get(id));
}

export function getProductLite(id: string): ProductLite | undefined {
  return useCatalog.getState().byId.get(id);
}

export function useFees(): CatalogSnapshot["fees"] {
  return useCatalog((s) => s.snap?.fees ?? DEFAULT_FEES);
}

export function getFees(): CatalogSnapshot["fees"] {
  return useCatalog.getState().snap?.fees ?? DEFAULT_FEES;
}
