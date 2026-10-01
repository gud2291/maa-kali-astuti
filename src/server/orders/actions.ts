"use server";
import { after } from "next/server";
import { runAction, type ActionResult, AppError } from "@/server/result";
import { clientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { verifyTurnstile } from "@/server/auth/turnstile";
import { getCustomer } from "@/server/auth/guards";
import { checkoutSchema } from "@/lib/validation/checkout";
import { placeOrder } from "./service";
import { sendOrderPlacedEmails } from "./emails";
import { invalidateLater, TAG } from "@/server/cache";
import { log } from "@/server/log";

export async function placeOrderAction(
  input: unknown,
): Promise<ActionResult<{ number: string; accessKey: string }>> {
  return runAction(async () => {
    const data = checkoutSchema.parse(input);

    if (data.method === "online") {
      throw new AppError("NOT_CONFIGURED");
    }

    const ip = await clientIp();
    await verifyTurnstile(data.turnstileToken, ip);
    await rateLimit("order:ip", ip, 10, 600);
    await rateLimit("cod:phone", data.contact.phone, 3, 86400);

    const customer = await getCustomer();
    const { orderId, number, accessKey } = await placeOrder(data, {
      userId: customer?.id ?? null,
      ip,
    });

    after(async () => {
      try {
        await sendOrderPlacedEmails(orderId);
      } catch (err) {
        log.error("order.email_after_failed", {
          orderId,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      try {
        const itemIds = Array.from(new Set(data.lines.map((l) => l.pid)));
        invalidateLater(TAG.catalog, ...itemIds.map(TAG.product));
      } catch (err) {
        log.error("order.invalidate_after_failed", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    return { number, accessKey };
  });
}
