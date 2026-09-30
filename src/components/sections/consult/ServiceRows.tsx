import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import type { Mode, ModeKey, Service } from "@/lib/api/consult";
import { isReport } from "@/lib/api/consult";
import { fmt } from "@/lib/core/format";
import { bookHref, serviceHref } from "@/lib/routes";
import { waLink } from "@/lib/site";
import { EYEBROW, LABEL, UNDERLINE, rich } from "./ui";

/* §2 "Four services" #services (Consultations.dc.html 72–118). Sand band. Heading + intro, then one
   ruled row per service: number + icon · name, Devanagari, line, guarantee pill · Duration / Mode /
   Delivery / You get · "From" price with Details + Book. From 1100px the row is 4 columns
   (96px · 1.2fr · 1.5fr · 220px, price stacked right); below that everything stacks and the price
   sits in a row with the actions. A WhatsApp nudge closes the section. */

export async function ServiceRows({ services, modes }: { services: Service[]; modes: Record<ModeKey, Mode> }) {
  const t = await getTranslations("consult");

  return (
    <section id="services" data-screen-label="Four services" className="scroll-mt-[60px] bg-s1 shadow-hair-y">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
        <div className="mb-[clamp(28px,4vw,44px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-[18px]">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={`${EYEBROW} text-g7`}>{t("services.eyebrow")}</span>
            <h2
              lang="en"
              className="m-0 font-display text-[clamp(32px,3.8vw,50px)] leading-[1.08] font-normal tracking-[-.018em] text-balance text-em9 font-soft"
            >
              {t.rich("services.title", rich())}
            </h2>
            <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-g7">
              {t("services.deva")}
            </span>
          </div>
          <p data-reveal="1" className="m-0 max-w-[520px] font-sans text-[16px] leading-[1.65] text-pretty text-ink6">
            {t("services.intro")}
          </p>
        </div>

        <div className="flex flex-col border-t border-[rgba(184,146,58,.5)]">
          {services.map((s, i) => (
            <article
              key={s.key}
              data-reveal={i}
              className="grid grid-cols-1 items-center gap-[18px] border-b border-[rgba(184,146,58,.5)] px-[clamp(4px,1.6vw,22px)] py-[clamp(22px,3vw,34px)] transition-colors duration-[250ms] hover:bg-iv w1100:grid-cols-[96px_minmax(0,1.2fr)_minmax(0,1.5fr)_220px] w1100:gap-7"
            >
              <div className="flex items-center gap-3.5">
                <span className="font-display text-[15px] leading-none font-normal text-g7 italic tabular">
                  {"0" + (i + 1)}
                </span>
                <span className="grid size-[52px] flex-none place-items-center rounded-pill bg-iv text-em7 shadow-[inset_0_0_0_1px_rgba(184,146,58,.6)]">
                  <Icon name={s.icon} className="size-[26px]" />
                </span>
              </div>

              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                  <Link
                    href={serviceHref(s.key)}
                    lang="en"
                    className="font-display text-[clamp(24px,2.4vw,30px)] leading-[1.1] font-normal tracking-[-.01em] text-em9 no-underline font-soft hover:text-em5"
                  >
                    {s.name}
                  </Link>
                  <span lang="hi" className="font-deva text-[16px] leading-[1.3] text-g7">
                    {s.hi}
                  </span>
                </div>
                <p lang="en" className="m-0 max-w-[440px] font-sans text-[15px] leading-[1.6] text-pretty text-ink6">
                  {s.line}
                </p>
                {s.guarantee && (
                  <span className="inline-flex h-7 items-center gap-[7px] self-start rounded-pill bg-iv px-3 font-sans text-[10.5px] leading-none font-bold tracking-[.1em] text-g7 uppercase shadow-[inset_0_0_0_1px_rgba(184,146,58,.6)] hi:tracking-normal">
                    <Icon name="seal" className="size-3.5" />
                    {t("services.guarantee")}
                  </span>
                )}
              </div>

              <dl className="m-0 grid grid-cols-2 gap-x-[22px] gap-y-3.5">
                <div className="flex flex-col gap-[5px]">
                  <dt className={`${LABEL} text-g7`}>{t("services.duration")}</dt>
                  <dd className="m-0 font-sans text-[14px] leading-[1.35] font-semibold text-ink">
                    {isReport(s) ? t("dur.report") : t("dur.range", { a: s.tiers[0].mins, b: s.tiers[2].mins })}
                  </dd>
                </div>
                <div className="flex flex-col gap-[5px]">
                  <dt className={`${LABEL} text-g7`}>{t("services.mode")}</dt>
                  <dd className="m-0 flex gap-2 text-em7">
                    {s.modes.map((m) => (
                      <span
                        key={m}
                        title={t(`modes.${m}`)}
                        role="img"
                        aria-label={t(`modes.${m}`)}
                        className="grid size-[30px] place-items-center rounded-pill bg-cream shadow-ring-sand"
                      >
                        <Icon name={modes[m].icon} className="size-4" />
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="flex flex-col gap-[5px]">
                  <dt className={`${LABEL} text-g7`}>{t("services.delivery")}</dt>
                  <dd lang="en" className="m-0 font-sans text-[14px] leading-[1.4] font-medium text-ink">
                    {s.deliver}
                  </dd>
                </div>
                <div className="flex flex-col gap-[5px]">
                  <dt className={`${LABEL} text-g7`}>{t("services.get")}</dt>
                  <dd lang="en" className="m-0 font-sans text-[14px] leading-[1.4] font-medium text-ink">
                    {s.get}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-row items-center justify-between gap-3 w1100:flex-col w1100:items-end">
                <span className="flex flex-col items-center gap-1 w1100:items-end">
                  <span className={`${LABEL} text-ink6`}>{t("services.from")}</span>
                  <span className="font-sans text-[24px] leading-none font-bold text-em9 tabular">
                    {fmt(s.tiers[0].price)}
                  </span>
                </span>
                <span className="flex items-center gap-3.5">
                  <Link
                    href={serviceHref(s.key)}
                    aria-label={t("services.detailsAria", { name: s.name })}
                    className={`${UNDERLINE} text-[13.5px] leading-none`}
                  >
                    {t("services.details")}
                  </Link>
                  <Link
                    href={bookHref(s.key)}
                    aria-label={t("services.bookAria", { name: s.name })}
                    className="inline-flex h-11 items-center gap-2 rounded-btn bg-em7 px-[18px] font-sans text-[14px] leading-none font-semibold text-iv no-underline shadow-ring-gold transition-colors duration-150 hover:bg-em5 hover:text-iv"
                  >
                    {t("services.book")}
                    <Icon name="arrowR" className="size-[15px]" />
                  </Link>
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-[26px] flex flex-wrap items-center gap-x-4 gap-y-2.5 font-sans text-[14px] leading-[1.5] font-medium text-ink6">
          <span>{t("services.unsure")}</span>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-[7px] font-semibold text-em7 no-underline"
          >
            <Icon name="whatsapp" className="size-4" />
            {t("services.wa")}
          </a>
        </div>
      </div>
    </section>
  );
}
