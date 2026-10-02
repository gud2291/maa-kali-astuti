"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { waLinkTo } from "@/lib/site";
import { useSiteSettings } from "@/components/layout/SiteSettingsProvider";

/* §17 Newsletter (Home.dc.html 913–933, vNews 1358–1365). Emerald band with a faint mandala on the
   left. Two columns from 900px. Idle form → rose ring + alert on a bad email → "Subscribed" status.
   The footer's own newsletter is off on Home (chrome-config). */

export function NewsletterBand() {
  const t = useTranslations("home.news");
  const { contact } = useSiteSettings();

  return (
    <section lang="en" aria-label={t("aria")} className="relative overflow-hidden bg-em7 text-em1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-[-120px] size-[380px] -translate-y-1/2 opacity-10"
      >
        <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
          <MandalaG R={296} col="#D9B96A" sw={1} />
        </svg>
      </div>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-x-12 gap-y-5 px-[clamp(16px,4vw,32px)] py-[clamp(32px,4vw,48px)] min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col gap-1.5">
          <span className="font-display text-[clamp(22px,2.4vw,30px)] leading-[1.2] font-normal text-balance text-iv">
            {t("title")}
          </span>
          <span lang="hi" className="font-deva text-[15px] leading-[1.35] text-g3">
            {t("deva")}
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap gap-2.5">
            <NewsletterForm
              idPrefix="hn"
              label={t("label")}
              placeholder={t("ph")}
              subscribe={t("subscribe")}
              errorText={t("err")}
              doneText={t("done")}
              source="home"
              inputClassName="h-[50px] min-w-0 flex-[1_1_220px] rounded-field border-0 bg-iv px-3.5 font-sans text-[15px] leading-none font-medium text-ink outline-none"
              buttonClassName="h-[50px] cursor-pointer rounded-btn border-0 bg-g3 px-5 font-sans text-[14px] leading-none font-bold text-n9 hover:bg-g4 disabled:opacity-60"
              errorClassName="flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.3] font-semibold text-rose"
              doneClassName="flex min-h-[50px] items-center gap-2.5 font-sans text-[15px] leading-[1.4] font-medium text-iv"
              extra={
                <a
                  href={waLinkTo(contact.whatsapp, t("waText"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[50px] items-center gap-2 rounded-btn px-[18px] font-sans text-[14px] leading-none font-semibold text-g1 no-underline shadow-ring-g3 hover:bg-[rgba(217,185,106,.12)] hover:text-iv"
                >
                  <Icon name="whatsapp" className="size-[17px]" />
                  {t("wa")}
                </a>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
