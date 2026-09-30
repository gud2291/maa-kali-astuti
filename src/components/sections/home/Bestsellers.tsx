import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { getAllProducts, getProductsByIds } from "@/lib/api/catalog";
import type { Product } from "@/types/product";
import { BestsellerTabs } from "./BestsellerTabs";
import { BEST_IDS, BEST_TAB_CAT, BEST_TABS, type BestTab } from "./home-data";

/* §4 Bestsellers (Home.dc.html 241–272, bestList 1059–1065, vBest 1449–1459).
   The five tab lists are resolved on the server; the client island only swaps between them. */
export async function Bestsellers() {
  const t = await getTranslations("home.best");
  const all = await getAllProducts();
  const byPop = (a: Product, b: Product) => b.pop - a.pop;

  const lists = Object.fromEntries(
    await Promise.all(
      BEST_TABS.map(async (k): Promise<[BestTab, Product[]]> => {
        if (k === "best") return [k, await getProductsByIds(BEST_IDS)];
        if (k === "new")
          return [
            k,
            all
              .slice()
              .sort((a, b) => a.date - b.date)
              .slice(0, 8),
          ];
        const cat = BEST_TAB_CAT[k];
        return [
          k,
          all
            .filter((p) => p.cat === cat)
            .sort(byPop)
            .slice(0, 8),
        ];
      }),
    ),
  ) as Record<BestTab, Product[]>;

  const em = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;

  return (
    <section data-screen-label="03 Bestsellers" className="bg-iv shadow-[inset_0_1px_0_#EAE0CA]">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(56px,7vw,104px)] pb-[clamp(64px,8vw,120px)]">
        <BestsellerTabs lists={lists}>
          {/* The design keeps this heading in English on the Hindi page. */}
          <MaskText lang="en" className="flex flex-col gap-3">
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
              {t("eyebrow")}
            </span>
            <h2 className="m-0 font-display text-[clamp(34px,4.2vw,56px)] leading-[1.06] font-normal tracking-[-.02em] text-em9 font-soft">
              <MaskLine>{t.rich("title", { em })}</MaskLine>
            </h2>
            <span lang="hi" className="font-deva text-[19px] leading-[1.35] text-g7">
              {t("deva")}
            </span>
          </MaskText>
        </BestsellerTabs>
      </div>
    </section>
  );
}
