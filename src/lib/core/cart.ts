/* Pure cart maths ported from mka-core.js store (407, 418–439). The zustand store and any
   server-side re-check (phase B) share these functions. */
import { COD_FEE, COUPONS, ENERGIZATION, EXPRESS, FREE_SHIPPING, GIFT_WRAP, MAX_LINE_QTY, SHIPPING } from "./commerce";
import type { AppliedCoupon, CartLine, CartTotals, CouponResult, Energization, ResolvedLine } from "@/types/cart";
import type { Product } from "@/types/product";

/** `${pid}|${variant}|${name/gotra}` — same product with another size or sankalp is a new line. */
export const lineKey = (pid: string, variant?: string | null, energ?: Energization | null): string =>
  `${pid}|${variant || ""}|${energ ? energ.name + "/" + energ.gotra : ""}`;

export const clampQty = (q: number): number => Math.max(1, Math.min(MAX_LINE_QTY, Math.round(q) || 1));

export const cartCount = (lines: readonly CartLine[]): number => lines.reduce((a, l) => a + l.qty, 0);

/** Attach products; lines whose product no longer exists are dropped. */
export function resolveLines(lines: readonly CartLine[], lookup: (id: string) => Product | undefined): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const l of lines) {
    const p = lookup(l.pid);
    if (p) out.push({ ...l, p });
  }
  return out;
}

type TotalsOpts = { noCoupon?: boolean; express?: boolean; cod?: boolean };

export function computeTotals(
  ls: readonly ResolvedLine[],
  coupon: AppliedCoupon | null,
  gift: boolean,
  o: TotalsOpts = {},
): CartTotals {
  const items = ls.reduce((a, l) => a + l.p.price * l.qty, 0);
  const mrp = ls.reduce((a, l) => a + l.p.mrp * l.qty, 0);
  const energ = ls.reduce((a, l) => a + (l.energ ? ENERGIZATION * l.qty : 0), 0);
  const sub = items + energ;
  const c = o.noCoupon ? null : coupon;
  const disc = c ? (c.kind === "percent" ? Math.round((items * c.value) / 100) : c.value) : 0;
  const giftFee = gift ? GIFT_WRAP : 0;
  const ship = ls.length === 0 ? 0 : sub - disc >= FREE_SHIPPING ? 0 : SHIPPING;
  const express = o.express ? EXPRESS : 0;
  const cod = o.cod ? COD_FEE : 0;
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
    toFree: Math.max(0, FREE_SHIPPING - (sub - disc)),
    pct: Math.min(1, (sub - disc) / FREE_SHIPPING),
  };
}

/** Validate a code against the cart (mka-core.js 420–427). `sub` = subtotal without a coupon. */
export function checkCoupon(raw: string, sub: number): { result: CouponResult; coupon: AppliedCoupon | null } {
  const code = String(raw || "")
    .trim()
    .toUpperCase();
  if (!code) return { result: { ok: false, msg: "empty" }, coupon: null };
  if (code === "SADHANA10") {
    const c = COUPONS.SADHANA10;
    return { result: { ok: true, msg: "applied10", code }, coupon: { code, kind: c.kind, value: c.value } };
  }
  if (code === "FIRST100") {
    const c = COUPONS.FIRST100;
    if (sub < c.min) return { result: { ok: false, msg: "minCart", code }, coupon: null };
    return { result: { ok: true, msg: "applied100", code }, coupon: { code, kind: c.kind, value: c.value } };
  }
  return { result: { ok: false, msg: "invalid", code }, coupon: null };
}
