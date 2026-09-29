import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Logo } from "@/components/ui/Logo";
import { LotusRule } from "@/components/ui/ornaments/LotusRule";
import { ButtonLink } from "@/components/ui/Button";

/* F2 placeholder: proves fonts, tokens, grain, the inline logo and one ambient loop.
   The real Home is built in F5–F7. */
export default function HomePlaceholder({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("placeholder");
  const other = locale === "hi" ? "en" : "hi";

  return (
    <section className="container-mka section-y flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
      <div className="relative size-[132px]">
        {/* chakra halo — spins via data-amb, paused offscreen / hidden tab / reduced motion */}
        <div data-amb="spin:120" className="absolute -inset-10 opacity-60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/svg/chakra/outer-d9b96a.svg" alt="" width={212} height={212} className="size-full" />
        </div>
        <Logo uid="ph" className="relative" />
      </div>
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h1 className="m-0 font-display text-[clamp(34px,4.2vw,56px)] leading-[1.06] font-normal font-soft tracking-[-.02em] text-em9 hi:font-deva hi:leading-[1.35] hi:tracking-normal">
        {t("heading")}
      </h1>
      <span lang="hi" className="font-deva text-[19px] leading-[1.35] text-g7">
        ॥ साधक पवन पाण्डेय ॥
      </span>
      <div className="h-4 w-60">
        <LotusRule />
      </div>
      <p className="m-0 max-w-[520px] font-sans text-[16px] leading-[1.65] text-ink6">{t("body")}</p>
      <ButtonLink href="/" locale={other} variant="outline" size="md">
        {other === "hi" ? "हिंदी" : "English"}
      </ButtonLink>
    </section>
  );
}
