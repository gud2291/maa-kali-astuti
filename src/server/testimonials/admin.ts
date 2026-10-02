import "server-only";
import { eq, inArray, asc, desc, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { testimonials } from "@/server/db/schema/content";
import { media } from "@/server/db/schema/core";
import { requireAdmin } from "@/server/auth/guards";
import { audit, diffOf } from "@/server/audit";
import { AppError } from "@/server/result";
import { toMediaRef } from "@/server/media/refs";
import type { MediaRef } from "@/lib/domain/media";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/validation/content";

export type TestimonialAdminRow = typeof testimonials.$inferSelect & {
  mediaRef?: MediaRef | null;
};

export async function listTestimonialsAdmin(): Promise<TestimonialAdminRow[]> {
  await requireAdmin("content.edit");

  const rows = await db
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.sort), desc(testimonials.createdAt));

  const mediaIds = rows
    .map((r) => r.mediaId)
    .filter((id): id is number => id !== null);

  const mediaMap = new Map<number, MediaRef>();
  if (mediaIds.length > 0) {
    const mediaRows = await db
      .select()
      .from(media)
      .where(inArray(media.id, mediaIds));

    for (const m of mediaRows) {
      if (m.status === "ready") {
        mediaMap.set(m.id, toMediaRef(m));
      }
    }
  }

  return rows.map((r) => ({
    ...r,
    mediaRef: r.mediaId ? mediaMap.get(r.mediaId) ?? null : null,
  }));
}

export async function createTestimonial(input: unknown): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");
  const data = testimonialSchema.parse(input);

  const [maxRow] = await db
    .select({ maxSort: sql<number | null>`max(${testimonials.sort})` })
    .from(testimonials);

  const nextSort = (maxRow?.maxSort ?? -1) + 1;

  const [inserted] = await db
    .insert(testimonials)
    .values({
      kind: data.kind,
      quoteEn: data.quoteEn,
      quoteHi: data.quoteHi,
      name: data.name,
      city: data.city ?? null,
      tag: data.tag ?? null,
      rating: data.rating ?? null,
      youtubeId: data.youtubeId ?? null,
      mediaId: data.mediaId ?? null,
      featured: data.featured,
      visible: data.visible,
      sort: nextSort,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning({ id: testimonials.id });

  if (!inserted) {
    throw new AppError("INTERNAL", "Failed to create testimonial");
  }

  await audit({
    actorId: admin.id,
    action: "testimonial.create",
    entity: "testimonial",
    entityId: inserted.id,
    summary: `Created testimonial by "${data.name}"`,
  });

  return inserted;
}

export async function updateTestimonial(
  id: number,
  input: unknown,
): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");
  const data = testimonialSchema.parse(input);

  const [existing] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "Testimonial not found");
  }

  const patch = {
    kind: data.kind,
    quoteEn: data.quoteEn,
    quoteHi: data.quoteHi,
    name: data.name,
    city: data.city ?? null,
    tag: data.tag ?? null,
    rating: data.rating ?? null,
    youtubeId: data.youtubeId ?? null,
    mediaId: data.mediaId ?? null,
    featured: data.featured,
    visible: data.visible,
    updatedAt: new Date(),
  };

  await db
    .update(testimonials)
    .set(patch)
    .where(eq(testimonials.id, id));

  const diff = diffOf(
    existing as Record<string, unknown>,
    patch as Record<string, unknown>,
    Object.keys(patch) as (keyof typeof patch)[],
  );

  await audit({
    actorId: admin.id,
    action: "testimonial.update",
    entity: "testimonial",
    entityId: id,
    summary: `Updated testimonial #${id} by "${data.name}"`,
    diff,
  });

  return { id };
}

export async function deleteTestimonial(id: number): Promise<{ id: number }> {
  const admin = await requireAdmin("content.edit");

  const [existing] = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", "Testimonial not found");
  }

  await db.delete(testimonials).where(eq(testimonials.id, id));

  await audit({
    actorId: admin.id,
    action: "testimonial.delete",
    entity: "testimonial",
    entityId: id,
    summary: `Deleted testimonial #${id} by "${existing.name}"`,
  });

  return { id };
}

export async function reorderTestimonials(
  ids: number[],
): Promise<{ count: number }> {
  const admin = await requireAdmin("content.edit");

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!;
    await db
      .update(testimonials)
      .set({ sort: i, updatedAt: new Date() })
      .where(eq(testimonials.id, id));
  }

  await audit({
    actorId: admin.id,
    action: "testimonial.reorder",
    entity: "testimonial",
    entityId: "all",
    summary: `Reordered ${ids.length} testimonials`,
  });

  return { count: ids.length };
}
