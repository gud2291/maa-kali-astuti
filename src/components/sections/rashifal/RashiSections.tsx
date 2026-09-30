import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Icon } from "@/components/icons/Icon";
import { Starfield } from "@/components/signature/Starfield";
import { EYEBROW, rich, UNDERLINE } from "@/components/sections/consult/ui";
import { InlineArt } from "@/components/ui/InlineArt";
import { DIYA_SVG } from "@/lib/art/diya";
import type { Rashi } from "@/lib/astro/rashi";
import { routes, serviceHref } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";
import { RashiChart, RashiCompat } from "./RashiDetail";
import { brass, H2 } from "./ui";

/* Server-rendered parts of the rashi page (Rashi-Detail.dc.html 112–167). Copy rule on /hi (F9):
   display headings stay English; Manrope UI text is translated; rashi data (remedy) stays English. */

/** §4 Remedy (112–122). Night with a sparser sky; the diya (glow + flicker) beside the remedy. */
export async function RashiRemedy({ r }: { r: Rashi }) {
  const t = await getTranslations("rashifal.remedy");
  return (
    <section data-screen-label="Remedy" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="rd-sky2" n={14} nMob={8} h={800} />
      </div>
      <div className="relative mx-auto grid max-w-[1040px] grid-cols-1 items-center gap-x-[clamp(24px,4vw,48px)] gap-y-5 px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,104px)] md:grid-cols-[120px_minmax(0,1fr)_auto]">
        <span className="block size-[120px]">
          <InlineArt svg={DIYA_SVG} uid="rd-diya" />
        </span>
        <div className="flex min-w-0 flex-col gap-3">
          <span className={cn(EYEBROW, "text-g3")}>{t.rich("eyebrow", rich("text-g3"))}</span>
          <p
            lang="en"
            className="m-0 font-display text-[clamp(22px,2.6vw,32px)] leading-[1.35] text-pretty text-iv italic [font-variation-settings:'SOFT'_50]"
          >
            {r.remedy}
          </p>
          <span className="font-sans text-[14px] leading-[1.5] font-medium text-sg3">
            {t("when", { day: r.day, dayHi: r.dayHi })}
          </span>
        </div>
      </div>
    </section>
  );
}

/** §5 Compatible rashis + recommended products (124–152). Ivory; products 2 cols, 4 from 1024. */
export async function RashiRecommend({ r, products }: { r: Rashi; products: Product[] }) {
  const t = await getTranslations("rashifal.recommend");
  return (
    <section data-screen-label="Compatible and products" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
        <RashiCompat r={r} />

        <div className="mt-[clamp(56px,7vw,96px)] mb-[clamp(20px,3vw,32px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-3.5 border-t border-s2 pt-[clamp(32px,4vw,48px)]">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow", { name: r.en })}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.6vw,46px)]")}>
              {t.rich("title", { em: brass })}
            </h2>
          </div>
          <Link href={routes.shop} className={cn(UNDERLINE, "inline-flex items-center gap-2 text-[14px] leading-[1.3]")}>
            {t("all")}
            <Icon name="arrowR" className="size-[15px]" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-[clamp(12px,2vw,24px)] lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="min-w-0">
              <ProductCard product={p} sizes="(min-width: 1024px) 300px, 50vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** §6 Kundali CTA (154–167). Sand; copy + two CTAs beside the demo chart (1.2fr / .8fr from 1024). */
export async function RashiCta({ r }: { r: Rashi }) {
  const t = await getTranslations("rashifal.cta");
  return (
    <section data-screen-label="Kundali CTA" className="bg-s1 shadow-[inset_0_1px_0_rgba(184,146,58,.35)]">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] pt-[clamp(56px,8vw,104px)] pb-[clamp(80px,9vw,120px)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
        <div data-reveal="0" className="flex max-w-[560px] flex-col gap-3.5">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.6vw,46px)]")}>
            A rashi is one sign. Your chart has {brass("twelve houses.")}
          </h2>
          <p className="m-0 font-sans text-[16px] leading-[1.7] text-pretty text-ink6">{t("lead", { name: r.en })}</p>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <Link
              href={routes.kundali99}
              className="inline-flex h-[52px] items-center gap-2.5 rounded-btn bg-em7 px-6 font-sans text-[15px] leading-none font-semibold text-iv no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5 hover:text-iv"
            >
              <Icon name="kundali" className="size-[18px]" />
              {t("kundali")}
            </Link>
            <Link
              href={serviceHref("kundali")}
              className="inline-flex h-[52px] items-center gap-2 rounded-btn bg-iv px-5 font-sans text-[15px] leading-none font-semibold text-em7 no-underline shadow-[inset_0_0_0_1px_#164E3F] hover:bg-em1"
            >
              {t("book")}
            </Link>
          </div>
        </div>
        <RashiChart label={t("chartAria")} />
      </div>
    </section>
  );
}
