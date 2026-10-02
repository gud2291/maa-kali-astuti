import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { courses } from "@/server/db/schema/content";
import { requireAdmin } from "@/server/auth/guards";
import { audit, diffOf } from "@/server/audit";
import { AppError } from "@/server/result";
import { courseSchema, type CourseInput } from "@/lib/validation/content";
import type { CourseKey } from "@/lib/domain/enums";

export type CourseAdminRow = typeof courses.$inferSelect;

export async function listCoursesAdmin(): Promise<CourseAdminRow[]> {
  await requireAdmin("content.edit");

  return db
    .select()
    .from(courses)
    .orderBy(asc(courses.sort));
}

export async function getCourseAdmin(key: CourseKey): Promise<CourseAdminRow> {
  await requireAdmin("content.edit");

  const [row] = await db
    .select()
    .from(courses)
    .where(eq(courses.key, key))
    .limit(1);

  if (!row) {
    throw new AppError("NOT_FOUND", `Course "${key}" not found`);
  }

  return row;
}

export async function updateCourse(
  key: CourseKey,
  input: unknown,
): Promise<{ key: CourseKey }> {
  const admin = await requireAdmin("content.edit");
  const data = courseSchema.parse(input);

  const [existing] = await db
    .select()
    .from(courses)
    .where(eq(courses.key, key))
    .limit(1);

  if (!existing) {
    throw new AppError("NOT_FOUND", `Course "${key}" not found`);
  }

  const patch = {
    nameEn: data.nameEn,
    nameHi: data.nameHi,
    deity: data.deity,
    days: data.days,
    content: data.content,
    feeInr: data.feeInr ?? null,
    visible: data.visible,
    updatedAt: new Date(),
  };

  await db
    .update(courses)
    .set(patch)
    .where(eq(courses.key, key));

  const diff = diffOf(
    existing as Record<string, unknown>,
    patch as Record<string, unknown>,
    Object.keys(patch) as (keyof typeof patch)[],
  );

  await audit({
    actorId: admin.id,
    action: "course.update",
    entity: "course",
    entityId: key,
    summary: `Updated course "${key}": "${data.nameEn}"`,
    diff,
  });

  return { key };
}
