import "server-only";
import coursesData from "@/lib/data/courses.json";
import ritualsData from "@/lib/data/rituals.json";
import { getCourseRows, type CourseRow } from "@/server/courses/queries";
import { getRitualRows } from "@/server/rituals/queries";
import { getVideoRows } from "@/server/videos/queries";
import { getSetting } from "@/server/settings/queries";
import { loc } from "@/lib/domain/loc";
import { MON } from "@/lib/core/dates";
import type { CourseOption } from "@/components/forms/InquiryForm";
import type { IconName } from "@/components/icons/Icon";

export type Course = {
  key: string;
  slug: string;
  en: string;
  hi: string;
  deity: string;
  icon: string;
  days: number;
  essence: string;
  overview: string;
  attain: string[];
  niyam: string;
  feeInr?: number | null;
};

/** [icon, title, description] rows (A.INCLUDES, A.ENROLL, A.RITUALS minus Hindi, A.RPROCESS, A.RECEIVE). */
export type IconRow = [IconName, string, string];

function toCourse(r: CourseRow, locale: string): Course {
  return {
    key: r.key,
    slug: r.slug,
    en: r.nameEn,
    hi: r.nameHi,
    deity: r.deity,
    icon: r.icon,
    days: r.days,
    essence: loc(r.content.essence, locale),
    overview: loc(r.content.overview, locale),
    attain: (r.content.attain ?? []).map((a) => loc(a, locale)),
    niyam: loc(r.content.niyam, locale),
    feeInr: r.feeInr,
  };
}

/** Options for the enrollment inquiry's "Which sadhana?" select (key · English · Hindi). */
export async function getCourseOptions(locale = "en"): Promise<CourseOption[]> {
  void locale;
  const rows = await getCourseRows();
  return rows.map((c) => ({ key: c.key, en: c.nameEn, hi: c.nameHi }));
}

/** The six sadhana courses, in DB/design order. */
export async function getCourses(locale = "en"): Promise<Course[]> {
  const rows = await getCourseRows();
  return rows.map((r) => toCourse(r, locale));
}

/** One course by URL slug (`kali-sadhana`) or key (`kali`). */
export async function getCourse(slugOrKey: string, locale = "en"): Promise<Course | null> {
  const rows = await getCourseRows();
  const c = rows.find((r) => r.slug === slugOrKey || r.key === slugOrKey);
  if (!c) return null;
  return toCourse(c, locale);
}

/** Shared course copy: what every course includes, the five enrollment
 *  steps, the five course modules [title, description] and the common niyam. */
export async function getCourseKit() {
  return {
    includes: coursesData.includes as IconRow[],
    enroll: coursesData.enroll as IconRow[],
    modules: coursesData.modules as [string, string][],
    niyam: coursesData.niyam,
  };
}

/** Rituals page data: ritual types [icon, en, hi, line], the five-step
 *  process and what you receive. */
export async function getRituals(locale = "en") {
  const rows = await getRitualRows();
  return {
    rituals: rows.map((r): [IconName, string, string, string] => [
      r.icon as IconName,
      r.nameEn,
      r.nameHi,
      loc({ en: r.lineEn, hi: r.lineHi }, locale),
    ]),
    process: ritualsData.process as IconRow[],
    receive: ritualsData.receive as IconRow[],
  };
}

export type Review = { q: string; n: string; c: string };

/** Kundali ₹99 reader reviews. */
export async function getKundaliReviews(): Promise<Review[]> {
  return (await import("@/lib/data/kundali99.json")).default.reviews;
}

/* ---------------- About (F14) ---------------- */

export type Chapter = { k: string; yr: string; dev: string; t: string; hi: string; d: string; note: string };
export type Book = { key: string; hi: string[]; en: string; sub: string; year: string; pages: string; line: string };

/** About page data: the six story chapters, the three pillars
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

export type Video = {
  id: string;
  yt?: string;
  cat: string;
  en: string;
  hi: string[];
  dur: string;
  date: string;
  desc: string;
  motif?: string;
};

export type Short = {
  id: string;
  yt?: string;
  en: string;
  hi: string[];
  dur: string;
};

function formatPublishedOn(d: string | null): string {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  const day = parseInt(parts[2], 10);
  const mIndex = parseInt(parts[1], 10) - 1;
  const month = MON[mIndex] ?? "";
  const year = parts[0];
  return `${day} ${month} ${year}`;
}

/** Video library: categories [key, en, hi], the twelve discourses, six
 *  Shorts and the subscriber line. */
export async function getVideos(locale = "en") {
  const [rows, videoSetting, socialSetting] = await Promise.all([
    getVideoRows(),
    getSetting("videos"),
    getSetting("social"),
  ]);

  const vids: Video[] = [];
  const shorts: Short[] = [];

  for (const r of rows) {
    const id = r.legacyKey ?? r.youtubeId ?? String(r.id);
    const yt = r.youtubeId ?? undefined;
    const hi = r.titleHi.split("\n");

    if (r.kind === "video") {
      vids.push({
        id,
        yt,
        cat: r.category,
        en: r.titleEn,
        hi,
        dur: r.duration,
        date: formatPublishedOn(r.publishedOn),
        desc: loc({ en: r.descEn ?? "", hi: r.descHi ?? "" }, locale),
        motif: r.motif ?? undefined,
      });
    } else {
      shorts.push({
        id,
        yt,
        en: r.titleEn,
        hi,
        dur: r.duration,
      });
    }
  }

  const cats: [string, string, string][] = videoSetting.categories.map((c) => [
    c.key,
    c.label.en,
    c.label.hi,
  ]);

  const subs = loc(socialSetting.youtubeSubs, locale);

  return {
    cats,
    videos: vids,
    shorts,
    subs,
  };
}
