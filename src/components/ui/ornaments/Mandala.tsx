import { cn } from "@/lib/utils/cn";

/* JSX port of M.mandala (mka-core.js 163–170): rings + petal bands + dot rings, centred on 0,0. */

const pt = (r: number, t: number) => `${(r * Math.cos(t)).toFixed(1)},${(r * Math.sin(t)).toFixed(1)}`;
function petals(r1: number, r2: number, n: number, w: number, rot = 0) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rot;
    const aw = (w * Math.PI * 2) / n;
    d += `M${pt(r1, a - aw)} Q${pt(r1 + (r2 - r1) * 0.62, a - aw * 1.05)} ${pt(r2, a)} Q${pt(r1 + (r2 - r1) * 0.62, a + aw * 1.05)} ${pt(r1, a + aw)} `;
  }
  return d;
}

type GProps = { R: number; col?: string; sw?: number };

/** The mandala as a `<g>` for use inside another `<svg>` (design call sites embed it). */
export function MandalaG({ R, col = "#D9B96A", sw = 1 }: GProps) {
  const C = (r: number) => <circle r={r.toFixed(1)} />;
  const D = (r: number, n: number, s: number) => (
    <circle
      r={r.toFixed(1)}
      fill="none"
      stroke={col}
      strokeWidth={(s * 2).toFixed(2)}
      strokeLinecap="round"
      strokeDasharray={`0 ${((2 * Math.PI * r) / n).toFixed(3)}`}
    />
  );
  return (
    <g fill="none" stroke={col} strokeWidth={sw}>
      {C(R)}
      {C(R * 0.97)}
      <path d={petals(R * 0.74, R * 0.95, 32, 0.5)} />
      <path d={petals(R * 0.74, R * 0.87, 32, 0.5, Math.PI / 32)} />
      {C(R * 0.72)}
      {D(R * 0.68, 72, R * 0.005 + 0.5)}
      {C(R * 0.64)}
      <path d={petals(R * 0.44, R * 0.63, 16, 0.5)} />
      <path d={petals(R * 0.44, R * 0.55, 16, 0.28)} />
      {C(R * 0.42)}
      <path d={petals(R * 0.2, R * 0.41, 8, 0.46)} />
      {C(R * 0.19)}
      {D(R * 0.155, 24, R * 0.004 + 0.5)}
      {C(R * 0.1)}
      {C(R * 0.035)}
    </g>
  );
}

/** Standalone mandala `<svg>` sized by its wrapper. Add `data-amb="spin:180"` on the wrapper to rotate. */
export function Mandala({ R = 296, col, sw, className }: Partial<GProps> & { className?: string }) {
  const m = R + 2;
  return (
    <svg
      viewBox={`${-m} ${-m} ${2 * m} ${2 * m}`}
      width="100%"
      height="100%"
      aria-hidden="true"
      className={cn("block", className)}
    >
      <MandalaG R={R} col={col} sw={sw} />
    </svg>
  );
}
