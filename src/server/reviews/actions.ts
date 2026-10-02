"use server";

import { runAction, type ActionResult } from "@/server/result";
import { clientIp } from "@/server/request";
import { verifyTurnstile } from "@/server/auth/turnstile";
import { rateLimit } from "@/server/rate-limit";
import { getCustomer } from "@/server/auth/guards";
import { reviewSubmitSchema, moreReviewsSchema } from "@/lib/validation/review";
import { submitReview } from "./service";
import { fetchReviewItemsByProduct, type ProductReviewItem } from "./queries";

export async function submitReviewAction(
  rawInput: unknown,
): Promise<ActionResult<{ reviewId: number }>> {
  return runAction(async () => {
    const input = reviewSubmitSchema.parse(rawInput);
    const ip = await clientIp();

    await verifyTurnstile(input.turnstileToken, ip);
    await rateLimit("review:ip", ip, 5, 3600);

    const customer = await getCustomer();
    const userId = customer?.id ?? null;

    // Max 1 review per product per email/phone per day
    if (input.contact && input.contact.trim() !== "") {
      const contactKey = input.contact.trim().toLowerCase();
      await rateLimit(`review:${input.productId}`, contactKey, 1, 86400);
    }
    if (customer?.email) {
      await rateLimit(`review:${input.productId}`, customer.email.toLowerCase(), 1, 86400);
    }
    if (customer?.phone) {
      await rateLimit(`review:${input.productId}`, customer.phone, 1, 86400);
    }

    const { reviewId } = await submitReview(input, { userId, ip });

    return { reviewId };
  });
}

export async function moreReviewsAction(
  rawInput: unknown,
): Promise<ActionResult<{ items: ProductReviewItem[]; hasMore: boolean }>> {
  return runAction(async () => {
    const { productId, offset } = moreReviewsSchema.parse(rawInput);
    const limit = 10;
    const items = await fetchReviewItemsByProduct(productId, limit, offset);
    return {
      items,
      hasMore: items.length === limit,
    };
  });
}
