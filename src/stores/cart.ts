/* Cart store — port of mka-core.js M.store cart half (398–443). Persisted to localStorage.
   Hydration-safe: `skipHydration` keeps the server render and the first client render on the
   empty initial state; <StoreHydrator/> rehydrates (and seeds the demo cart) after mount. */
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORE_KEY } from "@/lib/core/commerce";
import { cartCount, checkCoupon, clampQty, computeTotals, lineKey, resolveLines } from "@/lib/core/cart";
import { productById } from "@/lib/api/products-index";
import type { AppliedCoupon, CartLine, CouponResult, Energization, RemovedLine } from "@/types/cart";
import type { WristSize } from "@/types/product";

export const CART_STORAGE_KEY = `${STORE_KEY}.cart`;

type AddOpts = { variant?: WristSize | null; qty?: number; energ?: Energization | null };

type CartState = {
  lines: CartLine[];
  coupon: AppliedCoupon | null;
  gift: boolean;
  /** Adds (or bumps) a line; new lines go to the top. Returns the line key. */
  add: (pid: string, o?: AddOpts) => string;
  setQty: (key: string, qty: number) => void;
  /** Removes a line and returns a snapshot for Undo. */
  remove: (key: string) => RemovedLine | null;
  restore: (snap: RemovedLine | null) => void;
  setEnerg: (key: string, energ: Energization | null) => void;
  applyCoupon: (code: string) => CouponResult;
  removeCoupon: () => void;
  setGift: (on: boolean) => void;
  clear: () => void;
  /** First-visit demo cart (mka-core.js 399). */
  seed: () => void;
};

const SEED: CartLine[] = [
  {
    key: lineKey("r5", null, { name: "Ravi Sharma", gotra: "Kashyap" }),
    pid: "r5",
    variant: null,
    qty: 1,
    energ: { name: "Ravi Sharma", gotra: "Kashyap" },
  },
  { key: lineKey("havan"), pid: "havan", variant: null, qty: 1, energ: null },
];

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      gift: false,
      add: (pid, o = {}) => {
        const key = lineKey(pid, o.variant, o.energ);
        const lines = get().lines;
        const ex = lines.find((l) => l.key === key);
        set({
          lines: ex
            ? lines.map((l) => (l === ex ? { ...l, qty: clampQty(l.qty + (o.qty || 1)) } : l))
            : [{ key, pid, variant: o.variant || null, qty: clampQty(o.qty || 1), energ: o.energ || null }, ...lines],
        });
        return key;
      },
      setQty: (key, qty) => set({ lines: get().lines.map((l) => (l.key === key ? { ...l, qty: clampQty(qty) } : l)) }),
      remove: (key) => {
        const lines = get().lines;
        const i = lines.findIndex((l) => l.key === key);
        if (i < 0) return null;
        set({ lines: lines.filter((_, j) => j !== i) });
        return { line: lines[i], i };
      },
      restore: (snap) => {
        if (!snap) return;
        const lines = get().lines.slice();
        lines.splice(Math.min(snap.i, lines.length), 0, snap.line);
        set({ lines });
      },
      setEnerg: (key, energ) =>
        set({
          lines: get().lines.map((l) => (l.key === key ? { ...l, energ, key: lineKey(l.pid, l.variant, energ) } : l)),
        }),
      applyCoupon: (code) => {
        const sub = computeTotals(resolveLines(get().lines, productById), null, false, { noCoupon: true }).sub;
        const { result, coupon } = checkCoupon(code, sub);
        if (coupon) set({ coupon });
        return result;
      },
      removeCoupon: () => set({ coupon: null }),
      setGift: (gift) => set({ gift }),
      clear: () => set({ lines: [], coupon: null, gift: false }),
      seed: () => set({ lines: SEED.map((l) => ({ ...l })), coupon: null, gift: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ lines: s.lines, coupon: s.coupon, gift: s.gift }),
    },
  ),
);

/* ---------- selectors ---------- */

/** Total quantity (header / tab-bar badge). 0 until hydrated. */
export const useCartCount = () => useCart((s) => cartCount(s.lines));

/** Lines with their products attached (memoised on the lines array). */
export function useCartLines() {
  const lines = useCart((s) => s.lines);
  return useMemo(() => resolveLines(lines, productById), [lines]);
}

/** Totals for the drawer / checkout; `express` and `cod` add their fees. */
export function useCartTotals(o: { express?: boolean; cod?: boolean } = {}) {
  const lines = useCartLines();
  const coupon = useCart((s) => s.coupon);
  const gift = useCart((s) => s.gift);
  const { express, cod } = o;
  return useMemo(() => computeTotals(lines, coupon, gift, { express, cod }), [lines, coupon, gift, express, cod]);
}

/** Non-reactive count for event handlers (e.g. "first add opens the drawer"). */
export const getCartCount = () => cartCount(useCart.getState().lines);
