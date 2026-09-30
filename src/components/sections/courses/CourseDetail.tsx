import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { InquiryForm, type CourseOption } from "@/components/forms/InquiryForm";
import { Icon, type IconName } from "@/components/icons/Icon";
import { EYEBROW, rich } from "@/components/sections/consult/ui";
import { NightCrumbs } from "@/components/sections/rashifal/ui";
import { Starfield } from "@/components/signature/Starfield";
import { YantraDraw } from "@/components/signature/YantraDraw";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { InlineArt } from "@/components/ui/InlineArt";
import type { Course } from "@/lib/api/content";
import { YANTRA_BRASS, YANTRA_GOLD } from "@/lib/art/yantras";
import { fmt } from "@/lib/core/format";
import { courseHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { COURSE_FEE, GOLD_CTA, H2, H2N, WaLink } from "./CoursesSections";

/* Course detail (design/Course-Detail.dc.html 27–192). Copy rule on /hi (F9): display text and the
   course data stay English; Manrope UI text is translated. */

type YKey = keyof typeof YANTRA_GOLD;
/** Hero CTA row id: the sticky Enquire bar shows once it has scrolled above the viewport (ctaRef 234). */
export const COURSE_CTA_ID = "course-cta";

const LABEL = "font-sans text-[10.5px] font-semibold tracking-[.14em] uppercase hi:tracking-normal";
const DEVA = ["१", "२", "३", "४", "५", "६"];
/** "Kali Sadhana" → "Kali" (renderVals 212). */
export const courseName = (c: Course) => c.en.replace(/\s*Sadhana$/, "");

/** §1 Hero (31–57): night; crumbs, deity eyebrow, "<Name> Sadhana", Devanagari, essence, facts row,
 *  CTA row (#course-cta) — beside the arch with the course yantra, which draws once 30% is in view
 *  (1800 ms) and redraws on hover (1600 ms, at most every 2 s). */
export async function CourseHero({ c }: { c: Course }) {
  const t = await getTranslations("sadhana");
  const facts = [
    { k: t("detail.facts.duration"), v: t("detail.facts.days", { n: c.days }) },
    { k: t("detail.facts.mode"), v: t("detail.facts.modeV") },
    { k: t("detail.facts.fee"), v: t("detail.facts.feeV", { price: fmt(COURSE_FEE) }) },
  ];
  return (
    <section data-screen-label="Course hero" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="cd-sky" n={28} nMob={16} h={820} />
      </div>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(36px,6vw,96px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,48px)] pb-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <NightCrumbs
            label={t("crumbs.label")}
            items={[
              { href: routes.home, t: t("crumbs.home") },
              { href: routes.courses, t: t("crumbs.courses") },
              { t: <span lang="en">{c.en}</span> },
            ]}
          />
          <span lang="en" className={cn(EYEBROW, "text-g3")}>
            {c.deity}
          </span>
          <h1
            lang="en"
            className="m-0 font-display text-[clamp(44px,6vw,88px)] leading-none font-normal tracking-[-.024em] text-iv font-soft"
          >
            {t.rich("detail.title", { ...rich("text-g3"), name: courseName(c) })}
          </h1>
          <span lang="hi" className="font-deva text-[clamp(22px,2.4vw,30px)] leading-[1.3] text-g3">
            {c.hi}
          </span>
          <p
            lang="en"
            className="m-0 max-w-[540px] font-sans text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-pretty text-sg3"
          >
            {c.essence}
          </p>
          <dl className="m-0 mt-1.5 grid max-w-[600px] grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-3.5 border-y border-[rgba(217,185,106,.28)] py-[18px]">
            {facts.map((x) => (
              <div key={x.k} className="flex flex-col gap-1.5">
                <dt className={cn(LABEL, "leading-none text-sg5")}>{x.k}</dt>
                <dd className="m-0 font-sans text-[15px] leading-[1.35] font-semibold text-iv">{x.v}</dd>
              </div>
            ))}
          </dl>
          <div id={COURSE_CTA_ID} className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
            <AnchorLink to="enquire" className={GOLD_CTA}>
              <Icon name="chat" className="size-[17px]" />
              {t("detail.enquire", { name: c.en })}
            </AnchorLink>
            <span className="flex items-center gap-2 font-sans text-[13.5px] leading-[1.4] font-medium text-sg3">
              <Icon name="scroll" className="size-4 text-g3" />
              {t("detail.syllabus")}
            </span>
          </div>
        </div>

        <div className="relative w-full max-w-[300px] justify-self-center md:max-w-[420px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-[50%_50%_6px_6px/35.7%_35.7%_6px_6px] shadow-ring-gold-45"
          />
          <div className="relative aspect-[5/7] overflow-hidden rounded-[50%_50%_4px_4px/35.7%_35.7%_4px_4px] bg-n8 shadow-[0_40px_60px_-40px_rgba(0,0,0,.6),inset_0_0_0_1px_rgba(217,185,106,.55)]">
            <span aria-hidden="true" className="absolute inset-0 block">
              <Starfield seed="cd-arch" n={10} nMob={6} w={500} h={700} />
              <svg
                viewBox="0 0 500 700"
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 block"
              >
                <circle cx="250" cy="330" r="220" fill="none" stroke="#D9B96A" strokeWidth=".6" opacity=".22" />
              </svg>
            </span>
            <YantraDraw threshold={0.3} dur={1800} redrawDur={1600} throttle={2000} focus={false} className="contents">
              <span
                data-yantra=""
                data-yantra-hover=""
                className="absolute top-[22%] right-[10%] left-[10%] block aspect-square"
              >
                <InlineArt svg={YANTRA_GOLD[c.key as YKey]} uid={`cd${c.key}`} />
              </span>
            </YantraDraw>
            <span className="absolute inset-x-0 bottom-[7%] flex flex-col items-center gap-1.5 text-center">
              <span className={cn(LABEL, "leading-none tracking-[.16em] text-sg3")}>
                <span lang="en">{t("detail.yantra", { name: c.en })}</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** §2 Overview (59–70): ivory; label (.8fr) beside the large overview line + practice note. */
export async function CourseOverview({ c }: { c: Course }) {
  const t = await getTranslations("sadhana.detail.overview");
  return (
    <section data-screen-label="Overview" className="bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(24px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)]">
        <div data-reveal="0" className="flex flex-col gap-3">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
          <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-g7">
            {t("deva")}
          </span>
        </div>
        <div className="flex max-w-[760px] flex-col gap-[22px]">
          <p
            data-reveal="1"
            lang="en"
            className="m-0 font-display text-[clamp(22px,2.4vw,30px)] leading-[1.45] font-normal text-pretty text-em9 font-soft"
          >
            {c.overview}
          </p>
          <p data-reveal="2" className="m-0 font-sans text-[16px] leading-[1.7] text-pretty text-ink6">
            {t("body")}
          </p>
        </div>
      </div>
    </section>
  );
}

/** §3 What you attain (72–84): sand; four numbered lines (Devanagari numerals), 2 columns from 768. */
export async function CourseAttain({ c }: { c: Course }) {
  const t = await getTranslations("sadhana.detail.attain");
  return (
    <section data-screen-label="What you attain" className="bg-s1 shadow-hair-y">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
        <div data-reveal="0" className="mb-[clamp(24px,3vw,40px)] flex flex-col gap-3">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
            {t.rich("title", rich())}
          </h2>
        </div>
        <ol className="m-0 grid list-none grid-cols-1 gap-x-[clamp(24px,4vw,64px)] border-t border-[rgba(184,146,58,.5)] p-0 md:grid-cols-2">
          {c.attain.map((a, i) => (
            <li
              key={a}
              data-reveal={i % 2}
              className="grid grid-cols-[48px_minmax(0,1fr)] items-baseline gap-4 border-b border-[rgba(184,146,58,.5)] py-6"
            >
              <span lang="hi" className="font-deva text-[30px] leading-none text-g5">
                {DEVA[i]}
              </span>
              <span lang="en" className="font-display text-[clamp(19px,1.8vw,22px)] leading-[1.4] font-normal text-pretty text-em9">
                {a}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** §4 Structure (86–106): ivory; sticky side (top 96px from 1024) with the key facts and the
 *  "to be confirmed" pill, beside the five modules on a brass rail. */
export async function CourseStructure({ c, modules }: { c: Course; modules: [string, string][] }) {
  const t = await getTranslations("sadhana.detail.structure");
  const d = c.days;
  const when = [
    t("when.prep"),
    t("when.diksha"),
    t("when.practice", { end: d - 2 }),
    t("when.weekly"),
    t("when.close", { a: d - 1, b: d }),
  ];
  const struct = [
    { k: t("duration"), v: t("durationV", { days: d }) },
    { k: t("daily"), v: t("dailyV") },
    { k: t("diksha"), v: t("dikshaV") },
  ];
  return (
    <section data-screen-label="Structure" className="bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)]">
        <div className="static top-24 flex flex-col gap-3.5 lg:sticky">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.4vw,44px)] leading-[1.1]")}>
            {t.rich("title", { ...rich(), days: d })}
          </h2>
          <dl className="m-0 mt-1.5 flex flex-col">
            {struct.map((x) => (
              <div key={x.k} className="flex justify-between gap-3.5 border-t border-s2 py-3">
                <dt className={cn(LABEL, "leading-[1.5] text-ink6")}>{x.k}</dt>
                <dd className="m-0 text-right font-sans text-[14px] leading-[1.45] font-semibold text-ink">{x.v}</dd>
              </div>
            ))}
          </dl>
          <span className="inline-flex h-[26px] items-center self-start rounded-pill bg-s1 px-2.5 font-sans text-[11.5px] leading-none font-semibold text-g7 shadow-[inset_0_0_0_1px_rgba(184,146,58,.5)]">
            {t("confirm")}
          </span>
        </div>
        <ol className="m-0 flex list-none flex-col p-0">
          {modules.map(([title, dd], i) => {
            const last = i === modules.length - 1;
            return (
              <li
                key={title}
                data-reveal={i % 2}
                className={cn("relative grid grid-cols-[56px_minmax(0,1fr)] gap-[18px]", !last && "pb-7")}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-14 bottom-0 left-[27.5px] w-px",
                    last ? "bg-transparent" : "bg-[rgba(184,146,58,.5)]",
                  )}
                />
                <span className="grid size-14 place-items-center rounded-pill bg-em9 font-display text-[20px] leading-none font-normal text-g3 italic shadow-ring-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-col gap-1.5 pt-1.5">
                  <span className="font-sans text-[10.5px] leading-[1.2] font-bold tracking-[.14em] text-g7 uppercase hi:tracking-normal">
                    {when[i]}
                  </span>
                  <span lang="en" className="font-display text-[clamp(20px,2vw,24px)] leading-[1.2] font-normal text-em9">
                    {title}
                  </span>
                  <span lang="en" className="font-sans text-[15px] leading-[1.6] text-pretty text-ink6">
                    {dd}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** §5 Niyam (107–123): night; heading beside the course-specific rule card, then the six common
 *  niyam with lotus bullets (2 columns from 768). */
export async function CourseNiyam({ c, niyam }: { c: Course; niyam: string[] }) {
  const t = await getTranslations("sadhana.detail.niyam");
  return (
    <section data-screen-label="Discipline and niyam" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="cd-sky2" n={14} nMob={8} h={800} />
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(32px,4vw,52px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-4">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g3")}>{t.rich("eyebrow", rich("text-g3"))}</span>
            <h2 lang="en" className={cn(H2N, "text-[clamp(32px,4vw,52px)]")}>
              {t.rich("title", rich("text-g3"))}
            </h2>
          </div>
          <div
            data-reveal="1"
            className="flex max-w-[460px] flex-col gap-1.5 rounded-btn bg-n8 px-[18px] py-4 shadow-ring-gold-45"
          >
            <span className="font-sans text-[10.5px] leading-[1.2] font-bold tracking-[.14em] text-g3 uppercase hi:tracking-normal">
              {t("specific", { name: c.en })}
            </span>
            <span lang="en" className="font-sans text-[15px] leading-[1.55] font-medium text-iv">
              {c.niyam}
            </span>
          </div>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-x-[clamp(24px,4vw,64px)] border-t border-[rgba(217,185,106,.3)] p-0 md:grid-cols-2">
          {niyam.map((n, i) => (
            <li
              key={n}
              data-reveal={i % 2}
              className="grid grid-cols-[24px_minmax(0,1fr)] items-center gap-4 border-b border-[rgba(217,185,106,.3)] py-[18px]"
            >
              <span aria-hidden="true" className="block size-[22px] text-g3">
                <Icon name="lotus" />
              </span>
              <span lang="en" className="font-display text-[clamp(18px,1.8vw,21px)] leading-[1.4] font-normal text-iv">
                {n}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const SUPPORT_ICONS: IconName[] = ["calendar", "whatsapp", "lotus"];

/** §6 Guidance & support (125–141): ivory; three items on brass top rules (3 columns from 900). */
export async function CourseSupport() {
  const t = await getTranslations("sadhana.detail.support");
  const items = t.raw("items") as { t: string; d: string }[];
  return (
    <section data-screen-label="Guidance and support" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
        <div data-reveal="0" className="mb-[clamp(24px,3vw,40px)] flex flex-col gap-3">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.6vw,46px)]")}>
            {t.rich("title", rich())}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-x-[clamp(24px,3vw,48px)] w900:grid-cols-3">
          {items.map((x, i) => (
            <div key={x.t} data-reveal={i} className="flex flex-col gap-3 border-t border-g5 py-6">
              <span className="grid size-11 place-items-center rounded-pill bg-s1 text-em7">
                <Icon name={SUPPORT_ICONS[i]} className="size-[22px]" />
              </span>
              <span lang="en" className="font-display text-[21px] leading-[1.25] font-normal text-em9">
                {x.t}
              </span>
              <span className="font-sans text-[15px] leading-[1.6] text-pretty text-ink6">{x.d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** §7 Fee (143–159): sand; the emerald fee card (inclusions) beside the payment terms (2 columns from 1024). */
export async function CourseFee() {
  const t = await getTranslations("sadhana.detail.fee");
  const inc = t.raw("inc") as string[];
  const pay = t.raw("pay") as { k: string; v: string }[];
  return (
    <section data-screen-label="Fee and payment" className="bg-s1 shadow-hair-y">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-stretch gap-[clamp(24px,4vw,56px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-2">
        <div
          data-reveal="0"
          className="flex flex-col gap-4 rounded-btn bg-em9 p-[clamp(22px,3vw,36px)] text-em1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)]"
        >
          <span className={cn(EYEBROW, "text-g3")}>{t("eyebrow")}</span>
          <span className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
            <span className="font-display text-[clamp(44px,5vw,64px)] leading-none font-normal tracking-[-.015em] text-iv tabular">
              {fmt(COURSE_FEE)}
            </span>
            <span className="font-sans text-[13.5px] leading-[1.3] font-medium text-sg3">{t("for")}</span>
          </span>
          <ul className="m-0 mt-1.5 flex list-none flex-col gap-[11px] border-t border-[rgba(217,185,106,.3)] p-0 pt-4">
            {inc.map((x) => (
              <li
                key={x}
                className="grid grid-cols-[18px_minmax(0,1fr)] gap-2.5 font-sans text-[14.5px] leading-[1.5] font-medium text-em1"
              >
                <span className="mt-0.5 block size-[18px] text-g3">
                  <Icon name="check" />
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal="1" className="flex flex-col justify-center gap-1">
          <span lang="en" className="mb-2.5 font-display text-[clamp(24px,2.6vw,32px)] leading-[1.2] font-normal text-em9">
            {t("payment")}
          </span>
          <dl className="m-0 flex flex-col">
            {pay.map((p) => (
              <div
                key={p.k}
                className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 border-t border-[rgba(184,146,58,.4)] py-3.5"
              >
                <dt className={cn(LABEL, "leading-[1.6] text-g7")}>{p.k}</dt>
                <dd className="m-0 font-sans text-[15px] leading-[1.5] font-medium text-ink">{p.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/** §8 Enquire `#enquire` (161–179): ivory; copy beside InquiryForm (preset = this course), then
 *  "The other sadhanas" (brass yantras, static): 2 / 3 (≥600) / 5 (≥1024) columns. */
export async function CourseEnquire({
  c,
  others,
  courses,
}: {
  c: Course;
  others: Course[];
  courses: CourseOption[];
}) {
  const t = await getTranslations("sadhana");
  return (
    <section id="enquire" data-screen-label="Course inquiry" className="scroll-mt-[60px] bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <div className="flex max-w-[480px] flex-col gap-3.5">
          <span className={cn(EYEBROW, "text-g7")}>{t("detail.enq.eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
            {t.rich("detail.enq.title", { ...rich(), name: c.en })}
          </h2>
          <p className="m-0 font-sans text-[16px] leading-[1.7] text-pretty text-ink6">{t("detail.enq.body")}</p>
          <WaLink label={t("enquire.wa")} />
        </div>
        <div className="min-w-0">
          <InquiryForm kind="course" preset={c.key} courses={courses} />
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pb-[clamp(88px,10vw,128px)]">
        <span
          className={cn(EYEBROW, "mb-[18px] block border-t border-s2 pt-[clamp(32px,4vw,48px)] text-g7")}
        >
          {t("detail.enq.others")}
        </span>
        <div className="grid grid-cols-2 gap-3 min-[600px]:grid-cols-3 lg:grid-cols-5">
          {others.map((o) => (
            <Link
              key={o.key}
              href={courseHref(o.key)}
              className="flex flex-col items-center gap-2.5 rounded-btn bg-cream px-3 py-[18px] text-center no-underline shadow-ring-sand transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-ring-g5"
            >
              <span className="block size-14">
                <InlineArt svg={YANTRA_BRASS[o.key as YKey]} uid={`o${o.key}`} />
              </span>
              <span lang="en" className="font-display text-[17px] leading-[1.2] font-normal text-em9">
                {o.en}
              </span>
              <span lang="hi" className="font-deva text-[14px] leading-[1.3] text-g7">
                {o.hi}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
