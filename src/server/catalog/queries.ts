import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { categories, products, productMedia } from "@/server/db/schema/catalog";
import { media } from "@/server/db/schema/core";
import { cached, TAG } from "@/server/cache";
import { toCategory, toProduct } from "./mappers";
import { toMediaRef } from "@/server/media/refs";
import type { Category } from "@/types/catalog";
import type { Product } from "@/types/product";
import type { MediaRef } from "@/lib/domain/media";

export type CatalogData = {
  products: Product[];
  categories: Category[];
};

async function fetchCatalog(): Promise<CatalogData> {
  const [catRows, prodRows, mediaRows] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(eq(categories.visible, true))
      .orderBy(asc(categories.sort)),
    db
      .select()
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
