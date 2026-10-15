import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Logo } from "@/components/ui/Logo";
import { LotusRule } from "@/components/ui/ornaments/LotusRule";
import { ButtonA, ButtonLink } from "@/components/ui/Button";
import { routes } from "@/lib/routes";
import { waLinkTo } from "@/lib/core/commerce";
import { getSetting } from "@/server/settings/queries";

/**
 * Branded placeholder for pages linked by the design but not designed yet (INV §G): turning
 * chakra around the emblem, "Being prepared", the page title and links back into the store.
 * Built only from existing design tokens and components.
 */
export async function ComingSoon({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  const [t, contact] = await Promise.all([getTranslations("soon"), getSetting("contact")]);
  return (
    <section className="container-mka flex min-h-[72vh] flex-col items-center justify-center gap-6 section-y text-center">
      <div className="relative size-[112px]">
        <div data-amb="spin:120" aria-hidden className="absolute -inset-10 opacity-60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/svg/chakra/outer-d9b96a.svg" alt="" width={192} height={192} className="size-full" />
        </div>
        <div data-amb="spin:-90" aria-hidden className="absolute -inset-4 opacity-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/svg/chakra/middle-d9b96a.svg" alt="" width={144} height={144} className="size-full" />
        </div>
        <Logo uid="soon" className="relative" sizes="112px" />
      </div>
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h1 className="m-0 font-display text-[clamp(32px,4vw,52px)] leading-[1.08] font-normal tracking-[-.02em] text-em9 font-soft hi:font-deva hi:leading-[1.35] hi:tracking-normal">
        {title}
      </h1>
      {lead && <p className="m-0 font-sans text-[15px] leading-[1.5] font-semibold text-g7">{lead}</p>}
      <div className="h-4 w-60">
        <LotusRule />
      </div>
      <p className="m-0 max-w-[520px] font-sans text-[16px] leading-[1.65] text-ink6">{t("body")}</p>
      {children}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href={routes.home} variant="primary" size="md">
          {t("home")}
        </ButtonLink>
        <ButtonLink href={routes.shop} variant="outline" size="md">
          {t("shop")}
        </ButtonLink>
        <ButtonA href={waLinkTo(contact.whatsapp)} variant="outline" size="md">
          <span className="block size-[18px]">
            <Icon name="whatsapp" />
          </span>
          {t("wa")}
        </ButtonA>
      </div>
    </section>
  );
}
