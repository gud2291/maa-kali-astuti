/* Love Calculator by name, ported from mka-astro.js 372–386. A light numerology reading:
   Pythagorean name numbers (Latin letters only — INV gotcha 8), planetary friendships, and a
   percentage seeded by the sorted pair of names (52–97). */
import loveData from "@/lib/data/love.json";
import { rng } from "@/lib/core/rng";

/** Number → graha name (A.NUMP). */
export const NUMP = loveData.nump as Record<string, string>;
/** Ashtakoota names and max points (A.KOOTA). */
export const KOOTA = loveData.koota as [string, number][];

/** Planetary friends per number (closure FR, mka-astro.js 376). */
const FR: Record<number, number[]> = {
  1: [2, 9, 3],
  2: [1, 5],
  3: [1, 2, 9],
  4: [6, 8, 5],
  5: [1, 6],
  6: [5, 8, 4],
  7: [6, 8, 5],
  8: [5, 6, 4],
  9: [1, 2, 3],
};

/** Digit-sum down to 1–9 (0 → 9). */
const red = (n: number) => {
  while (n > 9)
    n = String(n)
      .split("")
      .reduce((a, b) => a + +b, 0);
  return n || 9;
};

/** Name number: A=1 … I=9, J=1 …; names without Latin letters fall back to a char-code hash. */
export function nameNum(s: string): number {
  const t = String(s || "").replace(/[^A-Za-z]/g, "");
  if (!t) {
    let h = 0;
    for (const c of String(s || "")) h += c.charCodeAt(0);
    return red(h);
  }
  return red([...t.toUpperCase()].reduce((a, c) => a + (((c.charCodeAt(0) - 65) % 9) + 1), 0));
}

export type LoveRel = "same" | "friend" | "neutral" | "opp";
export type LoveResult = {
  na: number;
  nb: number;
  pa: string;
  pb: string;
  rel: LoveRel;
  pct: number;
  label: string;
  labelHi: string;
  line: string;
};

/** A.love (mka-astro.js 377–383). */
export function love(a: string, b: string): LoveResult {
  const na = nameNum(a);
  const nb = nameNum(b);
  const rel: LoveRel =
    na === nb
      ? "same"
      : FR[na].includes(nb) || FR[nb].includes(na)
        ? "friend"
        : Math.abs(na - nb) === 4
          ? "opp"
          : "neutral";
  const R = rng(
    "love" +
      [a, b]
        .map((s) => String(s).trim().toLowerCase())
        .sort()
        .join("|"),
  );
  const base = { same: 81, friend: 86, neutral: 73, opp: 64 }[rel];
  const pct = Math.max(52, Math.min(97, Math.round(base + (R() - 0.4) * 16)));
  const L =
    pct >= 90
      ? ["Rare Harmony", "दुर्लभ सामंजस्य"]
      : pct >= 80
        ? ["Harmonious Bond", "मधुर बंधन"]
        : pct >= 70
          ? ["Warm Companionship", "स्नेहिल साथ"]
          : pct >= 60
            ? ["Growing Together", "साथ बढ़ता रिश्ता"]
            : ["Balanced Opposites", "संतुलित विपरीत"];
  const pa = NUMP[na];
  const pb = NUMP[nb];
  const line = {
    same: `You share the same vibration (${pa}), so you often think alike. Leave room for each other’s quiet time.`,
    friend: `${pa} and ${pb} are natural friends. Plans you make together tend to hold.`,
    neutral: `${pa} and ${pb} move at different speeds. Talk plans through rather than assuming.`,
    opp: `${pa} and ${pb} pull in different directions. Patience turns the difference into strength.`,
  }[rel];
  return { na, nb, pa, pb, rel, pct, label: L[0], labelHi: L[1], line };
}

/** First character, upper-cased ("" when empty). */
export const initial = (s: string) => {
  const t = String(s || "").trim();
  return t ? [...t][0].toUpperCase() : "";
};

/** At least two Latin or Devanagari letters (Home lOk 1132 / kSubmit name check 1120). */
export const hasTwoLetters = (s: string) => String(s || "").replace(/[^A-Za-zऀ-ॿ]/g, "").length >= 2;
