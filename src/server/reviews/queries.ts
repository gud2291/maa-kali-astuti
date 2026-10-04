import "server-only";
import { and, eq, desc, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { reviews } from "@/server/db/schema/commerce";
import { media } from "@/server/db/schema/core";
import { cached, TAG } from "@/server/cache";
import { toMediaRef } from "@/server/media/refs";
import type { MediaRef } from "@/lib/domain/media";

export type HomeReviewRow = {
  id: number;
  productId: string;
  name: string;
  city: string | null;
  rating: number;
  title: string | null;
  body: string;
  mediaIds: number[];
  verified: boolean;
  legacyDate: string | null;
  createdAt: number;
};

export type ProductReviewItem = {
  id: number;
  name: string;
  city: string | null;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  photos: MediaRef[];
  date: number;
};

export type ProductReviewsData = {
  avg: number;
  count: number;
  dist: [number, number, number, number, number]; // [5★, 4★, 3★, 2★, 1★]
  items: ProductReviewItem[];
};

async function fetchHomeReviewRows(): Promise<HomeReviewRow[]> {
  const rows = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      name: reviews.name,
      city: reviews.city,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      mediaIds: reviews.mediaIds,
      verified: reviews.verified,
      legacyDate: reviews.legacyDate,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(and(eq(reviews.status, "approved"), eq(reviews.showOnHome, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(6);

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.getTime(),
  }));
}

export const getHomeReviewRows: () => Promise<HomeReviewRow[]> = cached(
  "home-reviews",
  fetchHomeReviewRows,
  () => [TAG.reviews],
);

export async function fetchReviewItemsByProduct(
  productId: string,
  limit: number,
  offset: number,
): Promise<ProductReviewItem[]> {
  const rows = await db
    .select({
      id: reviews.id,
      name: reviews.name,
      city: reviews.city,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      mediaIds: reviews.mediaIds,
      verified: reviews.verified,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  if (rows.length === 0) {
    return [];
  }

  // Collect all media IDs
  const allMediaIds = Array.from(
    new Set(rows.flatMap((r) => r.mediaIds || [])),
  ).filter((id): id is number => typeof id === "number" && id > 0);

  const mediaMap = new Map<number, MediaRef>();
  if (allMediaIds.length > 0) {
    const mediaRows = await db
      .select({
        id: media.id,
        variants: media.variants,
        width: media.width,
        height: media.height,
        blur: media.blur,
        altEn: media.altEn,
        altHi: media.altHi,
      })
      .from(media)
      .where(inArray(media.id, allMediaIds));

    for (const m of mediaRows) {
      mediaMap.set(m.id, toMediaRef(m));
    }
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    city: r.city,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    photos: (r.mediaIds || [])
      .map((id) => mediaMap.get(id))
      .filter((m): m is MediaRef => m !== undefined),
    date: r.createdAt.getTime(),
  }));
}

async function fetchProductReviews(productId: string): Promise<ProductReviewsData> {
  // Distribution from one GROUP BY (at most 5 rows), not every rating row.
  const byRating = await db
    .select({ rating: reviews.rating, n: sql<number>`count(*)` })
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
    .groupBy(reviews.rating);

  let count = 0;
  let sum = 0;
  const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const r of byRating) {
    const n = Number(r.n);
    count += n;
    sum += r.rating * n;
    if (r.rating >= 1 && r.rating <= 5) {
      dist[5 - r.rating] += n;
    }
  }

  const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  const items = await fetchReviewItemsByProduct(productId, 10, 0);

  return {
    avg,
    count,
    dist,
    items,
  };
}

export const getProductReviews: (productId: string) => Promise<ProductReviewsData> = cached(
  "product-reviews",
  fetchProductReviews,
  (id) => [TAG.productReviews(id)],
);
