/* Wishlist store — port of mka-core.js store.isWish / wishToggle (414–415). Persisted, hydrated
   by <StoreHydrator/> like the cart. */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORE_KEY } from "@/lib/core/commerce";

export const WISH_STORAGE_KEY = `${STORE_KEY}.wish`;

type WishState = {
  /** Product ids, most recent first. */
  ids: string[];
  /** Adds or removes; returns true when the product is now saved. */
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  seed: () => void;
};

export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids;
        const had = ids.includes(id);
        set({ ids: had ? ids.filter((x) => x !== id) : [id, ...ids] });
        return !had;
      },
      remove: (id) => set({ ids: get().ids.filter((x) => x !== id) }),
      seed: () => set({ ids: ["b-rose", "a-bagla", "m7"] }),
    }),
    {
      name: WISH_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ ids: s.ids }),
    },
  ),
);

export const useIsWished = (id: string) => useWishlist((s) => s.ids.includes(id));
export const useWishCount = () => useWishlist((s) => s.ids.length);
