import "server-only";

import { CHART_LINES, chartLayout } from "@/lib/astro/chart";
import { toKundali, toKundaliD9 } from "@/lib/astro/from-snapshot";
import type { ChartSnapshot } from "@/lib/domain/kundali";
import type { Kundali } from "@/lib/astro/kundali";

export type ChartType = "d1" | "chandra" | "d9";

type Props = {
  chart: ChartSnapshot;
  type: ChartType;
  title?: string;
  lang?: "en" | "hi";
  className?: string;
};

export function ReportChart({ chart, type, title, lang = "en", className }: Props) {
  const hi = lang === "hi";

  let K: Kundali;
  let defaultTitle = "";

  if (type === "d1") {
    K = toKundali(chart);
    defaultTitle = hi ? "लग्न कुण्डली (D1)" : "Lagna Chart (D1)";
  } else if (type === "d9") {
    K = toKundaliD9(chart);
    defaultTitle = hi ? "नवमांश कुण्डली (D9)" : "Navamsa Chart (D9)";
  } else {
    // Chandra Chart (Moon as lagna)
    const base = toKundali(chart);
    const moonSign = chart.moonSign;
    K = {
      ...base,
      lagna: moonSign,
      planets: base.planets.map((p) => ({
        ...p,
        house: ((p.sign - moonSign + 12) % 12) + 1,
      })),
    };
    defaultTitle = hi ? "चन्द्र कुण्डली" : "Chandra Chart (Moon Lagna)";
  }

  const chartTitle = title || defaultTitle;
  const { signs, items } = chartLayout(K, hi);

  return (
    <svg
      viewBox="-6 -6 412 412"
      width="100%"
      height="100%"
      role="img"
      aria-label={chartTitle}
      className={className || "chart-svg"}
    >
      <title>{chartTitle}</title>
      {/* Chart lines frame */}
      <g fill="none" stroke="#C5A265" strokeWidth={1.4} strokeLinejoin="round">
        {CHART_LINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* House sign numbers */}
      {signs.map((s) => (
        <text
          key={`s-${s.x}-${s.y}`}
          x={s.x}
          y={s.y}
          textAnchor="middle"
          fontFamily="var(--font-montserrat, Montserrat), sans-serif"
          fontSize={12}
          fontWeight={600}
          fill="#1C6B54"
        >
          {s.n}
        </text>
      ))}

      {/* Planets and Lagna marker */}
      {items.map((it, i) => (
        <text
          key={`p-${i}`}
          x={it.x}
          y={it.y}
          textAnchor="middle"
          fontFamily={
            hi
              ? "var(--font-tiro, 'Tiro Devanagari Hindi'), serif"
              : "var(--font-montserrat, Montserrat), sans-serif"
          }
          fontSize={it.asc ? 12 : 14.5}
          fontWeight={it.asc ? 600 : (hi ? 500 : 700)}
          letterSpacing={it.asc && !hi ? 0.5 : 0}
          fill={it.asc ? "#164E3F" : "#14120E"}
        >
          {it.t}
          {it.r && (
            <tspan fontSize={9.5} dx={1.5} dy={-4} fill="#997A3D" fontWeight={700}>
              R
            </tspan>
          )}
        </text>
      ))}
    </svg>
  );
}
