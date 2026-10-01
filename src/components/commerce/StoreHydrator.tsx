"use client";
import { useEffect } from "react";
import { CART_STORAGE_KEY, useCart } from "@/stores/cart";
import { WISH_STORAGE_KEY, useWishlist } from "@/stores/wishlist";
import { HISTORY_STORAGE_KEY, useHistory } from "@/stores/history";
import { useCatalog } from "@/stores/catalog";
import { DEMO_SEED } from "@/lib/core/commerce";

const has = (key: string) => {
  try {
    return localStorage.getItem(key) != null;
  } catch {
    return true; // storage blocked: never seed over nothing
  }
};

/**
 * Rehydrates the persisted stores after mount (so SSR and the first client render agree on
 * empty values), seeds the prototype's demo cart / wishlist / history on a first visit, and
 * keeps tabs in sync through the `storage` event (mka-core.js store.on). Mounted once in the layout.
 */
export function StoreHydrator() {
  useEffect(() => {
    const firstCart = !has(CART_STORAGE_KEY);
    const firstWish = !has(WISH_STORAGE_KEY);
    const firstHistory = !has(HISTORY_STORAGE_KEY);
    void Promise.resolve(useCart.persist.rehydrate()).then(() => {
      if (DEMO_SEED && firstCart) useCart.getState().seed();
      void useCatalog.getState().load();
    });
    void Promise.resolve(useWishlist.persist.rehydrate()).then(() => {
      if (DEMO_SEED && firstWish) useWishlist.getState().seed();
    });
    void Promise.resolve(useHistory.persist.rehydrate()).then(() => {
      if (DEMO_SEED && firstHistory) useHistory.getState().seed();
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) void useCart.persist.rehydrate();
      else if (e.key === WISH_STORAGE_KEY) void useWishlist.persist.rehydrate();
      else if (e.key === HISTORY_STORAGE_KEY) void useHistory.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}
