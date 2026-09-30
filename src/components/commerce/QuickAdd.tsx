"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { fmt } from "@/lib/core/format";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { EASE } from "@/components/motion/easing";
import { productById } from "@/lib/api/products-index";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import { flyToCart } from "./fx";
import { ProductImage } from "./ProductImage";
import type { Product, WristSize } from "@/types/product";

const SIZES: WristSize[] = ["S", "M", "L"];

/**
 * Wrist-size picker (SiteChrome.dc.html 361–387 + 550–559), opened with `useUi().openQuick(pid)`.
 * Mobile: bottom sheet sliding up. ≥768: centred 460px dialog fading in from −46%.
 * Radix Dialog gives focus trap, Esc and scroll lock.
 */
export function QuickAdd() {
  const quick = useUi((s) => s.quick);
  const p = quick ? productById(quick.pid) : undefined;
  return (
    <Dialog.Root open={!!p} onOpenChange={(open) => !open && useUi.getState().closeQuick()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 bg-[rgba(10,31,26,.45)]" />
        {p && <QuickSheet key={p.id} p={p} fromWish={!!quick?.fromWish} />}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function QuickSheet({ p, fromWish }: { p: Product; fromWish: boolean }) {
  const t = useTranslations("quick");
  const tt = useTranslations("toast");
  const hi = useLocale() === "hi";
  const [size, setSize] = useState<WristSize>("M");
  const [guide, setGuide] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLSpanElement>(null);
  const name = hi ? p.hi : p.name;

  useEffect(() => {
    const el = sheetRef.current;
    if (!el || isReduced()) return;
    const mob = window.matchMedia("(max-width: 767.98px)").matches;
    el.animate(
      mob
        ? [{ transform: "translateY(100%)" }, { transform: "none" }]
        : [
            { opacity: 0, transform: "translate(-50%,-46%)" },
            { opacity: 1, transform: "translate(-50%,-50%)" },
          ],
      { duration: 360, easing: EASE },
    );
  }, []);

  const addToCart = () => {
    useCart.getState().add(p.id, { variant: size });
    if (fromWish) useWishlist.getState().toggle(p.id);
    flyToCart(imgRef.current);
    const ui = useUi.getState();
    ui.toast({ msg: tt("sheetAdded", { name, size }), tone: "ok", action: { kind: "cart", label: tt("viewCart") } });
    ui.closeQuick();
  };

  return (
    <Dialog.Content
      ref={sheetRef}
      aria-describedby={undefined}
      className={cn(
        "fixed z-60 max-w-full bg-iv px-5 pt-2.5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-20px_50px_-20px_rgba(10,31,26,.5)] outline-none",
        "inset-x-0 bottom-0 w-full rounded-t-[8px]",
        "md:inset-auto md:top-1/2 md:left-1/2 md:w-[460px] md:[transform:translate(-50%,-50%)] md:rounded-[6px]",
      )}
    >
      <Dialog.Title className="sr-only">{t("title")}</Dialog.Title>
      <div aria-hidden className="mx-auto mb-3.5 h-1 w-10 rounded-pill bg-s2" />

      <div className="grid grid-cols-[72px_minmax(0,1fr)_40px] items-center gap-3.5">
        <span className="relative block h-[90px] w-[72px] overflow-hidden rounded-3 bg-s1">
          <span ref={imgRef} className="absolute inset-0 block">
            <ProductImage p={p} sizes="72px" />
          </span>
        </span>
        <span className="flex flex-col gap-1.5">
          <span className="font-title text-[19px] leading-[1.2] font-normal text-em9">{name}</span>
          <span className="font-sans text-[15px] leading-none font-bold text-ink tabular">
            {fmt(p.price)} <span className="text-[13px] font-medium text-ink6 line-through">{fmt(p.mrp)}</span>
          </span>
        </span>
        <Dialog.Close
          aria-label={t("close")}
          className="grid size-10 cursor-pointer place-items-center self-start border-0 bg-transparent text-em7"
        >
          <span className="block size-5">
            <Icon name="close" />
          </span>
        </Dialog.Close>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span
          id="qa-size-label"
          className="font-sans text-[12px] leading-none font-semibold tracking-[.04em] text-ink hi:tracking-normal"
        >
          {t("wristSize")}
        </span>
        <button
          type="button"
          onClick={() => setGuide((g) => !g)}
          aria-expanded={guide}
          className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent py-1.5 font-sans text-[12.5px] leading-none font-semibold text-em7"
        >
          <span className="block size-[15px]">
            <Icon name="ruler" />
          </span>
          {t("sizeGuide")}
        </button>
      </div>

      <div role="radiogroup" aria-labelledby="qa-size-label" className="mt-2.5 grid grid-cols-3 gap-2">
        {SIZES.map((k) => {
          const on = size === k;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSize(k)}
              className={cn(
                "flex h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-btn border-0 bg-cream transition-shadow duration-200 ease-[ease]",
                on ? "shadow-[inset_0_0_0_1.5px_#B8923A,0_0_0_3px_rgba(184,146,58,.15)]" : "shadow-ring-sand",
              )}
            >
              <span className="font-sans text-[15px] leading-none font-bold text-em9">{k}</span>
              <span className="font-sans text-[11px] leading-none font-medium text-ink6">{t(k)}</span>
            </button>
          );
        })}
      </div>

      {guide && (
        <div className="mt-3.5 grid grid-cols-[120px_1fr] items-center gap-3.5 rounded-btn bg-s1 p-3">
          <WristArt />
          <span className="font-sans text-[13px] leading-[1.55] font-normal text-ink">{t("guide")}</span>
        </div>
      )}

      <button
        type="button"
        onClick={addToCart}
        className="mt-[18px] flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-btn border-0 bg-em7 font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv shadow-ring-gold hi:tracking-normal"
      >
        <span className="block size-[18px]">
          <Icon name="bag" />
        </span>
        {t("addSize", { size, price: fmt(p.price) })}
      </button>
    </Dialog.Content>
  );
}

/** Wrist measuring sketch (SiteChrome.dc.html 460). JSX so the "+1 cm" label uses the web font. */
function WristArt() {
  return (
    <svg
      viewBox="0 0 120 80"
      width="120"
      height="80"
      fill="none"
      stroke="#7A5C1C"
      strokeWidth={1.3}
      strokeLinecap="round"
      aria-hidden
      className="block"
    >
      <path d="M8 58c14-6 26-8 40-8h40c10 0 18 4 24 10M8 30c14 6 26 8 40 8h40c10 0 18-4 24-10" />
      <ellipse cx="62" cy="44" rx="7" ry="18" stroke="#B8923A" strokeWidth={2} />
      <path d="M62 26v-8M58 18h8" stroke="#B8923A" />
      <text x="74" y="16" fontSize="8" fill="#7A5C1C" stroke="none" className="font-sans">
        +1 cm
      </text>
    </svg>
  );
}
