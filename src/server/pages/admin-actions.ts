"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import { env } from "@/server/env";
import {
  listPages,
  getPage,
  updatePage,
  type AdminPageItem,
  type AdminPageDetail,
} from "./admin";
import { pageInputSchema, type PageInput } from "@/lib/validation/page";
import { POLICY_SLUGS, type PolicySlug } from "@/lib/domain/enums";

export async function listPagesAction(): Promise<ActionResult<AdminPageItem[]>> {
  return runAction(async () => {
    return listPages();
  });
}

export async function getPageAction(
  slug: PolicySlug,
): Promise<ActionResult<AdminPageDetail>> {
  return runAction(async () => {
    const validSlug = z.enum(POLICY_SLUGS).parse(slug);
    return getPage(validSlug);
  });
}

export async function updatePageAction(
  slug: PolicySlug,
  rawInput: unknown,
): Promise<ActionResult<AdminPageDetail>> {
  return runAction(async () => {
    const validSlug = z.enum(POLICY_SLUGS).parse(slug);
    const schema = pageInputSchema(env.NEXT_PUBLIC_MEDIA_URL ?? "");
    const input = schema.parse(rawInput);
    const result = await updatePage(validSlug, input);
    invalidate(TAG.pages, TAG.page(validSlug));
    return result;
  });
}
