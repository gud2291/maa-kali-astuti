"use client";

import { useTranslations } from "next-intl";
import { useFees } from "@/stores/catalog";
import { useCheckout } from "./useCheckout";
import { usePincode } from "@/lib/hooks/usePincode";
import { Icon } from "@/components/icons/Icon";
import { fmt } from "@/lib/core/format";
import { RadioDot, pickRing } from "@/components/sections/booking/ui";
import { cn } from "@/lib/utils/cn";
import type { Quote } from "@/server/cart/quote";

export function StepDelivery({
  quote,
  onNext,
  onBack,
}: {
  quote: Quote | null;
  onNext: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("checkout");
  const fees = useFees();
  const { delivery, setDelivery } = useCheckout();
  const { state: pinState } = usePincode();

  const standardDates = pinState.data?.standard
    ? `${pinState.data.standard[0]} – ${pinState.data.standard[1]}`
    : t("standardDaysDefault");

  const expressDates = pinState.data?.express
    ? `${pinState.data.express[0]} – ${pinState.data.express[1]}`
    : t("expressDaysDefault");

  const standardFeeLabel =
    quote?.totals.ship === 0 ? t("free") : fmt(fees.shippingInr);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="m-0 font-title text-[22px] leading-tight font-normal text-em9">
          {t("deliveryTitle")}
        </h2>
        <p className="mt-1 font-sans text-[13px] leading-normal font-medium text-ink6">
          {t("deliverySub")}
        </p>
      </div>

      <div role="radiogroup" aria-label={t("deliveryTitle")} className="flex flex-col gap-3">
        {/* Standard option */}
        <div
          onClick={() => setDelivery("standard")}
          className={cn(
            "flex cursor-pointer flex-col gap-2 rounded-btn bg-cream p-4 transition-all duration-200",
            pickRing(delivery === "standard"),
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RadioDot sel={delivery === "standard"} />
              <div className="flex flex-col">
                <span className="font-sans text-[15px] font-bold text-em9">
                  {t("standardDelivery")}
                </span>
                <span className="font-sans text-[12.5px] font-medium text-ink6">
                  {standardDates}
                </span>
              </div>
            </div>
            <span
              className={cn(
                "font-sans text-[15px] font-bold tabular",
                quote?.totals.ship === 0 ? "text-ok" : "text-ink",
              )}
            >
              {standardFeeLabel}
            </span>
          </div>
          <p className="m-0 pl-[30px] font-sans text-[12px] leading-relaxed text-ink6">
            {t("standardDeliveryDesc")}
          </p>
        </div>

        {/* Express option */}
        <div
          onClick={() => setDelivery("express")}
          className={cn(
            "flex cursor-pointer flex-col gap-2 rounded-btn bg-cream p-4 transition-all duration-200",
            pickRing(delivery === "express"),
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RadioDot sel={delivery === "express"} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[15px] font-bold text-em9">
                    {t("expressDelivery")}
                  </span>
                  <span className="rounded-pill bg-g1 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-g7">
                    {t("faster")}
                  </span>
                </div>
                <span className="font-sans text-[12.5px] font-medium text-ink6">
                  {expressDates}
                </span>
              </div>
            </div>
            <span className="font-sans text-[15px] font-bold text-ink tabular">
              +{fmt(fees.expressInr)}
            </span>
          </div>
          <p className="m-0 pl-[30px] font-sans text-[12px] leading-relaxed text-ink6">
            {t("expressDeliveryDesc")}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-[52px] items-center gap-1.5 rounded-btn px-4 font-sans text-[14px] font-semibold text-em7 hover:bg-em1 transition-colors cursor-pointer"
        >
          <span className="block size-4">
            <Icon name="arrowL" />
          </span>
          {t("back")}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex h-[52px] flex-1 items-center justify-center rounded-btn bg-em7 sheen font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv shadow-ring-gold hover:bg-em9 transition-colors cursor-pointer"
        >
          {t("continueToPayment")}
        </button>
      </div>
    </div>
  );
}
