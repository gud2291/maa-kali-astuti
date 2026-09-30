import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { CountGroup, Counter } from "@/components/motion/Counter";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { InlineArt } from "@/components/ui/InlineArt";
import { BOOK_SVG } from "@/lib/art/books";
import { PORTRAIT_HOME_SVG } from "@/lib/art/portrait";
import about from "@/lib/data/about.json";
import { routes } from "@/lib/routes";
import { ABOUT_MINI, ABOUT_STATS } from "./home-data";

/* §12 "11 About Sadhak Ji" (Home.dc.html 721–761, vAbout 1320–1327, count 1265–1268, L3 1254).
   Sand band with gold hairlines. Text (mini timeline, count-up stats, the book card, two CTAs)
   beside the arch portrait with its outline and the founder quote card overlapping the bottom.
   Below 1024 the art comes first; on mobile the arch is 300px and the quote spans the full width. */

export async function AboutTeaser() {
  const t = await getTranslations("home.about");
  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;

  return (
    <section lang="en" data-screen-label="11 About Sadhak Ji" className="relative overflow-hidden bg-s1 shadow-hair-y">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(40px,6vw,104px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,136px)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
        <div className="order-2 flex min-w-0 flex-col gap-[22px] lg:order-1">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(34px,4.2vw,56px)] leading-[1.06] font-normal tracking-[-.02em] text-em9 font-soft">
              <MaskLine>{t("l1")}</MaskLine>
              <MaskLine>{t.rich("l2", { em })}</MaskLine>
            </h2>
            <span lang="hi" className="font-deva text-[19px] leading-[1.35] text-g7">
              {t("deva")}
            </span>
          </MaskText>

          <ol className="m-0 flex list-none flex-col border-t border-[rgba(184,146,58,.4)] p-0">
            {ABOUT_MINI.map(([yr, text], i) => (
              <li
                key={yr}
                data-reveal={i}
                className="grid grid-cols-[110px_minmax(0,1fr)] items-baseline gap-4 border-b border-[rgba(184,146,58,.4)] py-3.5"
              >
                <span className="font-sans text-[12px] leading-[1.3] font-semibold tracking-[.1em] text-g7 tabular">
                  {yr}
                </span>
                <span className="font-sans text-[15.5px] leading-[1.5] font-medium text-ink">{text}</span>
              </li>
            ))}
          </ol>

          <CountGroup className="grid grid-cols-3 gap-4">
            {ABOUT_STATS.map(([v, label]) => (
              <div key={label} className="flex flex-col gap-1.5">
                <span className="font-display text-[clamp(32px,3.6vw,50px)] leading-none font-normal tracking-[-.02em] text-em9 tabular">
                  <Counter value={v} />
                  <span className="text-g5">+</span>
                </span>
                <span className="font-sans text-[13px] leading-[1.4] font-medium text-ink6">{label}</span>
              </div>
            ))}
          </CountGroup>

          <div className="grid grid-cols-[84px_minmax(0,1fr)] items-center gap-[18px] rounded-btn bg-iv p-3.5 shadow-[inset_0_0_0_1px_rgba(184,146,58,.4)]">
            <span className="block aspect-[3/4] w-[84px]">
              <InlineArt svg={BOOK_SVG.satya} uid="hmb" />
            </span>
            <span className="flex flex-col gap-[5px]">
              <span className="font-sans text-[10.5px] leading-[1.2] font-semibold tracking-[.14em] text-g7 uppercase">
                {t("bookEyebrow")}
              </span>
              <span className="font-display text-[19px] leading-[1.2] font-normal text-em9">{t("bookTitle")}</span>
              <span className="font-sans text-[13.5px] leading-[1.5] text-ink6">{t("bookLine")}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={routes.about}
              className="inline-flex h-[52px] items-center gap-2.5 rounded-btn bg-em7 px-6 font-sans text-[15px] leading-none font-semibold text-iv no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5 hover:text-iv"
            >
              {t("story")}
              <Icon name="arrowR" className="size-4" />
            </Link>
            <Link
              href={routes.consultations}
              className="inline-flex h-[52px] items-center rounded-btn bg-iv px-[22px] font-sans text-[15px] leading-none font-semibold text-em7 no-underline shadow-ring-em hover:bg-em1 hover:text-em7"
            >
              {t("consult")}
            </Link>
          </div>
        </div>

        <div className="relative order-1 w-full max-w-[300px] justify-self-center pb-[170px] md:max-w-[420px] md:pb-[120px] lg:order-2">
          <div data-reveal="0" className="relative aspect-[300/380]">
            <span
              aria-hidden="true"
              className="absolute right-[8%] bottom-[-22px] left-[8%] h-10 rounded-[50%] bg-[radial-gradient(closest-side,rgba(14,59,48,.28),rgba(14,59,48,0))]"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 324 404"
              fill="none"
              stroke="#B8923A"
              strokeWidth="1"
              className="pointer-events-none absolute top-[-3.2%] left-[-4%] h-[106.3%] w-[108%] overflow-visible"
            >
              <path d="M2 404V162A160 160 0 0 1 322 162V404" opacity=".55" />
            </svg>
            <span className="absolute inset-0 block">
              <InlineArt svg={PORTRAIT_HOME_SVG} uid="hmp" />
            </span>
          </div>
          <figure
            data-reveal="2"
            className="absolute right-[-8px] bottom-0 left-[-8px] m-0 flex flex-col gap-2.5 rounded-btn bg-iv px-[22px] py-5 shadow-[inset_0_0_0_1px_rgba(184,146,58,.55),0_24px_48px_-24px_rgba(14,59,48,.45)] md:right-[16%] md:left-[-64px]"
          >
            <span aria-hidden="true" className="h-[22px] font-display text-[64px] leading-[.5] text-g5">
              “
            </span>
            <blockquote className="m-0 font-display text-[clamp(19px,1.8vw,23px)] leading-[1.35] font-normal text-pretty text-em9 italic [font-variation-settings:'SOFT'_50]">
              {about.quote}
            </blockquote>
            <figcaption className="font-sans text-[11px] leading-[1.3] font-semibold tracking-[.14em] text-g7 uppercase">
              {t("quoteBy")}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
