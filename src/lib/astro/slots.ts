/* Consultation slots, ported 1:1 from mka-astro.js 319–322 (A.SLOTS, slotsFor, t12, istDate).
   Demo availability: each slot of a day is free when the seeded draw is > .34, so the same date
   and session length always show the same "booked" times. Phase B reads real availability. */
import consultData from "@/lib/data/consult.json";
import { rng } from "@/lib/core/rng";

type SlotLen = "30" | "45" | "60" | "90";
const SLOTS = consultData.slots as Record<SlotLen, string[]>;

export type Slot = { t: string; free: boolean };

/** Session start times (IST, "HH:mm") for a date and session length in minutes. */
export function slotsFor(date: Date, mins: number): Slot[] {
  const k = (mins <= 30 ? 30 : mins <= 45 ? 45 : mins <= 60 ? 60 : 90) as 30 | 45 | 60 | 90;
  const R = rng("slot" + date.toDateString() + k);
  return SLOTS[String(k) as SlotLen].map((t) => ({ t, free: R() > 0.34 }));
}

/** "14:30" → "2:30 pm". */
export function t12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

/** The absolute instant of `t` (IST wall time) on the calendar day of `d`. */
export function istDate(d: Date, t: string): Date {
  const [h, m] = t.split(":").map(Number);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), h, m) - 330 * 60000);
}

/** yyyy-mm-dd in local time (date inputs, `max` attributes). */
export const isoDay = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
