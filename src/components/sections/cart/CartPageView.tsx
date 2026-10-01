"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { CartLine } from "@/components/commerce/CartLine";
import { CouponField } from "@/components/commerce/CouponField";
import { CartEmpty } from "@/components/commerce/CartEmpty";
import { RitualUpsell } from "@/components/sections/cart/RitualUpsell";
import { fmt } from "@/lib/core/format";
import { routes } from "@/lib/routes";
import { PAY_DRAWER } from "@/lib/site";
import { useCartLines, useCartTotals } from "@/stores/cart";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { cn } from "@/lib/utils/cn";

export function CartPageView() {
  const t = useTranslations("cartPage");
  const td = useTranslations("drawer");
  const hydrated = useHydrated();
  const lines = useCartLines();
  const tot = useCartTotals();

  if (!hydrated) {
    return (
      <main className="min-h-[60vh] bg-iv py-10">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="h-10 w-48 animate-pulse rounded bg-s1" />
        </div>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="min-h-[70vh] bg-iv py-12 md:py-20">
        <div className="mx-auto max-w-[1240px] px-4">
          <CartEmpty uid="cart-page" />
        </div>
      </main>
    );
  }

  const freeMsg =
    tot.count === 0 ? td("freeBase") : tot.toFree > 0 ? td("freeMore", { amount: fmt(tot.toFree) }) : td("freeDone");

  return (
    <main className="min-h-screen bg-iv py-8 md:py-12">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 border-b border-s2 pb-4">
          <h1 className="m-0 font-display text-[28px] md:text-[36px] leading-tight font-normal text-em9">
            {t("title")}{" "}
            <span className="font-sans text-[16px] md:text-[18px] font-semibold text-ink6">
              ({tot.count})
            </span>
          </h1>
          <Link
            href={routes.shop}
            className="flex items-center gap-1.5 font-sans text-[13px] font-semibold text-em7 hover:text-em9 no-underline"
          >
            <span className="block size-3.5">
              <Icon name="arrowL" />
            </span>
            {t("continueShopping")}
          </Link>
        </div>

        {/* 8 / 4 Grid */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: 8 cols */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            {/* Free shipping bar */}
            <div className="rounded-btn border border-s2 bg-cream p-4">
              <div className="flex items-center gap-2 font-sans text-[13.5px] leading-[1.3] font-medium text-ink">
                <span className="block size-4 flex-none text-g5">
                  <Icon name="truck" />
                </span>
                {freeMsg}
              </div>
              <div className="relative mt-2.5 h-1.5 rounded-pill bg-s2">
                <div
                  className="absolute inset-y-0 left-0 rounded-pill bg-g5 transition-[width] duration-500 ease-mka"
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

            {/* Cart Lines */}
            <div className="divide-y divide-s2 rounded-btn border border-s2 bg-cream px-4 md:px-6">
              {lines.map((l) => (
                <CartLine key={l.key} line={l} />
              ))}
            </div>

            {/* Coupon field */}
            <div className="rounded-btn border border-s2 bg-cream p-4">
              <CouponField disc={tot.disc} initialOpen={false} />
            </div>

            {/* Ritual Upsell */}
            <RitualUpsell />
          </div>

          {/* Right Column: 4 cols (sticky >= 1024px) */}
          <div className="lg:sticky lg:top-[88px] lg:col-span-4">
            <div className="flex flex-col gap-5 rounded-btn border border-s2 bg-cream p-6 shadow-sm">
              <h2 className="m-0 font-title text-[20px] leading-tight font-normal text-em9">
                {t("summaryTitle")}
              </h2>

              <dl className="m-0 flex flex-col gap-3 font-sans text-[14px]">
                <div className="flex justify-between text-ink">
                  <dt className="text-ink6">{t("subtotal")}</dt>
                  <dd className="m-0 font-semibold tabular">{fmt(tot.items)}</dd>
                </div>

                {tot.save > 0 && (
                  <div className="flex justify-between text-ok">
                    <dt className="text-ok">{t("savings")}</dt>
                    <dd className="m-0 font-semibold tabular">−{fmt(tot.save)}</dd>
                  </div>
                )}

                {tot.energ > 0 && (
                  <div className="flex justify-between text-ink">
                    <dt className="text-g7">{t("energization")}</dt>
                    <dd className="m-0 font-semibold tabular text-g7">+{fmt(tot.energ)}</dd>
                  </div>
                )}

                {tot.disc > 0 && (
                  <div className="flex justify-between text-em7">
                    <dt className="text-em7">{t("discount")}</dt>
                    <dd className="m-0 font-semibold tabular">−{fmt(tot.disc)}</dd>
                  </div>
                )}

                <div className="flex justify-between text-ink">
                  <dt className="text-ink6">{t("shipping")}</dt>
                  <dd className="m-0 font-semibold">
                    {tot.ship ? fmt(tot.ship) : <span className="text-ok">{t("freeShipping")}</span>}
                  </dd>
                </div>

                <div className="border-t border-s2 pt-3">
                  <div className="flex items-baseline justify-between">
                    <dt className="font-sans text-[16px] font-bold text-em9">{t("total")}</dt>
                    <dd className="m-0 font-sans text-[24px] font-bold text-em9 tabular">
                      {fmt(tot.total)}
                    </dd>
                  </div>
                  <p className="mt-1 font-sans text-[12px] text-ink6">{td("taxes")}</p>
                </div>
              </dl>

              {/* Estimated delivery */}
              <div className="flex items-center gap-2.5 rounded-field bg-s1 p-3 font-sans text-[13px] font-medium text-ink">
                <span className="block size-4 flex-none text-em7">
                  <Icon name="truck" />
                </span>
                <span>{t("deliveryEstimate", { days: "4–7" })}</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <Link
                  href={routes.checkout}
                  className="flex h-[52px] items-center justify-center gap-2.5 rounded-btn bg-em7 sheen font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv no-underline shadow-ring-gold hover:bg-em9 transition-colors"
                >
                  <span className="block size-4">
                    <Icon name="lock" />
                  </span>
                  {t("checkout")}
                </Link>
                <Link
                  href={routes.shop}
                  className="flex h-[46px] items-center justify-center rounded-btn font-sans text-[14px] leading-none font-semibold text-em7 no-underline shadow-ring-em hover:bg-em1 transition-colors"
                >
                  {t("continueShopping")}
                </Link>
              </div>

              {/* Trust / Security */}
              <div className="mt-2 flex flex-col items-center gap-2 border-t border-s2 pt-4">
                <span className="font-sans text-[11px] font-medium text-ink6">{td("secured")}</span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
