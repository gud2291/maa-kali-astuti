import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { Starfield } from "@/components/signature/Starfield";
import { InlineArt } from "@/components/ui/InlineArt";
import { YANTRA_GOLD } from "@/lib/art/yantras";
import { fmt } from "@/lib/core/format";
import courses from "@/lib/data/courses.json";
import { anchors, courseHref } from "@/lib/routes";
import { CourseRail } from "./CourseRail";
import { ROMAN } from "./home-data";

/* §10 "09 Sadhana courses" (Home.dc.html 647–686, vCourses 1301–1312, L3 1252).
   Night band with a seeded star sky (26 desktop / 14 mobile). Copy column (₹50,000 box, enquire
   CTA) beside a horizontally scrolling track of the six courses; each card's yantra draws itself
   (S11) — see CourseRail. One column below 1024; the track bleeds to the right screen edge. */

type CourseKey = keyof typeof YANTRA_GOLD;

export async function CourseTrack() {
  const t = await getTranslations("home.courses");
  const em = (c: ReactNode) => <em className="text-g3 italic">{c}</em>;

  return (
    <section lang="en" data-screen-label="09 Sadhana courses" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="hm-csky" n={26} nMob={14} />
      </div>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(32px,4vw,64px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,136px)] lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)]">
        <div className="flex max-w-[460px] min-w-0 flex-col gap-[18px]">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(36px,4.6vw,64px)] leading-[1.04] font-normal tracking-[-.022em] text-iv font-soft">
              <MaskLine>{t("l1")}</MaskLine>
              <MaskLine>{t.rich("l2", { em })}</MaskLine>
            </h2>
            <span lang="hi" className="font-deva text-[21px] leading-[1.35] text-g3">
              {t("deva")}
            </span>
          </MaskText>
          <p data-reveal="1" className="m-0 font-sans text-[16.5px] leading-[1.7] text-pretty text-sg3">
            {t("intro")}
          </p>
          <div
            data-reveal="2"
            className="flex flex-col gap-2 rounded-btn bg-n8 px-5 py-[18px] shadow-[inset_0_0_0_1px_rgba(217,185,106,.4)]"
          >
            <span className="flex items-baseline gap-2.5">
              <span className="font-sans text-[34px] leading-none font-bold text-iv tabular">{fmt(50000)}</span>
              <span className="font-sans text-[13.5px] leading-[1.3] font-medium text-sg3">{t("per")}</span>
            </span>
            <span className="font-sans text-[13.5px] leading-[1.55] font-medium text-em1">{t("note")}</span>
          </div>
          <Link
            data-reveal="3"
            href={anchors.coursesEnquire}
            className="inline-flex h-[52px] items-center gap-2.5 self-start rounded-btn px-6 font-sans text-[15px] leading-none font-semibold text-g1 no-underline shadow-ring-g3 transition-colors duration-200 hover:bg-[rgba(217,185,106,.12)] hover:text-iv"
          >
            <Icon name="chat" className="size-[18px]" />
            {t("enquire")}
          </Link>
        </div>

        <CourseRail region={t("region")} prev={t("prev")} next={t("next")}>
          {courses.courses.map((c, i) => (
            <Link
              key={c.key}
              href={courseHref(c.key)}
              data-course={c.key}
              draggable={false}
              className="flex flex-[0_0_76%] snap-start flex-col overflow-hidden rounded-btn bg-n8 text-em1 no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.3)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:text-em1 hover:shadow-[inset_0_0_0_1px_#D9B96A,0_30px_60px_-36px_rgba(0,0,0,.7)] md:flex-[0_0_290px]"
            >
              <span className="relative block aspect-square overflow-hidden bg-n9 shadow-[inset_0_-1px_0_rgba(217,185,106,.25)]">
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 aspect-square w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-pill shadow-[inset_0_0_0_1px_rgba(217,185,106,.14)]"
                />
                <span
                  data-yantra={c.key}
                  className="absolute top-1/2 left-1/2 block aspect-square w-[76%] -translate-x-1/2 -translate-y-1/2"
                >
                  <InlineArt svg={YANTRA_GOLD[c.key as CourseKey]} uid={`hc${c.key}`} />
                </span>
                <span className="absolute top-3 left-3 inline-flex h-[26px] items-center gap-1.5 rounded-pill bg-[rgba(10,31,26,.72)] px-2.5 font-sans text-[11.5px] leading-none font-semibold text-g1 tabular shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)]">
                  {t("badge", { n: ROMAN[i], days: c.days })}
                </span>
              </span>
              <span className="flex flex-1 flex-col gap-[9px] px-[18px] pt-[18px] pb-5">
                <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="font-display text-[23px] leading-[1.1] font-normal text-iv font-soft">{c.en}</span>
                  <span lang="hi" className="font-deva text-[17px] leading-[1.3] text-g3">
                    {c.hi}
                  </span>
                </span>
                <span className="font-sans text-[14.5px] leading-[1.6] text-pretty text-sg3">{c.essence}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2.5 font-sans text-[13.5px] leading-none font-bold text-g1">
                  {t("card")}
                  <Icon name="arrowR" className="size-[15px]" />
                </span>
              </span>
            </Link>
          ))}
        </CourseRail>
      </div>
    </section>
  );
}
