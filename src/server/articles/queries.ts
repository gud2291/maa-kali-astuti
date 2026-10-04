import "server-only";

import { eq, desc, and } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema/content";
import { media } from "@/server/db/schema/core";
import { cached, TAG } from "@/server/cache";
import { toMediaRef } from "@/server/media/refs";
import type { ArticleCategory, ContentStatus } from "@/lib/domain/enums";
import type { MediaRef } from "@/lib/domain/media";
import type { RichDoc } from "@/lib/domain/types";
import type { Loc } from "@/lib/domain/loc";

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

export type ArticleListItem = {
  id: number;
  slug: string;
  category: ArticleCategory;
  titleEn: string;
  titleHi: string;
  excerptEn: string;
  excerptHi: string;
  coverMediaId: number | null;
  coverMedia: MediaRef | null;
  legacyArt: string | null;
  readMins: number;
  publishedAt: number | null;
};

export type ArticleDetail = {
  id: number;
  slug: string;
  category: ArticleCategory;
  titleEn: string;
  titleHi: string;
  excerptEn: string;
  excerptHi: string;
  bodyEn: RichDoc;
  bodyHi: RichDoc | null;
  coverMediaId: number | null;
  coverMedia: MediaRef | null;
  legacyArt: string | null;
  readMins: number;
  faq: { q: Loc; a: Loc }[];
  productIds: string[];
  publishedAt: number | null;
  seoTitleEn: string | null;
  seoTitleHi: string | null;
  seoDescEn: string | null;
  seoDescHi: string | null;
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

async function fetchArticleList(): Promise<ArticleListItem[]> {
  // List columns only — the rich-text bodies stay out of this (≤ 200 rows) cache entry.
  const rows = await db
    .select({
      article: {
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
        publishedAt: articles.publishedAt,
      },
      coverMedia: {
        id: media.id,
        variants: media.variants,
        width: media.width,
        height: media.height,
        blur: media.blur,
        altEn: media.altEn,
        altHi: media.altHi,
      },
    })
    .from(articles)
    .leftJoin(media, eq(articles.coverMediaId, media.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(200);

  return rows.map(({ article, coverMedia }) => ({
    id: article.id,
    slug: article.slug,
    category: article.category,
    titleEn: article.titleEn,
    titleHi: article.titleHi,
    excerptEn: article.excerptEn,
    excerptHi: article.excerptHi,
    coverMediaId: article.coverMediaId,
    coverMedia: coverMedia ? toMediaRef(coverMedia) : null,
    legacyArt: article.legacyArt,
    readMins: article.readMins,
    publishedAt: article.publishedAt ? article.publishedAt.getTime() : null,
  }));
}

export const getArticleList: () => Promise<ArticleListItem[]> = cached(
  "article-list",
  fetchArticleList,
  () => [TAG.articles],
);

async function fetchArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const rows = await db
    .select({
      article: articles,
      coverMedia: media,
    })
    .from(articles)
    .leftJoin(media, eq(articles.coverMediaId, media.id))
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const { article, coverMedia } = row;

  return {
    id: article.id,
    slug: article.slug,
    category: article.category,
    titleEn: article.titleEn,
    titleHi: article.titleHi,
    excerptEn: article.excerptEn,
    excerptHi: article.excerptHi,
    bodyEn: article.bodyEn,
    bodyHi: article.bodyHi,
    coverMediaId: article.coverMediaId,
    coverMedia: coverMedia ? toMediaRef(coverMedia) : null,
    legacyArt: article.legacyArt,
    readMins: article.readMins,
    faq: article.faq,
    productIds: article.productIds,
    publishedAt: article.publishedAt ? article.publishedAt.getTime() : null,
    seoTitleEn: article.seoTitleEn,
    seoTitleHi: article.seoTitleHi,
    seoDescEn: article.seoDescEn,
    seoDescHi: article.seoDescHi,
  };
}

export const getArticleBySlug: (slug: string) => Promise<ArticleDetail | null> =
  cached("article-by-slug", fetchArticleBySlug, (slug) => [
    TAG.articles,
    TAG.article(slug),
  ]);
