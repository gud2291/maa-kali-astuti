/* Hero arch — JSX port of H.archClip + H.archFrame (mka-home.js 125–134).
   The frame draws beyond its 400×500 box (finial, curls, dotted outer arc), so it must be
   inline SVG with overflow visible; an <img> would crop it. */
import { ARCH_PATH } from "@/lib/art/arch";

const f1 = (n: number) => (+n).toFixed(1);
const G = "#B8923A";

/** Arch outline offset outward by `o` user units (negative = inward). */
const arc = (o: number) =>
  `M${-o} 500V196C${-o} ${92 - o} ${f1(92 - o * 0.6)} ${f1(22 - o * 0.9)} 200 ${f1(4 - o * 1.1)}C${f1(308 + o * 0.6)} ${f1(22 - o * 0.9)} ${400 + o} ${92 - o} ${400 + o} 196V500`;

const curl = (x: number, s: number) =>
  `M${x} 196H${x - 14 * s}C${x - 21 * s} 196 ${x - 23 * s} 205 ${x - 17 * s} 209C${x - 12.5 * s} 211 ${x - 9 * s} 206.5 ${x - 11.5 * s} 203`;

/** Zero-size SVG holding the objectBoundingBox clip path (`clip-path: url(#id)`). */
export function ArchClip({ id }: { id: string }) {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={id} clipPathUnits="objectBoundingBox">
          <path d={ARCH_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}

/** The gold frame around the arch: four offset arcs, finial, side curls and the base rules. */
export function ArchFrame() {
  const P = (o: number, sw: number, op?: number, dash?: string) => (
    <path
      d={arc(o)}
      fill="none"
      stroke={G}
      strokeWidth={sw}
      opacity={op}
      strokeDasharray={dash}
      strokeLinecap={dash ? "round" : undefined}
      vectorEffect="non-scaling-stroke"
    />
  );
  const curlEl = (x: number, s: number) => (
    <>
      <path
        d={curl(x, s)}
        fill="none"
        stroke={G}
        strokeWidth={1}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={x - 26 * s} cy="196" r="1.4" fill={G} />
    </>
  );
  return (
    <svg viewBox="0 0 400 500" width="100%" height="100%" overflow="visible" aria-hidden="true" className="block">
      {P(-6, 0.8, 0.45)}
      {P(10, 1.3)}
      {P(16, 0.7, 0.55)}
      {P(44, 1, 0.5, "0 5")}
      <g fill="none" stroke={G} strokeWidth={1.1} strokeLinecap="round" vectorEffect="non-scaling-stroke">
        <path d="M200 -13.6V-30" />
        <path d="M200 -52C206 -44 206 -36 200 -30C194 -36 194 -44 200 -52Z" />
        <path d="M200 -30C194 -35 187 -35 182 -31C187 -26.5 194 -26.5 200 -30ZM200 -30C206 -35 213 -35 218 -31C213 -26.5 206 -26.5 200 -30Z" />
      </g>
      <circle cx="200" cy="-59" r="1.8" fill={G} />
      {curlEl(-10, 1)}
      {curlEl(410, -1)}
      <path d="M-36 500H436" stroke={G} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      <path d="M-48 508H448" stroke={G} strokeWidth={0.6} opacity={0.6} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
