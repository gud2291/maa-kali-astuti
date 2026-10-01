import "server-only";
import { eq, desc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";
import type { ArticleCategory, ContentStatus } from "@/lib/domain/enums";

export type JournalRow = {
  id: number;
  slug: string;
  category: ArticleCategory;
  titleEn: string;
  titleHi: string;
  excerptEn: string;
  excerptHi: string;
  coverMediaId: number | null;
  legacyArt: string | null;
  readMins: number;
  status: ContentStatus;
  publishedAt: number | null;
  productIds: string[];
};

async function fetchJournalRows(limit: number): Promise<JournalRow[]> {
  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      category: articles.category,
      titleEn: articles.titleEn,
      titleHi: articles.titleHi,
      excerptEn: articles.excerptEn,
      excerptHi: articles.excerptHi,
      coverMediaId: articles.coverMediaId,
      legacyArt: articles.legacyArt,
      readMins: articles.readMins,
      status: articles.status,
      publishedAt: articles.publishedAt,
      productIds: articles.productIds,
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);

  return rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt ? r.publishedAt.getTime() : null,
  }));
}

export const getJournalRows: (limit: number) => Promise<JournalRow[]> = cached(
  "journal-rows",
  fetchJournalRows,
  () => [TAG.articles],
);
