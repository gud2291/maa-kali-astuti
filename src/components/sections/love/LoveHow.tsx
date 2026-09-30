"use client";
import { useTranslations } from "next-intl";
import { rich } from "@/components/sections/consult/ui";
import { Starfield } from "@/components/signature/Starfield";
import { love, NUMP } from "@/lib/astro/love";
import { useLoveNames } from "./LoveNames";

/* 01 How it works (Love-Calculator.dc.html 101–138, breakdown 215–222). Night band (28 stars, 16 on
   mobile). Three steps worked through with the typed names (Priya / Arjun until a name has Latin
   letters — INV gotcha 8): ① letter tiles (A=1 … I=9, first 12 letters), ② the digit-sum chain,
   ③ the two ruling grahas and how they relate. 3 columns from 1024. */

type Row = { tiles: { l: string; n: number }[]; steps: string; num: number; planet: string; name: string };

function breakdown(name: string): Row | null {
  const t = String(name || "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();
  if (!t) return null;
  const val = (l: string) => ((l.charCodeAt(0) - 65) % 9) + 1;
  const tiles = [...t].slice(0, 12).map((l) => ({ l, n: val(l) }));
  let sum = [...t].reduce((x, l) => x + val(l), 0);
  const st = [sum];
  while (sum > 9) {
    sum = String(sum)
      .split("")
      .reduce((x, y) => x + +y, 0);
    st.push(sum);
  }
  return { tiles, steps: st.join(" → "), num: sum, planet: NUMP[sum], name: name.trim().split(/\s+/)[0] };
}

const STEP_LI = "flex flex-col gap-4 border-t border-[rgba(217,185,106,.35)] py-6";
const NUMERAL = "font-display text-[40px] leading-none text-g3 italic";
const STEP_T = "font-display text-[22px] leading-[1.25] text-iv";

export function LoveHow() {
  const t = useTranslations("love.how");
  const { a, b } = useLoveNames();
  const exA = breakdown(a) ?? (breakdown("Priya") as Row);
  const exB = breakdown(b) ?? (breakdown("Arjun") as Row);
  const rel = love(exA.name, exB.name).rel;
  const rows = [exA, exB];

  return (
    <section data-screen-label="How it works" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="lv-sky" n={28} nMob={16} w={1440} h={700} />
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(36px,5vw,64px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-4">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase hi:tracking-normal">
              {t("eyebrow")}
            </span>
            <h2
              lang="en"
              className="m-0 font-display text-[clamp(32px,4vw,52px)] leading-[1.06] font-normal tracking-[-.018em] text-balance text-iv font-soft"
            >
              {t.rich("title", rich("text-g3"))}
            </h2>
          </div>
          <p
            data-reveal="1"
            className="m-0 max-w-[460px] font-sans text-[15.5px] leading-[1.65] text-pretty text-sg3"
          >
            {t("lead", { pair: t("pair", { a: exA.name, b: exB.name }) })}
          </p>
        </div>

        <ol className="m-0 grid list-none grid-cols-1 gap-x-[clamp(24px,3vw,48px)] p-0 lg:grid-cols-3">
          <li data-reveal="0" className={STEP_LI}>
            <span aria-hidden="true" className={NUMERAL}>
              १
            </span>
            <span lang="en" className={STEP_T}>
              {t("s1")}
            </span>
            {rows.map((r, i) => (
              <div key={i} role="img" aria-label={t("tilesAria", { name: r.name })} className="flex flex-wrap gap-1">
                {r.tiles.map((x, j) => (
                  <span
                    key={j}
                    aria-hidden="true"
                    className="flex w-[34px] flex-col items-center gap-1 rounded-field bg-n8 pt-[7px] pb-1.5 shadow-[inset_0_0_0_1px_rgba(217,185,106,.3)]"
                  >
                    <span className="font-sans text-[14px] leading-none font-semibold text-iv">{x.l}</span>
                    <span className="font-sans text-[11px] leading-none font-bold text-g3">{x.n}</span>
                  </span>
                ))}
              </div>
            ))}
          </li>
          <li data-reveal="1" className={STEP_LI}>
            <span aria-hidden="true" className={NUMERAL}>
              २
            </span>
            <span lang="en" className={STEP_T}>
              {t("s2")}
            </span>
            {rows.map((r, i) => (
              <span
                key={i}
                className="flex items-center justify-between gap-3 border-b border-dotted border-[rgba(217,185,106,.4)] py-2.5 font-sans text-[14.5px] leading-[1.3] font-semibold text-em1 tabular"
              >
                <span>{r.name}</span>
                <span className="text-sg3">{r.steps}</span>
              </span>
            ))}
          </li>
          <li data-reveal="2" className={STEP_LI}>
            <span aria-hidden="true" className={NUMERAL}>
              ३
            </span>
            <span lang="en" className={STEP_T}>
              {t("s3")}
            </span>
            <span className="flex items-center gap-3">
              {rows.map((r, i) => (
                <span key={i} className="flex flex-col items-center gap-1.5">
                  <span className="grid size-14 place-items-center rounded-pill bg-n8 font-display text-[26px] leading-none text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.6)]">
                    {r.num}
                  </span>
                  <span className="font-sans text-[12.5px] leading-[1.2] font-semibold text-em1">{r.planet}</span>
                </span>
              ))}
            </span>
            <span className="font-sans text-[14.5px] leading-[1.6] font-medium text-pretty text-sg3">
              {t(`rel.${rel}`, { a: exA.planet, b: exB.planet })}
            </span>
          </li>
        </ol>
      </div>
    </section>
  );
}
