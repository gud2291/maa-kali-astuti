/* Rashi helpers ported from mka-astro.js. F6 extends this module with predict / kundali / love. */
import rashiData from "@/lib/data/rashi.json";

export type Rashi = (typeof rashiData)[number];
export type RashiKey = Rashi["key"];

export const RASHI = rashiData as readonly Rashi[];

/** Sun sign (sidereal dates) for a month (1–12) and day — A.sunRashi (mka-astro.js 64). */
export function sunRashi(m: number, d: number): Rashi {
  const v = m * 100 + d;
  let idx = 8;
  let bv = -1;
  RASHI.forEach((r) => {
    const s = r.start[0] * 100 + r.start[1];
    if (s <= v && s > bv) {
      bv = s;
      idx = r.i;
    }
  });
  return RASHI[idx];
}

/** Today's sun sign in the viewer's local time. Client-only (the page is static). */
export const todayRashi = (now = new Date()) => sunRashi(now.getMonth() + 1, now.getDate());
