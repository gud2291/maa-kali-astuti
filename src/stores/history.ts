/* Browsing history — port of mka-core.js store.searches / store.recent / store.view (399, 416)
   and SiteChrome saveQ (562). Persisted and hydrated by <StoreHydrator/> like the cart. */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORE_KEY } from "@/lib/core/commerce";

export const HISTORY_STORAGE_KEY = `${STORE_KEY}.history`;

type HistoryState = {
  /** Recent search queries, newest first (max 5; the overlay shows 4). */
  searches: string[];
  /** Recently viewed product ids, newest first (max 10). Filled by the PDP later. */
  recent: string[];
  saveSearch: (q: string) => void;
  view: (id: string) => void;
  /** First-visit demo values (mka-core.js 399). */
  seed: () => void;
};

export const useHistory = create<HistoryState>()(
  persist(
    (set, get) => ({
      searches: [],
      recent: [],
      saveSearch: (raw) => {
        const q = raw.trim();
        if (!q) return;
        set({ searches: [q, ...get().searches.filter((x) => x !== q)].slice(0, 5) });
      },
      view: (id) => set({ recent: [id, ...get().recent.filter((x) => x !== id)].slice(0, 10) }),
      seed: () => set({ searches: ["5 mukhi", "pyrite bracelet"], recent: ["b-pyrite", "m5", "a-bagla"] }),
    }),
    {
      name: HISTORY_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ searches: s.searches, recent: s.recent }),
    },
  ),
);
