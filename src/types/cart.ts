import type { Product, WristSize } from "./product";

/** Name + gotra for the ₹251 energization sankalp. */
export type Energization = { name: string; gotra: string };

/** One cart line. `key` = pid | variant | energization (mka-core.js 407). */
export type CartLine = {
  key: string;
  pid: string;
  variant: WristSize | null;
  qty: number;
  energ: Energization | null;
};

/** A line resolved against the catalogue. */
export type ResolvedLine = CartLine & { p: Product };

export type AppliedCoupon = { code: string; kind: "percent" | "flat"; value: number };

/** Result of applying a coupon: an i18n key under `cart.coupon` plus its params. */
export type CouponResult = {
  ok: boolean;
  msg: "empty" | "applied10" | "applied100" | "minCart" | "invalid";
  code?: string;
};

export type CartTotals = {
  count: number;
  /** Items at selling price. */
  items: number;
  mrp: number;
  /** MRP − price. */
  save: number;
  /** Energization fees. */
  energ: number;
  /** items + energ. */
  sub: number;
  disc: number;
  gift: number;
  ship: number;
  express: number;
  cod: number;
  total: number;
  /** ₹ still needed for free shipping. */
  toFree: number;
  /** Free-shipping progress 0–1. */
  pct: number;
};

/** Snapshot returned by remove(), passed back to restore() by the toast's Undo. */
export type RemovedLine = { line: CartLine; i: number };
