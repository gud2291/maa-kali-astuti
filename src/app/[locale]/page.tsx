import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Logo } from "@/components/ui/Logo";
import { LotusRule } from "@/components/ui/ornaments/LotusRule";
import { ButtonLink } from "@/components/ui/Button";
import { ProductCard } from "@/components/commerce/ProductCard";
import { getProductsByIds } from "@/lib/api/catalog";

/* F2 placeholder: proves fonts, tokens, grain, the inline logo and one ambient loop.
   F3 adds a temporary ProductCard preview. The real Home is built in F5–F7. */
export default function HomePlaceholder({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("placeholder");
  const other = locale === "hi" ? "en" : "hi";

  return (
    <>
      <section className="container-mka flex min-h-[80vh] flex-col items-center justify-center gap-6 section-y text-center">
        <div className="relative size-[132px]">
          {/* chakra halo — spins via data-amb, paused offscreen / hidden tab / reduced motion */}
          <div data-amb="spin:120" className="absolute -inset-10 opacity-60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/svg/chakra/outer-d9b96a.svg" alt="" width={212} height={212} className="size-full" />
          </div>
          <Logo uid="ph" className="relative" />
        </div>
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="m-0 font-display text-[clamp(34px,4.2vw,56px)] leading-[1.06] font-normal tracking-[-.02em] text-em9 font-soft hi:font-deva hi:leading-[1.35] hi:tracking-normal">
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
      <CardPreview title={t("cards")} />
    </>
  );
}

/* Temporary (F3): every card state in one place — sizes + bestseller, sold out, "only N left",
   photographed product, row layout and wishlist mode. Removed when F5 builds the Home. */
async function CardPreview({ title }: { title: string }) {
  const [pyrite, r12, vidya, nag12, havan, m7] = await getProductsByIds([
    "b-pyrite",
    "r12",
    "a-vidya",
    "nag12",
    "havan",
    "m7",
  ]);
  return (
    <section className="container-mka pb-24">
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
        <ProductCard product={pyrite} />
        <ProductCard product={r12} />
        <ProductCard product={vidya} />
        <ProductCard product={nag12} />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,420px)_minmax(0,260px)]">
        <ProductCard product={havan} size="row" />
        <ProductCard product={m7} size="compact" mode="wish" />
      </div>
    </section>
  );
}
