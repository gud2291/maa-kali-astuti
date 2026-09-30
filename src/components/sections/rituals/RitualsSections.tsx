import { getTranslations } from "next-intl/server";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { Icon, type IconName } from "@/components/icons/Icon";
import { EYEBROW, rich } from "@/components/sections/consult/ui";
import { GHOST_CTA, GOLD_CTA, H2, H2N } from "@/components/sections/courses/CoursesSections";
import { NightCrumbs } from "@/components/sections/rashifal/ui";
import { Starfield } from "@/components/signature/Starfield";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { FaqList } from "@/components/ui/FaqList";
import { InlineArt } from "@/components/ui/InlineArt";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import type { IconRow } from "@/lib/api/content";
import { THALI_RITUALS_SVG } from "@/lib/art/thali";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { ProcessSteps } from "./ProcessSteps";

/* Rituals & Anushthan (design/Rituals.dc.html 27–142). Copy rule on /hi (F9): display text and the
   ritual data (A.RITUALS, A.RPROCESS, A.RECEIVE, FAQ) stay English; Manrope UI text is translated. */

/** Placeholder pill (Rituals 76, 116). */
const PILL =
  "inline-flex h-7 items-center rounded-pill px-3 font-sans text-[12px] leading-none font-semibold text-g7 shadow-ring-g5-55";

/** §1 Hero (31–51): night; copy + CTAs beside the brass thali (S5: glow, incense smoke, diya flicker
 *  inside the art) under a slowly turning mandala (spin 200 s, opacity .13). */
export async function RitualsHero() {
  const t = await getTranslations("rituals");
  return (
    <section data-screen-label="Rituals hero" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="rt-sky" n={28} nMob={16} h={820} />
      </div>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(24px,5vw,72px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,48px)] pb-[clamp(56px,8vw,112px)] lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <NightCrumbs
            label={t("crumbs.label")}
            items={[{ href: routes.home, t: t("crumbs.home") }, { t: t("crumbs.here") }]}
          />
          <span className={cn(EYEBROW, "text-g3")}>{t.rich("hero.eyebrow", rich("text-g3"))}</span>
          <h1
            lang="en"
            className="m-0 font-display text-[clamp(42px,5.8vw,82px)] leading-[1.02] font-normal tracking-[-.022em] text-balance text-iv font-soft"
          >
            {t.rich("hero.title", rich("text-g3"))}
          </h1>
          <span lang="hi" className="font-deva text-[clamp(18px,2vw,23px)] leading-[1.35] text-g3">
            {t("hero.deva")}
          </span>
          <p className="m-0 max-w-[540px] font-sans text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-pretty text-sg3">
            {t("hero.intro")}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2.5">
            <AnchorLink to="inquire" className={GOLD_CTA}>
              <Icon name="chat" className="size-[17px]" />
              {t("hero.share")}
            </AnchorLink>
            <AnchorLink to="process" className={GHOST_CTA}>
              {t("hero.how")}
            </AnchorLink>
          </div>
        </div>
        <div className="relative w-full max-w-[380px] justify-self-center md:max-w-[600px]">
          <div
            aria-hidden="true"
            data-amb="spin:200"
            className="pointer-events-none absolute -top-[8%] right-[6%] left-[6%] aspect-square opacity-[.13]"
          >
            <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
              <MandalaG R={296} col="#D9B96A" sw={1} />
            </svg>
          </div>
          <div className="relative aspect-[520/400]">
            <InlineArt svg={THALI_RITUALS_SVG} uid="rt" />
          </div>
          <span className="mt-2.5 block text-center font-sans text-[10.5px] leading-[1.4] font-semibold tracking-[.16em] text-sg5 uppercase hi:tracking-normal">
            {t("hero.caption")}
          </span>
        </div>
      </div>
    </section>
  );
}

/** §2 Ethics (53–67): ivory; the large ethics line and three numbered principles (3 columns from 900). */
export async function RitualsEthics() {
  const t = await getTranslations("rituals.ethics");
  const items = t.raw("items") as { t: string; d: string }[];
  return (
    <section data-screen-label="Ethics" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <span data-reveal="0" className={cn(EYEBROW, "block text-g7")}>
          {t("eyebrow")}
        </span>
        <p
          data-reveal="1"
          lang="en"
          className="m-0 mt-[18px] max-w-[1000px] font-display text-[clamp(28px,3.8vw,52px)] leading-[1.18] font-normal tracking-[-.015em] text-balance text-em9 font-soft"
        >
          {t.rich("quote", rich())}
        </p>
        <div className="mt-[clamp(36px,5vw,64px)] grid grid-cols-1 gap-x-[clamp(24px,3vw,48px)] w900:grid-cols-3">
          {items.map((e, i) => (
            <div key={e.t} data-reveal={i} className="flex flex-col gap-2.5 border-t border-g5 py-[22px]">
              <span className="font-display text-[15px] leading-none font-normal text-g7 italic">{`0${i + 1}`}</span>
              <span lang="en" className="font-display text-[21px] leading-[1.25] font-normal text-em9">
                {e.t}
              </span>
              <span className="font-sans text-[15px] leading-[1.6] text-pretty text-ink6">{e.d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** §3 Ritual types (69–87): sand; heading + placeholder pill, six rituals (2 columns from 900). */
export async function RitualTypes({ rituals }: { rituals: [IconName, string, string, string][] }) {
  const t = await getTranslations("rituals.types");
  return (
    <section data-screen-label="Ritual types" className="bg-s1 shadow-hair-y">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
        <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-3.5">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
              {t.rich("title", rich())}
            </h2>
          </div>
          <span data-reveal="1" className={cn(PILL, "bg-iv")}>
            {t("badge")}
          </span>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-x-[clamp(24px,4vw,64px)] border-t border-[rgba(184,146,58,.5)] p-0 w900:grid-cols-2">
          {rituals.map(([icon, en, hi, d], i) => (
            <li
              key={en}
              data-reveal={i % 2}
              className="grid grid-cols-[48px_minmax(0,1fr)] gap-4 border-b border-[rgba(184,146,58,.5)] py-[22px]"
            >
              <span className="grid size-12 place-items-center rounded-pill bg-iv text-em7 shadow-ring-g5-55">
                <Icon name={icon} className="size-[22px]" />
              </span>
              <span className="flex flex-col gap-[5px]">
                <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span lang="en" className="font-display text-[21px] leading-[1.2] font-normal text-em9">
                    {en}
                  </span>
                  <span lang="hi" className="font-deva text-[16px] leading-[1.3] text-g7">
                    {hi}
                  </span>
                </span>
                <span lang="en" className="font-sans text-[15px] leading-[1.55] text-pretty text-ink6">
                  {d}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** §4 Process `#process` (88–107): night; sticky side (top 110px from 1024, .8fr) beside the
 *  scroll-filled five steps (ProcessSteps, 1.3fr). */
export async function RitualProcess({ steps }: { steps: IconRow[] }) {
  const t = await getTranslations("rituals.process");
  return (
    <section id="process" data-screen-label="Five-step process" className="relative scroll-mt-[60px] bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <Starfield seed="rt-sky2" n={14} nMob={8} h={800} />
      </div>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(32px,5vw,88px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.3fr)]">
        <div className="static top-[110px] flex flex-col gap-3 lg:sticky">
          <span className={cn(EYEBROW, "text-g3")}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2N, "text-[clamp(32px,4vw,52px)]")}>
            {t.rich("title", rich("text-g3"))}
          </h2>
          <p className="m-0 max-w-[380px] font-sans text-[15.5px] leading-[1.65] text-pretty text-sg3">{t("intro")}</p>
        </div>
        <ProcessSteps steps={steps} />
      </div>
    </section>
  );
}

/** §5 What you receive (109–127): ivory; five cream cards (2 columns from 900), the first spanning
 *  the row with a larger title. */
export async function RitualReceive({ items }: { items: IconRow[] }) {
  const t = await getTranslations("rituals.receive");
  return (
    <section data-screen-label="What you receive" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
        <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-3.5">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
              {t.rich("title", rich())}
            </h2>
          </div>
          <span data-reveal="1" className={cn(PILL, "bg-s1")}>
            {t("badge")}
          </span>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 w900:grid-cols-2">
          {items.map(([icon, title, d], i) => (
            <li
              key={title}
              data-reveal={i % 2}
              className={cn(
                "grid grid-cols-[52px_minmax(0,1fr)] items-center gap-[18px] rounded-btn bg-cream p-[clamp(18px,2.4vw,26px)] shadow-ring-sand",
                i === 0 && "col-span-full",
              )}
            >
              <span className="grid size-[52px] place-items-center rounded-pill bg-em9 text-g3">
                <Icon name={icon} className="size-6" />
              </span>
              <span className="flex flex-col gap-[5px]">
                <span
                  lang="en"
                  className={cn(
                    "font-display leading-[1.2] font-normal text-em9",
                    i === 0 ? "text-[clamp(24px,2.6vw,32px)]" : "text-[21px]",
                  )}
                >
                  {title}
                </span>
                <span lang="en" className="font-sans text-[15px] leading-[1.55] text-pretty text-ink6">
                  {d}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** §6 Inquiry `#inquire` (129–139): sand; copy + FaqList "rituals" (all closed) beside InquiryForm
 *  kind "ritual" (.9fr / 1.1fr from 1024). */
export async function RitualInquire({ faq }: { faq: [string, string][] }) {
  const t = await getTranslations("rituals.inquire");
  return (
    <section
      id="inquire"
      data-screen-label="Ritual inquiry"
      className="scroll-mt-[60px] bg-s1 shadow-[inset_0_1px_0_rgba(184,146,58,.35)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] pt-[clamp(56px,8vw,112px)] pb-[clamp(80px,10vw,128px)] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
            {t.rich("title", rich())}
          </h2>
          <p className="m-0 max-w-[460px] font-sans text-[16px] leading-[1.7] text-pretty text-ink6">{t("body")}</p>
          <div lang="en" className="mt-3">
            <FaqList items={faq} openFirst={false} />
          </div>
        </div>
        <div className="min-w-0">
          <InquiryForm kind="ritual" />
        </div>
      </div>
    </section>
  );
}
