"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { rich } from "@/components/sections/consult/ui";
import { ButtonA, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { LotusRule } from "@/components/ui/ornaments/LotusRule";
import { bookHref, routes } from "@/lib/routes";
import { waLinkTo } from "@/lib/core/commerce";
import { useSiteSettings } from "@/components/layout/SiteSettingsProvider";

/* Branded 404 (no design file; INV §H F14: reuse the S7 chakra + brand tokens). Rendered inside
   the locale layout, so the header, footer and tab bar stay. The three gold rings turn at
   120 / −90 / 60 s (data-amb: paused offscreen / on a hidden tab, still under reduced motion)
   around an italic "404"; then "यह मार्ग यहाँ समाप्त होता है — This path ends here" and the
   ways back. Triggered by notFound() and by the [...rest] catch-all. */

const RINGS = [
  { ring: "outer", amb: "spin:120" },
  { ring: "middle", amb: "spin:-90" },
  { ring: "inner", amb: "spin:60" },
] as const;

export default function NotFound() {
  const t = useTranslations("notFound");
  const { contact } = useSiteSettings();
  return (
    <section className="relative overflow-hidden bg-iv">
      <title>{t("meta")}</title>
      <div className="container-mka flex min-h-[72vh] flex-col items-center justify-center gap-5 section-y text-center">
        <div className="relative grid size-[min(280px,72vw)] place-items-center">
          <div aria-hidden="true" className="absolute inset-0 opacity-60">
            {RINGS.map((r) => (
              <span key={r.ring} data-amb={r.amb} className="absolute inset-0 block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/svg/chakra/${r.ring}-d9b96a.svg`} alt="" width={280} height={280} className="block size-full" />
              </span>
            ))}
          </div>
          <span
            aria-hidden="true"
            className="relative font-display text-[clamp(56px,9vw,88px)] leading-none font-normal tracking-[-.02em] text-g5 italic font-soft"
          >
            404
          </span>
        </div>
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <span lang="hi" className="font-deva text-[clamp(20px,2.4vw,28px)] leading-[1.35] text-g7">
          {t("deva")}
        </span>
        <h1
          lang="en"
          className="m-0 font-display text-[clamp(32px,4vw,52px)] leading-[1.08] font-normal tracking-[-.02em] text-balance text-em9 font-soft"
        >
          {t.rich("title", rich())}
        </h1>
        <div className="h-4 w-60">
          <LotusRule />
        </div>
        <p className="m-0 max-w-[520px] font-sans text-[16px] leading-[1.65] text-ink6">{t("body")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={routes.home} variant="primary" size="md">
            {t("home")}
          </ButtonLink>
          <ButtonLink href={routes.shop} variant="outline" size="md">
            {t("shop")}
          </ButtonLink>
          <ButtonLink href={bookHref("kundali")} variant="outline" size="md">
            <Icon name="calendar" className="size-[18px]" />
            {t("consult")}
          </ButtonLink>
          <ButtonA href={waLinkTo(contact.whatsapp)} variant="outline" size="md">
            <Icon name="whatsapp" className="size-[18px]" />
            {t("wa")}
          </ButtonA>
        </div>
      </div>
    </section>
  );
}
