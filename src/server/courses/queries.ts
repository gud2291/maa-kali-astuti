import "server-only";
import { eq, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { courses } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";
import type { CourseKey } from "@/lib/domain/enums";
import type { CourseContent } from "@/lib/domain/types";

export type CourseRow = {
  key: CourseKey;
  slug: string;
  nameEn: string;
  nameHi: string;
  deity: string;
  icon: string;
  days: number;
  content: CourseContent;
  feeInr: number | null;
  sort: number;
};

async function fetchCourseRows(): Promise<CourseRow[]> {
  return db
    .select({
      key: courses.key,
      slug: courses.slug,
      nameEn: courses.nameEn,
      nameHi: courses.nameHi,
      deity: courses.deity,
      icon: courses.icon,
      days: courses.days,
      content: courses.content,
      feeInr: courses.feeInr,
      sort: courses.sort,
    })
    .from(courses)
    .where(eq(courses.visible, true))
    .orderBy(asc(courses.sort));
}

export const getCourseRows: () => Promise<CourseRow[]> = cached(
  "course-rows",
  fetchCourseRows,
  () => [TAG.courses],
);
