import "server-only";
import { after } from "next/server";
import { markOrderPaid, recordPaymentFailure } from "@/server/orders/service";
import { sendOrderPlacedEmails } from "@/server/orders/emails";
import { invalidateLater, TAG } from "@/server/cache";
import { db } from "@/server/db/client";
import { orderItems } from "@/server/db/schema/commerce";
import { eq } from "drizzle-orm";
import { log } from "@/server/log";

export async function dispatchPaid(opts: {
  entity: string;
  entityId: number;
  rzpOrderId: string | null;
  rzpPaymentId: string;
  amountInr: number;
  method?: string | null;
}): Promise<void> {
  if (opts.entity === "order") {
    const res = await markOrderPaid({
      orderId: opts.entityId,
      rzpOrderId: opts.rzpOrderId,
      rzpPaymentId: opts.rzpPaymentId,
      amountInr: opts.amountInr,
      method: opts.method,
    });

    if (res.first) {
      after(async () => {
        try {
          await sendOrderPlacedEmails(opts.entityId);
        } catch (err) {
          log.error("dispatch.email_failed", {
            orderId: opts.entityId,
            error: err instanceof Error ? err.message : String(err),
          });
        }

        try {
          const items = await db
            .select({ productId: orderItems.productId })
            .from(orderItems)
            .where(eq(orderItems.orderId, opts.entityId));

          const productTags = Array.from(
            new Set(items.map((i) => TAG.product(i.productId))),
          );
          invalidateLater(TAG.catalog, ...productTags);
        } catch (err) {
          log.error("dispatch.invalidate_failed", {
            orderId: opts.entityId,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    }
  } else {
    log.warn("payment.unhandledEntity", {
      entity: opts.entity,
      entityId: opts.entityId,
      action: "paid",
    });
  }
}

export async function dispatchFailed(opts: {
  entity: string;
  entityId: number;
  rzpOrderId?: string | null;
  rzpPaymentId?: string | null;
  error?: string | null;
}): Promise<void> {
  if (opts.entity === "order") {
    await recordPaymentFailure({
      orderId: opts.entityId,
      rzpOrderId: opts.rzpOrderId,
      rzpPaymentId: opts.rzpPaymentId,
      error: opts.error,
    });
  } else {
    log.warn("payment.unhandledEntity", {
      entity: opts.entity,
      entityId: opts.entityId,
      action: "failed",
    });
  }
}
