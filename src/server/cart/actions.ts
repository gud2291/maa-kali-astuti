"use server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { checkoutDrafts } from "@/server/db/schema/commerce";
import { runAction, type ActionResult } from "@/server/result";
import { clientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { randomToken } from "@/server/ids";
import { getCatalog } from "@/server/catalog/queries";
import { getSetting } from "@/server/settings/queries";
import { evaluateCoupon } from "@/server/coupons/service";
import { checkCouponSchema } from "@/lib/validation/cart";
import { quoteSchema, draftSchema } from "@/lib/validation/checkout";
import { quoteCheckout, type Quote } from "@/server/cart/quote";
import { fmt } from "@/lib/core/format";
import type { AppliedCoupon, CouponResult } from "@/types/cart";

export async function checkCouponAction(
  input: unknown,
): Promise<ActionResult<{ result: CouponResult; coupon: AppliedCoupon | null }>> {
  return runAction(async () => {
    const { code, lines } = checkCouponSchema.parse(input);

    const ip = await clientIp();
    await rateLimit("coupon:ip", ip, 20, 600);

    const [catalog, store] = await Promise.all([
      getCatalog(),
      getSetting("store"),
    ]);

    const productMap = new Map(catalog.products.map((p) => [p.id, p]));

    let subtotalInr = 0;
    for (const line of lines) {
      const prod = productMap.get(line.pid);
      if (prod) {
        const itemPrice = prod.price;
        const energFee = line.energ ? store.energizationInr : 0;
        subtotalInr += (itemPrice + energFee) * line.qty;
      }
    }

    const evalResult = await evaluateCoupon(code, { subtotalInr, email: null });

    if (evalResult.ok) {
      const coupon = evalResult.coupon;
      const offStr = coupon.kind === "percent" ? `${coupon.value}%` : fmt(coupon.value);
      const result: CouponResult = {
        ok: true,
        msg: "applied",
        code: coupon.code,
        off: offStr,
      };
      return { result, coupon };
    }

    const minStr = evalResult.min != null ? fmt(evalResult.min) : undefined;
    const result: CouponResult = {
      ok: false,
      msg: evalResult.reason,
      code: code.trim().toUpperCase(),
      min: minStr,
    };
    return { result, coupon: null };
  });
}

export async function quoteAction(
  input: unknown,
): Promise<ActionResult<Quote>> {
  return runAction(async () => {
    const data = quoteSchema.parse(input);
    const ip = await clientIp();
    await rateLimit("quote:ip", ip, 60, 600);
    return quoteCheckout(data);
  });
}

export async function saveDraftAction(
  input: unknown,
): Promise<ActionResult<{ token: string }>> {
  return runAction(async () => {
    const data = draftSchema.parse(input);
    const ip = await clientIp();
    await rateLimit("draft:ip", ip, 20, 3600);

    let token = data.token;
    if (token) {
      const existing = await db
        .select({ id: checkoutDrafts.id })
        .from(checkoutDrafts)
        .where(eq(checkoutDrafts.token, token))
        .limit(1);

      if (existing[0]) {
        await db
          .update(checkoutDrafts)
          .set({
            email: data.email,
            phone: data.phone ?? null,
            name: data.name ?? null,
            locale: data.locale,
            lines: data.lines,
            totalInr: data.totalInr,
            updatedAt: new Date(),
          })
          .where(eq(checkoutDrafts.id, existing[0].id));
        return { token };
      }
    }

    token = randomToken(24);
    await db.insert(checkoutDrafts).values({
      token,
      email: data.email,
      phone: data.phone ?? null,
      name: data.name ?? null,
      locale: data.locale,
      lines: data.lines,
      totalInr: data.totalInr,
    });

    return { token };
  });
}

