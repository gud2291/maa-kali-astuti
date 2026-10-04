import "server-only";
import { eq, asc, and } from "drizzle-orm";
import { db } from "@/server/db/client";
import { categories, products, productMedia } from "@/server/db/schema/catalog";
import { media } from "@/server/db/schema/core";
import { cached, TAG } from "@/server/cache";
import { toCategory, toProduct } from "./mappers";
import { toMediaRef } from "@/server/media/refs";
import type { Category } from "@/types/catalog";
import type { Product } from "@/types/product";
import type { MediaRef } from "@/lib/domain/media";
import type { ProductContent } from "@/lib/domain/types";

export type CatalogData = {
  products: Product[];
  categories: Category[];
};

export type ProductDetail = {
  product: Product & {
    energizable?: boolean;
    seoTitleEn?: string | null;
    seoTitleHi?: string | null;
    seoDescEn?: string | null;
    seoDescHi?: string | null;
  };
  content: ProductContent;
  related: Product[];
  certificate: MediaRef | null;
};

/** Columns the list mapper (`toCategory` / `toProduct`) reads — never the big `content` JSON. */
const CATEGORY_LIST_COLUMNS = {
  key: categories.key,
  slug: categories.slug,
  nameEn: categories.nameEn,
  nameHi: categories.nameHi,
  shortEn: categories.shortEn,
  descEn: categories.descEn,
  descHi: categories.descHi,
};

const PRODUCT_LIST_COLUMNS = {
  id: products.id,
  slug: products.slug,
  categoryKey: products.categoryKey,
  sub: products.sub,
  mukhi: products.mukhi,
  stone: products.stone,
  stoneName: products.stoneName,
  nameEn: products.nameEn,
  nameHi: products.nameHi,
  longEn: products.longEn,
  intentEn: products.intentEn,
  intentKey: products.intentKey,
  priceInr: products.priceInr,
  mrpInr: products.mrpInr,
  stock: products.stock,
  sizes: products.sizes,
  badges: products.badges,
  ratingAvg: products.ratingAvg,
  ratingCount: products.ratingCount,
  popularity: products.popularity,
  art: products.art,
  legacyPhoto: products.legacyPhoto,
  legacyPhoto2: products.legacyPhoto2,
  publishedAt: products.publishedAt,
};

async function fetchCatalog(): Promise<CatalogData> {
  const [catRows, prodRows, mediaRows] = await Promise.all([
    db
      .select(CATEGORY_LIST_COLUMNS)
      .from(categories)
      .where(eq(categories.visible, true))
      .orderBy(asc(categories.sort)),
    db
      .select(PRODUCT_LIST_COLUMNS)
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(asc(products.sort)),
    db
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
      .where(eq(media.status, "ready"))
      .orderBy(asc(productMedia.productId), asc(productMedia.sort)),
  ]);

  const mediaByProductId = new Map<string, MediaRef[]>();
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
    const existing = mediaByProductId.get(row.productId);
    if (existing) {
      existing.push(ref);
    } else {
      mediaByProductId.set(row.productId, [ref]);
    }
  }

  const visibleCategories = catRows.map(toCategory);
  const catLookup = new Map(catRows.map((c) => [c.key, c]));

  const activeProducts: Product[] = [];
  for (const pRow of prodRows) {
    const cat = catLookup.get(pRow.categoryKey);
    if (!cat) continue;
    const productImages = mediaByProductId.get(pRow.id);
    activeProducts.push(toProduct(pRow, cat, productImages));
  }

  return {
    products: activeProducts,
    categories: visibleCategories,
  };
}

export const getCatalog: () => Promise<CatalogData> = cached(
  "catalog",
  fetchCatalog,
  () => [TAG.catalog],
);

async function fetchProductDetail(slug: string): Promise<ProductDetail | null> {
  const prodRows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "active")))
    .limit(1);

  const pRow = prodRows[0];
  if (!pRow) return null;

  const [catRows, mediaRows, certMediaRows] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(and(eq(categories.key, pRow.categoryKey), eq(categories.visible, true)))
      .limit(1),
    db
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
      .where(and(eq(productMedia.productId, pRow.id), eq(media.status, "ready")))
      .orderBy(asc(productMedia.sort)),
    pRow.content?.certificateMediaId
      ? db
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
          .where(and(eq(media.id, pRow.content.certificateMediaId), eq(media.status, "ready")))
          .limit(1)
      : Promise.resolve([]),
  ]);

  const catRow = catRows[0];
  if (!catRow) return null;

  const productImages = mediaRows.map((row) =>
    toMediaRef({
      id: row.id,
      variants: row.variants,
      width: row.width,
      height: row.height,
      blur: row.blur,
      altEn: row.altEn,
      altHi: row.altHi,
    }),
  );

  const product: ProductDetail["product"] = {
    ...toProduct(pRow, catRow, productImages),
    energizable: pRow.energizable,
    seoTitleEn: pRow.seoTitleEn,
    seoTitleHi: pRow.seoTitleHi,
    seoDescEn: pRow.seoDescEn,
    seoDescHi: pRow.seoDescHi,
  };

  const certificate = certMediaRows[0]
    ? toMediaRef({
        id: certMediaRows[0].id,
        variants: certMediaRows[0].variants,
        width: certMediaRows[0].width,
        height: certMediaRows[0].height,
        blur: certMediaRows[0].blur,
        altEn: certMediaRows[0].altEn,
        altHi: certMediaRows[0].altHi,
      })
    : null;

  const catalog = await getCatalog();
  let related: Product[] = [];
  const relatedIds = pRow.relatedIds ?? [];
  if (relatedIds.length > 0) {
    const byId = new Map(catalog.products.map((p) => [p.id, p]));
    related = relatedIds.map((id) => byId.get(id)).filter((p): p is Product => p != null);
  }
  if (related.length === 0) {
    related = catalog.products
      .filter((p) => p.cat === pRow.categoryKey && p.id !== pRow.id)
      .sort((a, b) => (b.pop ?? 0) - (a.pop ?? 0))
      .slice(0, 8);
  }

  return {
    product,
    content: pRow.content,
    related,
    certificate,
  };
}

export const getProductDetail: (slug: string) => Promise<ProductDetail | null> = cached(
  "product-detail",
  fetchProductDetail,
  () => [TAG.catalog],
);

