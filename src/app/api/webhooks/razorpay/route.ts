import { db } from "@/server/db/client";
import { webhookEvents } from "@/server/db/schema/core";
import { eq } from "drizzle-orm";
import { verifyWebhookSignature } from "@/server/payments/razorpay";
import { dispatchPaid, dispatchFailed } from "@/server/payments/dispatch";
import { applyRefundWebhook } from "@/server/orders/refunds";
import { markLinkPaid } from "@/server/inquiries/links";
import { log } from "@/server/log";

export async function POST(request: Request): Promise<Response> {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (err) {
    log.error("webhook.read_body_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return new Response("Could not read body", { status: 400 });
  }

  const signature = request.headers.get("x-razorpay-signature") || "";
  const valid = verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    log.warn("webhook.invalid_signature", { signature });
    return new Response("Invalid signature", { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch (err) {
    log.error("webhook.json_parse_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = typeof body.event === "string" ? body.event : "unknown";
  const eventId =
    request.headers.get("x-razorpay-event-id") ||
    (typeof body.id === "string" ? body.id : `evt_${Date.now()}`);

  try {
    const inserted = await db
      .insert(webhookEvents)
      .values({
        id: eventId,
        provider: "razorpay",
        type: eventType,
      })
      .onConflictDoNothing()
      .returning({ id: webhookEvents.id });

    if (inserted.length === 0) {
      return new Response("OK (duplicate)", { status: 200 });
    }

    const payload = body.payload as
      | Record<string, { entity: Record<string, unknown> }>
      | undefined;

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload?.payment?.entity;
      const orderEntity = payload?.order?.entity;

      const notes = (paymentEntity?.notes || orderEntity?.notes || {}) as Record<
        string,
        string
      >;
      const entity = notes.entity;
      const entityId = Number(notes.id);
      const rzpPaymentId =
        typeof paymentEntity?.id === "string" ? paymentEntity.id : "";
      const rzpOrderId =
        typeof paymentEntity?.order_id === "string"
          ? paymentEntity.order_id
          : typeof orderEntity?.id === "string"
            ? orderEntity.id
            : null;

      const amountPaise =
        typeof paymentEntity?.amount === "number"
          ? paymentEntity.amount
          : typeof orderEntity?.amount_paid === "number"
            ? orderEntity.amount_paid
            : 0;
      const amountInr = Math.round(amountPaise / 100);
      const method =
        typeof paymentEntity?.method === "string" ? paymentEntity.method : null;

      if (entity && Number.isFinite(entityId) && entityId > 0 && rzpPaymentId) {
        await dispatchPaid({
          entity,
          entityId,
          rzpOrderId,
          rzpPaymentId,
          amountInr,
          method,
        });
      } else {
        log.warn("webhook.missing_entity_or_payment", {
          eventType,
          entity,
          entityId,
          rzpPaymentId,
        });
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      const notes = (paymentEntity?.notes || {}) as Record<string, string>;
      const entity = notes.entity;
      const entityId = Number(notes.id);
      const rzpPaymentId =
        typeof paymentEntity?.id === "string" ? paymentEntity.id : null;
      const rzpOrderId =
        typeof paymentEntity?.order_id === "string"
          ? paymentEntity.order_id
          : null;
      const error =
        typeof paymentEntity?.error_description === "string"
          ? paymentEntity.error_description
          : typeof paymentEntity?.error_code === "string"
            ? paymentEntity.error_code
            : "Payment failed";

      if (entity && Number.isFinite(entityId) && entityId > 0) {
        await dispatchFailed({
          entity,
          entityId,
          rzpOrderId,
          rzpPaymentId,
          error,
        });
      }
    } else if (
      eventType === "refund.processed" ||
      eventType === "refund.failed"
    ) {
      const refundEntity = payload?.refund?.entity;
      const rzpRefundId =
        typeof refundEntity?.id === "string" ? refundEntity.id : "";
      const status =
        eventType === "refund.processed" ? "processed" : "failed";

      if (rzpRefundId) {
        await applyRefundWebhook(rzpRefundId, status);
      } else {
        log.warn("webhook.missing_refund_id", { eventType });
      }
    } else if (eventType === "payment_link.paid") {
      const linkEntity = payload?.payment_link?.entity;
      const paymentEntity = payload?.payment?.entity;
      const rzpLinkId =
        typeof linkEntity?.id === "string" ? linkEntity.id : "";
      const rzpPaymentId =
        typeof paymentEntity?.id === "string"
          ? paymentEntity.id
          : typeof (linkEntity as Record<string, unknown> | undefined)?.payment_id === "string"
            ? ((linkEntity as Record<string, unknown>).payment_id as string)
            : "";
      const amountPaise =
        typeof paymentEntity?.amount === "number"
          ? paymentEntity.amount
          : typeof linkEntity?.amount_paid === "number"
            ? linkEntity.amount_paid
            : typeof linkEntity?.amount === "number"
              ? linkEntity.amount
              : 0;
      const amountInr = Math.round(amountPaise / 100);
      const method =
        typeof paymentEntity?.method === "string" ? paymentEntity.method : null;

      if (rzpLinkId) {
        await markLinkPaid({
          rzpLinkId,
          rzpPaymentId,
          amountInr,
          method,
        });
      } else {
        log.warn("webhook.missing_link_id", { eventType });
      }
    }

    await db
      .update(webhookEvents)
      .set({ processedAt: new Date() })
      .where(eq(webhookEvents.id, eventId));

    return new Response("OK", { status: 200 });
  } catch (err) {
    log.error("webhook.processing_failed", {
      eventId,
      eventType,
      error: err instanceof Error ? err.message : String(err),
    });
    return new Response("Internal error recorded", { status: 200 });
  }
}
