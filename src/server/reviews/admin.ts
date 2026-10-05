import "server-only";
import { eq, desc, count, inArray, type SQL } from "drizzle-orm";
import { db } from "@/server/db/client";
import { reviews } from "@/server/db/schema/commerce";
import { products } from "@/server/db/schema/catalog";
import { media } from "@/server/db/schema/core";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { deleteMedia } from "@/server/media/service";
import { toMediaRef } from "@/server/media/refs";
import { recomputeProductRating } from "./service";
import type { ReviewStatus } from "@/lib/domain/enums";
import type { MediaRef } from "@/lib/domain/media";

export type AdminReviewRow = {
  id: number;
  productId: string;
  productName: string;
  productSlug: string;
  productThumb: string | null;
  productArt: unknown | null;
  name: string;
  city: string | null;
  rating: number;
  title: string | null;
  body: string;
  mediaIds: number[];
  photos: MediaRef[];
  verified: boolean;
  status: ReviewStatus;
  showOnHome: boolean;
  createdAt: number;
  approvedAt: number | null;
};

export type ListReviewsParams = {
  status?: ReviewStatus;
  page?: number;
};

export type ListReviewsResult = {
  rows: AdminReviewRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: Record<"all" | ReviewStatus, number>;
};

export async function listReviews(
  params: ListReviewsParams = {},
): Promise<ListReviewsResult> {
  await requireAdmin("reviews.moderate");

  const pageSize = 20;
  const page = Math.max(1, params.page ?? 1);
  const offset = (page - 1) * pageSize;

  const statusCounts = await db
    .select({
      status: reviews.status,
      count: count(),
    })
    .from(reviews)
    .groupBy(reviews.status);

  const counts: Record<"all" | ReviewStatus, number> = {
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  for (const sc of statusCounts) {
    if (sc.status && sc.status in counts) {
      counts[sc.status as ReviewStatus] = sc.count;
      counts.all += sc.count;
    }
  }

  const whereClause: SQL | undefined = params.status
    ? eq(reviews.status, params.status)
    : undefined;

  const total = params.status ? counts[params.status] : counts.all;

  const rawRows = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      productName: products.nameEn,
      productSlug: products.slug,
      productLegacyPhoto: products.legacyPhoto,
      productArt: products.art,
      name: reviews.name,
      city: reviews.city,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      mediaIds: reviews.mediaIds,
      verified: reviews.verified,
      status: reviews.status,
      showOnHome: reviews.showOnHome,
      createdAt: reviews.createdAt,
      approvedAt: reviews.approvedAt,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .where(whereClause)
    .orderBy(desc(reviews.createdAt))
    .limit(pageSize)
    .offset(offset);

  const allMediaIds = Array.from(
    new Set(rawRows.flatMap((r) => r.mediaIds || [])),
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

  const rows: AdminReviewRow[] = rawRows.map((r) => ({
    id: r.id,
    productId: r.productId,
    productName: r.productName ?? r.productId,
    productSlug: r.productSlug ?? "",
    productThumb: r.productLegacyPhoto ?? null,
    productArt: r.productArt ?? null,
    name: r.name,
    city: r.city,
    rating: r.rating,
    title: r.title,
    body: r.body,
    mediaIds: r.mediaIds || [],
    photos: (r.mediaIds || [])
      .map((id) => mediaMap.get(id))
      .filter((m): m is MediaRef => m !== undefined),
    verified: r.verified,
    status: r.status as ReviewStatus,
    showOnHome: r.showOnHome,
    createdAt: r.createdAt.getTime(),
    approvedAt: r.approvedAt ? r.approvedAt.getTime() : null,
  }));

  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    counts,
  };
}

export async function approveReview(
  id: number,
): Promise<{ productId: string }> {
  const admin = await requireAdmin("reviews.moderate");

  const [existing] = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      status: reviews.status,
    })
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND");
  }

  await db
    .update(reviews)
    .set({
      status: "approved",
      approvedAt: new Date(),
    })
    .where(eq(reviews.id, id));

  await recomputeProductRating(existing.productId);

  await audit({
    actorId: admin.id,
    action: "review.approve",
    entity: "review",
    entityId: id,
    summary: `Approved review #${id} for product ${existing.productId}`,
  });

  return { productId: existing.productId };
}

export async function rejectReview(
  id: number,
): Promise<{ productId: string }> {
  const admin = await requireAdmin("reviews.moderate");

  const [existing] = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      status: reviews.status,
    })
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND");
  }

  await db
    .update(reviews)
    .set({
      status: "rejected",
    })
    .where(eq(reviews.id, id));

  await recomputeProductRating(existing.productId);

  await audit({
    actorId: admin.id,
    action: "review.reject",
    entity: "review",
    entityId: id,
    summary: `Rejected review #${id} for product ${existing.productId}`,
  });

  return { productId: existing.productId };
}

export async function setShowOnHome(
  id: number,
  on: boolean,
): Promise<{ productId: string }> {
  const admin = await requireAdmin("reviews.moderate");

  const [existing] = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      showOnHome: reviews.showOnHome,
    })
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND");
  }

  await db
    .update(reviews)
    .set({
      showOnHome: on,
    })
    .where(eq(reviews.id, id));

  await audit({
    actorId: admin.id,
    action: "review.show_on_home",
    entity: "review",
    entityId: id,
    summary: `Set showOnHome=${on} for review #${id}`,
  });

  return { productId: existing.productId };
}

export async function deleteReview(
  id: number,
): Promise<{ productId: string }> {
  const admin = await requireAdmin("reviews.moderate");

  const [existing] = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      mediaIds: reviews.mediaIds,
    })
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND");
  }

  // Delete attached media
  if (existing.mediaIds && existing.mediaIds.length > 0) {
    for (const mediaId of existing.mediaIds) {
      await deleteMedia(mediaId).catch(() => {});
    }
  }

  await db.delete(reviews).where(eq(reviews.id, id));

  await recomputeProductRating(existing.productId);

  await audit({
    actorId: admin.id,
    action: "review.delete",
    entity: "review",
    entityId: id,
    summary: `Deleted review #${id} for product ${existing.productId}`,
  });

  return { productId: existing.productId };
}
