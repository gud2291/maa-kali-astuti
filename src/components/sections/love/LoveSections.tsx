import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Icon } from "@/components/icons/Icon";
import { EYEBROW, rich } from "@/components/sections/consult/ui";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { KOOTA } from "@/lib/astro/love";
import { fmt } from "@/lib/core/format";
import { bookHref, routes } from "@/lib/routes";
import type { Product } from "@/types/product";
import { LoveTool } from "./LoveTool";

/* Server-rendered parts of the Love Calculator page (Love-Calculator.dc.html). Copy rule on /hi
   (F9): display headings stay English; Manrope UI text is translated. */

const H2 = "m-0 font-display font-normal tracking-[-.018em] text-balance font-soft";

/** Tool hero (31–99): ivory, a faint brass mandala top-right; intro left, the card right (from 1024). */
export async function LoveHero() {
  const t = await getTranslations("love.hero");
  return (
    <section data-screen-label="Love calculator" className="relative overflow-hidden bg-iv">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-60 size-[640px] opacity-[.07]"
      >
        <svg viewBox="-320 -320 640 640" width="100%" height="100%" className="block">
          <MandalaG R={316} col="#B8923A" sw={1} />
        </svg>
      </div>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,44px)] pb-[clamp(56px,8vw,112px)] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <nav
            aria-label={t("crumbsAria")}
            className="flex items-center gap-2 font-sans text-[12.5px] leading-none font-medium text-ink6"
          >
            <Link href={routes.home} className="text-ink6 no-underline hover:text-ink6">
              {t("home")}
            </Link>
            <span aria-hidden="true" className="text-g5">
              /
            </span>
            <span aria-current="page" className="text-ink">
              {t("here")}
            </span>
          </nav>
          <span className={`${EYEBROW} text-g7`}>{t.rich("eyebrow", rich())}</span>
          <h1
            lang="en"
            className="m-0 font-display text-[clamp(42px,5.6vw,78px)] leading-[1.02] font-normal tracking-[-.022em] text-balance text-em9 font-soft"
          >
            {t.rich("title", rich())}
          </h1>
          <span lang="hi" className="font-deva text-[clamp(18px,2vw,22px)] leading-[1.35] text-g7">
            नाम से जानिए आपसी तालमेल
          </span>
          <p className="m-0 max-w-[500px] font-sans text-[clamp(16px,1.4vw,18px)] leading-[1.65] text-pretty text-ink6">
            {t("lead")}
          </p>
          <span className="mt-1.5 flex max-w-[480px] items-start gap-2.5 border-t border-s2 pt-4 font-title text-[16px] leading-[1.5] text-ink italic hi:not-italic">
            <span className="mt-[3px] block size-[18px] flex-none text-g5">
              <Icon name="heart" />
            </span>
            {t("note")}
          </span>
        </div>
        <LoveTool />
      </div>
    </section>
  );
}

/** 02 A note of honesty (139–168): sand; copy left, the Ashtakoot Milan card right (from 1024). */
export async function LoveMilan({ premiumPrice }: { premiumPrice: number }) {
  const t = await getTranslations("love.milan");
  return (
    <section data-screen-label="Kundali Milan" className="bg-s1 shadow-hair-y">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(32px,5vw,88px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] lg:grid-cols-2">
        <div data-reveal="0" className="flex max-w-[560px] flex-col gap-3.5">
          <span className={`${EYEBROW} text-g7`}>{t("eyebrow")}</span>
          <h2 lang="en" className={`${H2} text-[clamp(32px,3.8vw,50px)] leading-[1.08] text-em9`}>
            {t.rich("title", rich())}
          </h2>
          <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-g7">
            विवाह का निर्णय कुंडली मिलान से
          </span>
          <p className="m-0 font-sans text-[16px] leading-[1.7] text-pretty text-ink">{t("p1")}</p>
          <p className="m-0 font-sans text-[16px] leading-[1.7] text-pretty text-ink6">{t("p2")}</p>
        </div>
        <div
          data-reveal="1"
          className="flex flex-col gap-[18px] rounded-btn bg-cream p-[clamp(22px,3vw,34px)] shadow-[inset_0_0_0_1px_rgba(184,146,58,.5),0_24px_48px_-32px_rgba(14,59,48,.35)]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span lang="en" className="font-display text-[24px] leading-[1.2] text-em9">
              Ashtakoot Milan
            </span>
            <span className="font-sans text-[12.5px] leading-none font-semibold text-ink6 tabular">{t("gunas")}</span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {KOOTA.map(([k, p]) => (
              <li key={k} className="grid grid-cols-[112px_minmax(0,1fr)_28px] items-center gap-3">
                <span lang="en" className="font-sans text-[13.5px] leading-[1.2] font-semibold text-ink">
                  {k}
                </span>
                <span aria-hidden="true" className="relative h-1.5 overflow-hidden rounded-pill bg-s1">
                  <span
                    className="absolute inset-y-0 left-0 rounded-pill bg-g5"
                    style={{ width: `${(p / 8) * 100}%` }}
                  />
                </span>
                <span className="text-right font-sans text-[13px] leading-none font-bold text-em9 tabular">
                  {p}
                  <span className="sr-only"> {t("gunasUnit")}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-s2 pt-[18px]">
            <span className="flex flex-col gap-1">
              <span className="font-sans text-[13.5px] leading-[1.3] font-semibold text-ink">{t("incl")}</span>
              <span className="font-sans text-[12.5px] leading-[1.3] font-medium text-ink6 tabular">
                {t("inclSub", { price: fmt(premiumPrice) })}
              </span>
            </span>
            <Link
              href={bookHref("kundali", "premium")}
              className="inline-flex h-[50px] items-center gap-[9px] rounded-btn bg-em7 px-5 font-sans text-[14.5px] leading-none font-semibold text-iv no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5 hover:text-iv"
            >
              <span className="block size-[17px]">
                <Icon name="calendar" />
              </span>
              {t("cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 03 For love & relationships (170–185): 4 ProductCards (2 per row, 4 from 1024). */
export async function LoveProducts({ products }: { products: Product[] }) {
  const t = await getTranslations("love.products");
  return (
    <section data-screen-label="Related products" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(56px,8vw,112px)] pb-[clamp(72px,9vw,128px)]">
        <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-3.5">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={`${EYEBROW} text-g7`}>{t("eyebrow")}</span>
            <h2 lang="en" className={`${H2} text-[clamp(30px,3.6vw,46px)] leading-[1.08] text-em9`}>
              {t.rich("title", rich())}
            </h2>
          </div>
          <Link
            href={routes.shop}
            className="inline-flex items-center gap-2 bg-[linear-gradient(#B8923A,#B8923A)] bg-[length:100%_1px] bg-bottom bg-no-repeat py-1.5 font-sans text-[14px] leading-[1.3] font-semibold text-em7 no-underline"
          >
            {t("all")}
            <span className="block size-[15px]">
              <Icon name="arrowR" />
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-[clamp(12px,2vw,24px)] lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="min-w-0">
              <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 50vw" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
