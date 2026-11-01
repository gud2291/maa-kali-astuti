import {
  integer,
  text,
  index,
  uniqueIndex,
  pgTable,
  serial,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
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

export const services = pgTable("services", {
  key: text("key", { enum: SERVICE_KEYS }).primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi").notNull(),
  icon: text("icon").notNull(),
  modes: jsonb("modes").$type<ModeKey[]>().notNull(),
  guarantee: boolean("guarantee").notNull().default(false),
  content: jsonb("content").$type<ServiceContent>().notNull(),
  sort: integer("sort").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- service_tiers ---------- */

export const serviceTiers = pgTable(
  "service_tiers",
  {
    id: serial("id").primaryKey(),
    serviceKey: text("service_key", { enum: SERVICE_KEYS }).notNull(),
    tierKey: text("tier_key", { enum: TIER_KEYS }).notNull(),
    titleEn: text("title_en").notNull(),
    titleHi: text("title_hi").notNull().default(""),
    priceInr: integer("price_inr").notNull(),
    mins: integer("mins").notNull(),
    recommended: boolean("recommended").notNull().default(false),
    inclusions: jsonb("inclusions")
      .$type<Loc[]>()
      .notNull()
      .$defaultFn(() => []),
  },
  (t) => [
    uniqueIndex("service_tier_uniq").on(t.serviceKey, t.tierKey),
  ],
);

/* ---------- courses ---------- */

export const courses = pgTable("courses", {
  key: text("key", { enum: COURSE_KEYS }).primaryKey(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi").notNull(),
  deity: text("deity").notNull(),
  icon: text("icon").notNull(),
  days: integer("days").notNull(),
  content: jsonb("content").$type<CourseContent>().notNull(),
  feeInr: integer("fee_inr"),
  sort: integer("sort").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- rituals ---------- */

export const rituals = pgTable("rituals", {
  id: serial("id").primaryKey(),
  icon: text("icon").notNull(),
  nameEn: text("name_en").notNull(),
  nameHi: text("name_hi").notNull(),
  lineEn: text("line_en").notNull(),
  lineHi: text("line_hi").notNull().default(""),
  sort: integer("sort").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- videos ---------- */

export const videos = pgTable(
  "videos",
  {
    id: serial("id").primaryKey(),
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
    featured: boolean("featured").notNull().default(false),
    sort: integer("sort").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("videos_list_idx").on(t.kind, t.visible, t.sort),
  ],
);

/* ---------- testimonials ---------- */

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  kind: text("kind", { enum: TESTIMONIAL_KINDS }).notNull().default("text"),
  quoteEn: text("quote_en").notNull(),
  quoteHi: text("quote_hi").notNull().default(""),
  name: text("name").notNull(),
  city: text("city"),
  tag: text("tag"),
  rating: integer("rating"),
  youtubeId: text("youtube_id"),
  mediaId: integer("media_id"),
  featured: boolean("featured").notNull().default(false),
  sort: integer("sort").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- faqs ---------- */

export const faqs = pgTable(
  "faqs",
  {
    id: serial("id").primaryKey(),
    setKey: text("set_key", { enum: FAQ_SETS }).notNull(),
    qEn: text("q_en").notNull(),
    qHi: text("q_hi").notNull().default(""),
    aEn: text("a_en").notNull(),
    aHi: text("a_hi").notNull().default(""),
    sort: integer("sort").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("faqs_set_idx").on(t.setKey, t.visible, t.sort),
  ],
);

/* ---------- articles ---------- */

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    category: text("category", { enum: ARTICLE_CATEGORIES }).notNull(),
    titleEn: text("title_en").notNull(),
    titleHi: text("title_hi").notNull().default(""),
    excerptEn: text("excerpt_en").notNull(),
    excerptHi: text("excerpt_hi").notNull().default(""),
    bodyEn: jsonb("body_en").$type<RichDoc>().notNull(),
    bodyHi: jsonb("body_hi").$type<RichDoc>(),
    coverMediaId: integer("cover_media_id"),
    legacyArt: text("legacy_art"),
    readMins: integer("read_mins").notNull().default(5),
    faq: jsonb("faq")
      .$type<{ q: Loc; a: Loc }[]>()
      .notNull()
      .$defaultFn(() => []),
    productIds: jsonb("product_ids")
      .$type<string[]>()
      .notNull()
      .$defaultFn(() => []),
    status: text("status", { enum: CONTENT_STATUS }).notNull().default("draft"),
    publishedAt: timestamp("published_at", { mode: "date", withTimezone: true }),
    seoTitleEn: text("seo_title_en"),
    seoTitleHi: text("seo_title_hi"),
    seoDescEn: text("seo_desc_en"),
    seoDescHi: text("seo_desc_hi"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("articles_list_idx").on(t.status, t.publishedAt),
  ],
);

/* ---------- rashifal_entries ---------- */

export const rashifalEntries = pgTable(
  "rashifal_entries",
  {
    id: serial("id").primaryKey(),
    rashi: text("rashi", { enum: RASHI_KEYS }).notNull(),
    period: text("period", { enum: RASHIFAL_PERIODS }).notNull(),
    startsOn: text("starts_on").notNull(),
    textEn: text("text_en").notNull(),
    textHi: text("text_hi").notNull().default(""),
    scores: jsonb("scores").$type<{
      love: number;
      career: number;
      health: number;
      finance: number;
    }>(),
    lucky: jsonb("lucky").$type<{
      number: number;
      colour: Loc;
    }>(),
    status: text("status", { enum: CONTENT_STATUS }).notNull().default("published"),
    updatedBy: integer("updated_by"),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("rashifal_uniq").on(t.rashi, t.period, t.startsOn),
  ],
);

/* ---------- pages ---------- */

export const pages = pgTable("pages", {
  slug: text("slug", { enum: POLICY_SLUGS }).primaryKey(),
  titleEn: text("title_en").notNull(),
  titleHi: text("title_hi").notNull().default(""),
  bodyEn: jsonb("body_en").$type<RichDoc>().notNull(),
  bodyHi: jsonb("body_hi").$type<RichDoc>(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});
