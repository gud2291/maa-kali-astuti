import "server-only";

import { and, eq, desc, sql, count, like, or, ne } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema/content";
import { media } from "@/server/db/schema/core";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { attachMedia } from "@/server/media/service";
import { toMediaRef } from "@/server/media/refs";
import type { ArticleCategory, ContentStatus } from "@/lib/domain/enums";
import type { ArticleInput } from "@/lib/validation/article";
import type { MediaRef } from "@/lib/domain/media";
import type { RichDoc } from "@/lib/domain/types";
import type { Loc } from "@/lib/domain/loc";

export type AdminArticleListItem = {
  id: number;
  slug: string;
  category: ArticleCategory;
  titleEn: string;
  titleHi: string;
  excerptEn: string;
  excerptHi: string;
  readMins: number;
  status: ContentStatus;
  publishedAt: Date | null;
  coverMediaId: number | null;
  coverMedia: MediaRef | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminArticleDetail = {
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
  status: ContentStatus;
  publishedAt: Date | null;
  seoTitleEn: string | null;
  seoTitleHi: string | null;
  seoDescEn: string | null;
  seoDescHi: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ListArticlesParams = {
  status?: ContentStatus | "all";
  category?: ArticleCategory | "all";
  search?: string;
  page?: number;
  limit?: number;
};

export type ListArticlesResult = {
  items: AdminArticleListItem[];
  total: number;
  page: number;
  pages: number;
};

export async function listArticles(
  params: ListArticlesParams = {},
): Promise<ListArticlesResult> {
  await requireAdmin("content.edit");

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.status && params.status !== "all") {
    conditions.push(eq(articles.status, params.status));
  }

  if (params.category && params.category !== "all") {
    conditions.push(eq(articles.category, params.category));
  }

  if (params.search && params.search.trim()) {
    const q = `%${params.search.trim()}%`;
    conditions.push(
      or(
        like(articles.titleEn, q),
        like(articles.titleHi, q),
        like(articles.slug, q),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRes] = await db
    .select({ total: count() })
    .from(articles)
    .where(whereClause);

  const total = totalRes?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / limit));

  const rows = await db
    .select({
      article: articles,
      coverMedia: media,
    })
    .from(articles)
    .leftJoin(media, eq(articles.coverMediaId, media.id))
    .where(whereClause)
    .orderBy(desc(articles.createdAt))
    .limit(limit)
    .offset(offset);

  const items: AdminArticleListItem[] = rows.map(({ article, coverMedia }) => ({
    id: article.id,
    slug: article.slug,
    category: article.category,
    titleEn: article.titleEn,
    titleHi: article.titleHi,
    excerptEn: article.excerptEn,
    excerptHi: article.excerptHi,
    readMins: article.readMins,
    status: article.status,
    publishedAt: article.publishedAt,
    coverMediaId: article.coverMediaId,
    coverMedia: coverMedia ? toMediaRef(coverMedia) : null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  }));

  return { items, total, page, pages };
}

export async function getArticle(id: number): Promise<AdminArticleDetail> {
  await requireAdmin("content.edit");

  const rows = await db
    .select({
      article: articles,
      coverMedia: media,
    })
    .from(articles)
    .leftJoin(media, eq(articles.coverMediaId, media.id))
    .where(eq(articles.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new AppError("NOT_FOUND");
  }

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
    status: article.status,
    publishedAt: article.publishedAt,
    seoTitleEn: article.seoTitleEn,
    seoTitleHi: article.seoTitleHi,
    seoDescEn: article.seoDescEn,
    seoDescHi: article.seoDescHi,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}

export async function createArticle(
  input: ArticleInput,
): Promise<{ id: number; slug: string }> {
  const admin = await requireAdmin("content.edit");

  const existing = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, input.slug))
    .limit(1);

  if (existing.length > 0) {
    throw new AppError("CONFLICT", "Slug is already in use", { slug: "This slug is already in use" });
  }

  const publishedAt =
    input.status === "published"
      ? input.publishedAt || new Date()
      : input.publishedAt;

  const [inserted] = await db
    .insert(articles)
    .values({
      slug: input.slug,
      category: input.category,
      titleEn: input.titleEn,
      titleHi: input.titleHi,
      excerptEn: input.excerptEn,
      excerptHi: input.excerptHi,
      bodyEn: input.bodyEn,
      bodyHi: input.bodyHi,
      coverMediaId: input.coverMediaId,
      legacyArt: input.legacyArt,
      readMins: input.readMins,
      faq: input.faq,
      productIds: input.productIds,
      status: input.status,
      publishedAt,
      seoTitleEn: input.seoTitleEn,
      seoTitleHi: input.seoTitleHi,
      seoDescEn: input.seoDescEn,
      seoDescHi: input.seoDescHi,
    })
    .returning({ id: articles.id, slug: articles.slug });

  if (!inserted) {
    throw new AppError("INTERNAL");
  }

  if (input.coverMediaId) {
    await attachMedia([input.coverMediaId], {
      type: "article",
      id: String(inserted.id),
    });
  }

  await audit({
    actorId: admin.id,
    action: "article.create",
    entity: "article",
    entityId: String(inserted.id),
    summary: `Created article "${input.titleEn}" (${input.slug})`,
  });

  return inserted;
}

export async function updateArticle(
  id: number,
  input: ArticleInput,
): Promise<{ id: number; oldSlug: string; newSlug: string }> {
  const admin = await requireAdmin("content.edit");

  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  const existing = rows[0];
  if (!existing) {
    throw new AppError("NOT_FOUND");
  }

  if (input.slug !== existing.slug) {
    const slugClash = await db
      .select({ id: articles.id })
      .from(articles)
      .where(and(eq(articles.slug, input.slug), ne(articles.id, id)))
      .limit(1);

    if (slugClash.length > 0) {
      throw new AppError("CONFLICT", "Slug is already in use", { slug: "This slug is already in use" });
    }
  }

  const publishedAt =
    input.status === "published"
      ? existing.publishedAt || input.publishedAt || new Date()
      : input.publishedAt;

  await db
    .update(articles)
    .set({
      slug: input.slug,
      category: input.category,
      titleEn: input.titleEn,
      titleHi: input.titleHi,
      excerptEn: input.excerptEn,
      excerptHi: input.excerptHi,
      bodyEn: input.bodyEn,
      bodyHi: input.bodyHi,
      coverMediaId: input.coverMediaId,
      legacyArt: input.legacyArt,
      readMins: input.readMins,
      faq: input.faq,
      productIds: input.productIds,
      status: input.status,
      publishedAt,
      seoTitleEn: input.seoTitleEn,
      seoTitleHi: input.seoTitleHi,
      seoDescEn: input.seoDescEn,
      seoDescHi: input.seoDescHi,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));

  if (input.coverMediaId && input.coverMediaId !== existing.coverMediaId) {
    await attachMedia([input.coverMediaId], {
      type: "article",
      id: String(id),
    });
  }

  await audit({
    actorId: admin.id,
    action: "article.update",
    entity: "article",
    entityId: String(id),
    summary: `Updated article "${input.titleEn}" (${input.slug})`,
  });

  return { id, oldSlug: existing.slug, newSlug: input.slug };
}

export async function deleteArticle(id: number): Promise<{ slug: string }> {
  const admin = await requireAdmin("content.edit");

  const rows = await db
    .select({ slug: articles.slug, title: articles.titleEn })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  const existing = rows[0];
  if (!existing) {
    throw new AppError("NOT_FOUND");
  }

  await db.delete(articles).where(eq(articles.id, id));

  await audit({
    actorId: admin.id,
    action: "article.delete",
    entity: "article",
    entityId: String(id),
    summary: `Deleted article "${existing.title}" (${existing.slug})`,
  });

  return { slug: existing.slug };
}

export async function publishArticle(
  id: number,
  publish: boolean,
): Promise<{ slug: string; status: ContentStatus }> {
  const admin = await requireAdmin("content.edit");

  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  const existing = rows[0];
  if (!existing) {
    throw new AppError("NOT_FOUND");
  }

  const nextStatus: ContentStatus = publish ? "published" : "draft";
  const publishedAt = publish
    ? existing.publishedAt || new Date()
    : existing.publishedAt;

  await db
    .update(articles)
    .set({
      status: nextStatus,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id));

  await audit({
    actorId: admin.id,
    action: publish ? "article.publish" : "article.unpublish",
    entity: "article",
    entityId: String(id),
    summary: `${publish ? "Published" : "Unpublished"} article "${existing.titleEn}" (${existing.slug})`,
  });

  return { slug: existing.slug, status: nextStatus };
}
