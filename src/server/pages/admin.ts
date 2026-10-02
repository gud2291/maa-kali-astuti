import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { pages } from "@/server/db/schema/content";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { POLICY_SLUGS, type PolicySlug } from "@/lib/domain/enums";
import { POLICIES } from "@/lib/routes";
import type { PageInput } from "@/lib/validation/page";
import type { RichDoc } from "@/lib/domain/types";

export type AdminPageItem = {
  slug: PolicySlug;
  titleEn: string;
  titleHi: string;
  hasBodyEn: boolean;
  hasBodyHi: boolean;
  updatedAt: Date | null;
  updatedBy: number | null;
};

export type AdminPageDetail = {
  slug: PolicySlug;
  titleEn: string;
  titleHi: string;
  bodyEn: RichDoc;
  bodyHi: RichDoc | null;
  updatedAt: Date;
  updatedBy: number | null;
};

const DEFAULT_DOC: RichDoc = { type: "doc", content: [] };

export async function listPages(): Promise<AdminPageItem[]> {
  await requireAdmin("content.edit");

  const rows = await db.select().from(pages);
  const rowMap = new Map(rows.map((r) => [r.slug as PolicySlug, r]));

  return POLICY_SLUGS.map((slug) => {
    const row = rowMap.get(slug);
    const hasBodyEn = Boolean(
      row?.bodyEn?.content && row.bodyEn.content.length > 0,
    );
    const hasBodyHi = Boolean(
      row?.bodyHi?.content && row.bodyHi.content.length > 0,
    );

    return {
      slug,
      titleEn: row?.titleEn || POLICIES[slug],
      titleHi: row?.titleHi || "",
      hasBodyEn,
      hasBodyHi,
      updatedAt: row?.updatedAt ?? null,
      updatedBy: row?.updatedBy ?? null,
    };
  });
}

export async function getPage(slug: PolicySlug): Promise<AdminPageDetail> {
  await requireAdmin("content.edit");

  const rows = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  const row = rows[0];

  if (!row) {
    return {
      slug,
      titleEn: POLICIES[slug],
      titleHi: "",
      bodyEn: DEFAULT_DOC,
      bodyHi: null,
      updatedAt: new Date(),
      updatedBy: null,
    };
  }

  return {
    slug: row.slug as PolicySlug,
    titleEn: row.titleEn,
    titleHi: row.titleHi,
    bodyEn: row.bodyEn,
    bodyHi: row.bodyHi,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
  };
}

export async function updatePage(
  slug: PolicySlug,
  input: PageInput,
): Promise<AdminPageDetail> {
  const admin = await requireAdmin("content.edit");

  const now = new Date();

  await db
    .insert(pages)
    .values({
      slug,
      titleEn: input.titleEn,
      titleHi: input.titleHi,
      bodyEn: input.bodyEn,
      bodyHi: input.bodyHi,
      updatedBy: admin.id,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pages.slug,
      set: {
        titleEn: input.titleEn,
        titleHi: input.titleHi,
        bodyEn: input.bodyEn,
        bodyHi: input.bodyHi,
        updatedBy: admin.id,
        updatedAt: now,
      },
    });

  await audit({
    actorId: admin.id,
    action: "page.update",
    entity: "page",
    entityId: slug,
    summary: `Updated policy page "${input.titleEn}" (${slug})`,
  });

  return {
    slug,
    titleEn: input.titleEn,
    titleHi: input.titleHi,
    bodyEn: input.bodyEn,
    bodyHi: input.bodyHi,
    updatedAt: now,
    updatedBy: admin.id,
  };
}
