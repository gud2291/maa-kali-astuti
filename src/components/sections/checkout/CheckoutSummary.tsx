"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCartLines } from "@/stores/cart";
import { useFees } from "@/stores/catalog";
import { useCheckout } from "./useCheckout";
import { CouponField } from "@/components/commerce/CouponField";
import { ProductImage } from "@/components/commerce/ProductImage";
import { Icon } from "@/components/icons/Icon";
import { fmt } from "@/lib/core/format";
import { cn } from "@/lib/utils/cn";
import type { Quote } from "@/server/cart/quote";

export function CheckoutSummary({
  quote,
  refetchQuote,
  variant = "both",
}: {
  quote: Quote | null;
  refetchQuote: () => Promise<void>;
  variant?: "mobile" | "desktop" | "both";
}) {
  const t = useTranslations("checkout");
  const td = useTranslations("drawer");
  const locale = useLocale();
  const hi = locale === "hi";

  const lines = useCartLines();
  const fees = useFees();
  const { gift, delivery, method } = useCheckout();

  const [mobileOpen, setMobileOpen] = useState(false);

  const totals = quote?.totals;
  const totalAmount = totals?.total ?? 0;
  const itemsCount = lines.reduce((a, l) => a + l.qty, 0);

  const trustBadges = [
    { icon: "seal" as const, text: t("trust.authentic") },
    { icon: "flame" as const, text: t("trust.energized") },
    { icon: "lock" as const, text: t("trust.secure") },
    { icon: "truck" as const, text: t("trust.shipping") },
  ];

  const breakdownContent = (
    <div className="flex flex-col gap-4">
      {/* Lines with thumbs */}
      <div className="max-h-[260px] overflow-y-auto divide-y divide-s2 pr-1">
        {lines.map((l) => {
          const name = hi ? l.p.hi : l.p.name;
          const energFee = l.energ ? fees.energizationInr : 0;
          const lineTotal = (l.p.price + energFee) * l.qty;

          return (
            <div key={l.key} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative size-11 flex-none overflow-hidden rounded bg-s1">
                  <ProductImage p={{ ...l.p, date: 0, pop: 0 }} sizes="44px" alt="" />
                  <span className="absolute bottom-0 right-0 grid size-4 place-items-center rounded-tl bg-em9 font-sans text-[10px] font-bold text-iv">
                    {l.qty}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="line-clamp-1 font-title text-[13.5px] font-normal text-em9">
                    {name}
                  </span>
                  <span className="font-sans text-[11.5px] text-ink6">
                    {l.variant ? `Size ${l.variant}` : l.p.catShort}
                    {l.energ ? ` · ${t("energized")}` : ""}
                  </span>
                </div>
              </div>
              <span className="font-sans text-[13.5px] font-bold text-ink tabular">
                {fmt(lineTotal)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Coupon Field */}
      <div className="border-t border-s2 pt-2">
        <CouponField
          disc={totals?.disc}
          onApplied={() => {
            void refetchQuote();
          }}
        />
      </div>

      {/* Price breakdown */}
      <dl className="m-0 flex flex-col gap-2.5 border-t border-s2 pt-3 font-sans text-[13.5px]">
        {/* Subtotal */}
        <div className="flex justify-between text-ink">
          <dt className="text-ink6">{t("subtotal")}</dt>
          <dd className="m-0 font-semibold tabular">
            {fmt(totals?.items ?? lines.reduce((a, l) => a + l.p.price * l.qty, 0))}
          </dd>
        </div>

        {/* Energization fee */}
        {totals && totals.energ > 0 && (
          <div className="flex justify-between text-ink">
            <dt className="text-g7">{t("energization")}</dt>
            <dd className="m-0 font-semibold tabular text-g7">+{fmt(totals.energ)}</dd>
          </div>
        )}

        {/* Discount */}
        {totals && totals.disc > 0 && (
          <div className="flex justify-between text-em7">
            <dt className="text-em7">{t("discount")}</dt>
            <dd className="m-0 font-semibold tabular">−{fmt(totals.disc)}</dd>
          </div>
        )}

        {/* Gift wrap */}
        {gift && (
          <div className="flex justify-between text-ink">
            <dt className="text-ink6">{t("giftWrap")}</dt>
            <dd className="m-0 font-semibold tabular">+{fmt(fees.giftWrapInr)}</dd>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-ink">
          <dt className="text-ink6">{t("shipping")}</dt>
          <dd className="m-0 font-semibold">
            {totals?.ship === 0 ? (
              <span className="text-ok">{t("free")}</span>
            ) : (
              <span className="tabular">{fmt(totals?.ship ?? fees.shippingInr)}</span>
            )}
          </dd>
        </div>

        {/* Express fee */}
        {delivery === "express" && (
          <div className="flex justify-between text-ink">
            <dt className="text-ink6">{t("expressFee")}</dt>
            <dd className="m-0 font-semibold tabular">+{fmt(fees.expressInr)}</dd>
          </div>
        )}

        {/* COD fee */}
        {method === "cod" && totals && totals.cod > 0 && (
          <div className="flex justify-between text-ink">
            <dt className="text-ink6">{t("codFee")}</dt>
            <dd className="m-0 font-semibold tabular">+{fmt(totals.cod)}</dd>
          </div>
        )}

        {/* Grand Total */}
        <div className="border-t border-s2 pt-3">
          <div className="flex items-baseline justify-between">
            <dt className="font-sans text-[16px] font-bold text-em9">{t("total")}</dt>
            <dd className="m-0 font-sans text-[22px] font-bold text-em9 tabular">
              {fmt(totalAmount)}
            </dd>
          </div>
          <p className="mt-1 font-sans text-[12px] text-ink6">{td("taxes")}</p>
        </div>
      </dl>

      {/* Trust badges */}
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-s2 pt-3">
        {trustBadges.map((b) => (
          <div key={b.text} className="flex items-center gap-1.5 font-sans text-[11.5px] font-medium text-ink6">
            <Icon name={b.icon} className="size-3.5 flex-none text-g5" />
            <span className="line-clamp-1">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const showMobile = variant === "mobile" || variant === "both";
  const showDesktop = variant === "desktop" || variant === "both";

  return (
    <>
      {/* Mobile collapsible summary bar (<1024px) */}
      {showMobile && (
        <div className={cn("mb-6 rounded-btn border border-s2 bg-cream shadow-sm", variant === "both" && "lg:hidden")}>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex w-full cursor-pointer items-center justify-between p-4 border-0 bg-transparent text-left"
            aria-expanded={mobileOpen}
          >
            <div className="flex items-center gap-2">
              <Icon name="bag" className="size-4 text-em7" />
              <span className="font-sans text-[14px] font-semibold text-em9">
                {mobileOpen ? t("hideOrderSummary") : t("showOrderSummary")} ({itemsCount})
              </span>
              <Icon
                name="arrowR"
                className={cn("size-3.5 text-em7 transition-transform", mobileOpen && "rotate-90")}
              />
            </div>
            <span className="font-sans text-[16px] font-bold text-em9 tabular">
              {fmt(totalAmount)}
            </span>
          </button>

          {mobileOpen && (
            <div className="border-t border-s2 p-4">
              {breakdownContent}
            </div>
          )}
        </div>
      )}

      {/* Desktop sticky summary aside (>=1024px) */}
      {showDesktop && (
        <aside
          aria-label={t("summaryTitle")}
          className={cn("sticky top-[88px] flex flex-col gap-4 rounded-btn border border-s2 bg-cream p-6 shadow-sm", variant === "both" && "hidden lg:flex")}
        >
          <h2 className="m-0 font-title text-[20px] leading-tight font-normal text-em9">
            {t("summaryTitle")} ({itemsCount})
          </h2>
          {breakdownContent}
        </aside>
      )}
    </>
  );
}
