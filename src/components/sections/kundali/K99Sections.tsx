import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { EYEBROW, rich } from "@/components/sections/consult/ui";
import { Starfield } from "@/components/signature/Starfield";
import { FaqList } from "@/components/ui/FaqList";
import { InlineArt } from "@/components/ui/InlineArt";
import { Stars } from "@/components/ui/Rating";
import { REPORT_PAGE_K99_SVG } from "@/lib/art/report-pages";
import { fmt } from "@/lib/core/format";
import { routes, serviceHref } from "@/lib/routes";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { K99_CONTENTS, K99_SAMPLES } from "./k99-data";
import { UNDERLINE_LINK } from "./ui";

/* Server-rendered parts of the Kundali ₹99 page (Kundali-99.dc.html). The interactive hero card,
   the preview and the pay sheet live in KundaliTool. Copy rule on /hi (F9): display headings,
   report contents, captions and reviews stay English; Manrope UI text is translated. */

const H2 = "m-0 font-display font-normal tracking-[-.018em] text-balance font-soft";

/** Hero intro (35–46): breadcrumb, eyebrow, h1, Devanagari line, ₹99 · MRP · 80% OFF · taxes. */
export async function K99Intro({
  priceInr = 99,
  mrpInr = 499,
}: {
  priceInr?: number;
  mrpInr?: number;
} = {}) {
  const t = await getTranslations("k99");
  const off = mrpInr > priceInr ? Math.round(((mrpInr - priceInr) / mrpInr) * 100) : 0;
  return (
    <>
      <nav
        aria-label={t("crumbs.aria")}
        className="flex items-center gap-2 font-sans text-[12.5px] leading-none font-medium text-sg5"
      >
        <Link href={routes.home} className="text-sg5 no-underline hover:text-sg5">
          {t("crumbs.home")}
        </Link>
        <span aria-hidden="true" className="text-g5">
          /
        </span>
        <span aria-current="page" className="text-em1">
          {t("crumbs.here")}
        </span>
      </nav>
      <span className={`${EYEBROW} text-g3`}>{t.rich("hero.eyebrow", rich())}</span>
      <h1
        lang="en"
        className="m-0 font-display text-[clamp(40px,5.4vw,74px)] leading-[1.02] font-normal tracking-[-.022em] text-balance text-iv font-soft"
      >
        {t.rich("hero.title", rich("text-g3"))}
      </h1>
      <span lang="hi" className="font-deva text-[clamp(18px,2vw,22px)] leading-[1.35] text-g3">
        आपकी संपूर्ण जन्म कुंडली, केवल ₹{priceInr} में
      </span>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
        <span className="font-sans text-[40px] leading-none font-bold tracking-[-.01em] text-iv tabular">₹{priceInr}</span>
        <span className="font-sans text-[17px] leading-none font-medium text-sg5 tabular line-through">
          {fmt(mrpInr)}
        </span>
        {off > 0 && (
          <span className="inline-flex h-6 items-center rounded-pill bg-sin px-2.5 font-sans text-[11px] leading-none font-bold tracking-[.06em] text-iv">
            {t("hero.off", { n: off })}
          </span>
        )}
        <span className="font-sans text-[12.5px] leading-none font-medium text-sg3">{t("hero.tax")}</span>
      </div>
    </>
  );
}

/** Hero facts (48–56): lead paragraph, 3 icon rows, the rating line. */
export async function K99Facts() {
  const t = await getTranslations("k99.hero");
  const icons: IconName[] = ["scroll", "whatsapp", "kundali"];
  const facts = t.raw("facts") as string[];
  return (
    <>
      <p className="m-0 max-w-[520px] font-sans text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-pretty text-sg3">
        {t("lead")}
      </p>
      <ul className="m-0 flex max-w-[520px] list-none flex-col p-0">
        {facts.map((x, i) => (
          <li
            key={x}
            className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3.5 border-t border-[rgba(217,185,106,.22)] py-3.5"
          >
            <span className="grid size-10 place-items-center rounded-pill bg-n8 text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.4)]">
              <span className="block size-5">
                <Icon name={icons[i]} />
              </span>
            </span>
            <span className="font-sans text-[15px] leading-[1.5] font-medium text-em1">{x}</span>
          </li>
        ))}
      </ul>
      <span className="flex items-center gap-2.5 font-sans text-[13px] leading-[1.3] font-semibold text-em1">
        <span className="block h-3.5 w-[84px]">
          <Stars col="#D9B96A" />
        </span>
        {t("rating")}
      </span>
    </>
  );
}

/** 01 What's inside (260–279): sand; heading left, the 10-row table of contents right. */
export async function K99Contents() {
  const t = await getTranslations("k99.toc");
  return (
    <section data-screen-label="What's inside" className="bg-s1 shadow-hair-y">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,88px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.3fr)]">
        <div data-reveal="0" className="flex flex-col gap-3">
          <span className={`${EYEBROW} text-g7`}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)] leading-[1.08] text-em9")}>
            {t.rich("title", rich())}
          </h2>
          <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-g7">
            कुंडली में क्या-क्या है
          </span>
          <p className="m-0 mt-1 max-w-[380px] font-sans text-[15.5px] leading-[1.65] text-pretty text-ink6">
            {t("lead")}
          </p>
        </div>
        <ol lang="en" className="m-0 flex list-none flex-col border-t border-[rgba(184,146,58,.5)] p-0">
          {K99_CONTENTS.map(([title, p], i) => (
            <li
              key={title}
              data-reveal={i % 3}
              className="flex items-baseline gap-3.5 border-b border-[rgba(184,146,58,.28)] py-4"
            >
              <span className="w-7 flex-none font-display text-[15px] leading-none text-g7 italic tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-[clamp(17px,1.6vw,20px)] leading-[1.3] text-em9">{title}</span>
              <span
                aria-hidden="true"
                className="min-w-4 flex-1 -translate-y-1 border-b-[1.5px] border-dotted border-[rgba(184,146,58,.7)]"
              />
              <span className="flex-none font-sans text-[13px] leading-none font-semibold text-ink6 tabular">
                p. {p}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const TILT = [
  "md:[transform:rotate(-4deg)_translateY(20px)]",
  "md:[transform:rotate(-1.2deg)]",
  "md:[transform:rotate(1.2deg)]",
  "md:[transform:rotate(4deg)_translateY(20px)]",
];

/** 02 Sample pages (281–298): night (14 stars, 8 on mobile); 4 pages fanned from 768, a snap
 *  rail of 72%-wide pages below it. `safe center` keeps the rail's first page reachable. */
export async function K99Samples() {
  const t = await getTranslations("k99.samples");
  const pages = REPORT_PAGE_K99_SVG as Record<string, string>;
  return (
    <section data-screen-label="Sample pages" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="k99-sky2" n={14} nMob={8} w={1440} h={800} />
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(28px,4vw,56px)] flex flex-col items-center gap-3 text-center">
          <span data-reveal="0" className={`${EYEBROW} text-g3`}>
            {t("eyebrow")}
          </span>
          <h2
            data-reveal="1"
            lang="en"
            className={cn(H2, "max-w-[720px] text-[clamp(32px,4vw,52px)] leading-[1.06] text-iv")}
          >
            {t.rich("title", rich("text-g3"))}
          </h2>
          <span data-reveal="2" className="max-w-[460px] font-sans text-[14px] leading-[1.55] font-medium text-sg3">
            {t("lead")}
          </span>
        </div>
        <div className="mx-[-16px] no-scrollbar flex snap-x snap-mandatory items-start [justify-content:safe_center] gap-4 overflow-x-auto px-4 pt-3 pb-6 md:mx-0 md:gap-[clamp(16px,2.4vw,36px)] md:overflow-visible md:px-0 md:pt-6 md:pb-2">
          {K99_SAMPLES.map((cap, i) => (
            <figure
              key={cap}
              data-reveal={i}
              className={`m-0 flex flex-[0_0_72%] snap-center flex-col gap-3.5 md:flex-[0_0_min(24%,300px)] ${TILT[i]}`}
            >
              <span className="block aspect-[3/4] overflow-hidden rounded-3 shadow-[0_40px_60px_-30px_rgba(0,0,0,.65),0_0_0_1px_rgba(217,185,106,.35)] transition-transform duration-400 ease-mka hover:-translate-y-2">
                <InlineArt svg={pages[`sm${i}`]} uid={`sm${i}`} />
              </span>
              <figcaption
                lang="en"
                className="flex items-baseline justify-center gap-2 font-sans text-[13.5px] leading-[1.35] font-medium text-em1"
              >
                <span className="font-display text-[14px] leading-none text-g3 italic">{`0${i + 1}`}</span>
                {cap}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

type Review = { q: string; n: string; c: string };

/** 03 From readers (300–318): the first review as a large quote, the rest as a list + consult link. */
export async function K99Reviews({ reviews }: { reviews: Review[] }) {
  const t = await getTranslations("k99.reviews");
  const [r0, ...rest] = reviews;
  return (
    <section data-screen-label="Reviews" className="bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(32px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <figure data-reveal="0" className="m-0 flex flex-col gap-[22px]">
          <span className={`${EYEBROW} text-g7`}>{t("eyebrow")}</span>
          <span className="block h-4 w-24">
            <Stars col="#D9B96A" label={t("stars")} />
          </span>
          <blockquote
            lang="en"
            className="m-0 font-display text-[clamp(26px,3.2vw,40px)] leading-[1.22] tracking-[-.01em] text-pretty text-em9 italic [font-variation-settings:'SOFT'_50]"
          >
            “{r0.q}”
          </blockquote>
          <figcaption className="flex items-center gap-3">
            <span className="h-px w-7 bg-g5" />
            <span className="font-sans text-[14px] leading-[1.3] font-bold text-ink">{r0.n}</span>
            <span className="font-sans text-[13.5px] leading-[1.3] font-medium text-ink6">{r0.c}</span>
          </figcaption>
        </figure>
        <div className="flex flex-col border-t border-s2">
          {rest.map((r, i) => (
            <figure key={r.n} data-reveal={i + 1} className="m-0 flex flex-col gap-2.5 border-b border-s2 py-[22px]">
              <blockquote lang="en" className="m-0 font-sans text-[16px] leading-[1.6] text-pretty text-ink">
                “{r.q}”
              </blockquote>
              <figcaption className="font-sans text-[13px] leading-[1.3] font-semibold text-ink6">
                <span className="text-ink">{r.n}</span> · {r.c}
              </figcaption>
            </figure>
          ))}
          <Link href={serviceHref("kundali")} className={cn(UNDERLINE_LINK, "mt-[22px]")}>
            {t("link")}
            <span className="block size-[15px] flex-none">
              <Icon name="arrowR" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** 04 Questions (320–329): sand; FaqList set kundali99. Extra bottom room below 768 for the pay bar. */
export async function K99Faq({ items }: { items: [string, string][] }) {
  const t = await getTranslations("k99.faq");
  return (
    <section data-screen-label="Kundali FAQ" className="bg-s1 shadow-hair-top">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] pt-[clamp(56px,8vw,112px)] pb-[clamp(88px,10vw,112px)] md:pb-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)]">
        <div className="flex flex-col gap-3">
          <span className={`${EYEBROW} text-g7`}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.4vw,44px)] leading-[1.1] text-em9")}>
            {t.rich("title", rich())}
          </h2>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 self-start font-sans text-[14px] leading-none font-semibold text-em7 no-underline"
          >
            <span className="block size-[17px]">
              <Icon name="whatsapp" />
            </span>
            {t("askWa")}
          </a>
        </div>
        <div lang="en">
          <FaqList items={items} openFirst />
        </div>
      </div>
    </section>
  );
}
