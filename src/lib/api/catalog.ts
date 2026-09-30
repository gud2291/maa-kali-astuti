/* THE BACKEND SEAM for the catalogue. Components call these async getters and never import
   the JSON themselves. Today they read src/lib/data; in phase B they become DB queries /
   cached fetches with the same signatures. */
import categoriesData from "@/lib/data/categories.json";
import intentsData from "@/lib/data/intents.json";
import stonesData from "@/lib/data/stones.json";
import badgesData from "@/lib/data/badges.json";
import rudrakshaData from "@/lib/data/rudraksha.json";
import trendingData from "@/lib/data/trending.json";
import servicesData from "@/lib/data/services.json";
import articlesData from "@/lib/data/articles.json";
import { search as searchCore } from "@/lib/core/search";
import { queryProducts } from "@/lib/core/query";
import { PRODUCTS, productById, productBySlug } from "./products-index";
import type { Category, Intent, ProductPage, ProductQuery, SearchResults, Stone } from "@/types/catalog";
import type { BadgeKey, CategoryKey, Product, StoneKey } from "@/types/product";

const CATEGORIES = categoriesData as unknown as readonly Category[];
const INTENTS = intentsData as unknown as readonly Intent[];

/** Pure filter + sort, shared with client islands that already hold the list (the shop). */
export { queryProducts };

/** Filtered, sorted, paginated products. Without `sort` the design's catalogue order is kept. */
export async function getProducts(q: ProductQuery = {}): Promise<ProductPage> {
  const all = queryProducts(PRODUCTS, q);
  const offset = q.offset ?? 0;
  const items = q.limit != null ? all.slice(offset, offset + q.limit) : all.slice(offset);
  return { items, total: all.length };
}

/** Every product (catalogue order). */
export async function getAllProducts(): Promise<Product[]> {
  return PRODUCTS.slice();
}

/** By slug (routes) — falls back to the id so design references like `r5` still resolve. */
export async function getProduct(slugOrId: string): Promise<Product | null> {
  return productBySlug(slugOrId) ?? productById(slugOrId) ?? null;
}

/** Several products by id, in the given order; unknown ids are skipped. */
export async function getProductsByIds(ids: readonly string[]): Promise<Product[]> {
  return ids.map(productById).filter((p): p is Product => !!p);
}

export async function getCategories(): Promise<Category[]> {
  return CATEGORIES.slice();
}

export async function getCategory(slugOrKey: string): Promise<Category | null> {
  return CATEGORIES.find((c) => c.slug === slugOrKey || c.key === slugOrKey) ?? null;
}

export async function getCategoryByKey(key: CategoryKey): Promise<Category> {
  return CATEGORIES.find((c) => c.key === key)!;
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
export async function getRudrakshaInfo() {
  return rudrakshaData;
}

/** Search-overlay chips. */
export async function getTrending(): Promise<string[]> {
  return trendingData.slice();
}

/** Site search over products, services and journal articles (mka-core.js 543–552). */
export async function search(q: string): Promise<SearchResults> {
  return searchCore(q, {
    products: PRODUCTS,
    services: servicesData as unknown as SearchResults["services"],
    articles: articlesData as SearchResults["articles"],
  });
}
