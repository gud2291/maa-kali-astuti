/* THE BACKEND SEAM for editorial content (courses, rituals; about and videos join in F14).
   Components call these async getters and never import the JSON themselves. Phase B: CMS reads. */
import coursesData from "@/lib/data/courses.json";
import ritualsData from "@/lib/data/rituals.json";
import type { CourseOption } from "@/components/forms/InquiryForm";
import type { IconName } from "@/components/icons/Icon";

export type Course = (typeof coursesData.courses)[number];
/** [icon, title, description] rows (A.INCLUDES, A.ENROLL, A.RITUALS minus Hindi, A.RPROCESS, A.RECEIVE). */
export type IconRow = [IconName, string, string];

/** Options for the enrollment inquiry's "Which sadhana?" select (key · English · Hindi). */
export async function getCourseOptions(): Promise<CourseOption[]> {
  return coursesData.courses.map((c) => ({ key: c.key, en: c.en, hi: c.hi }));
}

/** The six sadhana courses (A.COURSES, mka-astro.js 389–396), in design order. */
export async function getCourses(): Promise<Course[]> {
  return coursesData.courses;
}

/** One course by URL slug (`kali-sadhana`) or key (`kali`). */
export async function getCourse(slugOrKey: string): Promise<Course | null> {
  return coursesData.courses.find((c) => c.slug === slugOrKey || c.key === slugOrKey) ?? null;
}

/** Shared course copy (mka-astro.js 399–402): what every course includes, the five enrollment
 *  steps, the five course modules [title, description] and the common niyam. */
export async function getCourseKit() {
  return {
    includes: coursesData.includes as IconRow[],
    enroll: coursesData.enroll as IconRow[],
    modules: coursesData.modules as [string, string][],
    niyam: coursesData.niyam,
  };
}

/** Rituals page data (mka-astro.js 405–407): ritual types [icon, en, hi, line], the five-step
 *  process and what you receive. */
export async function getRituals() {
  return {
    rituals: ritualsData.rituals as [IconName, string, string, string][],
    process: ritualsData.process as IconRow[],
    receive: ritualsData.receive as IconRow[],
  };
}

export type Review = { q: string; n: string; c: string };

/** Kundali ₹99 reader reviews (A.K99REV, mka-astro.js 334–339). */
export async function getKundaliReviews(): Promise<Review[]> {
  return (await import("@/lib/data/kundali99.json")).default.reviews;
}
