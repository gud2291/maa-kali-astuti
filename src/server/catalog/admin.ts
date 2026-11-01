import "server-only";
import { after } from "next/server";
import {
  eq,
  and,
  or,
  like,
  gt,
  lte,
  sql,
  desc,
  asc,
  count,
  inArray,
} from "drizzle-orm";
import { db } from "@/server/db/client";
import { categories, products, productMedia } from "@/server/db/schema/catalog";
import { media } from "@/server/db/schema/core";
import { orderItems } from "@/server/db/schema/commerce";
import { requireAdmin } from "@/server/auth/guards";
import { audit, diffOf } from "@/server/audit";
import { newProductId } from "@/server/ids";
import { AppError } from "@/server/result";
import { logStockMovement } from "@/server/inventory/movements";
import { attachMedia, deleteMedia } from "@/server/media/service";
import { toMediaRef } from "@/server/media/refs";
import type { ProductInput } from "@/lib/validation/product";
import type { CategoryInput } from "@/lib/validation/category";
import type { CategoryKey, ProductStatus } from "@/lib/domain/enums";
import type { MediaRef } from "@/lib/domain/media";
import type { ProductContent } from "@/lib/domain/types";

export type AdminProductRow = {
  id: string;
  slug: string;
  categoryKey: CategoryKey;
  nameEn: string;
  nameHi: string;
  priceInr: number;
  mrpInr: number;
  stock: number;
  lowStockAt: number;
  status: ProductStatus;
  featured: boolean;
  sort: number;
  legacyPhoto: string | null;
  createdAt: Date;
  media: MediaRef[];
};

export type ListProductsParams = {
  search?: string;
  category?: CategoryKey;
  status?: ProductStatus;
  stock?: "low" | "out";
  page?: number;
};

export async function listProducts(
  params: ListProductsParams = {},
): Promise<{ rows: AdminProductRow[]; total: number }> {
  await requireAdmin("products.view");

  const page = Math.max(1, params.page ?? 1);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (params.search && params.search.trim() !== "") {
    const term = `%${params.search.trim()}%`;
    conditions.push(
      or(
        like(products.nameEn, term),
        like(products.nameHi, term),
        like(products.slug, term),
        like(products.id, term),
      ),
    );
  }

  if (params.category) {
    conditions.push(eq(products.categoryKey, params.category));
  }

  if (params.status) {
    conditions.push(eq(products.status, params.status));
  }

  if (params.stock === "out") {
    conditions.push(eq(products.stock, 0));
  } else if (params.stock === "low") {
    conditions.push(
      and(gt(products.stock, 0), lte(products.stock, products.lowStockAt)),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Count and page are independent — run them together (one round trip instead of two).
  const [[totalRes], productRows] = await Promise.all([
    db.select({ count: count() }).from(products).where(whereClause),
    db
    .select({
      id: products.id,
      slug: products.slug,
      categoryKey: products.categoryKey,
      nameEn: products.nameEn,
      nameHi: products.nameHi,
      priceInr: products.priceInr,
      mrpInr: products.mrpInr,
      stock: products.stock,
      lowStockAt: products.lowStockAt,
      status: products.status,
      featured: products.featured,
      sort: products.sort,
      legacyPhoto: products.legacyPhoto,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(whereClause)
    .orderBy(asc(products.sort), desc(products.createdAt))
    .limit(pageSize)
    .offset(offset),
  ]);

  const total = totalRes?.count ?? 0;

  const productIds = productRows.map((p) => p.id);
  const mediaByProductId = new Map<string, MediaRef[]>();

  if (productIds.length > 0) {
    const mediaRows = await db
      .select({
        productId: productMedia.productId,
        sort: productMedia.sort,
        id: media.id,
        variants: media.variants,
        width: media.width,
        height: media.height,
        blur: media.blur,
        altEn: media.altEn,
        altHi: media.altHi,
      })
      .from(productMedia)
      .innerJoin(media, eq(productMedia.mediaId, media.id))
      .where(
        and(
          inArray(productMedia.productId, productIds),
          eq(media.status, "ready"),
        ),
      )
      .orderBy(asc(productMedia.sort));

    for (const row of mediaRows) {
      const ref = toMediaRef({
        id: row.id,
        variants: row.variants,
        width: row.width,
        height: row.height,
        blur: row.blur,
        altEn: row.altEn,
        altHi: row.altHi,
      });
      const list = mediaByProductId.get(row.productId) ?? [];
      list.push(ref);
      mediaByProductId.set(row.productId, list);
    }
  }

  const rows: AdminProductRow[] = productRows.map((p) => ({
    id: p.id,
    slug: p.slug,
    categoryKey: p.categoryKey as CategoryKey,
    nameEn: p.nameEn,
    nameHi: p.nameHi,
    priceInr: p.priceInr,
    mrpInr: p.mrpInr,
    stock: p.stock,
    lowStockAt: p.lowStockAt,
    status: p.status as ProductStatus,
    featured: Boolean(p.featured),
    sort: p.sort,
    legacyPhoto: p.legacyPhoto,
    createdAt: p.createdAt,
    media: mediaByProductId.get(p.id) ?? [],
  }));

  return { rows, total };
}

export type ProductEditData = {
  product: typeof products.$inferSelect;
  media: MediaRef[];
};

export async function getProductForEdit(
  id: string,
): Promise<ProductEditData | null> {
  await requireAdmin("products.view");

  const [row] = await db.select().from(products).where(eq(products.id, id));
  if (!row) return null;

  const mediaRows = await db
    .select({
      id: media.id,
      variants: media.variants,
      width: media.width,
      height: media.height,
      blur: media.blur,
      altEn: media.altEn,
      altHi: media.altHi,
      sort: productMedia.sort,
    })
    .from(productMedia)
    .innerJoin(media, eq(productMedia.mediaId, media.id))
    .where(and(eq(productMedia.productId, id), eq(media.status, "ready")))
    .orderBy(asc(productMedia.sort));

  const orderedMedia: MediaRef[] = mediaRows.map((m) =>
    toMediaRef({
      id: m.id,
      variants: m.variants,
      width: m.width,
      height: m.height,
      blur: m.blur,
      altEn: m.altEn,
      altHi: m.altHi,
    }),
  );

  return {
    product: row,
    media: orderedMedia,
  };
}

export async function listProductOptions(): Promise<{ id: string; name: string }[]> {
  await requireAdmin("products.view");

  const rows = await db
    .select({ id: products.id, name: products.nameEn })
    .from(products)
    .orderBy(asc(products.nameEn));

  return rows;
}

export async function createProduct(
  input: ProductInput,
): Promise<{ id: string }> {
  const actor = await requireAdmin("products.edit");

  const [existingSlug] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, input.slug));

  if (existingSlug) {
    throw new AppError("CONFLICT", "Slug is already in use", {
      slug: "This slug is already in use",
    });
  }

  const id = newProductId();
  const now = new Date();

  await db.insert(products).values({
    id,
    slug: input.slug,
    categoryKey: input.categoryKey,
    sub: input.sub ?? null,
    mukhi: input.mukhi ?? null,
    stone: input.stone ?? null,
    stoneName: input.stoneName ?? null,
    nameEn: input.nameEn,
    nameHi: input.nameHi || "",
    longEn: input.longEn ?? null,
    longHi: input.longHi ?? null,
    intentEn: input.intentEn,
    intentHi: input.intentHi || "",
    intentKey: input.intentKey,
    priceInr: input.priceInr,
    mrpInr: input.mrpInr,
    stock: input.stock,
    lowStockAt: input.lowStockAt,
    sizes: input.sizes ?? null,
    badges: input.badges,
    content: input.content as ProductContent,
    relatedIds: input.relatedIds,
    energizable: input.energizable,
    gstRate: input.gstRate ?? null,
    hsn: input.hsn ?? null,
    weightG: input.weightG ?? null,
    seoTitleEn: input.seoTitleEn ?? null,
    seoTitleHi: input.seoTitleHi ?? null,
    seoDescEn: input.seoDescEn ?? null,
    seoDescHi: input.seoDescHi ?? null,
    status: input.status,
    featured: input.featured,
    sort: input.sort,
    publishedAt: input.status === "active" ? now : null,
    createdAt: now,
    updatedAt: now,
  });

  if (input.stock > 0) {
    await logStockMovement(db, {
      productId: id,
      delta: input.stock,
      balanceAfter: input.stock,
      reason: "initial",
      actorId: actor.id,
    });
  }

  if (input.mediaIds && input.mediaIds.length > 0) {
    await db.insert(productMedia).values(
      input.mediaIds.map((mediaId, idx) => ({
        productId: id,
        mediaId,
        sort: idx,
      })),
    );
    await attachMedia(input.mediaIds, { type: "product", id });
  }

  await audit({
    actorId: actor.id,
    action: "product.create",
    entity: "product",
    entityId: id,
    summary: `Created product "${input.nameEn}" (${id})`,
  });

  return { id };
}

export async function updateProduct(
  id: string,
  input: ProductInput,
): Promise<{ id: string }> {
  const actor = await requireAdmin("products.edit");

  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (!existing) {
    throw new AppError("NOT_FOUND", "Product not found");
  }

  if (input.slug !== existing.slug) {
    const [slugConflict] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, input.slug));

    if (slugConflict && slugConflict.id !== id) {
      throw new AppError("CONFLICT", "Slug is already in use", {
        slug: "This slug is already in use",
      });
    }
  }

  const diff = diffOf(
    existing as Record<string, unknown>,
    input as unknown as Record<string, unknown>,
    [
      "slug",
      "categoryKey",
      "nameEn",
      "nameHi",
      "priceInr",
      "mrpInr",
      "stock",
      "lowStockAt",
      "status",
      "featured",
      "sort",
      "hsn",
      "gstRate",
      "weightG",
    ],
  );

  const now = new Date();
  let publishedAt = existing.publishedAt;
  if (existing.status !== "active" && input.status === "active" && !publishedAt) {
    publishedAt = now;
  }

  await db
    .update(products)
    .set({
      slug: input.slug,
      categoryKey: input.categoryKey,
      sub: input.sub ?? null,
      mukhi: input.mukhi ?? null,
      stone: input.stone ?? null,
      stoneName: input.stoneName ?? null,
      nameEn: input.nameEn,
      nameHi: input.nameHi || "",
      longEn: input.longEn ?? null,
      longHi: input.longHi ?? null,
      intentEn: input.intentEn,
      intentHi: input.intentHi || "",
      intentKey: input.intentKey,
      priceInr: input.priceInr,
      mrpInr: input.mrpInr,
      stock: input.stock,
      lowStockAt: input.lowStockAt,
      sizes: input.sizes ?? null,
      badges: input.badges,
      content: input.content as ProductContent,
      relatedIds: input.relatedIds,
      energizable: input.energizable,
      gstRate: input.gstRate ?? null,
      hsn: input.hsn ?? null,
      weightG: input.weightG ?? null,
      seoTitleEn: input.seoTitleEn ?? null,
      seoTitleHi: input.seoTitleHi ?? null,
      seoDescEn: input.seoDescEn ?? null,
      seoDescHi: input.seoDescHi ?? null,
      status: input.status,
      featured: input.featured,
      sort: input.sort,
      publishedAt,
      updatedAt: now,
    })
    .where(eq(products.id, id));

  if (input.stock !== existing.stock) {
    await logStockMovement(db, {
      productId: id,
      delta: input.stock - existing.stock,
      balanceAfter: input.stock,
      reason: "edit",
      note: "Stock changed in the product form",
      actorId: actor.id,
    });
  }

  const existingMediaRows = await db
    .select({ mediaId: productMedia.mediaId })
    .from(productMedia)
    .where(eq(productMedia.productId, id));

  const existingMediaIds = existingMediaRows.map((r) => r.mediaId);
  const newMediaIds = input.mediaIds ?? [];
  const removedMediaIds = existingMediaIds.filter(
    (mId) => !newMediaIds.includes(mId),
  );
  const addedMediaIds = newMediaIds.filter(
    (mId) => !existingMediaIds.includes(mId),
  );

  await db.transaction(async (tx) => {
    await tx.delete(productMedia).where(eq(productMedia.productId, id));
    if (newMediaIds.length > 0) {
      await tx.insert(productMedia).values(
        newMediaIds.map((mediaId, idx) => ({
          productId: id,
          mediaId,
          sort: idx,
        })),
      );
    }
  });

  if (addedMediaIds.length > 0) {
    await attachMedia(addedMediaIds, { type: "product", id });
  }

  if (removedMediaIds.length > 0) {
    after(async () => {
      await Promise.all(removedMediaIds.map((mId) => deleteMedia(mId).catch(() => {})));
    });
  }

  await audit({
    actorId: actor.id,
    action: "product.update",
    entity: "product",
    entityId: id,
    summary: `Updated product "${input.nameEn}" (${id})`,
    diff,
  });

  return { id };
}

export async function setProductStatus(
  id: string,
  status: ProductStatus,
): Promise<void> {
  const actor = await requireAdmin("products.edit");

  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (!existing) {
    throw new AppError("NOT_FOUND", "Product not found");
  }

  if (existing.status === status) return;

  const now = new Date();
  let publishedAt = existing.publishedAt;
  if (existing.status !== "active" && status === "active" && !publishedAt) {
    publishedAt = now;
  }

  await db
    .update(products)
    .set({
      status,
      publishedAt,
      updatedAt: now,
    })
    .where(eq(products.id, id));

  await audit({
    actorId: actor.id,
    action: "product.status",
    entity: "product",
    entityId: id,
    summary: `Changed status of product "${existing.nameEn}" (${id}) to ${status}`,
    diff: { status: [existing.status, status] },
  });
}

export async function duplicateProduct(
  id: string,
): Promise<{ id: string }> {
  const actor = await requireAdmin("products.edit");

  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (!existing) {
    throw new AppError("NOT_FOUND", "Product not found");
  }

  const newId = newProductId();
  const baseSlug = `${existing.slug}-copy`;
  let candidateSlug = baseSlug;
  let counter = 1;

  while (true) {
    const [conflict] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidateSlug));
    if (!conflict) break;
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  const now = new Date();

  await db.insert(products).values({
    ...existing,
    id: newId,
    slug: candidateSlug,
    nameEn: `${existing.nameEn} (Copy)`,
    nameHi: existing.nameHi ? `${existing.nameHi} (प्रति)` : "",
    status: "draft",
    publishedAt: null,
    legacyPhoto: null,
    legacyPhoto2: null,
    art: null,
    ratingAvg: 0,
    ratingCount: 0,
    popularity: 0,
    createdAt: now,
    updatedAt: now,
  });

  await audit({
    actorId: actor.id,
    action: "product.duplicate",
    entity: "product",
    entityId: newId,
    summary: `Duplicated product "${existing.nameEn}" (${id}) to new product (${newId})`,
  });

  return { id: newId };
}

export async function adjustStock(
  id: string,
  delta: number,
  reason: string,
): Promise<{ id: string; stock: number }> {
  const actor = await requireAdmin("products.edit");

  const [existing] = await db
    .select({ id: products.id, stock: products.stock, nameEn: products.nameEn })
    .from(products)
    .where(eq(products.id, id));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Product not found");
  }

  const now = new Date();
  const updatedRows = await db
    .update(products)
    .set({
      stock: sql`GREATEST(0, ${products.stock} + ${delta})`,
      updatedAt: now,
    })
    .where(eq(products.id, id))
    .returning({ id: products.id, stock: products.stock });

  const updated = updatedRows[0];
  const newStock = updated ? updated.stock : Math.max(0, existing.stock + delta);
  await logStockMovement(db, {
    productId: id,
    delta: newStock - existing.stock,
    balanceAfter: newStock,
    reason: "manual",
    note: reason,
    actorId: actor.id,
  });

  await audit({
    actorId: actor.id,
    action: "product.stock_adjust",
    entity: "product",
    entityId: id,
    summary: `Stock adjusted by ${delta > 0 ? "+" : ""}${delta} (${reason}). New stock: ${newStock}`,
    diff: { stock: [existing.stock, newStock] },
  });

  return { id, stock: newStock };
}

export async function deleteProduct(
  id: string,
): Promise<void> {
  const actor = await requireAdmin("products.edit");

  const [orderItemRef] = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .where(eq(orderItems.productId, id))
    .limit(1);

  if (orderItemRef) {
    throw new AppError(
      "CONFLICT",
      "Cannot delete product that has existing orders. Please archive it instead.",
    );
  }

  const [existing] = await db.select().from(products).where(eq(products.id, id));
  if (!existing) {
    throw new AppError("NOT_FOUND", "Product not found");
  }

  const mediaRows = await db
    .select({ mediaId: productMedia.mediaId })
    .from(productMedia)
    .where(eq(productMedia.productId, id));

  const mediaIds = mediaRows.map((r) => r.mediaId);

  await db.transaction(async (tx) => {
    await tx.delete(productMedia).where(eq(productMedia.productId, id));
    await tx.delete(products).where(eq(products.id, id));
  });

  if (mediaIds.length > 0) {
    after(async () => {
      for (const mId of mediaIds) {
        await deleteMedia(mId).catch(() => {});
      }
    });
  }

  await audit({
    actorId: actor.id,
    action: "product.delete",
    entity: "product",
    entityId: id,
    summary: `Deleted product "${existing.nameEn}" (${id})`,
  });
}

export type AdminCategoryRow = typeof categories.$inferSelect & {
  productCount: number;
};

export async function listCategoriesAdmin(): Promise<AdminCategoryRow[]> {
  await requireAdmin("products.view");

  const [catRows, counts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sort)),
    db
      .select({
        categoryKey: products.categoryKey,
        count: count(),
      })
      .from(products)
      .groupBy(products.categoryKey),
  ]);

  const countMap = new Map<string, number>(
    counts.map((c) => [c.categoryKey, c.count]),
  );

  return catRows.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat.key) ?? 0,
  }));
}

export async function getCategoryAdmin(
  key: CategoryKey,
): Promise<AdminCategoryRow | null> {
  await requireAdmin("products.view");

  const [cat] = await db.select().from(categories).where(eq(categories.key, key));
  if (!cat) return null;

  const [pCount] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.categoryKey, key));

  return {
    ...cat,
    productCount: pCount?.count ?? 0,
  };
}

export async function updateCategory(
  key: CategoryKey,
  input: CategoryInput,
): Promise<{ key: CategoryKey }> {
  const actor = await requireAdmin("products.edit");

  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.key, key));

  if (!existing) {
    throw new AppError("NOT_FOUND", "Category not found");
  }

  const diff = diffOf(
    existing as Record<string, unknown>,
    input as unknown as Record<string, unknown>,
    [
      "nameEn",
      "nameHi",
      "shortEn",
      "shortHi",
      "descEn",
      "descHi",
      "sort",
      "visible",
    ],
  );

  const now = new Date();

  await db
    .update(categories)
    .set({
      nameEn: input.nameEn,
      nameHi: input.nameHi || "",
      shortEn: input.shortEn,
      shortHi: input.shortHi || "",
      descEn: input.descEn,
      descHi: input.descHi || "",
      seoTitleEn: input.seoTitleEn ?? null,
      seoTitleHi: input.seoTitleHi ?? null,
      seoDescEn: input.seoDescEn ?? null,
      seoDescHi: input.seoDescHi ?? null,
      sort: input.sort,
      visible: input.visible,
      updatedAt: now,
    })
    .where(eq(categories.key, key));

  await audit({
    actorId: actor.id,
    action: "category.update",
    entity: "category",
    entityId: key,
    summary: `Updated category "${input.nameEn}" (${key})`,
    diff,
  });

  return { key };
}
