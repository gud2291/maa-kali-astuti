import type { CSSProperties, ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { ProductImage } from "@/components/commerce/ProductImage";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { getProductsByIds } from "@/lib/api/catalog";
import { categoryHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { HOME_CATS } from "./home-data";

/* §3 Shop by category (Home.dc.html 197–239, vCats 1426–1448).
   Five arches in a crescent rhythm (aspect 1:1.3 → 1:1.43 → 1:1.3) on ≥768; below 768 a snap rail
   of 62%-wide arches, all 1:1.3. Hover or focus: emerald fill rises from the bottom (650 ms), the
   art lifts 8px, a gem floats in (800 ms) and "Shop now" slides up (450 ms). */

const rad = (ar: number) => `${(50 / ar).toFixed(1)}%`;

export async function CategoryArches() {
  const t = await getTranslations("home.cats");
  const locale = await getLocale();
  const hi = locale === "hi";
  const products = await getProductsByIds(HOME_CATS.flatMap((c) => (c.pid ? [c.pid] : [])));
  const byId = new Map(products.map((p) => [p.id, p]));
  const em = (c: ReactNode) => <em className={hi ? "text-g5 not-italic" : "text-g5 italic"}>{c}</em>;

  return (
    <section data-screen-label="02 Categories" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(64px,9vw,136px)] pb-[clamp(56px,7vw,104px)]">
        <div className="mb-[clamp(32px,4.4vw,64px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] items-end gap-x-16 gap-y-[18px]">
          {hi ? (
            <MaskText className="flex flex-col gap-2.5">
              <span className="font-hi text-[15px] leading-[1.35] font-medium text-g7">{t("eyebrow")}</span>
              <h2 className="m-0 font-deva text-[clamp(26px,3.2vw,42px)] leading-[1.35] font-normal text-em9">
                <span className="-mb-[.1em] block overflow-hidden pb-[.1em]">
                  <span data-ln="" className="block">
                    {t.rich("title", { em })}
                  </span>
                </span>
              </h2>
              <span lang="en" className="font-display text-[18px] leading-[1.35] text-g7 italic">
                {t("sub")}
              </span>
            </MaskText>
          ) : (
            <MaskText className="flex flex-col gap-3">
              <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
                {t("eyebrow")}
              </span>
              <h2 className="m-0 font-display text-[clamp(26px,3.4vw,44px)] leading-[1.12] font-normal tracking-[-.018em] text-em9 font-soft">
                <MaskLine>{t.rich("title", { em })}</MaskLine>
              </h2>
              <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-g7">
                {t("sub")}
              </span>
            </MaskText>
          )}
          <div data-reveal="1" className="flex max-w-[460px] flex-col items-start gap-3.5 lg:justify-self-end">
            <p className="m-0 font-sans text-[16px] leading-[1.65] text-pretty text-ink6">{t("intro")}</p>
            <Link
              href={routes.shop}
              className="inline-flex items-center gap-2 bg-[linear-gradient(#B8923A,#B8923A)] bg-[size:100%_1px] bg-[position:0_100%] bg-no-repeat py-1.5 font-sans text-[14px] leading-[1.3] font-semibold text-em7 no-underline"
            >
              {t("all")}
              <span className="block size-[15px]">
                <Icon name="arrowR" />
              </span>
            </Link>
          </div>
        </div>

        <div className="-mx-4 no-scrollbar flex snap-x snap-mandatory items-end gap-[clamp(12px,1.6vw,24px)] overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-5 md:overflow-x-visible md:px-0 md:pb-0">
          {HOME_CATS.map((c, i) => {
            const p = c.pid ? byId.get(c.pid) : undefined;
            const vars = {
              "--ar-d": `1/${c.ar}`,
              "--rad-d": rad(c.ar),
              "--rad-m": rad(1.3),
            } as CSSProperties;
            return (
              <Link
                key={c.key}
                href={categoryHref(c.key)}
                data-reveal={i}
                style={vars}
                className="group flex flex-[0_0_62%] snap-center flex-col gap-[18px] text-ink no-underline md:flex-none"
              >
                <span className="relative block aspect-[1/1.3] overflow-hidden [border-radius:50%_50%_4px_4px/var(--rad-m)_var(--rad-m)_4px_4px] bg-s1 shadow-[inset_0_0_0_1px_rgba(184,146,58,.5)] md:[aspect-ratio:var(--ar-d)] md:[border-radius:50%_50%_4px_4px/var(--rad-d)_var(--rad-d)_4px_4px]">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 block origin-bottom scale-y-0 bg-em7 transition-transform duration-[650ms] ease-mka group-hover:scale-y-100 group-focus:scale-y-100"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-[7px] block [border-radius:50%_50%_2px_2px/var(--rad-m)_var(--rad-m)_2px_2px] shadow-[inset_0_0_0_1px_rgba(184,146,58,.35)] transition-shadow duration-[400ms] group-hover:shadow-[inset_0_0_0_1px_rgba(217,185,106,.7)] group-focus:shadow-[inset_0_0_0_1px_rgba(217,185,106,.7)] md:[border-radius:50%_50%_2px_2px/var(--rad-d)_var(--rad-d)_2px_2px]"
                  />
                  <span className="absolute top-[12%] right-[4%] bottom-[6%] left-[4%] block transition-transform duration-[650ms] ease-mka group-hover:-translate-y-2 group-focus:-translate-y-2">
                    {p ? (
                      <ProductImage p={p} alt="" sizes="(min-width: 768px) 20vw, 60vw" className="object-contain" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/svg/categories/${c.art}.svg`}
                        alt=""
                        width={400}
                        height={500}
                        loading="lazy"
                        decoding="async"
                        className="block size-full"
                      />
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute top-[20%] right-[9%] block aspect-square w-[22%] translate-y-3.5 opacity-0 transition-[opacity,transform] duration-[400ms,800ms] ease-mka group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100"
                  >
                    <span data-amb="float:6:8:10" className="block size-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/svg/gems/${c.gem}.svg`}
                        alt=""
                        width={100}
                        height={100}
                        loading="lazy"
                        className="block size-full"
                      />
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-4 flex translate-y-2 justify-center opacity-0 transition-[opacity,transform] duration-[300ms,450ms] ease-mka group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 font-sans text-[11px] leading-none font-bold text-g1 uppercase",
                        !hi && "tracking-[.14em]",
                      )}
                    >
                      {t("cta")}
                      <span className="block size-[13px]">
                        <Icon name="arrowR" />
                      </span>
                    </span>
                  </span>
                </span>
                <span className="flex flex-col items-center gap-1.5 text-center">
                  <span className="font-sans text-[11px] leading-none font-semibold tracking-[.16em] text-g7 tabular">
                    0{i + 1}
                  </span>
                  {hi ? (
                    <>
                      <span className="font-deva text-[clamp(20px,1.7vw,24px)] leading-[1.35] text-em9">
                        {c.name.hi}
                      </span>
                      <span lang="en" className="font-display text-[14.5px] leading-[1.3] text-g7 italic">
                        {c.name.en}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-display text-[clamp(19px,1.6vw,23px)] leading-[1.15] text-balance text-em9 font-soft">
                        {c.name.en}
                      </span>
                      <span lang="hi" className="font-deva text-[15px] leading-[1.35] text-g7">
                        {c.name.hi}
                      </span>
                    </>
                  )}
                  <span className="font-sans text-[13px] leading-[1.3] font-medium text-ink6">
                    {hi ? c.count.hi : c.count.en}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
