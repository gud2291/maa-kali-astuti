import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/commerce/ProductImage";
import { Icon } from "@/components/icons/Icon";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { InlineArt } from "@/components/ui/InlineArt";
import { Stars } from "@/components/ui/Rating";
import { productById } from "@/lib/api/products-index";
import { PORTRAIT_TESTI_SVG } from "@/lib/art/portrait";
import reviews from "@/lib/data/reviews.json";
import testimonials from "@/lib/data/testimonials.json";
import { videoHref } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { TESTI_ORDER, VIDEO_TESTI } from "./home-data";

/* §14 "13 Testimonials and reviews" (Home.dc.html 841–868, vTesti 1346–1353, L3 1256).
   Ten cards in the design order: text testimonials, photo reviews (product photo + "Verified
   buyer") and two video testimonials. Masonry of 2 columns from 768 and 3 from 1100; below 768
   a swipe rail of 84%-wide cards. The video cards render light (INV gotcha 9: the prototype's
   dark palette is overwritten), and their play button goes to /videos (INV §C). */

type Card = {
  key: string;
  q: string;
  n: string;
  c: string;
  s: string;
  /** Quote size + padding differ between text and media cards. */
  media: boolean;
  top?: ReactNode;
};

export async function Testimonials() {
  const t = await getTranslations("home.testi");
  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;

  const cards: Card[] = TESTI_ORDER.flatMap(([kind, i]): Card[] => {
    if (kind === "t") {
      const x = testimonials[i];
      return [{ key: `t${i}`, q: x.q, n: x.n, c: x.c, s: x.s, media: false }];
    }
    if (kind === "p") {
      const r = reviews[i];
      const p = productById(r.pid);
      if (!p) return [];
      return [
        {
          key: `p${i}`,
          q: r.q,
          n: r.n,
          c: `${r.c} · ${r.d}`,
          s: p.name.replace("Hand-Energized Pure ", ""),
          media: true,
          top: (
            <span className="relative block aspect-[4/3] overflow-hidden rounded-3 bg-s1">
              <ProductImage
                p={p}
                sizes="(min-width: 1100px) 30vw, (min-width: 768px) 45vw, 84vw"
                className={p.photo ? undefined : "object-contain"}
              />
              <span className="absolute bottom-2.5 left-2.5 inline-flex h-6 items-center gap-1.5 rounded-pill bg-[rgba(251,247,238,.94)] px-[9px] font-sans text-[10.5px] leading-none font-bold tracking-[.04em] text-em7">
                <Icon name="checkc" className="size-[13px] text-ok" />
                {t("verified")}
              </span>
            </span>
          ),
        },
      ];
    }
    const v = VIDEO_TESTI[i];
    return [
      {
        key: `v${i}`,
        q: v.q,
        n: v.n,
        c: v.c,
        s: v.s,
        media: true,
        top: (
          <Link
            href={videoHref()}
            aria-label={t("playVideo", { name: v.n })}
            className="relative block aspect-[4/5] w-full overflow-hidden rounded-3 bg-n9 no-underline"
          >
            <span aria-hidden="true" className="absolute inset-0 block">
              <InlineArt svg={PORTRAIT_TESTI_SVG[v.art]} uid={v.art} />
            </span>
            <span className="absolute top-[42%] left-1/2 -mt-8 -ml-8 grid size-16 place-items-center rounded-pill bg-[rgba(10,31,26,.55)] text-g3 shadow-[inset_0_0_0_1.5px_#D9B96A]">
              <Icon name="play" className="ml-1 size-6" />
            </span>
            <span className="absolute right-4 bottom-4 left-4 flex flex-col gap-[5px] text-left">
              <span className="font-sans text-[10.5px] leading-none font-semibold tracking-[.14em] text-g3 uppercase">
                {t("video", { dur: v.dur })}
              </span>
              <span className="font-display text-[19px] leading-[1.2] font-normal text-iv">{v.title}</span>
            </span>
          </Link>
        ),
      },
    ];
  });

  return (
    <section lang="en" data-screen-label="13 Testimonials and reviews" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,136px)]">
        <div className="mb-[clamp(28px,4vw,48px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(34px,4.2vw,56px)] leading-[1.06] font-normal tracking-[-.02em] text-em9 font-soft">
              <MaskLine>{t.rich("l1", { em })}</MaskLine>
            </h2>
          </MaskText>
          <div data-reveal="1" className="flex items-center gap-3.5">
            <span className="font-display text-[52px] leading-none font-normal text-em9 tabular">
              4.9<span className="text-[22px] text-ink6">{t("outOf")}</span>
            </span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-4 w-[90px]">
                <Stars col="#B8923A" />
              </span>
              <span className="font-sans text-[13px] leading-[1.3] font-medium text-ink6">{t("from")}</span>
            </span>
          </div>
        </div>

        <div className="-mx-4 no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-1.5 min-[1100px]:columns-3 md:mx-0 md:block md:snap-none md:columns-2 md:gap-x-5 md:overflow-visible md:p-0">
          {cards.map((q) => (
            <article
              key={q.key}
              className={cn(
                "mb-5 flex flex-[0_0_84%] snap-start break-inside-avoid flex-col gap-4 rounded-btn bg-cream text-ink shadow-ring-sand md:flex-none",
                q.media ? "px-3.5 pt-3.5 pb-[22px]" : "p-6",
              )}
            >
              {q.top}
              <span className="block h-[13px] w-[76px]">
                <Stars col="#B8923A" label={t("stars")} />
              </span>
              <p
                className={cn(
                  "m-0 font-display leading-[1.45] font-normal text-pretty text-em9 [font-variation-settings:'SOFT'_50]",
                  q.media ? "text-[16.5px]" : "text-[18px]",
                )}
              >
                {q.q}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-s2 pt-3.5">
                <span className="flex flex-col gap-[3px]">
                  <span className="font-sans text-[14px] leading-[1.2] font-semibold text-ink">{q.n}</span>
                  <span className="font-sans text-[12.5px] leading-[1.2] font-medium text-ink6">{q.c}</span>
                </span>
                <span className="inline-flex h-[26px] items-center rounded-pill bg-em1 px-2.5 font-sans text-[11.5px] leading-none font-semibold whitespace-nowrap text-em7">
                  {q.s}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
