import type { CategoryKey, IntentKey, Product, StoneKey } from "./product";
import type { IconName } from "@/components/icons/Icon";

export type Category = {
  key: CategoryKey;
  slug: string;
  name: string;
  hi: string;
  short: string;
  desc: string;
  /** Hindi description. */
  deshi: string;
};

export type Intent = { key: IntentKey; en: string; hi: string; icon: IconName };

export type Stone = {
  g: [string, string, string];
  gloss: number;
  fleck?: string;
  band?: string;
  sheen?: string;
  lava?: boolean;
  clear?: boolean;
  seven?: string[];
};

/** Shop sort keys (Shop.dc.html 294). */
export type ProductSort = "popular" | "newest" | "low" | "high" | "rating";

/** Shop filters (Shop.dc.html 287–295). Every field is optional; empty = no filter. */
export type ProductQuery = {
  cat?: CategoryKey | "all";
  /** Rudraksha sub: a mukhi number as a string, or "malas". */
  sub?: string | null;
  intents?: IntentKey[];
  mukhi?: number[];
  stones?: StoneKey[];
  inStock?: boolean;
  minRating?: number;
  price?: [number, number];
  ids?: string[];
  sort?: ProductSort;
  offset?: number;
  limit?: number;
};

export type ProductPage = { items: Product[]; total: number };

export type SearchResults = {
  products: Product[];
  services: {
    key: string;
    slug: string;
    name: string;
    hi: string;
    line: string;
    icon: string;
    price: number;
    dur: string;
  }[];
  articles: { t: string; c: string; m: number; pid?: string }[];
};
