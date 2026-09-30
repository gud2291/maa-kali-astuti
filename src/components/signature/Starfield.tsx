import { rng } from "@/lib/core/rng";

/* Seeded twinkling star sky — JSX port of M.stars(n, w, h, seed) (mka-core.js 171), in a
   `slice`-fitted SVG that fills its box. The same seed gives the same prefix, so the mobile count
   is the first `nMob` stars of the desktop list (the rest hide below 768). Server-safe. */
export function Starfield({
  seed,
  n,
  nMob = n,
  w = 1440,
  h = 900,
}: {
  seed: string;
  n: number;
  nMob?: number;
  w?: number;
  h?: number;
}) {
  const R = rng(seed);
  const stars = Array.from({ length: n }, () => {
    const r = R() < 0.15 ? 1.4 : R() < 0.5 ? 0.9 : 0.6;
    return { cx: (R() * w).toFixed(1), cy: (R() * h).toFixed(1), r };
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" className="block">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#D9B96A"
          data-amb="twinkle"
          className={i >= nMob ? "max-md:hidden" : undefined}
        />
      ))}
    </svg>
  );
}
