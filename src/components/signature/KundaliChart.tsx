import { CHART_LINES, chartLayout } from "@/lib/astro/chart";
import type { Kundali } from "@/lib/astro/kundali";

type Props = {
  K: Kundali;
  /** Frame + "Asc" colour. */
  col?: string;
  /** Planet colour. */
  ink?: string;
  /** Sign-number colour. */
  sub?: string;
  /** Planet font size (Asc is fs − 3). */
  fs?: number;
  sw?: number;
  /** Devanagari planet abbreviations. */
  hi?: boolean;
  label?: string;
};

const POP = { transformBox: "fill-box", transformOrigin: "center" } as const;

/**
 * North-Indian Lagna chart — JSX port of A.chart (mka-astro.js 114–133). Server-safe and static;
 * lines carry `data-cl` and labels `data-pl`, so `motion/draw.ts` (prime + drawChart) can draw it (S12).
 */
export function KundaliChart({
  K,
  col = "#D9B96A",
  ink = "#FBF7EE",
  sub = "#9FB3AA",
  fs = 15,
  sw = 1.3,
  hi = false,
  label = "North Indian Lagna chart",
}: Props) {
  const { signs, items } = chartLayout(K, hi);
  return (
    <svg viewBox="-6 -6 412 412" width="100%" height="100%" role="img" aria-label={label} className="block">
      <g fill="none" stroke={col} strokeWidth={sw} strokeLinejoin="round">
        {CHART_LINES.map((d) => (
          <path key={d} d={d} pathLength={1} data-cl="" />
        ))}
      </g>
      {signs.map((s) => (
        <text
          key={`s${s.x}-${s.y}`}
          x={s.x}
          y={s.y}
          textAnchor="middle"
          fontFamily="Manrope,sans-serif"
          fontSize={11.5}
          fontWeight={600}
          fill={sub}
          data-pl=""
          style={POP}
        >
          {s.n}
        </text>
      ))}
      {items.map((it, i) => (
        <text
          key={`p${i}`}
          x={it.x}
          y={it.y}
          textAnchor="middle"
          fontFamily={hi ? "'Tiro Devanagari Hindi',serif" : "Manrope,sans-serif"}
          fontSize={it.asc ? fs - 3 : fs}
          fontWeight={hi ? 400 : 700}
          letterSpacing={it.asc && !hi ? 1 : 0}
          fill={it.asc ? col : ink}
          data-pl=""
          style={POP}
        >
          {it.t}
          {it.r && (
            <tspan fontSize={fs - 6} dx={1} dy={-5}>
              R
            </tspan>
          )}
        </text>
      ))}
    </svg>
  );
}
