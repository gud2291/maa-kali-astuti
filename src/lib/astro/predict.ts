/* Rashifal predictions ported from mka-astro.js 342–369. Deterministic: the text is seeded by
   rashi + period + date bucket, so the same day always reads the same. Always pass `now`
   (INV gotcha 14) so the server HTML and the client agree for a given date. */
import predictData from "@/lib/data/predict.json";
import { addDays, dlong, MON } from "@/lib/core/dates";
import { rng } from "@/lib/core/rng";
import monthsData from "@/lib/data/months.json";
import type { Rashi } from "./rashi";

export type Period = "today" | "tomorrow" | "week" | "month" | "year";
export type Area = "love" | "career" | "health" | "finance";

/** [key, English, Hindi] (A.PERIODS). */
export const PERIODS = predictData.periods as [Period, string, string][];
/** [key, English, Hindi, icon] (A.AREAS). */
export const AREAS = predictData.areas as [Area, string, string, string][];

/* Prediction templates — closure constants OPEN / AREA in mka-astro.js 343–349 (not exported by
   the prototype, so they live here rather than in the extracted JSON). */
const OPEN = [
  "{Span} rewards patience over speed; {lord}, your rashi lord, favours steady effort.",
  "A calm, productive stretch {span}. Finish pending paperwork before starting something new.",
  "Conversations carry extra weight {span}. Say less, and mean what you say.",
  "Energy runs high {span}. Put it into the task you have been postponing.",
  "Old contacts resurface {span}, and one of them brings useful news about work.",
  "A good time to settle one open money question with family {span}.",
  "Your intuition is sharp {span}, but confirm the details before you commit.",
  "Keep plans simple {span}. Small finished tasks will matter more than big announcements.",
];
const AREA: Record<Area, string[]> = {
  love: [
    "In relationships, listen fully before you reply; a small misunderstanding clears quickly.",
    "Single seekers may meet someone through family or a place of worship.",
    "An unhurried meal together does more for your bond than any gift.",
    "Keep work stress out of the home; your partner is more patient than you think.",
    "A long-pending conversation with your spouse goes better than you expect.",
    "Say your appreciation out loud. It is noticed, and returned.",
  ],
  career: [
    "At work, a senior notices steady effort. Keep your reports precise.",
    "A good window to apply, pitch or ask for the responsibility you want.",
    "Read agreements clause by clause and do not sign in a hurry.",
    "Teamwork brings the result. Share credit generously.",
    "Business owners may see a delayed payment finally arrive.",
    "Focus on one project; scattered effort slows everything down.",
  ],
  health: [
    "Sleep on time; your energy depends on it more than usual.",
    "Favour warm, simple food if digestion feels sensitive.",
    "Ten minutes of pranayama each morning keeps the mind steady.",
    "Mind your posture during long hours at the desk.",
    "Drink enough water and walk for a while after meals.",
    "Gentle stretching eases stiffness in the joints.",
  ],
  finance: [
    "Money matters are stable. Postpone large purchases by a few days.",
    "An old investment shows modest gains; avoid speculative trades.",
    "Clear small dues first. It frees your mind for bigger decisions.",
    "A family expense may come up, so keep a small reserve ready.",
    "A good time to begin a disciplined savings habit.",
    "Avoid lending money for now, even to close friends.",
  ],
};

const SPAN: Record<Period, string> = {
  today: "today",
  tomorrow: "tomorrow",
  week: "this week",
  month: "this month",
  year: "this year",
};

const monday = (d: Date) => addDays(-((d.getDay() + 6) % 7), d);

/** Human label for a period — A.periodDate (mka-astro.js 351–358). */
export function periodDate(p: Period, now: Date | number): string {
  const d = new Date(now);
  if (p === "today") return dlong(d);
  if (p === "tomorrow") return dlong(addDays(1, d));
  if (p === "week") {
    const a = monday(d);
    const b = addDays(6, a);
    return `${a.getDate()} ${MON[a.getMonth()]} – ${b.getDate()} ${MON[b.getMonth()]} ${b.getFullYear()}`;
  }
  if (p === "month") return `${monthsData.long[d.getMonth()]} ${d.getFullYear()}`;
  return `Samvat ${d.getFullYear() + 57} · ${d.getFullYear()}`;
}

export type Prediction = {
  text: string;
  short: string;
  love: string;
  career: string;
  health: string;
  finance: string;
  /** 2–5 per area. */
  meters: Record<Area, number>;
  luckyNum: number;
  /** Rounded mean of the four meters. */
  overall: number;
};

/** Seeded prediction for a rashi and period — A.predict (mka-astro.js 359–368). */
export function predict(r: Rashi, p: Period, now: Date | number): Prediction {
  const d = new Date(now);
  const span = SPAN[p] ?? "today";
  const dk =
    p === "today"
      ? d.toDateString()
      : p === "tomorrow"
        ? addDays(1, d).toDateString()
        : p === "week"
          ? monday(d).toDateString()
          : p === "month"
            ? "m" + d.getMonth() + d.getFullYear()
            : "y" + d.getFullYear();
  const R = rng(r.key + p + dk);
  const pick = <T>(a: T[]) => a[Math.floor(R() * a.length)];
  const fill = (s: string) =>
    s
      .replace(/\{span\}/g, span)
      .replace(/\{Span\}/g, span[0].toUpperCase() + span.slice(1))
      .replace(/\{lord\}/g, r.lordHi);
  const o = fill(pick(OPEN));
  const love = pick(AREA.love);
  const career = pick(AREA.career);
  const health = pick(AREA.health);
  const finance = pick(AREA.finance);
  const m = () => 2 + Math.floor(R() * 4);
  const meters = { love: m(), career: m(), health: m(), finance: m() };
  return {
    text: `${o} ${career} ${love}`,
    short: o,
    love,
    career,
    health,
    finance,
    meters,
    luckyNum: [r.num, ((r.num + 2) % 9) + 1, ((r.num + 5) % 9) + 1][Math.floor(R() * 3)],
    overall: Math.round((meters.love + meters.career + meters.health + meters.finance) / 4),
  };
}
