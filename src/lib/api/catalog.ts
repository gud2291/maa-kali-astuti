import "server-only";
import intentsData from "@/lib/data/intents.json";
import stonesData from "@/lib/data/stones.json";
import badgesData from "@/lib/data/badges.json";
import rudrakshaData from "@/lib/data/rudraksha.json";
import trendingData from "@/lib/data/trending.json";
import servicesData from "@/lib/data/services.json";
import articlesData from "@/lib/data/articles.json";
import { search as searchCore } from "@/lib/core/search";
import { queryProducts } from "@/lib/core/query";
import { getCatalog } from "@/server/catalog/queries";
import { AppError } from "@/server/result";
import type {
  Category,
  Intent,
  ProductPage,
  ProductQuery,
  SearchResults,
  Stone,
} from "@/types/catalog";
import type { BadgeKey, CategoryKey, Product, StoneKey } from "@/types/product";

const INTENTS = intentsData as unknown as readonly Intent[];

/** Pure filter + sort, shared with client islands that already hold the list (the shop). */
export { queryProducts };

/** Filtered, sorted, paginated products. Without `sort` the catalogue order is kept. */
export async function getProducts(q: ProductQuery = {}): Promise<ProductPage> {
  const { products } = await getCatalog();
  const all = queryProducts(products, q);
  const offset = q.offset ?? 0;
  const items = q.limit != null ? all.slice(offset, offset + q.limit) : all.slice(offset);
  return { items, total: all.length };
}

/** Every product (catalogue order). */
export async function getAllProducts(): Promise<Product[]> {
  const { products } = await getCatalog();
  return products.slice();
}

/** By slug (routes) — falls back to the id so design references like `r5` still resolve. */
export async function getProduct(slugOrId: string): Promise<Product | null> {
  const { products } = await getCatalog();
  return products.find((p) => p.slug === slugOrId || p.id === slugOrId) ?? null;
}

/** Several products by id, in the given order; unknown ids are skipped. */
export async function getProductsByIds(ids: readonly string[]): Promise<Product[]> {
  const { products } = await getCatalog();
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => !!p);
}

export async function getCategories(): Promise<Category[]> {
  const { categories } = await getCatalog();
  return categories.slice();
}

export async function getCategory(slugOrKey: string): Promise<Category | null> {
  const { categories } = await getCatalog();
  return categories.find((c) => c.slug === slugOrKey || c.key === slugOrKey) ?? null;
}

export async function getCategoryByKey(key: CategoryKey): Promise<Category> {
  const { categories } = await getCatalog();
  const cat = categories.find((c) => c.key === key);
  if (!cat) {
    throw new AppError("NOT_FOUND", `Category not found: ${key}`);
  }
  return cat;
}

export async function getIntents(): Promise<Intent[]> {
  return INTENTS.slice();
}

export async function getStones(): Promise<Record<StoneKey, Stone>> {
  return stonesData as unknown as Record<StoneKey, Stone>;
}

/** Badge palette: [en, hi, bg, fg]. */
export async function getBadges(): Promise<Record<BadgeKey, [string, string, string, string]>> {
  return badgesData as Record<BadgeKey, [string, string, string, string]>;
}

/** Rudraksha facts per mukhi (deity, planet, mantra …). */
export async function getRudrakshaInfo(): Promise<typeof rudrakshaData> {
  return rudrakshaData;
}

/** Search-overlay chips. */
export async function getTrending(): Promise<string[]> {
  return trendingData.slice();
}

/** Site search over products, services and journal articles (mka-core.js 543–552). */
export async function search(q: string): Promise<SearchResults> {
  const { products } = await getCatalog();
  return searchCore(q, {
    products,
    services: servicesData as unknown as SearchResults["services"],
    articles: articlesData as SearchResults["articles"],
  });
}
