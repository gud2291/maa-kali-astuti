/* Pure cart maths ported from mka-core.js store (407, 418–439). The zustand store and any
   server-side re-check share these functions. */
import type { AppliedCoupon, CartLine, CartTotals, Energization, ResolvedLine } from "@/types/cart";
import type { ProductLite } from "@/lib/domain/types";
import type { Fees } from "./commerce";

/** `${pid}|${variant}|${name/gotra}` — same product with another size or sankalp is a new line. */
export const lineKey = (pid: string, variant?: string | null, energ?: Energization | null): string =>
  `${pid}|${variant || ""}|${energ ? energ.name + "/" + energ.gotra : ""}`;

export const clampQty = (q: number, max: number): number =>
  Math.max(1, Math.min(max, Math.round(q) || 1));

export const cartCount = (lines: readonly { qty: number }[]): number => lines.reduce((a, l) => a + l.qty, 0);

/** Attach products; lines whose product no longer exists are dropped. */
export function resolveLines(
  lines: readonly CartLine[],
  lookup: (id: string) => ProductLite | undefined,
): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const l of lines) {
    const p = lookup(l.pid);
    if (p) out.push({ ...l, p });
  }
  return out;
}

export function computeTotals(
  ls: readonly { qty: number; energ: Energization | null; p: { price: number; mrp: number } }[],
  fees: Fees,
  o: {
    coupon: AppliedCoupon | null;
    gift: boolean;
    express?: boolean;
    cod?: boolean;
    noCoupon?: boolean;
  },
): CartTotals {
  const items = ls.reduce((a, l) => a + l.p.price * l.qty, 0);
  const mrp = ls.reduce((a, l) => a + l.p.mrp * l.qty, 0);
  const energ = ls.reduce((a, l) => a + (l.energ ? fees.energizationInr * l.qty : 0), 0);
  const sub = items + energ;
  const c = o.noCoupon ? null : o.coupon;
  let disc = 0;
  if (c) {
    const rawDisc = c.kind === "percent" ? Math.round((items * c.value) / 100) : c.value;
    disc = Math.min(rawDisc, c.max ?? Infinity, items);
  }
  const giftFee = o.gift ? fees.giftWrapInr : 0;
  const ship = ls.length === 0 ? 0 : sub - disc >= fees.freeShippingInr ? 0 : fees.shippingInr;
  const express = o.express ? fees.expressInr : 0;
  const cod = o.cod ? fees.codFeeInr : 0;
  return {
    count: cartCount(ls),
    items,
    mrp,
    save: mrp - items,
    energ,
    sub,
    disc,
    gift: giftFee,
    ship,
    express,
    cod,
    total: sub - disc + giftFee + ship + express + cod,
    toFree: Math.max(0, fees.freeShippingInr - (sub - disc)),
    pct: fees.freeShippingInr > 0 ? Math.min(1, (sub - disc) / fees.freeShippingInr) : 1,
  };
}
