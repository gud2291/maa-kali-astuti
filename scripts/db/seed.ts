import { eq } from "drizzle-orm";
import { db, closeDb } from "./client";
import * as schema from "../../src/server/db/schema/index";
import { SETTINGS_DEFAULTS } from "../../src/lib/validation/settings";
import { POLICIES } from "../../src/lib/routes";
import { productContentFor } from "./seed-content";
import { AMULET_COPY } from "./amulet-content";
import { ATTAR_COPY } from "./attar-content";
import { BOOK_COPY } from "./book-content";
import type { RudrakshaInfo } from "./seed-content";
import { SEEDED_ARTICLES } from "./content/articles";
import { SEEDED_POLICIES } from "./content/policies";
import type { Loc, RichDoc, ServiceContent, CourseContent } from "../../src/lib/domain/types";
import type {
  CategoryKey,
  IntentKey,
  StoneKey,
  WristSize,
  BadgeKey,
  ServiceKey,
  TierKey,
  ModeKey,
  CourseKey,
  FaqSet,
  ArticleCategory,
  PolicySlug,
} from "../../src/lib/domain/enums";
import type { Product, ProductArt } from "../../src/types/product";

import categoriesData from "../../src/lib/data/categories.json";
import productsData from "../../src/lib/data/products.json";
import servicesData from "../../src/lib/data/services.json";
import coursesData from "../../src/lib/data/courses.json";
import ritualsData from "../../src/lib/data/rituals.json";
import videosData from "../../src/lib/data/videos.json";
import testimonialsData from "../../src/lib/data/testimonials.json";
import faqData from "../../src/lib/data/faq.json";
import articlesData from "../../src/lib/data/articles.json";
import reviewsData from "../../src/lib/data/reviews.json";
import rudrakshaData from "../../src/lib/data/rudraksha.json";

const L = (s: string): Loc => ({ en: s, hi: "" });

const MONTHS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function parsePublishedDate(d?: string): string | null {
  if (!d) return null;
  const parts = d.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const day = parts[0].padStart(2, "0");
  const month = MONTHS[parts[1]] ?? "01";
  const year = parts[2];
  return `${year}-${month}-${day}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ARTICLE_CAT_MAP: Record<string, ArticleCategory> = {
  "Rudraksha guide": "rudraksha",
  Crystals: "crystals",
  Remedies: "remedies",
  Astrology: "astrology",
};

type BatchStatement = PromiseLike<{ rowCount: number | null }>;

/** Runs the statements in order; returns the number of rows written. */
async function runBatch(statements: BatchStatement[]): Promise<number> {
  if (statements.length === 0) return 0;
  let inserted = 0;
  for (const stmt of statements) {
    const res = await stmt;
    inserted += res.rowCount ?? 0;
  }
  return inserted;
}

export async function main(): Promise<void> {
  const now = new Date();
  const seedOwnerEmail = process.env.SEED_OWNER_EMAIL?.trim().toLowerCase();
  const seedOwnerName = process.env.SEED_OWNER_NAME?.trim() || "Owner";

  /* 1. settings */
  const settingsStmts = Object.entries(SETTINGS_DEFAULTS).flatMap(([key, val]) => {
    // A null default (announcement) means "no row": settings.value is NOT NULL.
    if (val === null) return [];
    const valToSave =
      key === "notify" && seedOwnerEmail
        ? { ...(val as typeof SETTINGS_DEFAULTS.notify), adminEmails: [seedOwnerEmail] }
        : val;
    return [
      db
        .insert(schema.settings)
        .values({
          key,
          value: valToSave,
        })
        .onConflictDoNothing(),
    ];
  });
  const settingsInserted = await runBatch(settingsStmts);
  console.info(`seed: settings +${settingsInserted}`);

  /* 2. owner */
  if (seedOwnerEmail) {
    const existingOwner = await db
      .select({ id: schema.users.id, role: schema.users.role, status: schema.users.status })
      .from(schema.users)
      .where(eq(schema.users.email, seedOwnerEmail))
      .limit(1);

    const ownerStmt = db
      .insert(schema.users)
      .values({
        email: seedOwnerEmail,
        name: seedOwnerName,
        role: "owner",
        status: "active",
        emailVerifiedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          role: "owner",
          status: "active",
          updatedAt: now,
        },
      });

    await runBatch([ownerStmt]);
    const isNew = existingOwner.length === 0;
    console.info(`seed: users +${isNew ? 1 : 0}`);
  } else {
    console.info("seed: users +0");
  }

  /* 3. categories */
  const categoriesStmts = categoriesData.map((c, index) =>
    db
      .insert(schema.categories)
      .values({
        key: c.key as CategoryKey,
        slug: c.slug,
        nameEn: c.name,
        nameHi: c.hi,
        shortEn: c.short,
        shortHi: "",
        descEn: c.desc,
        descHi: c.deshi,
        sort: index,
      })
      .onConflictDoNothing(),
  );
  const categoriesInserted = await runBatch(categoriesStmts);
  console.info(`seed: categories +${categoriesInserted}`);

  /* 4. products */
  const productsStmts = productsData.map((p, index) => {
    const publishedAt = new Date(now.getTime() - (p.date ?? 0) * 86_400_000);
    const featured = Array.isArray(p.badges) && (p.badges as BadgeKey[]).includes("featured" as BadgeKey);
    const content = productContentFor(
      p as Product,
      rudrakshaData as Record<string, RudrakshaInfo>,
    );

    return db
      .insert(schema.products)
      .values({
        id: p.id,
        slug: p.slug,
        categoryKey: p.cat as CategoryKey,
        sub: p.sub ?? null,
        mukhi: p.mukhi ?? null,
        stone: (p.stone as StoneKey) ?? null,
        stoneName: p.stoneName ?? null,
        nameEn: p.name,
        nameHi: p.hi,
        longEn: p.long ?? null,
        longHi: null,
        intentEn: p.intent,
        intentHi: "",
        intentKey: p.ik as IntentKey,
        priceInr: p.price,
        mrpInr: p.mrp,
        stock: p.stock ?? 0,
        sizes: (p.sizes as WristSize[]) ?? null,
        badges: (p.badges as BadgeKey[]) ?? [],
        ratingAvg: p.rating ?? 0,
        ratingCount: p.reviews ?? 0,
        popularity: p.pop ?? 0,
        art: (p.art as ProductArt) ?? null,
        seoTitleEn: (AMULET_COPY[p.id] ?? ATTAR_COPY[p.id] ?? BOOK_COPY[p.id])?.seoTitle ?? null,
        seoDescEn: (AMULET_COPY[p.id] ?? ATTAR_COPY[p.id] ?? BOOK_COPY[p.id])?.seoDesc ?? null,
        seoTitleHi: BOOK_COPY[p.id]?.seoTitle ?? null,
        seoDescHi: BOOK_COPY[p.id]?.seoDesc ?? null,
        externalUrl: (p as { buyUrl?: string }).buyUrl ?? null,
        legacyPhoto: p.photo ?? null,
        legacyPhoto2: p.photo2 ?? null,
        content,
        energizable: p.cat !== "havan" && p.cat !== "attar" && p.cat !== "books",
        status: "active",
        featured,
        sort: index,
        publishedAt,
      })
      .onConflictDoNothing();
  });
  const productsInserted = await runBatch(productsStmts);
  console.info(`seed: products +${productsInserted}`);

  /* 5. services + service_tiers */
  const servicesStmts = servicesData.map((s, index) => {
    const content: ServiceContent = {
      line: L(s.line),
      deliver: L(s.deliver),
      get: L(s.get),
      modesLine: L(s.modesLine),
      covered: s.covered.map(([icon, t, d]) => ({
        icon,
        t: L(t),
        d: L(d),
      })),
      samples: (s.samples ?? []).map(([kind, cap]) => ({
        kind,
        cap: L(cap),
      })),
    };

    return db
      .insert(schema.services)
      .values({
        key: s.key as ServiceKey,
        slug: s.slug,
        nameEn: s.name,
        nameHi: s.hi,
        icon: s.icon,
        modes: s.modes as ModeKey[],
        guarantee: Boolean(s.guarantee),
        content,
        sort: index,
        visible: true,
      })
      .onConflictDoNothing();
  });

  const serviceTiersStmts: BatchStatement[] = [];
  for (const s of servicesData) {
    for (const t of s.tiers) {
      serviceTiersStmts.push(
        db
          .insert(schema.serviceTiers)
          .values({
            serviceKey: s.key as ServiceKey,
            tierKey: t.k as TierKey,
            titleEn: t.t,
            titleHi: "",
            priceInr: t.price,
            mins: t.mins,
            recommended: t.rec === 1,
            inclusions: t.inc.map((incStr: string) => L(incStr)),
          })
          .onConflictDoNothing(),
      );
    }
  }

  const servicesInserted = await runBatch(servicesStmts);
  const tiersInserted = await runBatch(serviceTiersStmts);
  console.info(`seed: services +${servicesInserted} (+${tiersInserted} tiers)`);

  /* 6. courses */
  const coursesStmts = coursesData.courses.map((c, index) => {
    const content: CourseContent = {
      essence: L(c.essence),
      overview: L(c.overview),
      niyam: L(c.niyam),
      attain: c.attain.map((a: string) => L(a)),
    };

    return db
      .insert(schema.courses)
      .values({
        key: c.key as CourseKey,
        slug: c.slug,
        nameEn: c.en,
        nameHi: c.hi,
        deity: c.deity,
        icon: c.icon,
        days: c.days,
        content,
        feeInr: null,
        sort: index,
        visible: true,
      })
      .onConflictDoNothing();
  });
  const coursesInserted = await runBatch(coursesStmts);
  console.info(`seed: courses +${coursesInserted}`);

  /* 7. rituals */
  const existingRituals = await db
    .select({ id: schema.rituals.id })
    .from(schema.rituals)
    .limit(1);

  if (existingRituals.length > 0) {
    console.info("seed: rituals +0");
  } else {
    const ritualsStmts = ritualsData.rituals.map(
      ([icon, en, hi, line], index) =>
        db
          .insert(schema.rituals)
          .values({
            icon,
            nameEn: en,
            nameHi: hi,
            lineEn: line,
            lineHi: "",
            sort: index,
            visible: true,
          })
          .onConflictDoNothing(),
    );
    const ritualsInserted = await runBatch(ritualsStmts);
    console.info(`seed: rituals +${ritualsInserted}`);
  }

  /* 8. videos */
  const existingVideos = await db
    .select({ id: schema.videos.id })
    .from(schema.videos)
    .limit(1);

  if (existingVideos.length > 0) {
    console.info("seed: videos +0");
  } else {
    const videoStmts: BatchStatement[] = [];
    videosData.videos.forEach((v, index) => {
      videoStmts.push(
        db
          .insert(schema.videos)
          .values({
            kind: "video",
            legacyKey: v.id,
            category: v.cat,
            titleEn: v.en,
            titleHi: Array.isArray(v.hi) ? v.hi.join("\n") : (v.hi ?? ""),
            descEn: v.desc ?? null,
            descHi: null,
            duration: v.dur,
            publishedOn: parsePublishedDate(v.date),
            motif: v.motif ?? null,
            featured: index === 0,
            sort: index,
            visible: true,
          })
          .onConflictDoNothing(),
      );
    });

    const baseSort = videosData.videos.length;
    videosData.shorts.forEach((s, index) => {
      videoStmts.push(
        db
          .insert(schema.videos)
          .values({
            kind: "short",
            legacyKey: s.id,
            category: "all",
            titleEn: s.en,
            titleHi: Array.isArray(s.hi) ? s.hi.join("\n") : (s.hi ?? ""),
            descEn: null,
            descHi: null,
            duration: s.dur,
            publishedOn: null,
            motif: s.motif ?? null,
            featured: false,
            sort: baseSort + index,
            visible: true,
          })
          .onConflictDoNothing(),
      );
    });

    const videosInserted = await runBatch(videoStmts);
    console.info(`seed: videos +${videosInserted}`);
  }

  /* 9. testimonials */
  const existingTestimonials = await db
    .select({ id: schema.testimonials.id })
    .from(schema.testimonials)
    .limit(1);

  if (existingTestimonials.length > 0) {
    console.info("seed: testimonials +0");
  } else {
    const testimonialsStmts = testimonialsData.map((t, index) =>
      db
        .insert(schema.testimonials)
        .values({
          kind: "text",
          quoteEn: t.q,
          quoteHi: "",
          name: t.n,
          city: t.c ?? null,
          tag: t.s ?? null,
          rating: 5,
          sort: index,
          visible: true,
        })
        .onConflictDoNothing(),
    );
    const testimonialsInserted = await runBatch(testimonialsStmts);
    console.info(`seed: testimonials +${testimonialsInserted}`);
  }

  /* 10. faqs */
  const existingFaqs = await db
    .select({ id: schema.faqs.id })
    .from(schema.faqs)
    .limit(1);

  if (existingFaqs.length > 0) {
    console.info("seed: faqs +0");
  } else {
    const faqsStmts: BatchStatement[] = [];
    for (const [setKey, items] of Object.entries(faqData)) {
      (items as [string, string][]).forEach(([q, a], index) => {
        faqsStmts.push(
          db
            .insert(schema.faqs)
            .values({
            setKey: setKey as FaqSet,
            qEn: q,
            qHi: "",
            aEn: a,
            aHi: "",
            sort: index,
            visible: true,
          })
          .onConflictDoNothing(),
        );
      });
    }
    const faqsInserted = await runBatch(faqsStmts);
    console.info(`seed: faqs +${faqsInserted}`);
  }

  /* 11. articles */
  const emptyDoc: RichDoc = { type: "doc", content: [] };
  const articlesStmts = articlesData.map((a, index) => {
    const category = ARTICLE_CAT_MAP[a.c] ?? "rudraksha";
    const publishedAt = new Date(now.getTime() - index * 86_400_000);
    return db
      .insert(schema.articles)
      .values({
        slug: slugify(a.t),
        category,
        titleEn: a.t,
        titleHi: "",
        excerptEn: "",
        excerptHi: "",
        bodyEn: emptyDoc,
        bodyHi: null,
        readMins: a.m,
        legacyArt: a.pid,
        productIds: [a.pid],
        status: "published",
        publishedAt,
      })
      .onConflictDoNothing();
  });
  const articlesInserted = await runBatch(articlesStmts);
  console.info(`seed: articles +${articlesInserted}`);

  /* 12. reviews */
  const existingReviews = await db
    .select({ id: schema.reviews.id })
    .from(schema.reviews)
    .limit(1);

  if (existingReviews.length > 0) {
    console.info("seed: reviews +0");
  } else {
    const reviewsStmts = reviewsData.map((r) =>
      db
        .insert(schema.reviews)
        .values({
          productId: r.pid,
          name: r.n,
          city: r.c ?? null,
          body: r.q,
          rating: r.r,
          legacyDate: r.d,
          verified: true,
          status: "approved",
          showOnHome: true,
          approvedAt: now,
        })
        .onConflictDoNothing(),
    );
    const reviewsInserted = await runBatch(reviewsStmts);
    console.info(`seed: reviews +${reviewsInserted}`);
  }

  /* 13. coupons */
  const couponsData = [
    {
      code: "SADHANA10",
      kind: "percent" as const,
      value: 10,
      minCartInr: 0,
      active: true,
    },
    {
      code: "FIRST100",
      kind: "flat" as const,
      value: 100,
      minCartInr: 999,
      active: true,
    },
  ];

  const couponsStmts = couponsData.map((cp) =>
    db
      .insert(schema.coupons)
      .values({
        code: cp.code,
        kind: cp.kind,
        value: cp.value,
        minCartInr: cp.minCartInr,
        active: cp.active,
      })
      .onConflictDoNothing(),
  );
  const couponsInserted = await runBatch(couponsStmts);
  console.info(`seed: coupons +${couponsInserted}`);

  /* 14. pages */
  const pagesStmts = Object.entries(POLICIES).map(([slug, titleEn]) =>
    db
      .insert(schema.pages)
      .values({
        slug: slug as PolicySlug,
        titleEn,
        titleHi: "",
        bodyEn: emptyDoc,
        bodyHi: null,
      })
      .onConflictDoNothing(),
  );
  const pagesInserted = await runBatch(pagesStmts);
  console.info(`seed: pages +${pagesInserted}`);

  /* 15. starter articles content */
  let articlesUpdated = 0;
  for (const art of SEEDED_ARTICLES) {
    const existing = await db
      .select({
        id: schema.articles.id,
        bodyEn: schema.articles.bodyEn,
      })
      .from(schema.articles)
      .where(eq(schema.articles.slug, art.slug))
      .limit(1);

    if (existing.length > 0) {
      const row = existing[0];
      const hasContent =
        row &&
        row.bodyEn &&
        Array.isArray(row.bodyEn.content) &&
        row.bodyEn.content.length > 0;

      if (!hasContent) {
        await db
          .update(schema.articles)
          .set({
            titleHi: art.titleHi,
            excerptEn: art.excerptEn,
            excerptHi: art.excerptHi,
            bodyEn: art.bodyEn,
            faq: art.faq,
            readMins: art.readMins,
            updatedAt: new Date(),
          })
          .where(eq(schema.articles.slug, art.slug));
        articlesUpdated += 1;
      }
    }
  }
  console.info(`seed: articles content +${articlesUpdated}`);

  /* 16. policy drafts */
  let policiesUpdated = 0;
  for (const pol of SEEDED_POLICIES) {
    const existing = await db
      .select({
        slug: schema.pages.slug,
        bodyEn: schema.pages.bodyEn,
      })
      .from(schema.pages)
      .where(eq(schema.pages.slug, pol.slug))
      .limit(1);

    if (existing.length > 0) {
      const row = existing[0];
      const hasContent =
        row &&
        row.bodyEn &&
        Array.isArray(row.bodyEn.content) &&
        row.bodyEn.content.length > 0;

      if (!hasContent) {
        await db
          .update(schema.pages)
          .set({
            titleHi: pol.titleHi,
            bodyEn: pol.bodyEn,
            updatedAt: new Date(),
          })
          .where(eq(schema.pages.slug, pol.slug));
        policiesUpdated += 1;
      }
    }
  }
  console.info(`seed: policies content +${policiesUpdated}`);
}

main()
  .catch((err: unknown) => {
    console.error("Seed error:", err);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
