import { after } from "next/server";
import { log } from "@/server/log";
import { env } from "@/server/env";
import { webhookTokenValid } from "@/server/shipping/shiprocket";
import { applyTrackingUpdate, type TrackingPayload } from "@/server/shipping/service";
import { sendOrderStatusEmail } from "@/server/orders/emails";

/**
 * Shiprocket tracking webhook (Shiprocket → Settings → API → Webhooks).
 * The URL must not contain the words "shiprocket" or "sr", hence /api/hooks/tracking.
 * Shiprocket sends the configured token in the `x-api-key` header; anything without it is refused.
 */
export async function POST(req: Request): Promise<Response> {
  if (!env.SHIPROCKET_WEBHOOK_TOKEN) {
    return Response.json({ error: "Tracking webhook is not configured (SHIPROCKET_WEBHOOK_TOKEN)." }, { status: 503 });
  }
  if (!webhookTokenValid(req.headers.get("x-api-key"))) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const update = await applyTrackingUpdate(payload as TrackingPayload);
    if (update?.isNew && update.orderMovedTo) {
      const { orderId, orderMovedTo } = update;
      after(() => {
        sendOrderStatusEmail(orderId, orderMovedTo).catch((e) =>
          log.error("shipping.status_email_failed", { orderId, error: e instanceof Error ? e.message : String(e) }),
        );
      });
    }
    // 200 even for unknown shipments (e.g. Shiprocket's own test call) so it doesn't keep retrying.
    return Response.json({ ok: true, matched: Boolean(update) });
  } catch (err) {
    log.error("shipping.tracking_update_failed", { error: err instanceof Error ? err.message : String(err) });
    return Response.json({ error: "Processing failed; will be retried." }, { status: 500 });
  }
}
