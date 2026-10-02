import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCatalog } from "@/server/catalog/queries";
import { getConsultRows } from "@/server/consult/queries";
import { getCourseRows } from "@/server/courses/queries";
import { getJournalRows } from "@/server/articles/queries";
import { db } from "@/server/db/client";
import { pages } from "@/server/db/schema/content";
import rashis from "@/lib/data/rashi.json";
import { POLICIES, type PolicySlug } from "@/lib/routes";

function makeEntries(
  path: string,
  lastModified?: Date,
  priority = 0.7,
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" = "weekly",
): MetadataRoute.Sitemap {
  const enUrl = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const hiUrl = path === "/" ? `${SITE_URL}/hi` : `${SITE_URL}/hi${path}`;
  const languages = { en: enUrl, hi: hiUrl };

  return [
    {
      url: enUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    },
    {
      url: hiUrl,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // 1. Core / top-level indexable pages
  entries.push(...makeEntries("/", new Date(), 1.0, "daily"));
  entries.push(...makeEntries("/shop", undefined, 0.9, "daily"));
  entries.push(...makeEntries("/consultations", undefined, 0.9, "weekly"));
  entries.push(...makeEntries("/kundali-99", undefined, 0.9, "weekly"));
  entries.push(...makeEntries("/love-calculator", undefined, 0.8, "monthly"));
  entries.push(...makeEntries("/rashifal", undefined, 0.9, "daily"));
  entries.push(...makeEntries("/sadhana-courses", undefined, 0.8, "weekly"));
  entries.push(...makeEntries("/rituals", undefined, 0.8, "weekly"));
  entries.push(...makeEntries("/about", undefined, 0.7, "monthly"));
  entries.push(...makeEntries("/videos", undefined, 0.7, "weekly"));
  entries.push(...makeEntries("/blog", undefined, 0.8, "weekly"));
  entries.push(...makeEntries("/contact", undefined, 0.6, "monthly"));
  entries.push(...makeEntries("/faq", undefined, 0.6, "monthly"));

  // 2. Policy pages
  const pageRows = await db
    .select({ slug: pages.slug, updatedAt: pages.updatedAt })
    .from(pages);
  const pageUpdatedMap = new Map<string, Date>(
    pageRows.map((r) => [r.slug, r.updatedAt]),
  );

  const policySlugs = Object.keys(POLICIES) as PolicySlug[];
  for (const slug of policySlugs) {
    const updated = pageUpdatedMap.get(slug);
    entries.push(...makeEntries(`/policies/${slug}`, updated, 0.5, "monthly"));
  }

  // 3. 12 Rashifal detail pages
  for (const r of rashis) {
    entries.push(...makeEntries(`/rashifal/${r.slug}`, undefined, 0.8, "daily"));
  }

  // 4. Catalog: categories + active products
  const catalog = await getCatalog();
  for (const cat of catalog.categories) {
    entries.push(...makeEntries(`/shop/${cat.slug}`, undefined, 0.8, "weekly"));
  }
  for (const prod of catalog.products) {
    entries.push(...makeEntries(`/product/${prod.slug}`, undefined, 0.8, "weekly"));
  }

  // 5. Consultations services
  const consultData = await getConsultRows();
  for (const svc of consultData.services) {
    entries.push(...makeEntries(`/consultations/${svc.slug}`, undefined, 0.8, "weekly"));
  }

  // 6. Sadhana courses
  const courseData = await getCourseRows();
  for (const course of courseData) {
    entries.push(...makeEntries(`/sadhana-courses/${course.slug}`, undefined, 0.8, "weekly"));
  }

  // 7. Published blog articles
  const articles = await getJournalRows(200);
  for (const a of articles) {
    const publishedDate = a.publishedAt ? new Date(a.publishedAt) : undefined;
    entries.push(...makeEntries(`/blog/${a.slug}`, publishedDate, 0.7, "monthly"));
  }

  return entries;
}
