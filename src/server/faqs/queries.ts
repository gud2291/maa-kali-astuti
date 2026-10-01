import "server-only";
import { and, eq, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { faqs } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";
import type { FaqSet } from "@/lib/domain/enums";

export type FaqRow = {
  id: number;
  setKey: FaqSet;
  qEn: string;
  qHi: string;
  aEn: string;
  aHi: string;
  sort: number;
};

async function fetchFaqRows(set: FaqSet): Promise<FaqRow[]> {
  return db
    .select({
      id: faqs.id,
      setKey: faqs.setKey,
      qEn: faqs.qEn,
      qHi: faqs.qHi,
      aEn: faqs.aEn,
      aHi: faqs.aHi,
      sort: faqs.sort,
    })
    .from(faqs)
    .where(and(eq(faqs.setKey, set), eq(faqs.visible, true)))
    .orderBy(asc(faqs.sort));
}

export const getFaqRows: (set: FaqSet) => Promise<FaqRow[]> = cached(
  "faq-rows",
  fetchFaqRows,
  () => [TAG.faqs],
);
