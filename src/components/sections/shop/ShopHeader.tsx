import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { ProductImage } from "@/components/commerce/ProductImage";
import { routes } from "@/lib/routes";
import type { Category } from "@/types/catalog";
import type { Product } from "@/types/product";
import { HEADER_STONES, splitTitle } from "./shop-data";

type Props = {
  /** Current category, or null on "All". */
  cat: Category | null;
  /** Position in the category list (eyebrow "02 — …"). */
  idx: number;
  /** Products in this category (all products on "All"). */
  count: number;
  /** Header art: one piece, or three on "All" (HEADER_ART). */
  art: Product[];
  hi: boolean;
  onAll: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/**
 * Header band (Shop.dc.html 29–55, head 305–312): faint mandala, breadcrumb, eyebrow, the
 * display title with a gold italic last word, the Devanagari line, description, count, and the
 * arch with floating product art. Title and eyebrow stay English on /hi, like the design's
 * display headings; the description switches to the Hindi text.
 */
export function ShopHeader({ cat, idx, count, art, hi, onAll }: Props) {
  const t = useTranslations("shop");
  const [a, i] = cat ? splitTitle(cat.name) : [t("allA"), t("allI")];
  const stones = art.length === 1 ? HEADER_STONES.single : HEADER_STONES.trio;

  return (
    <section className="relative overflow-hidden bg-s1 shadow-[inset_0_-1px_0_rgba(184,146,58,.35)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[-120px] mt-[-310px] size-[620px] opacity-[.07]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/svg/ornaments/mandala-7a5c1c.svg" alt="" width={620} height={620} className="block size-full" />
      </div>

      <div className="relative mx-auto grid max-w-[1480px] grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-[clamp(16px,3vw,24px)] pt-[clamp(22px,4vw,44px)] pb-[clamp(28px,4vw,48px)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <nav
            aria-label={t("breadcrumb")}
            className="flex flex-wrap items-center gap-2 font-sans text-[12.5px] leading-none font-medium text-ink6"
          >
            <Link href={routes.home} className="text-ink6 no-underline hover:text-ink6">
              {t("crumbHome")}
            </Link>
            <span aria-hidden="true" className="text-g5">
              /
            </span>
            <Link
              href={routes.shop}
              onClick={onAll}
              aria-current={cat ? undefined : "page"}
              className="text-ink6 no-underline hover:text-ink6"
            >
              {t("crumbShop")}
            </Link>
            {cat && (
              <>
                <span aria-hidden="true" className="text-g5">
                  /
                </span>
                <span aria-current="page" className="text-ink">
                  {hi ? cat.hi : cat.name}
                </span>
              </>
            )}
          </nav>

          <span
            lang="en"
            className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase"
          >
            {cat ? `0${idx + 2} — ${cat.name}` : t("allEyebrow")}
          </span>
          <h1
            lang="en"
            className="m-0 font-display text-[clamp(38px,5.2vw,68px)] leading-[1.04] font-normal tracking-[-.02em] text-balance text-em9 font-soft"
          >
            {a}
            <em className="text-g5 italic">{i}</em>
          </h1>
          <span lang="hi" className="font-deva text-[clamp(18px,2vw,22px)] leading-[1.35] text-g7">
            {cat ? cat.hi : t("allHi")}
          </span>
          <p className="m-0 max-w-[560px] font-sans text-[clamp(15px,1.4vw,17px)] leading-[1.65] text-pretty text-ink6">
            {cat ? (hi ? cat.deshi : cat.desc) : t("allDesc")}
          </p>
          <div className="flex flex-wrap items-center gap-3 font-sans text-[13px] leading-none font-semibold text-ink">
            <span className="tabular">{t("offerings", { n: count })}</span>
            <span aria-hidden="true" className="size-1 rounded-pill bg-g5" />
            <span className="flex items-center gap-1.5 font-medium text-ink6">
              <span className="block size-[15px] text-g5">
                <Icon name="flame" />
              </span>
              {t("energized")}
            </span>
          </div>
        </div>

        {/* Arch + floating art: 118×154 on mobile, 200×260 from 768 */}
        <div aria-hidden="true" className="relative h-[154px] w-[118px] flex-none md:h-[260px] md:w-[200px]">
          <svg
            viewBox="0 0 200 260"
            width="100%"
            height="100%"
            className="absolute inset-0"
            fill="none"
            stroke="#B8923A"
            strokeWidth="1"
          >
            <path d="M6 258V104A94 94 0 0 1 100 8a94 94 0 0 1 94 96v154" opacity=".7" />
            <path d="M16 258V106a84 84 0 0 1 84-88 84 84 0 0 1 84 88v152" opacity=".35" />
          </svg>
          {art.map((p, k) => {
            const s = stones[k];
            return (
              <span
                key={p.id}
                data-amb={s.amb}
                className="absolute block drop-shadow-[0_16px_18px_rgba(14,59,48,.18)]"
                style={{ left: s.l, top: s.t, width: s.w, height: s.h }}
              >
                <ProductImage p={p} alt="" priority sizes="200px" className={p.photo ? undefined : "object-contain"} />
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
