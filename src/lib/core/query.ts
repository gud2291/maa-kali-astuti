/* Pure catalogue filter + sort (Shop.dc.html results() 288–296). No data imports, so client
   islands that already hold the product list (the shop) can use it without pulling the JSON. */
import type { ProductQuery, ProductSort } from "@/types/catalog";
import type { Product } from "@/types/product";

/* Sort comparators (Shop.dc.html 294). */
export const SORTS: Record<ProductSort, (a: Product, b: Product) => number> = {
  popular: (a, b) => b.pop - a.pop,
  newest: (a, b) => a.date - b.date,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
};

/** Filter + sort. Without `sort` the given (catalogue) order is kept. */
export function queryProducts(list: readonly Product[], q: ProductQuery = {}): Product[] {
  const { cat = "all", sub, intents, mukhi, stones, inStock, minRating = 0, price, ids, sort } = q;
  const idSet = ids ? new Set(ids) : null;
  const r = list.filter(
    (p) =>
      (cat === "all" || p.cat === cat) &&
      (!sub || (sub === "malas" ? p.sub === "malas" : String(p.mukhi) === sub)) &&
      (!intents?.length || (p.cat !== "attar" && p.cat !== "books" && intents.includes(p.ik))) &&
      (!mukhi?.length || (p.mukhi != null && mukhi.includes(p.mukhi))) &&
      (!stones?.length || (p.stone != null && stones.includes(p.stone))) &&
      (!inStock || p.stock > 0) &&
      p.rating >= minRating &&
      (!price || (p.price >= price[0] && p.price <= price[1])) &&
      (!idSet || idSet.has(p.id)),
  );
  if (ids && !sort) return r.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  return sort ? r.sort(SORTS[sort]) : r;
}
