"use client";
import type { Ref } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductImage } from "@/components/commerce/ProductImage";
import { Starfield } from "@/components/signature/Starfield";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { shimmer } from "@/components/motion/fx";
import { routes } from "@/lib/routes";
import { waLink } from "@/lib/site";
import type { Product } from "@/types/product";
import { bannerKey, type ShopCat } from "./shop-data";

type Cell = { k: "card"; p: Product } | { k: "skel" } | { k: "banner" };

const CARD_SIZES = "(min-width: 1400px) 22vw, (min-width: 1024px) 26vw, (min-width: 768px) 30vw, 50vw";

/**
 * Results grid (Shop.dc.html 174–201, cells 343–346): 2 / 3 (≥768) / 4 (≥1400) columns.
 * While loading: skeletons. The editorial banner shows once, after the first two rows
 * (index cols × 2, INV gotcha 4). "Load more" appends a row of skeletons for 520 ms.
 */
export function ShopGrid({
  gridRef,
  items,
  loading,
  moreLoading,
  shown,
  cols,
  mob,
  cat,
  bannerArt,
}: {
  gridRef: Ref<HTMLDivElement>;
  items: Product[];
  loading: boolean;
  moreLoading: boolean;
  shown: number;
  cols: number;
  mob: boolean;
  cat: ShopCat;
  bannerArt: Product | undefined;
}) {
  const bi = cols * 2;
  let cells: Cell[] = loading
    ? Array.from({ length: Math.min(shown, mob ? 6 : bi) }, () => ({ k: "skel" }) as const)
    : items.slice(0, shown).map((p) => ({ k: "card", p }) as const);
  if (!loading && cells.length > bi) cells.splice(bi, 0, { k: "banner" });
  if (moreLoading) cells = cells.concat(Array.from({ length: cols }, () => ({ k: "skel" }) as const));

  return (
    <div
      ref={gridRef}
      id="shop-results"
      aria-busy={loading || moreLoading}
      className="grid grid-cols-2 gap-x-[clamp(12px,1.8vw,24px)] gap-y-[clamp(14px,2vw,28px)] md:grid-cols-3 2xl:grid-cols-4"
    >
      {cells.map((c, i) =>
        c.k === "card" ? (
          <div key={c.p.id} data-card="1" className="min-w-0">
            <ProductCard product={c.p} sizes={CARD_SIZES} />
          </div>
        ) : c.k === "banner" ? (
          <EditorialBanner key="banner" cat={cat} art={bannerArt} />
        ) : (
          <Skeleton key={`s${i}`} />
        ),
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      <div
        ref={(el) => shimmer(el)}
        className="aspect-[4/5] rounded-btn bg-s1 bg-[linear-gradient(100deg,rgba(234,224,202,0)_30%,rgba(234,224,202,.9)_50%,rgba(234,224,202,0)_70%)] bg-size-[220%_100%] bg-no-repeat"
      />
      <div className="h-2.5 w-[40%] rounded-field bg-s2" />
      <div className="h-4 w-[85%] rounded-field bg-s2" />
      <div className="h-3.5 w-[55%] rounded-field bg-s2" />
    </div>
  );
}

/** Night banner with stars + a faint mandala; floating art from 1024 (Shop.dc.html 185–199). */
function EditorialBanner({ cat, art }: { cat: ShopCat; art: Product | undefined }) {
  const t = useTranslations("shop");
  const k = bannerKey(cat);
  return (
    <div
      data-card="1"
      className="relative col-span-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 overflow-hidden rounded-btn bg-n9 px-[clamp(20px,4vw,48px)] py-[clamp(22px,4vw,40px)] text-iv"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-90">
        <Starfield seed="ban" n={26} w={900} h={260} />
        <svg
          viewBox="0 0 900 260"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 block"
        >
          <g transform="translate(760 130)" opacity=".18">
            <MandalaG R={200} col="#D9B96A" sw={0.8} />
          </g>
        </svg>
      </div>
      <div className="relative flex max-w-[560px] flex-col gap-3">
        <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase hi:tracking-normal">
          {t("bannerEyebrow")}
        </span>
        <span className="font-display text-[clamp(24px,3vw,36px)] leading-[1.12] font-normal tracking-[-.015em] font-soft hi:font-deva hi:leading-[1.35] hi:tracking-normal">
          {t(`banner.${k}.a`)}
          <em className="text-g3 italic hi:not-italic">{t(`banner.${k}.i`)}</em>
        </span>
        <span className="font-sans text-[15px] leading-[1.6] text-em1">{t("bannerBody")}</span>
        <div className="mt-1.5 flex flex-wrap gap-2.5">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener"
            className="flex h-[46px] items-center gap-2 rounded-btn bg-g3 px-[18px] font-sans text-[14px] leading-none font-bold text-n9 no-underline hover:text-n9"
          >
            <span className="block size-[17px]">
              <Icon name="whatsapp" />
            </span>
            {t("askWa")}
          </a>
          <Link
            href={routes.consultations}
            className="flex h-[46px] items-center gap-2 rounded-btn px-[18px] font-sans text-[14px] leading-none font-semibold text-g3 no-underline shadow-ring-g3 hover:text-g3"
          >
            {t("bookConsult")}
          </Link>
        </div>
      </div>
      {art && (
        <span aria-hidden="true" data-amb="float:9:10:4" className="relative hidden h-[220px] w-[180px] lg:block">
          <ProductImage p={art} alt="" sizes="180px" className={art.photo ? undefined : "object-contain"} />
        </span>
      )}
    </div>
  );
}

/** Empty state (Shop.dc.html 162–172). */
export function EmptyState({ onClear }: { onClear: () => void }) {
  const t = useTranslations("shop");
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-btn bg-s1 px-4 py-[clamp(40px,8vw,96px)] text-center shadow-[inset_0_0_0_1px_rgba(184,146,58,.3)]">
      <span aria-hidden="true" className="block size-[120px]">
        <svg
          viewBox="0 0 120 120"
          width="100%"
          height="100%"
          fill="none"
          stroke="#B8923A"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <circle cx="60" cy="60" r="56" strokeDasharray="2 5" />
          <g transform="translate(24 24) scale(3)">
            <path d="M12 5c2 2.4 2.6 5.4 0 9.5C9.4 10.4 10 7.4 12 5z" />
            <path d="M12 14.5C10.7 10.8 8.4 9 4.8 8.9c.2 3.4 2.6 5.6 7.2 5.6zM12 14.5c1.3-3.7 3.6-5.5 7.2-5.6-.2 3.4-2.6 5.6-7.2 5.6z" />
            <path d="M4.5 15.8c2 1.8 4.6 2.7 7.5 2.7s5.5-.9 7.5-2.7" />
          </g>
        </svg>
      </span>
      <span className="font-display text-[clamp(24px,3vw,32px)] leading-[1.2] font-normal text-em9 hi:font-deva hi:leading-[1.4]">
        {t("emptyTitle")}
      </span>
      <span className="max-w-[420px] font-sans text-[15px] leading-[1.6] text-ink6">{t("emptyBody")}</span>
      <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
        <button
          type="button"
          onClick={onClear}
          className="h-12 cursor-pointer rounded-btn border-0 bg-em7 px-[22px] font-sans text-[14px] leading-none font-semibold text-iv shadow-ring-gold"
        >
          {t("clearFilters")}
        </button>
        <a
          href={waLink()}
          target="_blank"
          rel="noopener"
          className="flex h-12 items-center gap-2 rounded-btn px-5 font-sans text-[14px] leading-none font-semibold text-em7 no-underline shadow-ring-em hover:text-em7"
        >
          <span className="block size-[17px]">
            <Icon name="whatsapp" />
          </span>
          {t("askWa")}
        </a>
      </div>
    </div>
  );
}

/** "Showing X of Y", gold progress line, "Load more" (Shop.dc.html 203–209). */
export function LoadMore({ shown, total, onMore }: { shown: number; total: number; onMore: () => void }) {
  const t = useTranslations("shop");
  const n = Math.min(shown, total);
  return (
    <div className="mt-[clamp(36px,5vw,56px)] flex flex-col items-center gap-3.5">
      <span className="font-sans text-[13px] leading-none font-medium text-ink6 tabular">
        {t("showing", { a: n, b: total })}
      </span>
      <div className="h-0.5 w-[200px] overflow-hidden rounded-pill bg-s2">
        <div
          className="h-full bg-g5 transition-[width] duration-500 ease-mka"
          style={{ width: `${Math.round((n / Math.max(1, total)) * 100)}%` }}
        />
      </div>
      {shown < total && (
        <button
          type="button"
          onClick={onMore}
          aria-controls="shop-results"
          className="h-12 cursor-pointer rounded-btn border border-em7 bg-iv px-7 font-sans text-[14px] leading-none font-semibold tracking-[.03em] text-em7 transition-colors duration-150 hover:bg-em1 hi:tracking-normal"
        >
          {t("loadMore")}
        </button>
      )}
    </div>
  );
}
