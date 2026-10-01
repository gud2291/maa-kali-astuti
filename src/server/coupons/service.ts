import "server-only";
import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { coupons, couponRedemptions, orders } from "@/server/db/schema/commerce";
import type { AppliedCoupon } from "@/types/cart";

export type EvaluateCouponCtx = {
  subtotalInr: number;
  email: string | null;
  now?: Date;
};

export type EvaluateCouponResult =
  | { ok: true; coupon: AppliedCoupon }
  | { ok: false; reason: "invalid" | "minCart" | "expired" | "used"; min?: number };

export async function evaluateCoupon(
  code: string,
  ctx: EvaluateCouponCtx,
): Promise<EvaluateCouponResult> {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{1,30}$/.test(normalized)) {
    return { ok: false, reason: "invalid" };
  }

  const rows = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, normalized))
    .limit(1);

  const coupon = rows[0];
  if (!coupon || !coupon.active) {
    return { ok: false, reason: "invalid" };
  }

  const now = ctx.now ?? new Date();
  const nowMs = now.getTime();

  if (coupon.startsAt && coupon.startsAt.getTime() > nowMs) {
    return { ok: false, reason: "expired" };
  }
  if (coupon.endsAt && coupon.endsAt.getTime() < nowMs) {
    return { ok: false, reason: "expired" };
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, reason: "used" };
  }

  if (ctx.subtotalInr < coupon.minCartInr) {
    return { ok: false, reason: "minCart", min: coupon.minCartInr };
  }

  if (ctx.email) {
    const email = ctx.email.trim().toLowerCase();

    if (coupon.perCustomerLimit != null) {
      const [redemptionCountRow] = await db
        .select({ count: count() })
        .from(couponRedemptions)
        .where(
          and(
            eq(couponRedemptions.couponId, coupon.id),
            eq(couponRedemptions.email, email),
          ),
        );

      if ((redemptionCountRow?.count ?? 0) >= coupon.perCustomerLimit) {
        return { ok: false, reason: "used" };
      }
    }

    if (coupon.firstOrderOnly) {
      const [orderRow] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.email, email),
            inArray(orders.paymentStatus, ["paid", "cod_pending", "cod_collected"]),
          ),
        )
        .limit(1);

      if (orderRow) {
        return { ok: false, reason: "used" };
      }
    }
  }

  return {
    ok: true,
    coupon: {
      code: coupon.code,
      kind: coupon.kind,
      value: coupon.value,
      max: coupon.maxDiscountInr ?? null,
    },
  };
}
