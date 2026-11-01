import "server-only";
import { eq, and, ne, desc, sql, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { reviews, orders, orderItems } from "@/server/db/schema/commerce";
import { products } from "@/server/db/schema/catalog";
import { claimMedia } from "@/server/media/service";
import { AppError } from "@/server/result";
import type { ReviewSubmitInput } from "@/lib/validation/review";

export type SubmitReviewContext = {
  userId?: number | null;
  ip?: string | null;
};

export async function submitReview(
  input: ReviewSubmitInput,
  ctx: SubmitReviewContext = {},
): Promise<{ reviewId: number }> {
  // Check that the product exists
  const prodRows = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, input.productId))
    .limit(1);

  if (prodRows.length === 0) {
    throw new AppError("NOT_FOUND");
  }

  let verified = false;
  let matchedOrderId: number | null = null;
  let matchedUserId: number | null = ctx.userId ?? null;

  // 1. If signed-in customer: check for any non-cancelled order containing this product
  if (ctx.userId) {
    const userOrders = await db
      .select({
        orderId: orders.id,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.userId, ctx.userId),
          ne(orders.status, "cancelled"),
          eq(orderItems.productId, input.productId),
        ),
      )
      .limit(1);

    if (userOrders.length > 0 && userOrders[0]) {
      verified = true;
      matchedOrderId = userOrders[0].orderId;
    }
  }

  // 2. If not verified yet, check orderNumber + contact
  if (!verified && input.orderNumber && input.contact) {
    const cleanOrderNumber = input.orderNumber.trim().toUpperCase();
    const cleanContact = input.contact.trim();
    const cleanPhone = cleanContact.replace(/\D/g, "").slice(-10);
    const cleanEmail = cleanContact.toLowerCase();

    const orderRows = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        email: orders.email,
        phone: orders.phone,
      })
      .from(orders)
      .where(and(eq(orders.number, cleanOrderNumber), ne(orders.status, "cancelled")))
      .limit(1);

    if (orderRows.length > 0 && orderRows[0]) {
      const ord = orderRows[0];
      const ordPhone = ord.phone.replace(/\D/g, "").slice(-10);
      const ordEmail = ord.email.toLowerCase();

      const contactMatches =
        (cleanEmail.includes("@") && cleanEmail === ordEmail) ||
        (cleanPhone.length === 10 && cleanPhone === ordPhone);

      if (contactMatches) {
        // Check if the order contains the product
        const items = await db
          .select({ id: orderItems.id })
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderId, ord.id),
              eq(orderItems.productId, input.productId),
            ),
          )
          .limit(1);

        if (items.length > 0) {
          verified = true;
          matchedOrderId = ord.id;
          if (!matchedUserId && ord.userId) {
            matchedUserId = ord.userId;
          }
        }
      }
    }
  }

  // Insert review with status "pending"
  const [created] = await db
    .insert(reviews)
    .values({
      productId: input.productId,
      orderId: matchedOrderId,
      userId: matchedUserId,
      name: input.name,
      city: input.city?.trim() || null,
      rating: input.rating,
      title: input.title?.trim() || null,
      body: input.body,
      mediaIds: [],
      verified,
      status: "pending",
      showOnHome: false,
    })
    .returning({ id: reviews.id });

  if (!created) {
    throw new AppError("INTERNAL");
  }

  // Claim uploaded photos if provided
  if (input.photos && input.photos.length > 0) {
    try {
      const claimedIds = await claimMedia(input.photos, {
        type: "review",
        id: String(created.id),
      });

      await db
        .update(reviews)
        .set({ mediaIds: claimedIds })
        .where(eq(reviews.id, created.id));
    } catch {
      // If claiming fails, the review remains created without photos or throws
      throw new AppError("UPLOAD_INVALID");
    }
  }

  return { reviewId: created.id };
}

export async function recomputeProductRating(
  productId: string,
): Promise<{ avg: number; count: number }> {
  // One aggregate row instead of loading every approved rating.
  const [agg] = await db
    .select({
      count: sql<number>`count(*)`.mapWith(Number),
      sum: sql<number>`coalesce(sum(${reviews.rating}), 0)`.mapWith(Number),
    })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")));

  const count = Number(agg?.count ?? 0);
  const avg = count > 0 ? Math.round((Number(agg?.sum ?? 0) / count) * 10) / 10 : 0;

  await db
    .update(products)
    .set({
      ratingAvg: avg,
      ratingCount: count,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));

  return { avg, count };
}
