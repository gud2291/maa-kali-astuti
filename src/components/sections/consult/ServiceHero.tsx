import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { KundaliChart } from "@/components/signature/KundaliChart";
import { ServiceArt } from "@/components/signature/ServiceArt";
import { Starfield } from "@/components/signature/Starfield";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { InlineArt } from "@/components/ui/InlineArt";
import type { Mode, ModeKey, Service } from "@/lib/api/consult";
import { isReport, recTier } from "@/lib/api/consult";
import { LOSHU_SVG, PALM_SVG, TAROT_SVG } from "@/lib/art/service-art";
import { DEMO_K } from "@/lib/astro/kundali";
import { fmt } from "@/lib/core/format";
import { bookHref, routes } from "@/lib/routes";
import { Crumbs, EYEBROW, LABEL, UNDERLINE, rich } from "./ui";

/* §1 Service hero (Consultation-Detail.dc.html 31–67). Ivory. Breadcrumb, eyebrow with the
   Devanagari name, display h1, the long description, a ruled Duration / Delivery / Modes list,
   the "From" price with "Book …" (recommended tier) and "Compare packages", and the satisfaction
   guarantee box on Kundali. Right: the night arch (stars + two faint rings) with the service art
   drawn on view and its Devanagari caption. The CTA row (#svc-cta) drives the sticky Book bar.
   Two columns (1.1fr / .9fr) from 980px; the arch is 320px wide below 768. */

export const CTA_ID = "svc-cta";

function Art({ k }: { k: Service["key"] }) {
  if (k === "palm") return <InlineArt svg={PALM_SVG} uid="cdpalm" />;
  if (k === "tarot") return <InlineArt svg={TAROT_SVG} uid="cdtarot" />;
  if (k === "numerology") return <InlineArt svg={LOSHU_SVG} uid="cdnumerology" />;
  return <KundaliChart K={DEMO_K} fs={15} />;
}

export async function ServiceHero({ s, modes }: { s: Service; modes: Record<ModeKey, Mode> }) {
  const t = await getTranslations("consult");
  const c = (k: string) => `detail.copy.${s.key}.${k}`;
  const short = t(c("short"));

  return (
    <section data-screen-label="Service hero" className="relative overflow-hidden bg-iv">
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(40px,6vw,88px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,44px)] pb-[clamp(56px,8vw,104px)] min-[980px]:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <div className="flex min-w-0 flex-col gap-[18px]">
          <Crumbs
            label={t("breadcrumb")}
            items={[
              { href: routes.home, t: t("crumbHome") },
              { href: routes.consultations, t: t("crumbConsult") },
              { t: <span lang="en">{s.name}</span> },
            ]}
          />
          <span className={`${EYEBROW} text-g7`}>{t.rich("detail.eyebrow", { ...rich(), name: s.hi })}</span>
          <h1
            lang="en"
            className="m-0 font-display text-[clamp(42px,5.6vw,76px)] leading-[1.02] font-normal tracking-[-.022em] text-balance text-em9 font-soft"
          >
            {t.rich(c("title"), rich())}
          </h1>
          <p className="m-0 max-w-[540px] font-sans text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-pretty text-ink6">
            {t(c("long"))}
          </p>
          <dl className="m-0 mt-1.5 grid max-w-[600px] grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-x-6 gap-y-3.5 border-y border-s2 py-[18px]">
            <div className="flex flex-col gap-1.5">
              <dt className={`${LABEL} text-g7`}>{t("detail.duration")}</dt>
              <dd className="m-0 font-sans text-[14.5px] leading-[1.35] font-semibold text-ink">
                {isReport(s) ? t("dur.report") : t("dur.range", { a: s.tiers[0].mins, b: s.tiers[2].mins })}
              </dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className={`${LABEL} text-g7`}>{t("detail.delivery")}</dt>
              <dd lang="en" className="m-0 font-sans text-[14.5px] leading-[1.35] font-semibold text-ink">
                {s.deliver}
              </dd>
            </div>
            <div className="col-span-full flex flex-col gap-2">
              <dt className={`${LABEL} text-g7`}>{t("detail.modes")}</dt>
              <dd className="m-0 flex flex-wrap gap-2">
                {s.modes.map((m) => (
                  <span
                    key={m}
                    className="inline-flex h-8 items-center gap-[7px] rounded-pill bg-cream pr-3 pl-2.5 font-sans text-[12.5px] leading-none font-semibold text-em7 shadow-ring-sand"
                  >
                    <Icon name={modes[m].icon} className="size-[15px]" />
                    {t(`modes.${m}`)}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
          <div id={CTA_ID} className="mt-1 flex flex-wrap items-center gap-x-[18px] gap-y-3.5">
            <span className="mr-1.5 flex flex-col gap-1">
              <span className={`${LABEL} text-ink6`}>{t("detail.from")}</span>
              <span className="font-sans text-[28px] leading-none font-bold text-em9 tabular">
                {fmt(s.tiers[0].price)}
              </span>
            </span>
            <Link
              href={bookHref(s.key, recTier(s).k)}
              className="inline-flex h-[52px] items-center gap-2.5 rounded-btn bg-em7 sheen px-[26px] font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv no-underline shadow-ring-gold hover:text-iv hi:tracking-normal"
            >
              <Icon name="calendar" className="size-[18px]" />
              {t("detail.book", { short })}
            </Link>
            <AnchorLink to="tiers" className={`${UNDERLINE} text-[14px] leading-none`}>
              {t("detail.compare")}
            </AnchorLink>
          </div>
          {s.guarantee && (
            <div className="mt-1.5 grid max-w-[520px] grid-cols-[44px_minmax(0,1fr)] items-center gap-3.5 rounded-btn bg-s1 px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(184,146,58,.45)]">
              <span className="grid size-11 place-items-center rounded-pill bg-em9 text-g3">
                <Icon name="seal" className="size-6" />
              </span>
              <span className="font-sans text-[13.5px] leading-[1.5] font-medium text-ink">
                {t.rich("detail.guarantee", rich())}
              </span>
            </div>
          )}
        </div>

        <div className="relative w-full max-w-[320px] justify-self-center md:max-w-[440px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-12px] rounded-[50%_50%_6px_6px/35.7%_35.7%_6px_6px] shadow-[inset_0_0_0_1px_rgba(184,146,58,.55)]"
          />
          <ServiceArt className="aspect-[5/7] overflow-hidden rounded-[50%_50%_4px_4px/35.7%_35.7%_4px_4px] bg-n9 shadow-[0_40px_60px_-40px_rgba(14,59,48,.55)]">
            <span aria-hidden="true" className="absolute inset-0 block">
              <Starfield seed="cd-arch" n={24} nMob={14} w={500} h={700} />
              <svg
                viewBox="0 0 500 700"
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 block"
              >
                <circle cx="250" cy="330" r="210" fill="none" stroke="#D9B96A" strokeWidth=".8" opacity=".25" />
                <circle cx="250" cy="330" r="232" fill="none" stroke="#D9B96A" strokeWidth=".5" opacity=".18" />
              </svg>
            </span>
            <span className="absolute top-[26%] right-[12%] left-[12%] block aspect-square">
              <Art k={s.key} />
            </span>
            <span className="absolute right-0 bottom-[7%] left-0 flex flex-col items-center gap-1.5 text-center">
              <span lang="hi" className="font-deva text-[17px] leading-[1.3] text-g3">
                {s.hi}
              </span>
              <span className="font-sans text-[10.5px] leading-none font-semibold tracking-[.16em] text-sg3 uppercase hi:tracking-normal">
                {t(c("artCap"))}
              </span>
            </span>
          </ServiceArt>
        </div>
      </div>
    </section>
  );
}
