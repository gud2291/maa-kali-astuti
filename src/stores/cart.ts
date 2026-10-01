/* Cart store — port of mka-core.js M.store cart half (398–443). Persisted to localStorage.
   Hydration-safe: `skipHydration` keeps the server render and the first client render on the
   empty initial state; <StoreHydrator/> rehydrates (and seeds the demo cart) after mount. */
import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { STORE_KEY } from "@/lib/core/commerce";
import { cartCount, clampQty, computeTotals, lineKey, resolveLines } from "@/lib/core/cart";
import { getFees, useCatalog, useFees } from "@/stores/catalog";
import { checkCouponAction } from "@/server/cart/actions";
import type {
  AppliedCoupon,
  CartLine,
  CartTotals,
  CouponResult,
  Energization,
  RemovedLine,
  ResolvedLine,
} from "@/types/cart";
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
  applyCoupon: (code: string) => Promise<CouponResult>;
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
        const max = getFees().maxLineQty;
        const key = lineKey(pid, o.variant, o.energ);
        const lines = get().lines;
        const ex = lines.find((l) => l.key === key);
        set({
          lines: ex
            ? lines.map((l) => (l === ex ? { ...l, qty: clampQty(l.qty + (o.qty || 1), max) } : l))
            : [
                {
                  key,
                  pid,
                  variant: o.variant || null,
                  qty: clampQty(o.qty || 1, max),
                  energ: o.energ || null,
                },
                ...lines,
              ],
        });
        return key;
      },
      setQty: (key, qty) => {
        const max = getFees().maxLineQty;
        set({
          lines: get().lines.map((l) => (l.key === key ? { ...l, qty: clampQty(qty, max) } : l)),
        });
      },
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
          lines: get().lines.map((l) =>
            l.key === key ? { ...l, energ, key: lineKey(l.pid, l.variant, energ) } : l,
          ),
        }),
      applyCoupon: async (code) => {
        const trimmed = code.trim();
        if (!trimmed) {
          return { ok: false, msg: "empty" };
        }
        const lines = get().lines.map((l) => ({
          pid: l.pid,
          variant: l.variant,
          qty: l.qty,
          energ: l.energ,
        }));
        const res = await checkCouponAction({ code: trimmed, lines });
        if (res.ok) {
          const { result, coupon } = res.data;
          if (coupon) set({ coupon });
          return result;
        }
        return { ok: false, msg: "invalid", code: trimmed };
      },
      removeCoupon: () => set({ coupon: null }),
      setGift: (gift) => set({ gift }),
      clear: () => set({ lines: [], coupon: null, gift: false }),
      seed: () => set({ lines: SEED.map((l) => ({ ...l })), coupon: null, gift: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          const old = persistedState as { lines?: CartLine[]; gift?: boolean } | undefined;
          return {
            lines: old?.lines ?? [],
            coupon: null,
            gift: !!old?.gift,
          };
        }
        return persistedState as CartState;
      },
      partialize: (s) => ({ lines: s.lines, coupon: s.coupon, gift: s.gift }),
    },
  ),
);

/* ---------- selectors ---------- */

/** Total quantity (header / tab-bar badge). 0 until hydrated. */
export const useCartCount = (): number => useCart((s) => cartCount(s.lines));

/** Lines with their products attached (memoised on the lines array). */
export function useCartLines(): ResolvedLine[] {
  const lines = useCart((s) => s.lines);
  const byId = useCatalog((s) => s.byId);
  return useMemo(() => resolveLines(lines, (id) => byId.get(id)), [lines, byId]);
}

/** Totals for the drawer / checkout; `express` and `cod` add their fees. */
export function useCartTotals(o: { express?: boolean; cod?: boolean } = {}): CartTotals {
  const lines = useCartLines();
  const coupon = useCart((s) => s.coupon);
  const gift = useCart((s) => s.gift);
  const fees = useFees();
  const { express, cod } = o;
  return useMemo(
    () => computeTotals(lines, fees, { coupon, gift, express, cod }),
    [lines, fees, coupon, gift, express, cod],
  );
}

/** Non-reactive count for event handlers (e.g. "first add opens the drawer"). */
export const getCartCount = (): number => cartCount(useCart.getState().lines);
