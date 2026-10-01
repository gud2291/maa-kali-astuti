import {
  integer,
  text,
  sqliteTable,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { Loc } from "../../../lib/domain/loc";
import type {
  ServiceContent,
  CourseContent,
  RichDoc,
} from "../../../lib/domain/types";
import {
  SERVICE_KEYS,
  TIER_KEYS,
  MODE_KEYS,
  COURSE_KEYS,
  VIDEO_KINDS,
  TESTIMONIAL_KINDS,
  FAQ_SETS,
  ARTICLE_CATEGORIES,
  CONTENT_STATUS,
  RASHI_KEYS,
  RASHIFAL_PERIODS,
  POLICY_SLUGS,
} from "../../../lib/domain/enums";
import type { ModeKey } from "../../../lib/domain/enums";

/* ---------- services ---------- */

export const services = sqliteTable("services", {
  key: text("key", { enum: SERVICE_KEYS }).primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi").notNull(),
  icon: text("icon").notNull(),
  modes: text("modes", { mode: "json" }).$type<ModeKey[]>().notNull(),
  guarantee: integer("guarantee", { mode: "boolean" }).notNull().default(false),
  content: text("content", { mode: "json" }).$type<ServiceContent>().notNull(),
  sort: integer("sort").notNull().default(0),
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- service_tiers ---------- */

export const serviceTiers = sqliteTable(
  "service_tiers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    serviceKey: text("service_key", { enum: SERVICE_KEYS }).notNull(),
    tierKey: text("tier_key", { enum: TIER_KEYS }).notNull(),
    titleEn: text("title_en").notNull(),
    titleHi: text("title_hi").notNull().default(""),
    priceInr: integer("price_inr").notNull(),
    mins: integer("mins").notNull(),
    recommended: integer("recommended", { mode: "boolean" }).notNull().default(false),
    inclusions: text("inclusions", { mode: "json" })
      .$type<Loc[]>()
      .notNull()
      .$defaultFn(() => []),
  },
  (t) => [
    uniqueIndex("service_tier_uniq").on(t.serviceKey, t.tierKey),
  ],
);

/* ---------- courses ---------- */

export const courses = sqliteTable("courses", {
  key: text("key", { enum: COURSE_KEYS }).primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi").notNull(),
  deity: text("deity").notNull(),
  icon: text("icon").notNull(),
  days: integer("days").notNull(),
  content: text("content", { mode: "json" }).$type<CourseContent>().notNull(),
  feeInr: integer("fee_inr"),
  sort: integer("sort").notNull().default(0),
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- rituals ---------- */

export const rituals = sqliteTable("rituals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  icon: text("icon").notNull(),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi").notNull(),
  lineEn: text("line_en").notNull(),
  lineHi: text("line_hi").notNull().default(""),
  sort: integer("sort").notNull().default(0),
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- videos ---------- */

export const videos = sqliteTable(
  "videos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    kind: text("kind", { enum: VIDEO_KINDS }).notNull(),
    youtubeId: text("youtube_id").unique(),
    legacyKey: text("legacy_key"),
    category: text("category").notNull(),
    titleEn: text("title_en").notNull(),
    titleHi: text("title_hi").notNull(),
    descEn: text("desc_en"),
    descHi: text("desc_hi"),
    duration: text("duration").notNull(),
    publishedOn: text("published_on"),
    motif: text("motif"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    sort: integer("sort").notNull().default(0),
    visible: integer("visible", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("videos_list_idx").on(t.kind, t.visible, t.sort),
  ],
);

/* ---------- testimonials ---------- */

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: TESTIMONIAL_KINDS }).notNull().default("text"),
  quoteEn: text("quote_en").notNull(),
  quoteHi: text("quote_hi").notNull().default(""),
  name: text("name").notNull(),
  city: text("city"),
  tag: text("tag"),
  rating: integer("rating"),
  youtubeId: text("youtube_id"),
  mediaId: integer("media_id"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  sort: integer("sort").notNull().default(0),
  visible: integer("visible", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- faqs ---------- */

export const faqs = sqliteTable(
  "faqs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    setKey: text("set_key", { enum: FAQ_SETS }).notNull(),
    qEn: text("q_en").notNull(),
    qHi: text("q_hi").notNull().default(""),
    aEn: text("a_en").notNull(),
    aHi: text("a_hi").notNull().default(""),
    sort: integer("sort").notNull().default(0),
    visible: integer("visible", { mode: "boolean" }).notNull().default(true),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("faqs_set_idx").on(t.setKey, t.visible, t.sort),
  ],
);

/* ---------- articles ---------- */

export const articles = sqliteTable(
  "articles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull().unique(),
    category: text("category", { enum: ARTICLE_CATEGORIES }).notNull(),
    titleEn: text("title_en").notNull(),
    titleHi: text("title_hi").notNull().default(""),
    excerptEn: text("excerpt_en").notNull(),
    excerptHi: text("excerpt_hi").notNull().default(""),
    bodyEn: text("body_en", { mode: "json" }).$type<RichDoc>().notNull(),
    bodyHi: text("body_hi", { mode: "json" }).$type<RichDoc>(),
    coverMediaId: integer("cover_media_id"),
    legacyArt: text("legacy_art"),
    readMins: integer("read_mins").notNull().default(5),
    faq: text("faq", { mode: "json" })
      .$type<{ q: Loc; a: Loc }[]>()
      .notNull()
      .$defaultFn(() => []),
    productIds: text("product_ids", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => []),
    status: text("status", { enum: CONTENT_STATUS }).notNull().default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    seoTitleEn: text("seo_title_en"),
    seoTitleHi: text("seo_title_hi"),
    seoDescEn: text("seo_desc_en"),
    seoDescHi: text("seo_desc_hi"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("articles_list_idx").on(t.status, t.publishedAt),
  ],
);

/* ---------- rashifal_entries ---------- */

export const rashifalEntries = sqliteTable(
  "rashifal_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    rashi: text("rashi", { enum: RASHI_KEYS }).notNull(),
    period: text("period", { enum: RASHIFAL_PERIODS }).notNull(),
    startsOn: text("starts_on").notNull(),
    textEn: text("text_en").notNull(),
    textHi: text("text_hi").notNull().default(""),
    scores: text("scores", { mode: "json" }).$type<{
      love: number;
      career: number;
      health: number;
      finance: number;
    }>(),
    lucky: text("lucky", { mode: "json" }).$type<{
      number: number;
      colour: Loc;
    }>(),
    status: text("status", { enum: CONTENT_STATUS }).notNull().default("published"),
    updatedBy: integer("updated_by"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("rashifal_uniq").on(t.rashi, t.period, t.startsOn),
  ],
);

/* ---------- pages ---------- */

export const pages = sqliteTable("pages", {
  slug: text("slug", { enum: POLICY_SLUGS }).primaryKey(),
  titleEn: text("title_en").notNull(),
  titleHi: text("title_hi").notNull().default(""),
  bodyEn: text("body_en", { mode: "json" }).$type<RichDoc>().notNull(),
  bodyHi: text("body_hi", { mode: "json" }).$type<RichDoc>(),
  updatedBy: integer("updated_by"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
