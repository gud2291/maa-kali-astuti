import "server-only";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { reviews } from "@/server/db/schema/commerce";
import { cached, TAG } from "@/server/cache";

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
