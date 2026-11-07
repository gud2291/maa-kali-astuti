import {
  integer,
  text,
  index,
  primaryKey,
  pgTable,
  serial,
  timestamp,
  boolean,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";
import type { ProductContent } from "../../../lib/domain/types";
import type { ProductArt } from "@/types/product";
import {
  CATEGORY_KEYS,
  STONE_KEYS,
  INTENT_KEYS,
  PRODUCT_STATUS,
  STOCK_REASON,
} from "../../../lib/domain/enums";
import type { WristSize, BadgeKey } from "../../../lib/domain/enums";
import { EMPTY_PRODUCT_CONTENT } from "../../../lib/domain/types";

/* ---------- categories ---------- */

export const categories = pgTable("categories", {
  key: text("key", { enum: CATEGORY_KEYS }).primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi").notNull(),
  shortEn: text("short_en").notNull(),
  shortHi: text("short_hi").notNull().default(""),
  descEn: text("desc_en").notNull(),
  descHi: text("desc_hi").notNull(),
  seoTitleEn: text("seo_title_en"),
  seoTitleHi: text("seo_title_hi"),
  seoDescEn: text("seo_desc_en"),
  seoDescHi: text("seo_desc_hi"),
  sort: integer("sort").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- products ---------- */

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    categoryKey: text("category_key", { enum: CATEGORY_KEYS }).notNull(),
    sub: text("sub"),
    mukhi: integer("mukhi"),
    stone: text("stone", { enum: STONE_KEYS }),
    stoneName: text("stone_name"),
    nameEn: text("name_en").notNull(),
    nameHi: text("name_hi").notNull(),
    longEn: text("long_en"),
    longHi: text("long_hi"),
    intentEn: text("intent_en").notNull(),
    intentHi: text("intent_hi").notNull().default(""),
    intentKey: text("intent_key", { enum: INTENT_KEYS }).notNull(),
    priceInr: integer("price_inr").notNull(),
    mrpInr: integer("mrp_inr").notNull(),
    stock: integer("stock").notNull().default(0),
    lowStockAt: integer("low_stock_at").notNull().default(5),
    sizes: jsonb("sizes").$type<WristSize[]>(),
    badges: jsonb("badges")
      .$type<BadgeKey[]>()
      .notNull()
      .$defaultFn(() => []),
    ratingAvg: doublePrecision("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    popularity: doublePrecision("popularity").notNull().default(0),
    art: jsonb("art").$type<ProductArt>(),
    legacyPhoto: text("legacy_photo"),
    legacyPhoto2: text("legacy_photo2"),
    /** Set for items sold elsewhere (e.g. a book on Flipkart): never purchasable through our cart / checkout. */
    externalUrl: text("external_url"),
    content: jsonb("content")
      .$type<ProductContent>()
      .notNull()
      .$defaultFn(() => JSON.parse(JSON.stringify(EMPTY_PRODUCT_CONTENT))),
    relatedIds: jsonb("related_ids")
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => []),
    energizable: boolean("energizable").notNull().default(true),
    gstRate: doublePrecision("gst_rate"),
    hsn: text("hsn"),
    weightG: integer("weight_g"),
    seoTitleEn: text("seo_title_en"),
    seoTitleHi: text("seo_title_hi"),
    seoDescEn: text("seo_desc_en"),
    seoDescHi: text("seo_desc_hi"),
    status: text("status", { enum: PRODUCT_STATUS }).notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    sort: integer("sort").notNull().default(0),
    publishedAt: timestamp("published_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("products_list_idx").on(t.status, t.categoryKey, t.sort),
    index("products_sort_idx").on(t.status, t.sort),
    index("products_published_idx").on(t.status, t.publishedAt),
  ],
);

/* ---------- product_media ---------- */

export const productMedia = pgTable(
  "product_media",
  {
    productId: text("product_id").notNull(),
    mediaId: integer("media_id").notNull(),
    sort: integer("sort").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.mediaId] }),
    index("product_media_sort_idx").on(t.productId, t.sort),
  ],
);

/* ---------- stock_movements (inventory history) ---------- */

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull(),
    /** Signed change: negative = stock went out, positive = stock came in. */
    delta: integer("delta").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    reason: text("reason", { enum: STOCK_REASON }).notNull(),
    orderId: integer("order_id"),
    note: text("note"),
    actorId: integer("actor_id"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("stock_movements_product_idx").on(t.productId, t.createdAt)],
);
