/* Route builders (DESIGN-INVENTORY §C). Every internal link is built here so the design's
   `*.dc.html#…` references map to one place. All paths are locale-less: pass them to the
   `Link` / `useRouter` from @/i18n/navigation, which adds `/hi` when needed. */
import categories from "@/lib/data/categories.json";
import services from "@/lib/data/services.json";
import type { CategoryKey, IntentKey, Product } from "@/types/product";

const CAT_SLUG = new Map(categories.map((c) => [c.key, c.slug] as const));
const SERVICE_SLUG = new Map(services.map((s) => [s.key, s.slug] as const));

export const routes = {
  home: "/",
  shop: "/shop",
  consultations: "/consultations",
  kundali99: "/kundali-99",
  loveCalculator: "/love-calculator",
  rashifal: "/rashifal",
  courses: "/sadhana-courses",
  rituals: "/rituals",
  videos: "/videos",
  about: "/about",
  /* Deferred (INV §G) — branded coming-soon pages until designed. */
  cart: "/cart",
  checkout: "/checkout",
  wishlist: "/wishlist",
  orderSuccess: "/order/success",
  account: "/account",
  trackOrder: "/track-order",
  blog: "/blog",
  contact: "/contact",
  faq: "/faq",
} as const;

/** `/shop/rudraksha-malas` … (design: `Shop.dc.html#c=<key>`). */
export const categoryHref = (key: CategoryKey) => `/shop/${CAT_SLUG.get(key) ?? key}`;

/** `/shop?intent=wealth` (design: `Shop.dc.html#intent=<key>`). */
export const intentHref = (key: IntentKey) => `/shop?intent=${key}`;

/** `/product/<slug>` (design: every card `p.href`, mega-menu product links). */
export const productHref = (p: Pick<Product, "slug">) => `/product/${p.slug}`;

/** `/consultations/kundali-reading` … (design: `Consultation-Detail.dc.html#s=<key>`). */
export const serviceHref = (key: string) => `/consultations/${SERVICE_SLUG.get(key) ?? key}`;

/** `/search?q=…` (design: `Search.dc.html#q=`). */
export const searchHref = (q: string) => `/search?q=${encodeURIComponent(q.trim())}`;

/** Policy pages linked from the footer (coming soon). Slug → English title. */
export const POLICIES = {
  shipping: "Shipping",
  "refund-returns": "Refund & Returns",
  privacy: "Privacy",
  terms: "Terms",
  "astrology-disclaimer": "Astrology Disclaimer",
} as const;
export type PolicySlug = keyof typeof POLICIES;
export const policyHref = (slug: PolicySlug) => `/policies/${slug}`;
