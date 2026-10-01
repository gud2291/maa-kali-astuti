"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePincode } from "@/lib/hooks/usePincode";
import { formatIst } from "@/lib/core/ist";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

export function PincodeCheck() {
  const t = useTranslations("pdp");
  const locale = useLocale() as "en" | "hi";
  const { check, state } = usePincode();
  const [pin, setPin] = useState("");

  const handleCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin.trim()) {
      void check(pin.trim());
    }
  };

  const formatDateStr = (dayKey: string) => {
    const [y, m, d] = dayKey.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return formatIst(date, { date: true, weekday: true, locale });
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-btn border border-s2 bg-cream/30 p-3.5">
      <div className="flex items-center gap-2">
        <Icon name="truck" className="size-4 text-em7" />
        <span className="font-sans text-[13px] font-semibold text-em9 tracking-wide uppercase">
          {t("pincodeTitle")}
        </span>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder={state.data?.pin ?? t("pincodePlaceholder")}
            className="h-10 w-full rounded-field border border-s2 bg-iv px-3 font-sans text-[14px] text-ink placeholder:text-ink6/60 outline-none transition-colors focus:border-g5 focus:ring-1 focus:ring-g5"
          />
        </div>
        <button
          type="submit"
          disabled={pin.length !== 6 || state.status === "loading"}
          className={cn(
            "h-10 px-4 rounded-field font-sans text-[13px] font-semibold transition-all cursor-pointer",
            "bg-em7 text-iv hover:bg-em5 disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {state.status === "loading" ? t("checking") : t("check")}
        </button>
      </form>

      {/* Result feedback */}
      {state.status === "ready" && state.data && (
        <div className="flex flex-col gap-1.5 pt-1 text-[13px] text-ink animate-in fade-in">
          {(state.data.city || state.data.state) && (
            <div className="flex items-center gap-1.5 font-medium text-em7">
              <Icon name="pin" className="size-3.5 flex-none" />
              <span>
                {t("deliveringTo", {
                  city: state.data.city || state.data.pin,
                  state: state.data.state || "",
                })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-ink6">
            <Icon name="clock" className="size-3.5 flex-none text-g7" />
            <span>
              {t("deliveryEstimate", {
                from: formatDateStr(state.data.standard[0]),
                to: formatDateStr(state.data.standard[1]),
              })}
            </span>
          </div>

          {state.data.express && (
            <div className="flex items-center gap-1.5 text-g7 font-medium">
              <Icon name="bolt" className="size-3.5 flex-none" />
              <span>
                {t("expressEstimate", {
                  from: formatDateStr(state.data.express[0]),
                  to: formatDateStr(state.data.express[1]),
                })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[12.5px] font-medium pt-0.5">
            {state.data.cod ? (
              <span className="flex items-center gap-1 text-ok">
                <Icon name="check" className="size-3.5" />
                {t("codAvailable")}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-ink6">
                <Icon name="info" className="size-3.5" />
                {t("codNotAvailable")}
              </span>
            )}
          </div>
        </div>
      )}

      {state.status === "error" && (
        <div className="flex items-center gap-1.5 text-[13px] text-sin animate-in fade-in pt-0.5">
          <Icon name="alert" className="size-3.5 flex-none" />
          <span>{state.error === "invalid" ? t("invalidPin") : t("pinNotFound")}</span>
        </div>
      )}
    </div>
  );
}
