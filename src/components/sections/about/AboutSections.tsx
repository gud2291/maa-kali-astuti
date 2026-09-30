import { getTranslations } from "next-intl/server";
import { Icon, type IconName } from "@/components/icons/Icon";
import { Crumbs, EYEBROW, rich } from "@/components/sections/consult/ui";
import { H2, H2N } from "@/components/sections/courses/CoursesSections";
import { Starfield } from "@/components/signature/Starfield";
import { InlineArt } from "@/components/ui/InlineArt";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { Link } from "@/i18n/navigation";
import type { Book, Chapter, IconRow, Video } from "@/lib/api/content";
import { BOOK_SVG } from "@/lib/art/books";
import { CHAPTER_SVG } from "@/lib/art/chapters";
import { PORTRAIT_BG_ABOUT_SVG } from "@/lib/art/portrait";
import { VIDEO_THUMB_SVG } from "@/lib/art/thumbs";
import { bookHref, routes, videoHref } from "@/lib/routes";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { StoryChapters } from "./StoryChapters";

/* About Sadhak Ji (design/About.dc.html 28–197). Copy rule on /hi (F9): Fraunces display text
   (h1/h2, chapter titles, pillar titles, book and video titles) and the story / pillar / book data
   stay English; Manrope UI text is translated. */

const CHAKRA = [
  { ring: "outer", amb: "spin:120" },
  { ring: "middle", amb: "spin:-90" },
  { ring: "inner", amb: "spin:60" },
] as const;

const CREDS: IconName[] = ["cert", "flame", "eye", "scroll"];

/** Ivory mandala in the ink tone (About 33) / gold on the emerald band (183). */
function MandalaBox({ col, className }: { col: string; className: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
        <MandalaG R={296} col={col} sw={1} />
      </svg>
    </div>
  );
}

/** §1 Hero portrait (32–67): copy, credential pills, CTAs; the arch portrait with the S7 chakra
 *  (spin 120 / −90 / 60 s) between the night sky and the silhouette, and the name caption. */
export async function AboutHero() {
  const t = await getTranslations("about");
  const creds = t.raw("hero.creds") as string[];
  return (
    <section data-screen-label="01 About hero" className="relative overflow-hidden bg-iv">
      <MandalaBox col="#7A5C1C" className="top-[-220px] left-[-240px] size-[720px] opacity-[.06]" />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(40px,6vw,96px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,44px)] pb-[clamp(64px,8vw,120px)] min-[980px]:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <Crumbs
            label={t("crumbs.label")}
            items={[{ href: routes.home, t: t("crumbs.home") }, { t: t("crumbs.here") }]}
          />
          <span className={cn(EYEBROW, "text-g7")}>{t.rich("hero.eyebrow", rich())}</span>
          <h1
            lang="en"
            className="m-0 font-display text-[clamp(36px,4.6vw,64px)] leading-[1.06] font-normal tracking-[-.02em] text-balance text-em9 font-soft"
          >
            {t.rich("hero.title", rich())}
          </h1>
          <span lang="hi" className="font-deva text-[clamp(18px,2vw,23px)] leading-[1.35] text-g7">
            {t("hero.deva")}
          </span>
          <p className="m-0 mt-1 max-w-[560px] font-sans text-[clamp(16px,1.3vw,18px)] leading-[1.7] text-pretty text-ink6">
            {t("hero.intro")}
          </p>
          <div className="flex flex-wrap gap-2">
            {creds.map((c, i) => (
              <span
                key={c}
                className="inline-flex h-[34px] items-center gap-[7px] rounded-pill bg-cream px-[13px] font-sans text-[13px] leading-none font-medium whitespace-nowrap text-em7 shadow-ring-sand"
              >
                <Icon name={CREDS[i]} className="size-4 text-g5" />
                {c}
              </span>
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <Link
              href={routes.consultations}
              className="inline-flex h-[52px] items-center gap-2.5 rounded-btn bg-em7 sheen px-6 font-sans text-[15px] leading-none font-semibold text-iv no-underline shadow-ring-gold hover:text-iv"
            >
              <Icon name="calendar" className="size-[18px]" />
              {t("hero.book")}
            </Link>
            <Link
              href={routes.videos}
              className="inline-flex h-[52px] items-center gap-2 rounded-btn bg-iv px-[22px] font-sans text-[15px] leading-none font-semibold text-em7 no-underline shadow-ring-em hover:bg-em1 hover:text-em7"
            >
              <Icon name="youtube" className="size-[18px]" />
              {t("hero.watch")}
            </Link>
          </div>
        </div>

        <div className="relative w-full max-w-[300px] justify-self-center pb-7 md:max-w-[430px]">
          <div className="relative aspect-[300/380]">
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
              <InlineArt svg={PORTRAIT_BG_ABOUT_SVG} uid="ab" />
            </span>
            <div
              aria-hidden="true"
              className="absolute top-[38.4%] left-1/2 aspect-square w-[74%] -translate-x-1/2 -translate-y-1/2 opacity-60"
            >
              {CHAKRA.map((c) => (
                <span key={c.ring} data-amb={c.amb} className="absolute inset-0 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/svg/chakra/${c.ring}-d9b96a.svg`}
                    alt=""
                    width={320}
                    height={320}
                    className="block size-full"
                  />
                </span>
              ))}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/svg/portrait/fg.svg"
              alt={t("hero.portraitAlt")}
              width={300}
              height={380}
              className="absolute inset-0 block size-full"
            />
          </div>
          <div className="absolute bottom-0 left-[-4px] flex max-w-[270px] flex-col gap-1.5 rounded-btn bg-iv px-[18px] py-3.5 shadow-[inset_0_0_0_1px_rgba(184,146,58,.55),0_18px_36px_-20px_rgba(14,59,48,.4)] md:left-[-36px]">
            <span lang="en" className="font-display text-[19px] leading-[1.15] font-normal text-em9">
              {t("hero.capName")}
            </span>
            <span className="font-sans text-[12.5px] leading-[1.45] font-medium text-ink6">{t("hero.capRole")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** §2 His story (69–109): night band with a star sky; header, then the sticky six-chapter story. */
export async function AboutStory({ chapters }: { chapters: Chapter[] }) {
  const t = await getTranslations("about.story");
  const arts = Object.fromEntries(
    chapters.map((c) => [c.k, CHAPTER_SVG[c.k as keyof typeof CHAPTER_SVG] ?? ""]),
  ) as Record<string, string>;
  return (
    <section data-screen-label="02 His story" className="relative bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Starfield seed="ab-sky" n={34} nMob={18} h={1400} />
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(64px,9vw,128px)] pb-[clamp(48px,6vw,96px)]">
        <div className="mb-[clamp(32px,5vw,72px)] flex max-w-[720px] flex-col gap-3">
          <span data-reveal="0" className={cn(EYEBROW, "text-g3")}>
            {t.rich("eyebrow", rich("text-g3"))}
          </span>
          <h2 data-reveal="1" lang="en" className={cn(H2N, "text-[clamp(34px,4.4vw,60px)] leading-[1.05] tracking-[-.02em]")}>
            {t.rich("title", rich("text-g3"))}
          </h2>
        </div>
        <StoryChapters chapters={chapters} arts={arts} />
      </div>
    </section>
  );
}

/** §3 Science, not superstition (111–128): heading column (sticky from 1024) + three pillars. */
export async function AboutPillars({ pillars }: { pillars: IconRow[] }) {
  const t = await getTranslations("about.approach");
  return (
    <section data-screen-label="03 Science, not superstition" className="bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(36px,6vw,104px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,136px)] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div className="top-[110px] flex flex-col gap-4 lg:sticky">
          <span data-reveal="0" className={cn(EYEBROW, "text-g7")}>
            {t("eyebrow")}
          </span>
          <h2
            data-reveal="1"
            lang="en"
            className={cn(H2, "text-[clamp(36px,4.8vw,66px)] leading-[1.02] tracking-[-.022em]")}
          >
            {t.rich("title", rich())}
          </h2>
          <span data-reveal="1" lang="hi" className="font-deva text-[21px] leading-[1.35] text-g7">
            {t("deva")}
          </span>
          <p
            data-reveal="2"
            className="m-0 mt-1.5 max-w-[480px] font-sans text-[16.5px] leading-[1.7] text-pretty text-ink6"
          >
            {t("intro")}
          </p>
        </div>
        <ol className="m-0 list-none border-t border-s2 p-0">
          {pillars.map(([icon, title, d], i) => (
            <li
              key={title}
              data-reveal={i}
              className="grid grid-cols-1 items-start gap-x-7 gap-y-[18px] border-b border-s2 py-[clamp(24px,3vw,40px)] md:grid-cols-[80px_minmax(0,1fr)]"
            >
              <span className="font-display text-[clamp(40px,4vw,56px)] leading-none font-normal text-g5 italic">
                {`${["i", "ii", "iii"][i]}.`}
              </span>
              <span className="flex flex-col gap-3">
                <span className="flex items-center gap-3">
                  <span className="grid size-10 flex-none place-items-center rounded-pill bg-s1 text-g5 shadow-[inset_0_0_0_1px_rgba(184,146,58,.5)]">
                    <Icon name={icon} className="size-5" />
                  </span>
                  <span lang="en" className="font-display text-[clamp(22px,2.2vw,28px)] leading-[1.2] font-normal text-em9">
                    {title}
                  </span>
                </span>
                <span lang="en" className="max-w-[560px] font-sans text-[16px] leading-[1.7] text-pretty text-ink6">
                  {d}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** §4 Published works (130–156): sand band; three book covers (3 cols ≥900, 2 ≥600) with a
 *  WhatsApp "Ask about a copy" link each. */
export async function AboutBooks({ books }: { books: Book[] }) {
  const t = await getTranslations("about.books");
  return (
    <section data-screen-label="04 Published works" className="bg-s1 shadow-hair-y">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(32px,4vw,56px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
              {t.rich("title", rich())}
            </h2>
            <span lang="hi" className="font-deva text-[19px] leading-[1.35] text-g7">
              {t("deva")}
            </span>
          </div>
          <p data-reveal="1" className="m-0 max-w-[420px] font-sans text-[15.5px] leading-[1.65] text-ink6">
            {t("intro")}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-[clamp(20px,3vw,40px)] gap-y-[clamp(28px,4vw,56px)] min-[600px]:grid-cols-2 w900:grid-cols-3">
          {books.map((b, i) => (
            <article key={b.key} data-reveal={i} className="flex flex-col gap-[18px]">
              <span className="relative mx-auto block aspect-[3/4] w-[78%] max-w-[260px] transition-transform duration-[400ms] ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:-rotate-1">
                <InlineArt svg={BOOK_SVG[b.key as keyof typeof BOOK_SVG] ?? ""} uid={`ab${b.key}`} />
              </span>
              <span className="h-px bg-[linear-gradient(90deg,rgba(184,146,58,0),rgba(184,146,58,.6),rgba(184,146,58,0))]" />
              <span className="flex flex-col items-center gap-2 text-center">
                <span lang="hi" className="font-deva text-[23px] leading-[1.25] text-em9">
                  {b.hi.join(" ")}
                </span>
                <span lang="en" className="font-display text-[18px] leading-[1.3] font-normal text-ink italic">
                  {b.en}
                </span>
                <span
                  lang="en"
                  className="font-sans text-[11px] leading-[1.3] font-semibold tracking-[.12em] text-g7 uppercase"
                >
                  {b.year} · {b.pages}
                </span>
                <span lang="en" className="max-w-[340px] font-sans text-[14.5px] leading-[1.6] text-pretty text-ink6">
                  {b.line}
                </span>
                <a
                  href={waLink(t("askText", { title: b.en }))}
                  target="_blank"
                  rel="noopener"
                  className="mt-1 inline-flex min-h-10 items-center gap-[7px] font-sans text-[13.5px] leading-none font-semibold text-em7 no-underline hover:text-em7"
                >
                  <Icon name="whatsapp" className="size-4" />
                  {t("ask")}
                </a>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** §5 Discourses (158–180): three videos (v1, v3, v5), each linking to /videos?v=<id>. */
export async function AboutMedia({ videos, cats }: { videos: Video[]; cats: Record<string, string> }) {
  const t = await getTranslations("about.media");
  return (
    <section data-screen-label="05 Media" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(24px,3.4vw,44px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
              {t.rich("title", rich())}
            </h2>
          </div>
          <Link
            href={routes.videos}
            className="inline-flex items-center gap-2 bg-[linear-gradient(#B8923A,#B8923A)] bg-[length:100%_1px] bg-bottom bg-no-repeat py-1.5 font-sans text-[14px] leading-[1.3] font-semibold text-em7 no-underline hover:text-em7"
          >
            {t("all")}
            <Icon name="arrowR" className="size-[15px]" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-[clamp(16px,2vw,28px)] min-[600px]:grid-cols-2 w900:grid-cols-3">
          {videos.map((v, i) => (
            <Link
              key={v.id}
              href={videoHref(v.id)}
              data-reveal={i}
              className="flex flex-col gap-3.5 text-ink no-underline hover:text-ink"
            >
              <span className="relative block aspect-video overflow-hidden rounded-btn bg-n9 shadow-[inset_0_0_0_1px_rgba(184,146,58,.35)] transition-transform duration-300 hover:-translate-y-[3px]">
                <span className="absolute inset-0 block">
                  <InlineArt svg={VIDEO_THUMB_SVG[v.id as keyof typeof VIDEO_THUMB_SVG] ?? ""} uid={`abv${v.id}`} />
                </span>
                <span className="absolute top-1/2 left-1/2 -mt-[27px] -ml-[27px] grid size-[54px] place-items-center rounded-pill bg-[rgba(10,31,26,.6)] text-g3 shadow-[inset_0_0_0_1.5px_#D9B96A]">
                  <Icon name="play" className="ml-[3px] size-5" />
                </span>
                <span className="absolute right-2 bottom-2 inline-flex h-[22px] items-center rounded-[2px] bg-[rgba(10,31,26,.85)] px-[7px] font-sans text-[11px] leading-none font-bold text-iv tabular">
                  {v.dur}
                </span>
              </span>
              <span lang="en" className="flex flex-col gap-1.5">
                <span className="font-sans text-[10.5px] leading-[1.2] font-semibold tracking-[.14em] text-g7 uppercase">
                  {cats[v.cat]}
                </span>
                <span className="font-display text-[20px] leading-[1.25] font-normal text-balance text-em9">{v.en}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** §6 Contact band (182–194): emerald; heading + Book / WhatsApp (row from 900, right-aligned). */
export async function AboutCta() {
  const t = await getTranslations("about.cta");
  return (
    <section aria-label={t("label")} className="relative overflow-hidden bg-em7 text-em1">
      <MandalaBox col="#D9B96A" className="top-1/2 right-[-160px] size-[520px] -translate-y-1/2 opacity-10" />
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-x-12 gap-y-6 px-[clamp(16px,4vw,32px)] py-[clamp(48px,7vw,96px)] w900:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-2.5">
          <h2 lang="en" className={cn(H2N, "text-[clamp(30px,3.6vw,48px)] leading-[1.08]")}>
            {t.rich("title", rich("text-g3"))}
          </h2>
          <span className="max-w-[560px] font-sans text-[16px] leading-[1.6] text-sg3">{t("sub")}</span>
        </div>
        <div className="flex flex-wrap justify-start gap-2.5 w900:justify-end">
          <Link
            href={bookHref("kundali")}
            className="inline-flex h-[52px] items-center gap-[9px] rounded-btn bg-g3 px-[22px] font-sans text-[14.5px] leading-none font-bold whitespace-nowrap text-n9 no-underline hover:bg-g4 hover:text-n9"
          >
            <Icon name="calendar" className="size-[18px]" />
            {t("book")}
          </Link>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener"
            className="inline-flex h-[52px] items-center gap-[9px] rounded-btn px-5 font-sans text-[14.5px] leading-none font-semibold whitespace-nowrap text-g1 no-underline shadow-ring-g3 hover:bg-[rgba(217,185,106,.12)] hover:text-iv"
          >
            <Icon name="whatsapp" className="size-[18px]" />
            {t("wa")}
          </a>
        </div>
      </div>
    </section>
  );
}
