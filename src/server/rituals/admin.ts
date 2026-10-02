import "server-only";
import { eq, asc, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { rituals } from "@/server/db/schema/content";
import { requireAdmin } from "@/server/auth/guards";
import { audit, diffOf } from "@/server/audit";
import { AppError } from "@/server/result";
import { ritualSchema, type RitualInput } from "@/lib/validation/content";

export type RitualAdminRow = typeof rituals.$inferSelect;

export async function listRitualsAdmin(): Promise<RitualAdminRow[]> {
  await requireAdmin("content.edit");

  return db
    .select()
    .from(rituals)
    .orderBy(asc(rituals.sort));
}

export async function createRitual(input: unknown): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");
  const data = ritualSchema.parse(input);

  const [maxRow] = await db
    .select({ maxSort: sql<number | null>`max(${rituals.sort})` })
    .from(rituals);

  const nextSort = (maxRow?.maxSort ?? -1) + 1;

  const [inserted] = await db
    .insert(rituals)
    .values({
      icon: data.icon,
      nameEn: data.nameEn,
      nameHi: data.nameHi,
      lineEn: data.lineEn,
      lineHi: data.lineHi,
      visible: data.visible,
      sort: nextSort,
      updatedAt: new Date(),
    })
    .returning({ id: rituals.id });

  if (!inserted) {
    throw new AppError("INTERNAL", "Failed to create ritual");
  }

  await audit({
    actorId: admin.id,
    action: "ritual.create",
    entity: "ritual",
    entityId: inserted.id,
    summary: `Created ritual: "${data.nameEn}"`,
  });

  return inserted;
}

export async function updateRitual(
  id: number,
  input: unknown,
): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");
  const data = ritualSchema.parse(input);

  const [existing] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "Ritual not found");
  }

  const patch = {
    icon: data.icon,
    nameEn: data.nameEn,
    nameHi: data.nameHi,
    lineEn: data.lineEn,
    lineHi: data.lineHi,
    visible: data.visible,
    updatedAt: new Date(),
  };

  await db
    .update(rituals)
    .set(patch)
    .where(eq(rituals.id, id));

  const diff = diffOf(
    existing as Record<string, unknown>,
    patch as Record<string, unknown>,
    Object.keys(patch) as (keyof typeof patch)[],
  );

  await audit({
    actorId: admin.id,
    action: "ritual.update",
    entity: "ritual",
    entityId: id,
    summary: `Updated ritual #${id}: "${data.nameEn}"`,
    diff,
  });

  return { id };
}

export async function deleteRitual(id: number): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");

  const [existing] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "Ritual not found");
  }

  await db.delete(rituals).where(eq(rituals.id, id));

  await audit({
    actorId: admin.id,
    action: "ritual.delete",
    entity: "ritual",
    entityId: id,
    summary: `Deleted ritual #${id}: "${existing.nameEn}"`,
  });

  return { id };
}

export async function reorderRituals(ids: number[]): Promise<{ count: number }> {
  const admin = await requireAdmin("content.edit");

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!;
    await db
      .update(rituals)
      .set({ sort: i, updatedAt: new Date() })
      .where(eq(rituals.id, id));
  }

  await audit({
    actorId: admin.id,
    action: "ritual.reorder",
    entity: "ritual",
    entityId: "all",
    summary: `Reordered ${ids.length} rituals`,
  });

  return { count: ids.length };
}
