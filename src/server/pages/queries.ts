import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { pages } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";
import type { PolicySlug } from "@/lib/routes";
import type { RichDoc } from "@/lib/domain/types";

export type PageRow = {
  slug: PolicySlug;
  titleEn: string;
  titleHi: string;
  bodyEn: RichDoc;
  bodyHi: RichDoc | null;
  updatedAt: number;
};

async function fetchPage(slug: PolicySlug): Promise<PageRow | null> {
  const rows = await db
    .select({
      slug: pages.slug,
      titleEn: pages.titleEn,
      titleHi: pages.titleHi,
      bodyEn: pages.bodyEn,
      bodyHi: pages.bodyHi,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    slug: row.slug as PolicySlug,
    titleEn: row.titleEn,
    titleHi: row.titleHi,
    bodyEn: row.bodyEn,
    bodyHi: row.bodyHi,
    updatedAt: row.updatedAt.getTime(),
  };
}

export const getPage: (slug: PolicySlug) => Promise<PageRow | null> = cached(
  "page-by-slug",
  fetchPage,
  (slug) => [TAG.pages, TAG.page(slug)],
);
