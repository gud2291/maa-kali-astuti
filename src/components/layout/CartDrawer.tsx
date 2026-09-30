"use client";
import { useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { InlineArt } from "@/components/ui/InlineArt";
import { ProductImage } from "@/components/commerce/ProductImage";
import { flyToCart } from "@/components/commerce/fx";
import { roll } from "@/components/motion/fx";
import { KALASH_SVG } from "@/lib/art/kalash";
import { productById } from "@/lib/api/products-index";
import { ENERGIZATION, MAX_LINE_QTY } from "@/lib/core/commerce";
import { fmt } from "@/lib/core/format";
import { productHref, routes } from "@/lib/routes";
import { PAY_DRAWER } from "@/lib/site";
import { useCart, useCartLines, useCartTotals } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import type { CouponResult, ResolvedLine } from "@/types/cart";
import type { Product } from "@/types/product";

/* "Complete your ritual" rail (SiteChrome 527): first four not already in the cart. */
const UPSELL = ["havan", "r5", "b-rose", "a-child", "b-tourmaline"];

/**
 * Cart drawer (SiteChrome.dc.html 244–323, 509–536). Radix Dialog from the right: 440px,
 * full width below 768. Slides in 420 ms / out 360 ms (CSS keyframes, so Radix waits for the
 * exit). Free-shipping progress, lines with qty roll + remove/Undo, upsell rail, coupon,
 * subtotal and CTAs; empty state with the kalash.
 */
export function CartDrawer() {
  const open = useUi((s) => s.cartOpen);
  return (
    <Dialog.Root open={open} onOpenChange={(o) => useUi.getState().setCartOpen(o)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 bg-[rgba(10,31,26,.45)] data-[state=closed]:animate-[mka-fade-out_300ms_ease_forwards] data-[state=open]:animate-[mka-fade-in_300ms_ease]" />
        <Dialog.Content
          aria-describedby={undefined}
          // Toasts (e.g. "Removed · Undo") live outside the dialog: using them must not close it.
          onInteractOutside={(e) => {
            if ((e.target as Element | null)?.closest?.("[aria-live]")) e.preventDefault();
          }}
          className="fixed top-0 right-0 bottom-0 z-60 flex w-full max-w-full flex-col bg-iv shadow-[-30px_0_60px_-30px_rgba(14,59,48,.35)] outline-none data-[state=closed]:animate-[mka-drawer-out_360ms_var(--ease-mka)_forwards] data-[state=open]:animate-[mka-drawer-in_420ms_var(--ease-mka)] md:w-[440px]"
        >
          <DrawerBody />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DrawerBody() {
  const t = useTranslations("drawer");
  const lines = useCartLines();
  const tot = useCartTotals();
  const empty = lines.length === 0;

  const freeMsg =
    tot.count === 0 ? t("freeBase") : tot.toFree > 0 ? t("freeMore", { amount: fmt(tot.toFree) }) : t("freeDone");

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-[18px] pb-3.5">
        <Dialog.Title className="m-0 font-display text-[24px] leading-none font-normal text-em9">
          {t("title")} <span className="font-sans text-[14px] leading-none font-semibold text-ink6">({tot.count})</span>
        </Dialog.Title>
        <Dialog.Close
          aria-label={t("close")}
          className="grid size-11 cursor-pointer place-items-center rounded-btn border-0 bg-transparent text-em7 hover:bg-s1"
        >
          <span className="block size-[22px]">
            <Icon name="close" />
          </span>
        </Dialog.Close>
      </div>

      <div className="border-b border-s2 px-5 pb-4">
        <div className="flex items-center gap-2 font-sans text-[13px] leading-[1.3] font-medium text-ink">
          <span className="block size-4 flex-none text-g5">
            <Icon name="truck" />
          </span>
          {freeMsg}
        </div>
        <div className="relative mt-2.5 h-1 rounded-pill bg-s2">
          <div
            className="absolute inset-y-0 left-0 rounded-pill bg-g5 transition-[width] duration-[600ms] ease-mka"
            style={{ width: `${Math.round((tot.count ? tot.pct : 0) * 100)}%` }}
          />
          <span
            className={cn(
              "absolute top-1/2 -right-0.5 -mt-[7px] size-3.5 rounded-pill shadow-[0_0_0_2px_#FBF7EE] transition-colors duration-300",
              tot.toFree === 0 && tot.count ? "bg-g5" : "bg-s2",
            )}
          />
        </div>
      </div>

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-7 py-6 text-center">
          <InlineArt svg={KALASH_SVG} uid="drawer" className="h-[170px] w-[220px]" />
          <span className="font-display text-[26px] leading-[1.2] font-normal text-em9">{t("emptyTitle")}</span>
          <span className="max-w-[300px] font-sans text-[15px] leading-[1.6] font-normal text-ink6">
            {t("emptyBody")}
          </span>
          <Link
            href={routes.shop}
            className="mt-1.5 inline-flex h-12 items-center gap-2.5 rounded-btn bg-em7 px-6 font-sans text-[14px] leading-none font-semibold tracking-[.03em] text-iv no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)] hi:tracking-normal"
          >
            {t("emptyCta")}
            <span className="block size-4">
              <Icon name="arrowR" />
            </span>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5">
            {lines.map((l) => (
              <Line key={l.key} l={l} />
            ))}
            <Upsell inCart={lines.map((l) => l.pid)} />
            <Coupon disc={tot.disc} />
          </div>

          <div className="flex flex-col gap-2.5 border-t border-s2 bg-iv px-5 pt-4 pb-[calc(18px+env(safe-area-inset-bottom))]">
            <div className="flex items-baseline justify-between tabular">
              <span className="font-sans text-[14px] leading-none font-semibold text-ink">{t("subtotal")}</span>
              <span className="font-sans text-[20px] leading-none font-bold text-em9">{fmt(tot.sub - tot.disc)}</span>
            </div>
            <div className="flex justify-between gap-3 font-sans text-[12.5px] leading-[1.35] font-medium text-ink6">
              <span>{tot.save > 0 ? t("save", { amount: fmt(tot.save + tot.disc) }) : t("taxes")}</span>
              <span className="whitespace-nowrap">
                {tot.ship ? t("ship", { amount: fmt(tot.ship) }) : t("freeShip")}
              </span>
            </div>
            <Link
              href={routes.checkout}
              className="flex h-[52px] items-center justify-center gap-2.5 rounded-btn bg-em7 sheen font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv no-underline shadow-ring-gold hi:tracking-normal"
            >
              <span className="block size-4">
                <Icon name="lock" />
              </span>
              {t("checkout")}
            </Link>
            <Link
              href={routes.cart}
              className="flex h-[46px] items-center justify-center rounded-btn font-sans text-[14px] leading-none font-semibold text-em7 no-underline shadow-ring-em hover:bg-em1"
            >
              {t("viewCart")}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1.5">
              <span className="font-sans text-[11px] leading-none font-medium text-ink6">{t("secured")}</span>
              {PAY_DRAWER.map((pm) => (
                <span
                  key={pm}
                  className="grid h-5 place-items-center rounded-field px-1.5 font-sans text-[9.5px] leading-none font-bold tracking-[.04em] text-ink6 shadow-ring-sand"
                >
                  {pm}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Line({ l }: { l: ResolvedLine }) {
  const t = useTranslations("drawer");
  const hi = useLocale() === "hi";
  const numRef = useRef<HTMLSpanElement>(null);
  const name = hi ? l.p.hi : l.p.name;
  const href = productHref(l.p);
  const meta = [l.variant ? t("size", { v: l.variant }) : null, l.p.intent].filter(Boolean).join(" · ");

  const setQty = (q: number, dir: number) => {
    useCart.getState().setQty(l.key, q);
    requestAnimationFrame(() => roll(numRef.current, dir));
  };
  const dec = () => {
    if (l.qty <= 1) return;
    setQty(l.qty - 1, -1);
  };
  const inc = () => {
    if (l.qty >= MAX_LINE_QTY) {
      useUi.getState().toast({ msg: t("max"), tone: "info" });
      return;
    }
    setQty(l.qty + 1, 1);
  };
  const remove = () => {
    const snap = useCart.getState().remove(l.key);
    useUi.getState().toast({
      msg: t("removed", { name }),
      tone: "info",
      action: { kind: "undo", run: () => useCart.getState().restore(snap) },
    });
  };

  const stepBtn = "grid h-[34px] w-8 cursor-pointer place-items-center border-0 bg-transparent text-em7";

  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)_auto] gap-3.5 border-b border-s2 py-4">
      <Link href={href} className="relative block h-[90px] w-[72px] overflow-hidden rounded-3 bg-s1" tabIndex={-1}>
        <ProductImage p={l.p} sizes="72px" alt="" />
      </Link>
      <div className="flex min-w-0 flex-col gap-[5px]">
        <Link href={href} className="font-title text-[16px] leading-[1.25] font-normal text-em9 no-underline">
          {name}
        </Link>
        <span className="font-sans text-[12px] leading-[1.3] font-medium text-ink6">{meta}</span>
        {l.energ && (
          <span className="flex items-start gap-1.5 font-sans text-[12px] leading-[1.35] font-medium text-g7">
            <span className="mt-px block size-[13px] flex-none">
              <Icon name="flame" />
            </span>
            {t("energ", { name: l.energ.name, gotra: l.energ.gotra, fee: fmt(ENERGIZATION) })}
          </span>
        )}
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex h-[34px] items-center rounded-btn bg-cream shadow-ring-sand">
            <button type="button" onClick={dec} aria-label={t("dec")} className={stepBtn}>
              <span className="block size-3.5">
                <Icon name="minus" />
              </span>
            </button>
            <span className="grid h-[34px] w-[26px] place-items-center overflow-hidden">
              <span
                ref={numRef}
                aria-live="polite"
                className="block font-sans text-[14px] leading-none font-bold text-ink tabular"
              >
                {l.qty}
              </span>
            </span>
            <button type="button" onClick={inc} aria-label={t("inc")} className={stepBtn}>
              <span className="block size-3.5">
                <Icon name="plus" />
              </span>
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            className="flex cursor-pointer items-center gap-[5px] border-0 bg-transparent px-0 py-1.5 font-sans text-[12px] leading-none font-medium text-ink6 hover:text-sin"
          >
            <span className="block size-3.5">
              <Icon name="trash" />
            </span>
            {t("remove")}
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 tabular">
        <span className="font-sans text-[15px] leading-none font-bold text-ink">
          {fmt((l.p.price + (l.energ ? ENERGIZATION : 0)) * l.qty)}
        </span>
        <span className="font-sans text-[12px] leading-none font-medium text-ink6 line-through">
          {fmt(l.p.mrp * l.qty)}
        </span>
      </div>
    </div>
  );
}

function Upsell({ inCart }: { inCart: string[] }) {
  const t = useTranslations("drawer");
  const hi = useLocale() === "hi";
  const imgs = useRef<Record<string, HTMLSpanElement | null>>({});
  const items = UPSELL.filter((id) => !inCart.includes(id))
    .slice(0, 4)
    .map((id) => productById(id))
    .filter((p): p is Product => !!p);
  if (!items.length) return null;

  const add = (p: Product) => {
    if (p.sizes) {
      useUi.getState().openQuick(p.id);
      return;
    }
    useCart.getState().add(p.id);
    flyToCart(imgs.current[p.id] ?? null);
  };

  return (
    <div className="pt-5 pb-2">
      <span className="font-sans text-[11px] leading-none font-semibold tracking-[.16em] text-g7 uppercase hi:tracking-normal">
        {t("complete")}
      </span>
      <div className="-mx-5 mt-3 no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1">
        {items.map((p) => {
          const name = hi ? p.hi : p.name;
          return (
            <div
              key={p.id}
              className="grid flex-[0_0_238px] snap-start grid-cols-[52px_minmax(0,1fr)_36px] items-center gap-2.5 rounded-btn bg-s1 p-2"
            >
              <Link
                href={productHref(p)}
                tabIndex={-1}
                className="relative block h-[65px] w-[52px] overflow-hidden rounded-3 bg-s1"
              >
                <span
                  ref={(el) => {
                    imgs.current[p.id] = el;
                  }}
                  className="absolute inset-0 block"
                >
                  <ProductImage p={p} sizes="52px" alt="" />
                </span>
              </Link>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="font-title text-[14px] leading-[1.2] font-normal text-em9">{name}</span>
                <span className="font-sans text-[13px] leading-none font-bold text-ink tabular">{fmt(p.price)}</span>
              </span>
              <button
                type="button"
                onClick={() => add(p)}
                aria-label={t("addAria", { name })}
                className="grid size-9 cursor-pointer place-items-center rounded-pill border border-em7 bg-iv text-em7 hover:bg-em1"
              >
                <span className="block size-4">
                  <Icon name="plus" />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Coupon({ disc }: { disc: number }) {
  const t = useTranslations("drawer");
  const tc = useTranslations("cart.coupon");
  const applied = useCart((s) => s.coupon);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<CouponResult | null>(null);

  const msg = (r: CouponResult) => tc(r.msg, { code: r.code ?? code.trim().toUpperCase() });
  const apply = (withToast: boolean) => {
    const r = useCart.getState().applyCoupon(code);
    setErr(r.ok ? null : r);
    setOpen(!r.ok);
    if (r.ok && withToast) useUi.getState().toast({ msg: msg(r), tone: "ok" });
  };

  return (
    <div className="pt-2.5 pb-5">
      {applied ? (
        <div className="flex h-11 items-center justify-between gap-2.5 rounded-btn bg-em1 px-3 font-sans text-[13px] leading-none font-semibold text-em7">
          <span className="flex items-center gap-2">
            <span className="block size-4">
              <Icon name="tag" />
            </span>
            {applied.code} · −{fmt(disc)}
          </span>
          <button
            type="button"
            onClick={() => useCart.getState().removeCoupon()}
            className="cursor-pointer border-0 bg-transparent font-sans text-[12px] leading-none font-semibold text-ink6 underline"
          >
            {t("couponRemove")}
          </button>
        </div>
      ) : open ? (
        <>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setErr(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") apply(false);
              }}
              aria-label={t("couponAria")}
              aria-invalid={err ? true : undefined}
              aria-describedby={err ? "coupon-err" : undefined}
              placeholder={t("couponPh")}
              autoComplete="off"
              autoFocus
              className={cn(
                "h-11 min-w-0 flex-1 rounded-field border bg-cream px-3 font-sans text-[14px] leading-none font-semibold tracking-[.06em] text-ink uppercase outline-none focus:border-em5",
                err ? "border-sin" : "border-s2",
              )}
            />
            <button
              type="button"
              onClick={() => apply(true)}
              className="h-11 cursor-pointer rounded-btn border border-em7 bg-iv px-4 font-sans text-[13px] leading-none font-semibold text-em7 hover:bg-em1"
            >
              {t("apply")}
            </button>
          </div>
          {err && (
            <span
              id="coupon-err"
              role="alert"
              className="mt-2 flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.3] font-medium text-sin"
            >
              <span className="block size-3.5">
                <Icon name="alert" />
              </span>
              {msg(err)}
            </span>
          )}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-0 py-1 font-sans text-[13px] leading-none font-semibold text-em7"
        >
          <span className="block size-4">
            <Icon name="tag" />
          </span>
          {t("couponLink")}
        </button>
      )}
    </div>
  );
}
