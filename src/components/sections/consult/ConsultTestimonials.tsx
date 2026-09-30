import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { Stars } from "@/components/ui/Rating";
import { MandalaG } from "@/components/ui/ornaments";
import type { Testimonial } from "@/lib/api/consult";
import { routes } from "@/lib/routes";
import { EYEBROW, rich } from "./ui";

/* §5 Testimonials (Consultations.dc.html 185–215). Sand band: heading + the 4.9 rating block, then
   the five written testimonials and a video card. Below 768 they form a snap rail (cards 84% wide,
   bleeding to the screen edges); from 768 a masonry of CSS columns (2, or 3 from 1100px).
   Every third quote is set at 20px, the rest at 18px. The video card opens /videos (placeholder
   until the real testimonial video exists). */

const CARD = "snap-start break-inside-avoid mb-5 max-md:flex-[0_0_84%]";

export async function ConsultTestimonials({ items }: { items: Testimonial[] }) {
  const t = await getTranslations("consult.testi");

  return (
    <section data-screen-label="Testimonials" className="bg-s1 shadow-hair-y">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
        <div className="mb-[clamp(28px,4vw,44px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={`${EYEBROW} text-g7`}>{t("eyebrow")}</span>
            <h2
              lang="en"
              className="m-0 font-display text-[clamp(32px,3.8vw,50px)] leading-[1.08] font-normal tracking-[-.018em] text-em9 font-soft"
            >
              {t.rich("title", rich())}
            </h2>
          </div>
          <div data-reveal="1" className="flex items-center gap-3.5">
            <span className="font-display text-[48px] leading-none font-normal text-em9 tabular">4.9</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-[15px] w-[84px]">
                <Stars label={t("rated")} />
              </span>
              <span className="font-sans text-[13px] leading-[1.3] font-medium text-ink6">{t("from")}</span>
            </span>
          </div>
        </div>

        <div className="mx-[-16px] no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-1.5 md:mx-0 md:block md:columns-2 md:gap-x-5 md:overflow-visible md:p-0 w1100:columns-3">
          {items.map((q, i) => (
            <article
              key={q.n}
              lang="en"
              className={`${CARD} flex flex-col gap-4 rounded-btn bg-cream p-6 shadow-ring-sand`}
            >
              <span className="block h-[13px] w-[72px]">
                <Stars />
              </span>
              <p
                className={`m-0 font-display leading-[1.45] font-normal text-pretty text-em9 [font-variation-settings:'SOFT'_50] ${
                  i % 3 === 0 ? "text-[20px]" : "text-[18px]"
                }`}
              >
                {q.q}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-s2 pt-3.5">
                <span className="flex flex-col gap-[3px]">
                  <span className="font-sans text-[14px] leading-[1.2] font-semibold text-ink">{q.n}</span>
                  <span className="font-sans text-[12.5px] leading-[1.2] font-medium text-ink6">{q.c}</span>
                </span>
                <span className="inline-flex h-[26px] items-center rounded-pill bg-em1 px-2.5 font-sans text-[11.5px] leading-none font-semibold whitespace-nowrap text-em7">
                  {q.s}
                </span>
              </div>
            </article>
          ))}
          <Link
            href={routes.videos}
            aria-label={t("videoAria")}
            className={`${CARD} relative block aspect-[4/5] w-full overflow-hidden rounded-btn bg-n9 p-0 text-left no-underline`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 400 500"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 block"
            >
              <defs>
                <linearGradient id="cons-vtg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#0A1F1A" stopOpacity="0" />
                  <stop offset="1" stopColor="#0A1F1A" />
                </linearGradient>
              </defs>
              <rect width="400" height="500" fill="#0A1F1A" />
              <g transform="translate(200 220)" opacity=".22">
                <MandalaG R={200} col="#D9B96A" sw={0.8} />
              </g>
              <rect y="300" width="400" height="200" fill="url(#cons-vtg)" />
            </svg>
            <span className="absolute top-[44%] left-1/2 -mt-[34px] -ml-[34px] grid size-[68px] place-items-center rounded-pill bg-[rgba(10,31,26,.55)] text-g3 shadow-[inset_0_0_0_1.5px_#D9B96A]">
              <Icon name="play" className="ml-1 size-[26px]" />
            </span>
            <span className="absolute right-5 bottom-5 left-5 flex flex-col gap-1.5">
              <span className="font-sans text-[10.5px] leading-none font-semibold tracking-[.14em] text-g3 uppercase hi:tracking-normal">
                {t("videoKicker")}
              </span>
              <span lang="en" className="font-display text-[20px] leading-[1.2] font-normal text-iv">
                {t("videoTitle")}
              </span>
              <span className="font-sans text-[12.5px] leading-[1.2] font-medium text-sg3">{t("videoBy")}</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
