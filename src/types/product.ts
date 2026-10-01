/* Product model — the shape of src/lib/data/products.json (mka-core.js 335–379 + extractor slug/photo). */
import type badges from "@/lib/data/badges.json";
import type stones from "@/lib/data/stones.json";
import type { MediaRef } from "@/lib/domain/media";

export type CategoryKey = "rudraksha" | "bracelets" | "amulets" | "havan" | "copper";
export type IntentKey = "wealth" | "protection" | "love" | "peace" | "health" | "courage" | "clarity";
export type BadgeKey = keyof typeof badges;
export type StoneKey = keyof typeof stones;
/** Wrist sizes for bracelets (SiteChrome quick sheet). */
export type WristSize = "S" | "M" | "L";

/** Generated-art recipe; the SVGs live in public/svg/products/<id>-main|detail.svg. */
export type ProductArt =
  { t: "bead"; m: number } | { t: "mala"; m: number } | { t: "bracelet"; s: StoneKey } | { t: "amulet"; th: string };

export type Product = {
  id: string;
  slug: string;
  cat: CategoryKey;
  catName: string;
  /** Short category name for eyebrow labels. */
  catShort?: string;
  /** Rudraksha sub-filter: mukhi number as a string, or "malas". */
  sub?: string;
  mukhi?: number;
  stone?: StoneKey;
  stoneName?: string;
  name: string;
  /** Hindi title. */
  hi: string;
  /** Long PDP title (12 Nag). */
  long?: string;
  price: number;
  mrp: number;
  /** Intention line shown in the card pill (English in the design). */
  intent: string;
  ik: IntentKey;
  badges: BadgeKey[];
  rating: number;
  reviews: number;
  /** Units in stock: 0 = sold out, ≤ 5 = "Only N left". */
  stock: number;
  sizes?: WristSize[];
  art?: ProductArt;
  /** Raster photos in /images (only products that have real photography). */
  photo?: string;
  photo2?: string;
  /** Sort key for "Newest": smaller is newer. */
  date: number;
  /** Popularity = reviews × rating. */
  pop: number;
  /** Responsive uploaded media images from R2 storage. */
  images?: MediaRef[];
};

/** Image slots used by cards and sheets. `alt` is the hover image. */
export type ProductImageSlot = "main" | "alt" | "detail";
