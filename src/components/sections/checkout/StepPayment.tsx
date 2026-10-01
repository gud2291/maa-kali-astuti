"use client";

import { useTranslations } from "next-intl";
import { useFees } from "@/stores/catalog";
import { useCheckout } from "./useCheckout";
import { Icon } from "@/components/icons/Icon";
import { fmt } from "@/lib/core/format";
import { RadioDot, pickRing } from "@/components/sections/booking/ui";
import { cn } from "@/lib/utils/cn";
import type { Quote } from "@/server/cart/quote";
import type { PayPref } from "@/lib/domain/enums";

export function StepPayment({
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
  const { method, setMethod, payPref, setPayPref } = useCheckout();

  const codFee = quote?.totals.cod ?? fees.codFeeInr;
  const isCodAllowed = quote?.codAllowed ?? fees.codEnabled;
  const isOnlineAllowed = quote?.onlineAllowed ?? false;

  const getDisabledReason = () => {
    if (quote?.codReason === "disabled") {
      return t("codReasonDisabled");
    }
    if (quote?.codReason === "limit") {
      return t("codReasonLimit");
    }
    return t("codReasonUnavailable");
  };

  const isCurrentMethodValid =
    (method === "online" && isOnlineAllowed) ||
    (method === "cod" && isCodAllowed);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="m-0 font-title text-[22px] leading-tight font-normal text-em9">
          {t("paymentTitle")}
        </h2>
        <p className="mt-1 font-sans text-[13px] leading-normal font-medium text-ink6">
          {t("paymentSub")}
        </p>
      </div>

      <div role="radiogroup" aria-label={t("paymentTitle")} className="flex flex-col gap-3">
        {/* Online Payment Card (First when allowed) */}
        {isOnlineAllowed && (
          <div
            onClick={() => {
              setMethod("online");
              if (!payPref) {
                setPayPref("upi");
              }
            }}
            className={cn(
              "flex flex-col gap-2 rounded-btn bg-cream p-4 transition-all duration-200 cursor-pointer",
              pickRing(method === "online"),
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RadioDot sel={method === "online"} />
                <div className="flex items-center gap-2">
                  <span className="block size-5 text-em7">
                    <Icon name="card" />
                  </span>
                  <span className="font-sans text-[15px] font-bold text-em9">
                    {t("onlineTitle")}
                  </span>
                </div>
              </div>
              <span className="inline-flex h-[22px] items-center rounded-pill bg-em1 px-2.5 font-sans text-[10.5px] font-bold tracking-wider text-em9 uppercase">
                {t("recommended")}
              </span>
            </div>

            <p className="m-0 pl-[32px] font-sans text-[12.5px] leading-relaxed text-ink6">
              {t("onlineDescription")}
            </p>

            {method === "online" && (
              <div className="mt-2 pl-[32px] flex flex-wrap gap-2">
                {(["upi", "card", "netbanking", "wallet"] as const).map(
                  (pref: PayPref) => {
                    const active = (payPref ?? "upi") === pref;
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPayPref(pref);
                        }}
                        className={cn(
                          "h-8 rounded-pill px-3 font-sans text-[12px] font-semibold transition-all cursor-pointer",
                          active
                            ? "bg-em7 text-iv shadow-ring-gold"
                            : "bg-iv text-em7 border border-s2 hover:border-g5",
                        )}
                      >
                        {t(`payPrefs.${pref}`)}
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        )}

        {/* Cash On Delivery (COD) Card */}
        <div
          onClick={() => {
            if (isCodAllowed) {
              setMethod("cod");
            }
          }}
          className={cn(
            "flex flex-col gap-2 rounded-btn bg-cream p-4 transition-all duration-200",
            isCodAllowed ? "cursor-pointer" : "cursor-not-allowed opacity-60",
            pickRing(method === "cod" && isCodAllowed),
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RadioDot sel={method === "cod" && isCodAllowed} />
              <div className="flex items-center gap-2">
                <span className="block size-5 text-em7">
                  <Icon name="truck" />
                </span>
                <span className="font-sans text-[15px] font-bold text-em9">
                  {t("cashOnDelivery")}
                </span>
              </div>
            </div>
            <span className="font-sans text-[14px] font-bold text-ink tabular">
              {codFee > 0 ? `+${fmt(codFee)}` : t("free")}
            </span>
          </div>

          <p className="m-0 pl-[32px] font-sans text-[12.5px] leading-relaxed text-ink6">
            {t("codDescription")}
          </p>

          {!isCodAllowed && (
            <div className="mt-1 ml-[32px] flex items-center gap-1.5 font-sans text-[12px] font-medium text-sin">
              <Icon name="alert" className="size-3.5 flex-none" />
              <span>{getDisabledReason()}</span>
            </div>
          )}
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
          disabled={!isCurrentMethodValid}
          className="flex h-[52px] flex-1 items-center justify-center rounded-btn bg-em7 sheen font-sans text-[15px] leading-none font-semibold tracking-[.03em] text-iv shadow-ring-gold hover:bg-em9 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("continueToReview")}
        </button>
      </div>
    </div>
  );
}
