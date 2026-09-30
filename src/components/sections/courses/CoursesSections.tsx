import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Icon } from "@/components/icons/Icon";
import { EYEBROW, rich } from "@/components/sections/consult/ui";
import { NightCrumbs } from "@/components/sections/rashifal/ui";
import { Starfield } from "@/components/signature/Starfield";
import { YantraDraw } from "@/components/signature/YantraDraw";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { FaqList } from "@/components/ui/FaqList";
import { InlineArt } from "@/components/ui/InlineArt";
import { Corner, LotusRule } from "@/components/ui/ornaments";
import type { Course, IconRow } from "@/lib/api/content";
import { YANTRA_GOLD, YANTRA_KALI_BG } from "@/lib/art/yantras";
import { fmt } from "@/lib/core/format";
import { courseHref, routes } from "@/lib/routes";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import type { CourseOption } from "@/components/forms/InquiryForm";
import { EnrollLine } from "./EnrollLine";

/* Sadhana Courses (design/Sadhana-Courses.dc.html 27–158). Copy rule on /hi (F9): Fraunces display
   text stays English; Manrope UI text is translated; course data (A.COURSES, A.INCLUDES, A.ENROLL)
   stays English until the phase-B CMS has Hindi fields. */

export const COURSE_FEE = 50000;
type YKey = keyof typeof YANTRA_GOLD;

/** Night-band gold CTA (Sadhana-Courses 44, Course-Detail 44, Rituals 42). */
export const GOLD_CTA =
  "inline-flex h-[52px] items-center gap-[9px] rounded-btn bg-g3 px-6 font-sans text-[15px] leading-none font-bold text-n9 no-underline transition-transform duration-200 hover:-translate-y-px hover:text-n9";
/** Night-band outline CTA (Sadhana-Courses 45, Rituals 43). */
export const GHOST_CTA =
  "inline-flex h-[52px] items-center gap-2 rounded-btn px-5 font-sans text-[15px] leading-none font-semibold text-g1 no-underline shadow-ring-gold-60 hover:bg-[rgba(217,185,106,.1)] hover:text-iv";
/** Light h2 (Fraunces 400, SOFT 40, −.018em). */
export const H2 = "m-0 font-display font-normal leading-[1.08] tracking-[-.018em] text-balance text-em9 font-soft";
/** Night h2. */
export const H2N = "m-0 font-display font-normal leading-[1.06] tracking-[-.018em] text-balance text-iv font-soft";
/** Ivory card-side intro paragraph (15.5px ink6). */
export const LEAD = "m-0 max-w-[460px] font-sans text-[15.5px] leading-[1.65] text-pretty";

/** §1 Hero (31–61): night, star sky, faint kali yantra top-right; copy + fee row + CTAs beside the
 *  "What every course includes" card (1.25fr / .75fr from 1024, aligned to the bottom). */
export async function CoursesHero({ includes }: { includes: IconRow[] }) {
  const t = await getTranslations("sadhana");
  return (
    <section data-screen-label="Courses hero" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="sc-sky" n={28} nMob={16} h={900} />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-[140px] size-[620px] opacity-[.07]"
      >
        <InlineArt svg={YANTRA_KALI_BG} uid="sc-bg" />
      </div>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-end gap-[clamp(32px,5vw,88px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,48px)] pb-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <NightCrumbs
            label={t("crumbs.label")}
            items={[{ href: routes.home, t: t("crumbs.home") }, { t: t("crumbs.courses") }]}
          />
          <span className={cn(EYEBROW, "text-g3")}>{t.rich("hero.eyebrow", rich("text-g3"))}</span>
          <h1
            lang="en"
            className="m-0 font-display text-[clamp(42px,6vw,86px)] leading-none font-normal tracking-[-.024em] text-balance text-iv font-soft"
          >
            {t.rich("hero.title", rich("text-g3"))}
          </h1>
          <span lang="hi" className="font-deva text-[clamp(18px,2vw,23px)] leading-[1.35] text-g3">
            {t("hero.deva")}
          </span>
          <p className="m-0 max-w-[560px] font-sans text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-pretty text-sg3">
            {t("hero.intro")}
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-[18px] border-t border-[rgba(217,185,106,.3)] pt-[22px]">
            <span className="flex flex-col gap-1.5">
              <span className="font-sans text-[10.5px] leading-none font-semibold tracking-[.14em] text-sg5 uppercase hi:tracking-normal">
                {t("hero.feeLabel")}
              </span>
              <span className="font-display text-[clamp(40px,4.4vw,56px)] leading-none font-normal tracking-[-.015em] text-iv tabular">
                {fmt(COURSE_FEE)}
              </span>
              <span className="font-sans text-[13px] leading-[1.3] font-medium text-sg3">{t("hero.feeNote")}</span>
            </span>
            <div className="flex flex-wrap gap-2.5">
              <AnchorLink to="enquire" className={GOLD_CTA}>
                <Icon name="chat" className="size-[17px]" />
                {t("hero.enquire")}
              </AnchorLink>
              <AnchorLink to="six" className={GHOST_CTA}>
                {t("hero.six")}
              </AnchorLink>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col rounded-btn bg-n8 p-[clamp(20px,3vw,32px)] shadow-ring-gold-45">
          <span className={cn(EYEBROW, "mb-1.5 text-g3")}>{t("hero.includes")}</span>
          <ul className="m-0 flex list-none flex-col p-0">
            {includes.map(([icon, title, d], i) => (
              <li
                key={title}
                data-reveal={i}
                className={cn(
                  "grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3.5 py-4",
                  i < includes.length - 1 && "border-b border-[rgba(217,185,106,.2)]",
                )}
              >
                <span className="grid size-10 place-items-center rounded-pill bg-n9 text-g3 shadow-ring-gold-45">
                  <Icon name={icon} className="size-5" />
                </span>
                <span lang="en" className="flex flex-col gap-1">
                  <span className="font-display text-[18px] leading-[1.25] font-normal text-iv">{title}</span>
                  <span className="font-sans text-[13.5px] leading-[1.5] font-medium text-sg3">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** §2 The six sadhanas `#six` (63–90). Cards 1 / 2 (≥640) / 3 (≥1024) columns, the middle column
 *  dropped 48px at 3 columns; night yantra panel (4/3 below 768, square above) whose yantra draws
 *  on view (S11: .35, 1600 ms) and redraws on hover / focus (1800 ms throttle). */
export async function CourseCards({ courses }: { courses: Course[] }) {
  const t = await getTranslations("sadhana.six");
  return (
    <section id="six" data-screen-label="Six sadhanas" className="scroll-mt-[60px] bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(56px,8vw,112px)] pb-[clamp(64px,9vw,136px)]">
        <div className="mb-[clamp(28px,4vw,52px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-4">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
              {t.rich("title", rich())}
            </h2>
          </div>
          <p data-reveal="1" className={cn(LEAD, "text-ink6")}>
            {t("intro")}
          </p>
        </div>
        <YantraDraw className="grid grid-cols-1 items-start gap-[clamp(16px,2vw,28px)] sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <Link
              key={c.key}
              href={courseHref(c.key)}
              data-reveal={i % 3}
              data-yantra-hover=""
              className={cn(
                "flex flex-col overflow-hidden rounded-btn bg-cream text-ink no-underline shadow-ring-sand transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:text-ink hover:shadow-[inset_0_0_0_1px_#B8923A,0_28px_50px_-30px_rgba(14,59,48,.45)]",
                i % 3 === 1 && "lg:mt-12",
              )}
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-n9 md:aspect-square">
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-pill shadow-[inset_0_0_0_1px_rgba(217,185,106,.14)]"
                />
                <span
                  data-yantra=""
                  className="absolute top-1/2 left-1/2 block aspect-square h-[80%] -translate-x-1/2 -translate-y-1/2"
                >
                  <InlineArt svg={YANTRA_GOLD[c.key as YKey]} uid={`c${c.key}`} />
                </span>
                <span className="absolute top-3.5 left-3.5 inline-flex h-[26px] items-center gap-1.5 rounded-pill bg-[rgba(10,31,26,.7)] px-2.5 font-sans text-[11.5px] leading-none font-semibold text-g1 tabular shadow-ring-gold-45">
                  <Icon name="calendar" className="size-[13px]" />
                  {t("days", { n: c.days })}
                </span>
              </span>
              <span className="flex flex-col gap-2.5 p-[clamp(18px,2.4vw,26px)]">
                <span lang="en" className="font-sans text-[10.5px] leading-[1.3] font-semibold tracking-[.14em] text-g7 uppercase">
                  {c.deity}
                </span>
                <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span lang="en" className="font-display text-[clamp(23px,2.2vw,28px)] leading-[1.1] font-normal text-em9 font-soft">
                    {c.en}
                  </span>
                  <span lang="hi" className="font-deva text-[18px] leading-[1.3] text-g7">
                    {c.hi}
                  </span>
                </span>
                <span lang="en" className="font-sans text-[15px] leading-[1.6] text-pretty text-ink6">
                  {c.essence}
                </span>
                <span className="mt-1.5 flex items-center justify-between gap-2.5 border-t border-s2 pt-3.5">
                  <span className="font-sans text-[15px] leading-none font-bold text-em9 tabular">{fmt(COURSE_FEE)}</span>
                  <span className="inline-flex items-center gap-1.5 font-sans text-[13.5px] leading-none font-semibold text-em7">
                    {t("view")}
                    <Icon name="arrowR" className="size-[15px]" />
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </YantraDraw>
      </div>
    </section>
  );
}

const DEVA = ["१", "२", "३", "४", "५"];

/** §3 Enrollment (91–115): night; five steps in a row from 1024 on a faint rail with the gold line
 *  growing on view (EnrollLine); below 1024 they stack, each with its own vertical rule. */
export async function Enrollment({ steps }: { steps: IconRow[] }) {
  const t = await getTranslations("sadhana.enroll");
  return (
    <section data-screen-label="Enrollment process" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="sc-sky2" n={14} nMob={8} h={800} />
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(36px,5vw,64px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-4">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g3")}>{t("eyebrow")}</span>
            <h2 lang="en" className={cn(H2N, "text-[clamp(32px,4vw,52px)]")}>
              {t.rich("title", rich("text-g3"))}
            </h2>
          </div>
          <p data-reveal="1" className={cn(LEAD, "max-w-[440px] text-sg3")}>
            {t("intro")}
          </p>
        </div>
        <div className="relative">
          <span
            aria-hidden="true"
            className="absolute top-6 right-6 left-6 hidden h-px bg-[rgba(217,185,106,.22)] lg:block"
          />
          <EnrollLine />
          <ol className="relative m-0 grid list-none grid-cols-1 gap-x-6 p-0 lg:grid-cols-5">
            {steps.map(([icon, title, d], i) => (
              <li
                key={title}
                data-reveal={i}
                className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-x-[18px] gap-y-3.5 pb-7 lg:grid-cols-1"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-12 bottom-0 left-[23.5px] w-px bg-[rgba(217,185,106,.35)] lg:hidden"
                />
                <span className="relative grid size-12 place-items-center rounded-pill bg-n8 text-g3 shadow-ring-gold-60">
                  <Icon name={icon} className="size-[22px]" />
                </span>
                <span className="flex flex-col gap-1.5 pt-1">
                  <span lang="hi" className="font-deva text-[18px] leading-none text-g3">
                    {DEVA[i]}
                  </span>
                  <span lang="en" className="font-display text-[21px] leading-[1.2] font-normal text-iv">
                    {title}
                  </span>
                  <span lang="en" className="font-sans text-[14.5px] leading-[1.55] text-pretty text-sg3">
                    {d}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** §4 For serious seekers (117–133): sand; a centred cornered frame with the italic policy line,
 *  the lotus rule and three asks (3 columns from 768). */
export async function SeriousSeekers() {
  const t = await getTranslations("sadhana.seekers");
  const asks = t.raw("asks") as { t: string; d: string }[];
  const corner = "absolute block size-11";
  return (
    <section data-screen-label="For serious seekers" className="bg-s1 shadow-[inset_0_-1px_0_rgba(184,146,58,.35)]">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="relative mx-auto max-w-[860px] px-[clamp(20px,5vw,72px)] py-[clamp(28px,5vw,64px)] text-center">
          <span aria-hidden="true" className={cn(corner, "top-0 left-0")}>
            <Corner />
          </span>
          <span aria-hidden="true" className={cn(corner, "top-0 right-0 -scale-x-100")}>
            <Corner />
          </span>
          <span aria-hidden="true" className={cn(corner, "bottom-0 left-0 -scale-y-100")}>
            <Corner />
          </span>
          <span aria-hidden="true" className={cn(corner, "right-0 bottom-0 scale-[-1]")}>
            <Corner />
          </span>
          <span data-reveal="0" className={cn(EYEBROW, "block text-g7")}>
            {t("eyebrow")}
          </span>
          <p
            data-reveal="1"
            lang="en"
            className="m-0 mt-[22px] font-display text-[clamp(24px,3vw,36px)] leading-[1.35] font-normal text-balance text-em9 italic [font-variation-settings:'SOFT'_50]"
          >
            {t("quote")}
          </p>
          <span data-reveal="2" className="mt-[18px] block font-sans text-[13.5px] leading-[1.3] font-semibold text-ink">
            {t("cite")}
          </span>
          <span aria-hidden="true" className="mx-auto my-7 block h-3.5 w-[200px]">
            <LotusRule />
          </span>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-7 gap-y-[18px] p-0 text-left md:grid-cols-3">
            {asks.map((a, i) => (
              <li key={a.t} data-reveal={i} className="flex flex-col gap-1.5">
                <span className="font-sans text-[14.5px] leading-[1.35] font-bold text-em9">{a.t}</span>
                <span className="font-sans text-[14px] leading-[1.55] text-pretty text-ink6">{a.d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** §5 FAQ (135–143): ivory; heading (.8fr) beside FaqList "courses" (1.6fr) from 1024. */
export async function CoursesFaq({ items }: { items: [string, string][] }) {
  const t = await getTranslations("sadhana.faq");
  return (
    <section data-screen-label="Courses FAQ" className="bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)]">
        <div className="flex flex-col gap-3">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.4vw,44px)] leading-[1.1]")}>
            {t.rich("title", rich())}
          </h2>
        </div>
        <div lang="en" className="min-w-0">
          <FaqList items={items} />
        </div>
      </div>
    </section>
  );
}

/** WhatsApp text link under the enquire copy (Sadhana-Courses 151, Course-Detail 167). */
export function WaLink({ label }: { label: string }) {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 inline-flex items-center gap-2 self-start font-sans text-[14px] leading-none font-semibold text-em7 no-underline"
    >
      <Icon name="whatsapp" className="size-[17px]" />
      {label}
    </a>
  );
}

/** §6 Enquire `#enquire` (145–155): sand; copy (.85fr) beside InquiryForm kind "course", preset kali. */
export async function CoursesEnquire({ courses }: { courses: CourseOption[] }) {
  const t = await getTranslations("sadhana.enquire");
  return (
    <section
      id="enquire"
      data-screen-label="Course inquiry"
      className="scroll-mt-[60px] bg-s1 shadow-[inset_0_1px_0_rgba(184,146,58,.35)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] pt-[clamp(56px,8vw,112px)] pb-[clamp(80px,10vw,128px)] lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <div className="flex max-w-[480px] flex-col gap-3.5">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
            {t.rich("title", rich())}
          </h2>
          <p className="m-0 font-sans text-[16px] leading-[1.7] text-pretty text-ink6">{t("body")}</p>
          <WaLink label={t("wa")} />
        </div>
        <div className="min-w-0">
          <InquiryForm kind="course" preset="kali" courses={courses} />
        </div>
      </div>
    </section>
  );
}
