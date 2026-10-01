"use client";
import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import { Rating } from "@/components/ui/Rating";
import { stockNote } from "@/lib/core/stock";
import { useIsWished } from "@/stores/wishlist";
import { cn } from "@/lib/utils/cn";
import { ProductImage } from "./ProductImage";
import { useProductActions } from "./useProductActions";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  /** std / compact = card layout (title 19 vs 16px) · row = compact horizontal line (upsell rails). */
  size?: "std" | "compact" | "row";
  /** shop = add-to-cart UI · wish = "Move to cart" + remove (wishlist page). */
  mode?: "shop" | "wish";
  /** next/image `sizes` for photographed products. */
  sizes?: string;
  /** Above-the-fold cards load eagerly. */
  priority?: boolean;
  className?: string;
};

/** Port of ProductCard.dc.html (14–139). Mobile (<768) has no hover UI: a round "+" adds instead. */
export function ProductCard({ product: p, size = "std", mode = "shop", sizes, priority, className }: Props) {
  const hi = useLocale() === "hi";
  const t = useTranslations("product");
  const imgRef = useRef<HTMLSpanElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);
  const wished = useIsWished(p.id);
  const { ph, oos, doAdd, add, addMobile, toggleWish, moveToCart, removeWish } = useProductActions(p, imgRef);

  const href = `/product/${p.slug}`;
  const title = hi ? p.hi : p.name;
  const catShort = p.catShort ?? "";
  const addAria = t("addAria", { name: p.name });
  const sn = stockNote(p, hi);

  if (size === "row") {
    return (
      <article
        className={cn(
          "grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-btn border border-s2 bg-cream p-3",
          className,
        )}
      >
        <Link
          href={href}
          tabIndex={-1}
          aria-label={p.name}
          className="relative block aspect-[4/5] w-[88px] overflow-hidden rounded-3 bg-s1"
        >
          <span ref={imgRef} className="absolute inset-0 block">
            <ProductImage p={p} sizes="88px" priority={priority} />
          </span>
        </Link>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-sans text-[10.5px] leading-[1.2] font-semibold tracking-[.14em] text-g7 uppercase">
            {catShort}
          </span>
          <Link href={href} className="font-title text-[17px] leading-[1.25] font-normal text-em9 no-underline">
            {title}
          </Link>
          <Price price={p.price} mrp={p.mrp} hi={hi} size="card" />
        </div>
        <button
          type="button"
          onClick={add}
          aria-label={addAria}
          className="grid size-10 cursor-pointer place-items-center rounded-pill border border-em7 bg-iv text-em7 transition-colors duration-150 hover:bg-em1"
        >
          <span className="block size-[18px]">
            <Icon name={ph === "added" ? "check" : "plus"} />
          </span>
        </button>
      </article>
    );
  }

  const busy = ph !== "idle";
  const showSizes = !!p.sizes && ph === "idle" && !oos;
  const addLabel = oos ? t("notify") : ph === "loading" ? t("adding") : ph === "added" ? t("added") : t("add");

  return (
    <article data-busy={busy || undefined} className={cn("group relative flex h-full flex-col gap-3.5", className)}>
      {/* Media: lifts 4px with a soft shadow on hover */}
      <div
        className={cn(
          "relative rounded-btn transition-[translate,box-shadow] duration-300 ease-mka",
          "md:group-hover:-translate-y-1 md:group-hover:shadow-[0_18px_36px_-18px_rgba(14,59,48,.35)]",
        )}
      >
        <Link
          href={href}
          tabIndex={-1}
          aria-label={p.name}
          className="relative block aspect-[4/5] overflow-hidden rounded-btn bg-s1"
        >
          <span
            ref={imgRef}
            className="absolute inset-0 block"
            style={oos ? { filter: "grayscale(.5) opacity(.75)" } : undefined}
          >
            <ProductImage p={p} sizes={sizes} priority={priority} />
          </span>
          {/* Hover crossfade to the second image (desktop only) */}
          <span className="absolute inset-0 hidden bg-[#EFE6D2] opacity-0 transition-opacity duration-[450ms] ease-mka md:block md:group-hover:opacity-100">
            <ProductImage p={p} slot="alt" alt="" sizes={sizes} />
          </span>
          {/* Gold ring */}
          <span className="pointer-events-none absolute inset-0 rounded-btn shadow-[inset_0_0_0_1px_rgba(184,146,58,0)] transition-shadow duration-300 ease-[ease] md:group-hover:shadow-[inset_0_0_0_1px_rgba(184,146,58,.7)]" />
        </Link>

        {/* Badges (sold out first, then up to two) */}
        <div className="pointer-events-none absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {oos && <Badge k="soldOut" hi={hi} />}
          {p.badges.slice(0, 2).map((k) => (
            <Badge key={k} k={k} hi={hi} />
          ))}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWish(heartRef.current);
          }}
          aria-label={wished ? t("wishRemove") : t("wishSave")}
          aria-pressed={wished}
          className={cn(
            "absolute top-2 right-2 grid size-9 cursor-pointer place-items-center rounded-pill border-0 bg-[rgba(251,247,238,.92)] transition-colors duration-150 hover:text-sin",
            wished ? "text-sin" : "text-em7",
          )}
        >
          <span ref={heartRef} className="block size-[18px]">
            <Icon name={wished ? "heartF" : "heart"} />
          </span>
        </button>

        {/* Desktop quick-add bar: slides up on hover, stays while adding */}
        {mode === "shop" && (
          <div
            className={cn(
              "absolute right-2.5 bottom-2.5 left-2.5 hidden flex-col gap-1.5 md:flex",
              "pointer-events-none translate-y-[14px] opacity-0 transition-[translate,opacity] duration-300 ease-mka",
              "md:group-hover:pointer-events-auto md:group-hover:translate-y-0 md:group-hover:opacity-100",
              "md:group-has-[:focus-visible]:pointer-events-auto md:group-has-[:focus-visible]:translate-y-0 md:group-has-[:focus-visible]:opacity-100",
              "group-data-busy:translate-y-0 group-data-busy:opacity-100",
            )}
          >
            {showSizes && (
              <div className="flex items-center gap-1.5 rounded-btn bg-[rgba(251,247,238,.96)] p-1.5 shadow-ring-sand">
                <span className="flex-1 pl-1 font-sans text-[11px] leading-none font-semibold text-ink6">
                  {t("wristSize")}
                </span>
                {p.sizes!.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => doAdd(k)}
                    className="h-[30px] w-[34px] cursor-pointer rounded-3 border border-s2 bg-cream font-sans text-[12px] leading-none font-bold text-em7 transition-colors duration-150 hover:border-em7 hover:bg-em1"
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={add}
              disabled={ph === "loading"}
              className="flex h-11 cursor-pointer items-center justify-center gap-[9px] rounded-btn border-0 bg-em7 sheen font-sans text-[13.5px] leading-none font-semibold tracking-[.03em] text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)] hi:tracking-normal"
            >
              <span className="block size-[17px]">
                <Icon name={ph === "added" ? "check" : oos ? "bell" : "bag"} />
              </span>
              <span aria-live="polite">{addLabel}</span>
            </button>
          </div>
        )}

        {/* Mobile "+" */}
        {mode === "shop" && !oos && (
          <button
            type="button"
            onClick={addMobile}
            aria-label={addAria}
            className="absolute right-2 bottom-2 grid size-10 cursor-pointer place-items-center rounded-pill border-0 bg-em7 text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55),0_8px_18px_-8px_rgba(14,59,48,.6)] md:hidden"
          >
            <span className="block size-[18px]">
              <Icon name={ph === "added" ? "check" : "plus"} />
            </span>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-[7px] px-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-sans text-[10.5px] leading-[1.2] font-semibold tracking-[.14em] text-g7 uppercase">
            {catShort}
          </span>
          <Rating rating={p.rating} reviews={p.reviews} hi={hi} />
        </div>
        <Link
          href={href}
          className={cn(
            "max-h-[2.5em] min-h-[2.5em] overflow-hidden font-title leading-[1.25] font-normal text-em9 no-underline font-soft",
            size === "compact" ? "text-[16px]" : "text-[16px] md:text-[19px]",
          )}
        >
          {title}
        </Link>
        <span className="inline-block h-6 max-w-full self-start truncate rounded-pill bg-em1 px-2.5 font-sans text-[11.5px] leading-6 font-medium text-em7">
          {p.intent}
        </span>
        <Price price={p.price} mrp={p.mrp} hi={hi} size="row" />
        {sn && (
          <span className="inline-flex items-center gap-1.5 font-sans text-[12px] leading-[1.2] font-semibold text-sin">
            <span className="block size-1.5 rounded-pill bg-sin" />
            {sn}
          </span>
        )}
        {mode === "wish" && (
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={moveToCart}
              className="h-[42px] flex-1 cursor-pointer rounded-btn border-0 bg-em7 font-sans text-[13px] leading-none font-semibold tracking-[.03em] text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)] transition-colors hover:bg-em5 hi:tracking-normal"
            >
              {t("move")}
            </button>
            <button
              type="button"
              onClick={removeWish}
              aria-label={t("wishRemove")}
              className="grid size-[42px] cursor-pointer place-items-center rounded-btn border border-s2 bg-cream text-ink6 transition-colors hover:border-sin hover:text-sin"
            >
              <span className="block size-[17px]">
                <Icon name="trash" />
              </span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
