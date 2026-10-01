import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/commerce/ProductImage";
import { Icon } from "@/components/icons/Icon";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import type { JournalItem } from "@/lib/api/content";
import { routes } from "@/lib/routes";
import type { Product } from "@/types/product";

/* §15 "14 Journal" (Home.dc.html 870–892, vBlog 1354–1357, L3 1257). Sand band: a featured article
   (spans two rows on ≥1024, 4/3 art; 16/10 below) and two compact cards. Every link goes to the
   journal, which is a coming-soon page for now (design M.soon('The journal') → /blog, INV §C). */

/** Product art as the article picture: photos cover, generated art is contained (as M.img). */
function ArticleArt({ p, sizes }: { p: Product; sizes: string }) {
  return <ProductImage p={p} alt="" sizes={sizes} className={p.photo ? undefined : "object-contain"} />;
}

export async function Journal({ articles }: { articles: JournalItem[] }) {
  const t = await getTranslations("home.journal");
  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;
  const [a0, ...rest] = articles.slice(0, 3);

  return (
    <section lang="en" data-screen-label="14 Journal" className="bg-s1 shadow-hair-y">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,128px)]">
        <div className="mb-[clamp(24px,3.4vw,44px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <MaskText className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(26px,3.4vw,44px)] leading-[1.12] font-normal tracking-[-.02em] text-em9 font-soft">
              <MaskLine>{t.rich("l1", { em })}</MaskLine>
            </h2>
          </MaskText>
          <Link
            href={routes.blog}
            className="inline-flex items-center gap-2 bg-[linear-gradient(#B8923A,#B8923A)] bg-[length:100%_1px] bg-bottom bg-no-repeat py-1.5 font-sans text-[14px] leading-[1.3] font-semibold text-em7 no-underline"
          >
            {t("all")}
            <Icon name="arrowR" className="size-[15px]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-[clamp(16px,2vw,28px)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <Link
            href={routes.blog}
            data-reveal="0"
            className="flex flex-col gap-[18px] text-ink no-underline hover:text-ink lg:row-span-2"
          >
            <span className="relative block aspect-[16/10] overflow-hidden rounded-btn bg-[#EFE6D2] shadow-[inset_0_0_0_1px_rgba(184,146,58,.35)] lg:aspect-[4/3]">
              <span className="absolute top-[6%] right-[18%] bottom-0 left-[18%] block">
                {a0?.product && <ArticleArt p={a0.product} sizes="(min-width: 1024px) 34vw, 64vw" />}
              </span>
            </span>
            <span className="flex flex-col gap-2.5">
              <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.14em] text-g7 uppercase">
                {t("metaLong", { c: a0?.c, m: a0?.m })}
              </span>
              <span className="font-display text-[clamp(24px,2.6vw,34px)] leading-[1.18] font-normal text-balance text-em9 font-soft">
                {a0?.t}
              </span>
              <span className="max-w-[560px] font-sans text-[15.5px] leading-[1.65] text-ink6">{t("featLine")}</span>
            </span>
          </Link>
          {rest.map((a, i) => (
            <Link
              key={a.slug}
              href={routes.blog}
              data-reveal={i + 1}
              className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-[18px] rounded-btn bg-iv p-3.5 text-ink no-underline shadow-[inset_0_0_0_1px_rgba(184,146,58,.3)] transition-shadow duration-[250ms] hover:text-ink hover:shadow-ring-g5 md:grid-cols-[120px_minmax(0,1fr)]"
            >
              <span className="relative block aspect-[4/5] overflow-hidden rounded-3 bg-s1">
                {a.product && <ArticleArt p={a.product} sizes="120px" />}
              </span>
              <span className="flex min-w-0 flex-col gap-2">
                <span className="font-sans text-[10.5px] leading-[1.2] font-semibold tracking-[.14em] text-g7 uppercase">
                  {t("metaShort", { c: a.c, m: a.m })}
                </span>
                <span className="font-display text-[clamp(19px,1.8vw,23px)] leading-[1.25] font-normal text-balance text-em9">
                  {a.t}
                </span>
                <span className="inline-flex items-center gap-1.5 font-sans text-[13px] leading-none font-semibold text-em7">
                  {t("read")}
                  <Icon name="arrowR" className="size-3.5" />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
