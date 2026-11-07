/* Shop state, URL mapping and design constants (Shop.dc.html script 240–382).
   The design keeps view state in the hash (`#c=&sub=&intent=`); here every filter lives in the
   URL (INV §C): the category is the path (`/shop/<slug>`), the rest are query params
   `?sub=&intent=&mukhi=&stone=&min=&max=&stock=&rating=&sort=` (lists comma-separated). */
import type { Category, Intent, ProductSort } from "@/types/catalog";
import type { CategoryKey, IntentKey, StoneKey } from "@/types/product";

export type ShopCat = CategoryKey | "all";

export type Filters = {
  cat: ShopCat;
  /** Rudraksha sub-chip: a mukhi number as a string, or "malas". */
  sub: string | null;
  intents: IntentKey[];
  mukhi: number[];
  stones: StoneKey[];
  stock: boolean;
  /** 0 = any, else 4.5 / 4.8. */
  rating: number;
  price: [number, number];
  sort: ProductSort;
};

/** Prototype states for manual QA only (`?demo=loading|empty`, design prop `demo`). Never written back. */
export type DemoState = "live" | "loading" | "empty";

export const PRICE_MAX = 12000;
export const PAGE = 12;

export const DEFAULT_FILTERS: Omit<Filters, "cat"> = {
  sub: null,
  intents: [],
  mukhi: [],
  stones: [],
  stock: false,
  rating: 0,
  price: [0, PRICE_MAX],
  sort: "popular",
};

/** Sort options in design order (sortsDef 347). Labels: messages `shop.sorts.<key>`. */
export const SORT_KEYS: ProductSort[] = ["popular", "newest", "low", "high", "rating"];

/** Rating radio options (Shop.dc.html 330). */
export const RATINGS = [4.8, 4.5, 0] as const;

/** Mukhi chips and sub-chips: 2 … 14. */
export const MUKHI = Array.from({ length: 13 }, (_, i) => i + 2);

/** Price slider maps value ↔ position on a square-root scale, snapped to ₹50 (toPos / toVal 272–273). */
export const toPos = (v: number) => Math.sqrt(v / PRICE_MAX);
export const toVal = (p: number) => Math.round((PRICE_MAX * p * p) / 50) * 50;

/** Header art per category (artFor 308–312): one centred piece, or three floating on "all". */
export const HEADER_ART: Record<ShopCat, string[]> = {
  all: ["r7", "b-pyrite", "a-bagla"],
  rudraksha: ["r5"],
  bracelets: ["b-rose"],
  amulets: ["a-bagla"],
  havan: ["havan"],
  copper: ["nag12"],
  attar: ["attar-sandal"],
  books: ["prahar-book"],
};

/** Stone positions + float params for the header (312). One piece uses the first entry. */
export const HEADER_STONES = {
  single: [{ l: "4%", t: "8%", w: "92%", h: "92%", amb: "float:9:14:5:.2" }],
  trio: [
    { l: "26%", t: "2%", w: "56%", h: "56%", amb: "float:8:12:6:.1" },
    { l: "-6%", t: "40%", w: "62%", h: "62%", amb: "float:10:16:-5:.5" },
    { l: "48%", t: "38%", w: "56%", h: "60%", amb: "float:11:10:4:.8" },
  ],
} as const;

/** Editorial banner art (bannerArt 377). */
export const bannerArtId = (cat: ShopCat) => (cat === "bracelets" ? "b-moon" : cat === "amulets" ? "a-kali" : "r5");

/** Banner + Buyer's-note copy variants (messages `shop.banner.<k>`, `shop.seo.<k>`). */
export const bannerKey = (cat: ShopCat) =>
  cat === "rudraksha" || cat === "bracelets" || cat === "amulets" ? cat : "default";
export const seoKey = (cat: ShopCat) => (cat === "rudraksha" || cat === "bracelets" ? cat : "all");

/** "Rudraksha & Malas" → ["Rudraksha & ", "Malas"]: the last word is the gold italic (head 306). */
export function splitTitle(name: string): [string, string] {
  const w = name.split(" ");
  return [w.slice(0, -1).join(" ") + " ", w[w.length - 1]];
}

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const uniq = <T>(a: T[]) => Array.from(new Set(a));

/** URL → filters. Unknown values are dropped, so a hand-edited URL never breaks the page. */
export function parseShopUrl(
  pathname: string,
  search: string,
  cats: readonly Category[],
  intents: readonly Intent[],
  stoneKeys: readonly StoneKey[],
): { filters: Filters; demo: DemoState } {
  const seg = pathname.split("/shop/")[1]?.split("/")[0] ?? "";
  const cat: ShopCat = cats.find((c) => c.slug === seg || c.key === seg)?.key ?? "all";
  const q = new URLSearchParams(search);

  const sub = q.get("sub");
  const intentKeys = new Set(intents.map((i) => i.key as string));
  const stoneSet = new Set<string>(stoneKeys);
  const num = (k: string) => {
    const v = q.get(k);
    return v != null && v !== "" && Number.isFinite(+v) ? Math.max(0, Math.min(PRICE_MAX, Math.round(+v))) : null;
  };
  let min = num("min") ?? 0;
  let max = num("max") ?? PRICE_MAX;
  if (min >= max) [min, max] = [0, PRICE_MAX];
  const rating = Number(q.get("rating"));
  const sort = q.get("sort") as ProductSort | null;
  const demo = q.get("demo");

  return {
    filters: {
      cat,
      sub: sub === "malas" || MUKHI.includes(Number(sub)) ? sub : null,
      intents: uniq(list(q.get("intent")).filter((k) => intentKeys.has(k))) as IntentKey[],
      mukhi: uniq(list(q.get("mukhi")).map(Number)).filter((m) => MUKHI.includes(m)),
      stones: uniq(list(q.get("stone")).filter((k) => stoneSet.has(k))) as StoneKey[],
      stock: q.get("stock") === "1",
      rating: rating === 4.8 || rating === 4.5 ? rating : 0,
      price: [min, max],
      sort: sort && SORT_KEYS.includes(sort) ? sort : "popular",
    },
    demo: demo === "loading" || demo === "empty" ? demo : "live",
  };
}

/** Filters → locale-less path + query string (without "?"; commas kept readable). */
export function shopUrl(f: Filters, cats: readonly Category[]): { path: string; query: string } {
  const slug = f.cat === "all" ? null : (cats.find((c) => c.key === f.cat)?.slug ?? f.cat);
  const parts: string[] = [];
  if (f.sub) parts.push(`sub=${f.sub}`);
  if (f.intents.length) parts.push(`intent=${f.intents.join(",")}`);
  if (f.mukhi.length) parts.push(`mukhi=${f.mukhi.join(",")}`);
  if (f.stones.length) parts.push(`stone=${f.stones.join(",")}`);
  if (f.price[0] > 0) parts.push(`min=${f.price[0]}`);
  if (f.price[1] < PRICE_MAX) parts.push(`max=${f.price[1]}`);
  if (f.stock) parts.push("stock=1");
  if (f.rating) parts.push(`rating=${f.rating}`);
  if (f.sort !== "popular") parts.push(`sort=${f.sort}`);
  return { path: slug ? `/shop/${slug}` : "/shop", query: parts.join("&") };
}

/** Same URL? Compares path + normalised query, so `a,b` and `a%2Cb` match. */
export const urlKey = (path: string, query: string) => `${path}?${new URLSearchParams(query).toString()}`;
