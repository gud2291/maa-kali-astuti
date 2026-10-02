"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import { updateCourse } from "./admin";
import { COURSE_KEYS, type CourseKey } from "@/lib/domain/enums";

export async function updateCourseAction(
  key: CourseKey,
  input: unknown,
): Promise<ActionResult<{ key: CourseKey }>> {
  return runAction(async () => {
    const validKey = z.enum(COURSE_KEYS).parse(key);
    const res = await updateCourse(validKey, input);
    invalidate(TAG.courses);
    return res;
  });
}
