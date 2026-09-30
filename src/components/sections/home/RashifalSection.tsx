import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { productById } from "@/lib/api/products-index";
import { RASHI } from "@/lib/astro/rashi";
import { rng } from "@/lib/core/rng";
import { productHref } from "@/lib/routes";
import { RashifalWheel, type RashiStone } from "./RashifalWheel";

/* §6 "05 Daily Rashifal" (Home.dc.html 346–435, vRashi 1163–1187). Night band: seeded star sky,
   a faint mandala bottom-right, then the wheel + reading panel (≥768) or the half-dial + card
   rail (<768) — see RashifalWheel. */

/** M.stars(30, 1440, 900, 'hm-rsky'); mobile shows the first 16 (same seed). */
function RashiSky() {
  const R = rng("hm-rsky");
  const stars = Array.from({ length: 30 }, () => {
    const r = R() < 0.15 ? 1.4 : R() < 0.5 ? 0.9 : 0.6;
    return { cx: (R() * 1440).toFixed(1), cy: (R() * 900).toFixed(1), r };
  });
  return (
    <svg viewBox="0 0 1440 900" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" className="block">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#D9B96A"
          data-amb="twinkle"
          className={i >= 16 ? "max-md:hidden" : undefined}
        />
      ))}
    </svg>
  );
}

export function RashifalSection({ buildNow }: { buildNow: number }) {
  // Gemstone cross-sell per rashi: "<Stone> bracelet" → its product page (vRashi 1177).
  const stones: Record<string, RashiStone> = Object.fromEntries(
    RASHI.map((r) => {
      const p = productById(r.stone);
      return [r.key, p ? { name: `${p.name.replace(/ Bracelet.*$/i, "")} bracelet`, href: productHref(p) } : null];
    }),
  );

  return (
    <section lang="en" data-screen-label="05 Daily Rashifal" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <RashiSky />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-240px] bottom-[-280px] size-[680px] opacity-[.06]"
      >
        <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
          <MandalaG R={296} col="#D9B96A" sw={1} />
        </svg>
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(64px,9vw,128px)] pb-[clamp(56px,8vw,120px)]">
        <RashifalWheel buildNow={buildNow} stones={stones} />
      </div>
    </section>
  );
}
