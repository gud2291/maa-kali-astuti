"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import { env } from "@/server/env";
import {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  type AdminArticleListItem,
  type AdminArticleDetail,
  type ListArticlesParams,
  type ListArticlesResult,
} from "./admin";
import {
  articleInputSchema,
  type ArticleInput,
} from "@/lib/validation/article";
import {
  ARTICLE_CATEGORIES,
  CONTENT_STATUS,
  type ArticleCategory,
  type ContentStatus,
} from "@/lib/domain/enums";

export async function listArticlesAction(
  params?: ListArticlesParams,
): Promise<ActionResult<ListArticlesResult>> {
  return runAction(async () => {
    return listArticles(params);
  });
}

export async function getArticleAction(
  id: number,
): Promise<ActionResult<AdminArticleDetail>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    return getArticle(validId);
  });
}

export async function createArticleAction(
  rawInput: unknown,
): Promise<ActionResult<{ id: number; slug: string }>> {
  return runAction(async () => {
    const schema = articleInputSchema(env.NEXT_PUBLIC_MEDIA_URL ?? "");
    const input = schema.parse(rawInput);
    const result = await createArticle(input);
    invalidate(TAG.articles, TAG.article(result.slug));
    return result;
  });
}

export async function updateArticleAction(
  id: number,
  rawInput: unknown,
): Promise<ActionResult<{ id: number; slug: string }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const schema = articleInputSchema(env.NEXT_PUBLIC_MEDIA_URL ?? "");
    const input = schema.parse(rawInput);
    const result = await updateArticle(validId, input);

    invalidate(TAG.articles, TAG.article(result.newSlug));
    if (result.oldSlug !== result.newSlug) {
      invalidate(TAG.article(result.oldSlug));
    }

    return { id: result.id, slug: result.newSlug };
  });
}

export async function deleteArticleAction(
  id: number,
): Promise<ActionResult<{ slug: string }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const result = await deleteArticle(validId);
    invalidate(TAG.articles, TAG.article(result.slug));
    return result;
  });
}

export async function publishArticleAction(
  id: number,
  publish: boolean,
): Promise<ActionResult<{ slug: string; status: ContentStatus }>> {
  return runAction(async () => {
    const validId = z.number().int().positive().parse(id);
    const validPublish = z.boolean().parse(publish);
    const result = await publishArticle(validId, validPublish);
    invalidate(TAG.articles, TAG.article(result.slug));
    return result;
  });
}
