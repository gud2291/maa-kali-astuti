import "server-only";
import type { Category } from "@/types/catalog";
import type {
  CategoryKey,
  IntentKey,
  Product,
  ProductArt,
  StoneKey,
  WristSize,
  BadgeKey,
} from "@/types/product";
import type { MediaRef } from "@/lib/domain/media";

export type CategoryRow = {
  key: CategoryKey;
  slug: string;
  nameEn: string;
  nameHi: string;
  shortEn: string;
  descEn: string;
  descHi: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  categoryKey: CategoryKey;
  sub?: string | null;
  mukhi?: number | null;
  stone?: string | null;
  stoneName?: string | null;
  nameEn: string;
  nameHi: string;
  longEn?: string | null;
  intentEn: string;
  intentKey: IntentKey;
  priceInr: number;
  mrpInr: number;
  stock: number;
  sizes?: WristSize[] | null;
  badges?: BadgeKey[] | null;
  ratingAvg: number;
  ratingCount: number;
  popularity: number;
  art?: ProductArt | null;
  legacyPhoto?: string | null;
  legacyPhoto2?: string | null;
  externalUrl?: string | null;
  publishedAt?: Date | number | null;
};

export type CategoryLike = {
  nameEn?: string;
  shortEn?: string;
  name_en?: string;
  short_en?: string;
  name?: string;
  short?: string;
};

export function toCategory(row: CategoryRow): Category {
  return {
    key: row.key,
    slug: row.slug,
    name: row.nameEn,
    hi: row.nameHi,
    short: row.shortEn,
    desc: row.descEn,
    deshi: row.descHi,
  };
}

export function toProduct(
  row: ProductRow,
  cat: CategoryLike,
  images?: MediaRef[],
): Product {
  const catName = cat.nameEn ?? cat.name_en ?? cat.name ?? "";
  const catShort = cat.shortEn ?? cat.short_en ?? cat.short;

  let date = 9999;
  if (row.publishedAt != null) {
    const publishedMs =
      row.publishedAt instanceof Date
        ? row.publishedAt.getTime()
        : typeof row.publishedAt === "number"
          ? row.publishedAt
          : null;
    if (publishedMs != null) {
      date = Math.max(0, Math.round((Date.now() - publishedMs) / 86_400_000));
    }
  }

  const p: Product = {
    id: row.id,
    slug: row.slug,
    cat: row.categoryKey,
    catName,
    name: row.nameEn,
    hi: row.nameHi,
    price: row.priceInr,
    mrp: row.mrpInr,
    intent: row.intentEn,
    ik: row.intentKey,
    badges: row.badges ?? [],
    rating: row.ratingAvg ?? 0,
    reviews: row.ratingCount ?? 0,
    stock: row.stock ?? 0,
    pop: row.popularity ?? 0,
    date,
  };

  if (catShort) p.catShort = catShort;
  if (row.sub != null) p.sub = row.sub;
  if (row.mukhi != null) p.mukhi = row.mukhi;
  if (row.stone != null) p.stone = row.stone as StoneKey;
  if (row.stoneName != null) p.stoneName = row.stoneName;
  if (row.longEn != null) p.long = row.longEn;
  if (row.sizes != null) p.sizes = row.sizes;
  if (row.art != null) p.art = row.art;
  if (row.legacyPhoto != null) p.photo = row.legacyPhoto;
  if (row.legacyPhoto2 != null) p.photo2 = row.legacyPhoto2;
  if (row.externalUrl) p.buyUrl = row.externalUrl;
  if (images && images.length > 0) p.images = images;

  return p;
}
