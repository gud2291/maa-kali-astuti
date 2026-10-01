"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { ProductImage } from "@/components/commerce/ProductImage";
import { roll } from "@/components/motion/fx";
import { fmt } from "@/lib/core/format";
import { productHref } from "@/lib/routes";
import { useCart } from "@/stores/cart";
import { useFees } from "@/stores/catalog";
import { useUi } from "@/stores/ui";
import type { ResolvedLine } from "@/types/cart";

export type CartLineProps = {
  line?: ResolvedLine;
  l?: ResolvedLine;
  readonly?: boolean;
};

export function CartLine({ line, l, readonly = false }: CartLineProps) {
  const item = line ?? l;
  if (!item) return null;

  return <CartLineItem l={item} readonly={readonly} />;
}

function CartLineItem({ l, readonly }: { l: ResolvedLine; readonly?: boolean }) {
  const t = useTranslations("drawer");
  const hi = useLocale() === "hi";
  const fees = useFees();
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
    if (l.qty >= fees.maxLineQty) {
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
        <ProductImage p={{ ...l.p, date: 0, pop: 0 }} sizes="72px" alt="" />
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
            {t("energ", { name: l.energ.name, gotra: l.energ.gotra, fee: fmt(fees.energizationInr) })}
          </span>
        )}
        {!readonly ? (
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
        ) : (
          <span className="mt-1 font-sans text-[12.5px] leading-none font-medium text-ink6">
            Qty: <strong className="font-semibold text-ink">{l.qty}</strong>
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 tabular">
        <span className="font-sans text-[15px] leading-none font-bold text-ink">
          {fmt((l.p.price + (l.energ ? fees.energizationInr : 0)) * l.qty)}
        </span>
        <span className="font-sans text-[12px] leading-none font-medium text-ink6 line-through">
          {fmt(l.p.mrp * l.qty)}
        </span>
      </div>
    </div>
  );
}
