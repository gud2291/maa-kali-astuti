/* Ported from mka-core.js 13–14 (fmt, off) and mka-home.js 212 (secs). */

/** ₹ with Indian digit grouping, rounded: 1250 → "₹1,250". */
export const fmt = (n: number): string => "₹" + Math.round(n).toLocaleString("en-IN");

/** Discount percentage from price and MRP, rounded: {price:1250, mrp:1599} → 22. */
export const off = (p: { price: number; mrp: number }): number => Math.round((1 - p.price / p.mrp) * 100);

/** Indian digit grouping without the ₹ sign (count-ups, stats). */
export const num = (n: number): string => Math.round(n).toLocaleString("en-IN");

/** "m:ss" or "h:mm:ss" → seconds. */
export const secs = (s: string): number => String(s).split(":").reduce((a, b) => a * 60 + +b, 0);
