/* THE BACKEND SEAM for editorial content (courses; rituals, about and videos join in F13–F14).
   Components call these async getters and never import the JSON themselves. Phase B: CMS reads. */
import coursesData from "@/lib/data/courses.json";
import type { CourseOption } from "@/components/forms/InquiryForm";

/** Options for the enrollment inquiry's "Which sadhana?" select (key · English · Hindi). */
export async function getCourseOptions(): Promise<CourseOption[]> {
  return coursesData.courses.map((c) => ({ key: c.key, en: c.en, hi: c.hi }));
}
