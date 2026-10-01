import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { products } from "@/server/db/schema/catalog";
import { getCatalog } from "@/server/catalog/queries";
import { getSetting } from "@/server/settings/queries";
import { evaluateCoupon } from "@/server/coupons/service";
import { computeTotals } from "@/lib/core/cart";
import { fmt } from "@/lib/core/format";
import { isConfigured } from "@/server/env";
import type { Loc } from "@/lib/domain/loc";
import type { WristSize } from "@/lib/domain/enums";
import type { AppliedCoupon, CartTotals, CouponResult, Energization } from "@/types/cart";
import type { QuoteInput } from "@/lib/validation/checkout";

export type QuoteIssueCode = "UNAVAILABLE" | "QTY_REDUCED" | "OUT_OF_STOCK";

export type QuoteIssue = {
  code: QuoteIssueCode;
  pid: string;
};

export type QuoteLine = {
  pid: string;
  variant: WristSize | null;
  qty: number;
  name: Loc;
  slug: string;
  image: string | null;
  price: number;
  mrp: number;
  energ: Energization | null;
  energInr: number;
  lineTotal: number;
  stock: number;
  gstRate: number | null;
  hsn: string | null;
};

export type Quote = {
  lines: QuoteLine[];
  totals: CartTotals;
  coupon: AppliedCoupon | null;
  couponResult: CouponResult | null;
  issues: QuoteIssue[];
  codAllowed: boolean;
  codReason: "disabled" | "limit" | null;
  onlineAllowed: boolean;
};

export async function quoteCheckout(input: QuoteInput): Promise<Quote> {
  const [catalog, store] = await Promise.all([
    getCatalog(),
    getSetting("store"),
  ]);

  const pids = Array.from(new Set(input.lines.map((l) => l.pid)));
  const freshRows = pids.length > 0
    ? await db
        .select()
        .from(products)
        .where(and(inArray(products.id, pids), eq(products.status, "active")))
    : [];

  const freshMap = new Map(freshRows.map((r) => [r.id, r]));
  const catMap = new Map(catalog.products.map((p) => [p.id, p]));

  const issues: QuoteIssue[] = [];
  const lines: QuoteLine[] = [];

  for (const rawLine of input.lines) {
    const row = freshMap.get(rawLine.pid);
    const catProd = catMap.get(rawLine.pid);

    // 1. Missing or inactive
    if (!row || !catProd) {
      issues.push({ code: "UNAVAILABLE", pid: rawLine.pid });
      continue;
    }

    // 2. Size validation
    const hasSizes = Array.isArray(row.sizes) && row.sizes.length > 0;
    if (hasSizes) {
      if (!rawLine.variant || !row.sizes!.includes(rawLine.variant)) {
        issues.push({ code: "UNAVAILABLE", pid: rawLine.pid });
        continue;
      }
    } else {
      if (rawLine.variant != null) {
        issues.push({ code: "UNAVAILABLE", pid: rawLine.pid });
        continue;
      }
    }

    // 3. Energization on non-energizable product
    let energ = rawLine.energ ?? null;
    if (energ && !row.energizable) {
      issues.push({ code: "UNAVAILABLE", pid: rawLine.pid });
      energ = null;
    }

    // 4. Quantity clamping
    let qty = rawLine.qty;
    if (qty > store.maxLineQty) {
      issues.push({ code: "QTY_REDUCED", pid: rawLine.pid });
      qty = store.maxLineQty;
    }

    // 5. Stock check
    if (row.stock < qty) {
      issues.push({ code: "OUT_OF_STOCK", pid: rawLine.pid });
    }

    const energInr = energ ? store.energizationInr : 0;
    const price = row.priceInr;
    const mrp = row.mrpInr;
    const lineTotal = (price + energInr) * qty;
    const image = catProd.images?.[0]?.src ?? catProd.photo ?? null;

    lines.push({
      pid: row.id,
      variant: rawLine.variant,
      qty,
      name: { en: row.nameEn, hi: row.nameHi },
      slug: row.slug,
      image,
      price,
      mrp,
      energ,
      energInr,
      lineTotal,
      stock: row.stock,
      gstRate: row.gstRate ?? null,
      hsn: row.hsn ?? null,
    });
  }

  // Evaluate coupon
  let appliedCoupon: AppliedCoupon | null = null;
  let couponResult: CouponResult | null = null;

  if (input.couponCode) {
    const subtotalInr = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const evalRes = await evaluateCoupon(input.couponCode, {
      subtotalInr,
      email: input.email ?? null,
    });

    if (evalRes.ok) {
      appliedCoupon = evalRes.coupon;
      const offStr = appliedCoupon.kind === "percent"
        ? `${appliedCoupon.value}%`
        : fmt(appliedCoupon.value);
      couponResult = {
        ok: true,
        msg: "applied",
        code: appliedCoupon.code,
        off: offStr,
      };
    } else {
      const minStr = evalRes.min != null ? fmt(evalRes.min) : undefined;
      couponResult = {
        ok: false,
        msg: evalRes.reason,
        code: input.couponCode.trim().toUpperCase(),
        min: minStr,
      };
    }
  }

  // Totals
  const totals = computeTotals(
    lines.map((l) => ({
      qty: l.qty,
      energ: l.energ,
      p: { price: l.price, mrp: l.mrp },
    })),
    store,
    {
      coupon: appliedCoupon,
      gift: input.gift,
      express: input.delivery === "express",
      cod: input.method === "cod",
    },
  );

  // COD allowed check: codAllowed = codEnabled && total <= codMaxInr
  let codAllowed = true;
  let codReason: "disabled" | "limit" | null = null;

  if (!store.codEnabled) {
    codAllowed = false;
    codReason = "disabled";
  } else if (totals.total > store.codMaxInr) {
    codAllowed = false;
    codReason = "limit";
  }

  const onlineAllowed = isConfigured("razorpay") && !!store.onlinePayments;

  return {
    lines,
    totals,
    coupon: appliedCoupon,
    couponResult,
    issues,
    codAllowed,
    codReason,
    onlineAllowed,
  };
}
