/* Synchronous product index for client-side lookups (cart lines, wishlist, quick-add sheet, card labels).
   Today it reads the generated JSON. Phase B: the cart hydrates its lines from a cart API
   instead, and this module goes away. Server code uses lib/api/catalog.ts. */
import data from "@/lib/data/products.json";
import categories from "@/lib/data/categories.json";
import type { CategoryKey, Product } from "@/types/product";

export const PRODUCTS = data as unknown as readonly Product[];

const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p] as const));
const BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p] as const));

export const productById = (id: string): Product | undefined => BY_ID.get(id);
export const productBySlug = (slug: string): Product | undefined => BY_SLUG.get(slug);

const CAT_SHORT = new Map(categories.map((c) => [c.key, c.short] as const));
/** Card eyebrow: "Rudraksha", "Bracelets" … (English in the design). */
export const categoryShort = (key: CategoryKey): string => CAT_SHORT.get(key) ?? "";
