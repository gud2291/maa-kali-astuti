/* THE BACKEND SEAM for editorial content (courses, rituals, about, videos).
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

/* ---------------- About (F14) ---------------- */

export type Chapter = { k: string; yr: string; dev: string; t: string; hi: string; d: string; note: string };
export type Book = { key: string; hi: string[]; en: string; sub: string; year: string; pages: string; line: string };

/** About page data (mka-home.js 242–246, 275–287): the six story chapters, the three pillars
 *  [icon, title, description] and the three published books. */
export async function getAbout() {
  const [about, books] = await Promise.all([import("@/lib/data/about.json"), import("@/lib/data/books.json")]);
  return {
    timeline: about.default.timeline as Chapter[],
    pillars: about.default.pillars as IconRow[],
    books: books.default as Book[],
  };
}

/* ---------------- Videos (F14) ---------------- */

export type Video = { id: string; cat: string; en: string; hi: string[]; dur: string; date: string; desc: string };
export type Short = { id: string; en: string; hi: string[]; dur: string };

/** Video library (mka-home.js 187–211): categories [key, en, hi], the twelve discourses, six
 *  Shorts and the subscriber line. [client-confirm] Real titles / ids come from the channel. */
export async function getVideos() {
  const v = (await import("@/lib/data/videos.json")).default;
  return {
    cats: v.cats as [string, string, string][],
    videos: v.videos as Video[],
    shorts: v.shorts as Short[],
    subs: v.subs,
  };
}
