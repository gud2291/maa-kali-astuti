/* North-Indian Lagna chart layout, ported from mka-astro.js 111–133 (A.chart). The SVG itself is
   the JSX port `components/signature/KundaliChart.tsx`; this module only does the maths. */
import type { Kundali } from "./kundali";

/** Planet-block centre per house (1–12 → index 0–11), in the 400×400 chart box. */
const HC: [number, number][] = [
  [200, 100],
  [100, 40],
  [40, 100],
  [100, 200],
  [40, 300],
  [100, 360],
  [200, 300],
  [300, 360],
  [360, 300],
  [300, 200],
  [360, 100],
  [300, 40],
];
/** Sign-number position per house. */
const SN: [number, number][] = [
  [200, 180],
  [100, 86],
  [84, 100],
  [180, 200],
  [84, 300],
  [100, 316],
  [200, 222],
  [300, 316],
  [318, 300],
  [222, 200],
  [318, 100],
  [300, 86],
];
/** Planets per row per house (narrow triangles hold one). */
const HCOLS = [2, 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 2];

/** The four line paths (frame, two diagonals, inner diamond) — each drawn with pathLength=1. */
export const CHART_LINES = ["M0 0H400V400H0Z", "M0 0L400 400", "M400 0L0 400", "M200 0L400 200L200 400L0 200Z"];

export type ChartSign = { x: number; y: number; n: number };
export type ChartItem = {
  x: string;
  y: string;
  t: string;
  /** Retrograde marker (never for Rahu/Ketu). */
  r: boolean;
  /** The "Asc" / "लग्न" label: smaller and in the frame colour. */
  asc: boolean;
};

const f1 = (n: number) => (+n).toFixed(1);

/** Sign numbers and positioned planet labels for a chart. `hi` uses Devanagari abbreviations. */
export function chartLayout(K: Kundali, hi = false): { signs: ChartSign[]; items: ChartItem[] } {
  const signs: ChartSign[] = [];
  const items: ChartItem[] = [];
  for (let h = 0; h < 12; h++) {
    const [sx, sy] = SN[h];
    signs.push({ x: sx, y: sy + 4, n: ((K.lagna + h) % 12) + 1 });
    const list = K.planets
      .filter((p) => p.house === h + 1)
      .map((p) => ({ t: hi ? p.dev : p.ab, r: p.retro && p.k !== "ra" && p.k !== "ke", asc: false }));
    if (h === 0) list.unshift({ t: hi ? "लग्न" : "Asc", r: false, asc: true });
    const cols = HCOLS[h];
    const n = list.length;
    const rows = Math.ceil(n / cols);
    const [cx, cy] = HC[h];
    list.forEach((it, j) => {
      const row = Math.floor(j / cols);
      const ci = j % cols;
      const inRow = Math.min(cols, n - row * cols);
      items.push({
        ...it,
        x: f1(cx + (ci - (inRow - 1) / 2) * 34),
        y: f1(cy + (row - (rows - 1) / 2) * 19 + 5),
      });
    });
  }
  return { signs, items };
}
