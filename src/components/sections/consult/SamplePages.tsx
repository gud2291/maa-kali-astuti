import { getTranslations } from "next-intl/server";
import { Starfield } from "@/components/signature/Starfield";
import { InlineArt } from "@/components/ui/InlineArt";
import { MandalaG } from "@/components/ui/ornaments";
import type { Service } from "@/lib/api/consult";
import { REPORT_PAGE_CONSULT_SVG } from "@/lib/art/report-pages";
import { EYEBROW, rich } from "./ui";

/* §3 "What you receive" (Consultation-Detail.dc.html 87–106). Night band (36 stars, 20 on mobile;
   a faint mandala bottom-left). Three 3:4 sample report pages: fanned on ≥768 (−3° / 0 / 3°, the
   outer two 18px lower, each min(30%, 340px)) and lifting 8px on hover; below 768 a snap rail of
   74%-wide pages bleeding to the edges. `safe center` keeps the rail's first page reachable when it
   overflows (the design's plain `center` would clip it). */

const TILT = ["md:[transform:rotate(-3deg)_translateY(18px)]", "", "md:[transform:rotate(3deg)_translateY(18px)]"];

export async function SamplePages({ s }: { s: Service }) {
  const t = await getTranslations("consult.detail");
  const pages = REPORT_PAGE_CONSULT_SVG as Record<string, string>;

  return (
    <section data-screen-label="Sample pages" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="cd-sky" n={36} nMob={20} w={1440} h={700} />
        <svg
          viewBox="0 0 1440 700"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 block"
        >
          <g transform="translate(90 620)" opacity=".1">
            <MandalaG R={280} col="#D9B96A" sw={0.8} />
          </g>
        </svg>
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(36px,5vw,64px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-[18px]">
          <div className="flex max-w-[600px] flex-col gap-3">
            <span data-reveal="0" className={`${EYEBROW} text-g3`}>
              {t("samplesEyebrow")}
            </span>
            <h2
              data-reveal="1"
              lang="en"
              className="m-0 font-display text-[clamp(32px,4vw,52px)] leading-[1.06] font-normal tracking-[-.018em] text-iv font-soft"
            >
              {t.rich("samplesTitle", rich("text-g3"))}
            </h2>
          </div>
          <span data-reveal="2" className="max-w-[320px] font-sans text-[13.5px] leading-[1.5] font-medium text-sg3">
            {t("samplesNote")}
          </span>
        </div>

        <div className="mx-[-16px] no-scrollbar flex snap-x snap-mandatory items-start [justify-content:safe_center] gap-4 overflow-x-auto px-4 pt-3 pb-5 md:mx-0 md:gap-[clamp(20px,3vw,44px)] md:overflow-visible md:px-0">
          {s.samples.map(([, caption], i) => (
            <figure
              key={caption}
              data-reveal={i}
              className={`m-0 flex flex-[0_0_74%] snap-center flex-col gap-4 md:flex-[0_0_min(30%,340px)] ${TILT[i]}`}
            >
              <span className="block aspect-[3/4] overflow-hidden rounded-3 shadow-[0_40px_60px_-30px_rgba(0,0,0,.6),0_0_0_1px_rgba(217,185,106,.35)] transition-transform duration-400 ease-mka hover:-translate-y-2">
                <InlineArt svg={pages[s.key + i]} uid={s.key + i} />
              </span>
              <figcaption
                lang="en"
                className="flex items-baseline gap-2.5 font-sans text-[13.5px] leading-[1.35] font-medium text-em1"
              >
                <span className="font-display text-[14px] leading-none font-normal text-g3 italic">
                  {"0" + (i + 1)}
                </span>
                {caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
