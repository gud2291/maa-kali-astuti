import { getTranslations } from "next-intl/server";
import { Icon, type IconName } from "@/components/icons/Icon";
import { Starfield } from "@/components/signature/Starfield";
import { MandalaG } from "@/components/ui/ornaments";
import { StepsReveal } from "./StepsReveal";
import { EYEBROW, rich } from "./ui";

/* §3 "How it works" (Consultations.dc.html 120–149). Night band with a twinkling sky (40 stars,
   22 on mobile) and a faint mandala bottom-right. Four numbered steps (१–४) on a gold rail: one
   column with the circle on the left below 900px, four columns above. Office facts close it. */

const DEVA = ["१", "२", "३", "४"];

export async function HowItWorks({ icons }: { icons: IconName[] }) {
  const t = await getTranslations("consult.how");
  const steps = t.raw("steps") as { t: string; d: string }[];

  return (
    <section data-screen-label="How it works" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="cons-sky" n={40} nMob={22} w={1440} h={640} />
        <svg
          viewBox="0 0 1440 640"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 block"
        >
          <g transform="translate(1320 560)" opacity=".1">
            <MandalaG R={300} col="#D9B96A" sw={0.8} />
          </g>
        </svg>
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(40px,6vw,72px)] flex max-w-[640px] flex-col gap-3">
          <span data-reveal="0" className={`${EYEBROW} text-g3`}>
            {t.rich("eyebrow", rich("text-g3"))}
          </span>
          <h2
            data-reveal="1"
            lang="en"
            className="m-0 font-display text-[clamp(32px,4vw,54px)] leading-[1.06] font-normal tracking-[-.018em] text-iv font-soft"
          >
            {t.rich("title", rich("text-g3"))}
          </h2>
          <p data-reveal="2" className="m-0 font-sans text-[16px] leading-[1.65] text-pretty text-sg3">
            {t("body")}
          </p>
        </div>

        <StepsReveal>
          <ol className="relative m-0 grid list-none grid-cols-1 gap-[34px] p-0 w900:grid-cols-4 w900:gap-7">
            {steps.map((st, i) => (
              <li
                key={i}
                data-step="1"
                className="relative grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-5 gap-y-[18px] w900:grid-cols-1"
              >
                <span
                  aria-hidden="true"
                  className="relative grid size-14 place-items-center rounded-pill bg-n9 font-deva text-[24px] leading-none text-g3 shadow-ring-g3"
                >
                  {DEVA[i]}
                </span>
                <div className="flex flex-col gap-[9px] pt-0.5 w900:pt-1">
                  <Icon name={icons[i]} className="size-6 text-g3" />
                  <span lang="en" className="font-display text-[22px] leading-[1.2] font-normal text-iv">
                    {st.t}
                  </span>
                  <span className="max-w-[280px] font-sans text-[14.5px] leading-[1.6] text-pretty text-sg3">
                    {st.d}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </StepsReveal>

        <div className="mt-[clamp(40px,5vw,64px)] flex flex-wrap gap-x-[22px] gap-y-2.5 border-t border-[rgba(217,185,106,.2)] pt-[22px] font-sans text-[13.5px] leading-[1.4] font-medium text-sg3">
          <span className="flex items-center gap-2">
            <Icon name="clock" className="size-4 text-g3" />
            {t("hours")}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="returns" className="size-4 text-g3" />
            {t("reschedule")}
          </span>
          <span className="flex items-center gap-2">
            <Icon name="lock" className="size-4 text-g3" />
            {t("private")}
          </span>
        </div>
      </div>
    </section>
  );
}
