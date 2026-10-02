import "server-only";
import { eq, and, asc, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { faqs } from "@/server/db/schema/content";
import { requireAdmin } from "@/server/auth/guards";
import { audit, diffOf } from "@/server/audit";
import { AppError } from "@/server/result";
import { faqSchema, type FaqInput } from "@/lib/validation/content";
import type { FaqSet } from "@/lib/domain/enums";

export type FaqAdminRow = typeof faqs.$inferSelect;

export async function listFaqsAdmin(setKey?: FaqSet): Promise<FaqAdminRow[]> {
  await requireAdmin("content.edit");

  const query = db.select().from(faqs);

  if (setKey) {
    return query
      .where(eq(faqs.setKey, setKey))
      .orderBy(asc(faqs.sort));
  }

  return query.orderBy(asc(faqs.setKey), asc(faqs.sort));
}

export async function createFaq(input: unknown): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");
  const data = faqSchema.parse(input);

  const [maxRow] = await db
    .select({ maxSort: sql<number | null>`max(${faqs.sort})` })
    .from(faqs)
    .where(eq(faqs.setKey, data.setKey));

  const nextSort = (maxRow?.maxSort ?? -1) + 1;

  const [inserted] = await db
    .insert(faqs)
    .values({
      setKey: data.setKey,
      qEn: data.qEn,
      qHi: data.qHi,
      aEn: data.aEn,
      aHi: data.aHi,
      visible: data.visible,
      sort: nextSort,
      updatedAt: new Date(),
    })
    .returning({ id: faqs.id });

  if (!inserted) {
    throw new AppError("INTERNAL", "Failed to create FAQ");
  }

  await audit({
    actorId: admin.id,
    action: "faq.create",
    entity: "faq",
    entityId: inserted.id,
    summary: `Created FAQ in "${data.setKey}": "${data.qEn.slice(0, 50)}..."`,
  });

  return inserted;
}

export async function updateFaq(id: number, input: unknown): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");
  const data = faqSchema.parse(input);

  const [existing] = await db
    .select()
    .from(faqs)
    .where(eq(faqs.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "FAQ not found");
  }

  const patch = {
    setKey: data.setKey,
    qEn: data.qEn,
    qHi: data.qHi,
    aEn: data.aEn,
    aHi: data.aHi,
    visible: data.visible,
    updatedAt: new Date(),
  };

  await db
    .update(faqs)
    .set(patch)
    .where(eq(faqs.id, id));

  const diff = diffOf(
    existing as Record<string, unknown>,
    patch as Record<string, unknown>,
    Object.keys(patch) as (keyof typeof patch)[],
  );

  await audit({
    actorId: admin.id,
    action: "faq.update",
    entity: "faq",
    entityId: id,
    summary: `Updated FAQ #${id} in "${data.setKey}"`,
    diff,
  });

  return { id };
}

export async function deleteFaq(id: number): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");

  const [existing] = await db
    .select()
    .from(faqs)
    .where(eq(faqs.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "FAQ not found");
  }

  await db.delete(faqs).where(eq(faqs.id, id));

  await audit({
    actorId: admin.id,
    action: "faq.delete",
    entity: "faq",
    entityId: id,
    summary: `Deleted FAQ #${id} from "${existing.setKey}"`,
  });

  return { id };
}

export async function reorderFaqs(
  setKey: FaqSet,
  ids: number[],
): Promise<{ count: number }> {
  const admin = await requireAdmin("content.edit");

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!;
    await db
      .update(faqs)
      .set({ sort: i, updatedAt: new Date() })
      .where(and(eq(faqs.id, id), eq(faqs.setKey, setKey)));
  }

  await audit({
    actorId: admin.id,
    action: "faq.reorder",
    entity: "faq",
    entityId: setKey,
    summary: `Reordered ${ids.length} FAQs in "${setKey}"`,
  });

  return { count: ids.length };
}
