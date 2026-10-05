/* Rashi helpers ported from mka-astro.js 33–65. */
import rashiData from "@/lib/data/rashi.json";
import type { RashiKey } from "@/lib/domain/enums";

/* JSON imports widen `key` to string; narrow it to the 12 known rashi keys. */
export type Rashi = Omit<(typeof rashiData)[number], "key"> & { key: RashiKey };
export type { RashiKey };

export const RASHI = rashiData as readonly Rashi[];

/** Rashi by key (falls back to Mesha) — A.rashi (mka-astro.js 62). */
export const rashiByKey = (k: string): Rashi => RASHI.find((r) => r.key === k) ?? RASHI[0];

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
export const todayRashi = (now: Date | number = new Date()) => {
  const d = new Date(now);
  return sunRashi(d.getMonth() + 1, d.getDate());
};

/** Same element (minus itself) plus one sign of the complementary element — A.compatible (65). */
export function compatible(r: Rashi): Rashi[] {
  const same = RASHI.filter((x) => x.el === r.el && x.key !== r.key);
  const ce = ({ Fire: "Air", Air: "Fire", Earth: "Water", Water: "Earth" } as Record<string, string>)[r.el];
  const c = RASHI.filter((x) => x.el === ce);
  return same.concat([c[r.i % 3]]);
}
