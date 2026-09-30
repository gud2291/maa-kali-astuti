"use client";

import { useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";
import { BANKS, UPI_APPS, type PayMethod, type UpiApp } from "@/lib/validation/booking";
import type { SummaryData } from "./BookingSummary";
import { ErrorRow, GROUP_TITLE, RadioDot, inputCls, pickRing } from "./ui";

/* Step 4 · Pay (Booking.dc.html 304–357). Below 768 a sand summary card opens the step (the
   night aside takes over from 1024; 768–1023 has none, as in the design: INV gotcha 6). Then the
   three methods as radio cards: UPI (app tiles; "UPI ID" reveals the field), card, and
   netbanking (bank chips). The Razorpay line closes the step. */

const METHOD_ICON: Record<PayMethod, IconName> = { upi: "bolt", card: "card", nb: "bank" };
const APP_ABBR: Record<UpiApp, string> = { gpay: "G", phonepe: "Pe", paytm: "P", id: "@" };

export function StepPay({
  sum,
  pay,
  app,
  upiId,
  bank,
  errUpi,
  errBank,
  onPay,
  onApp,
  onUpiId,
  onBank,
}: {
  sum: SummaryData;
  pay: PayMethod;
  app: UpiApp;
  upiId: string;
  bank: string;
  errUpi?: string;
  errBank?: string;
  onPay: (p: PayMethod) => void;
  onApp: (a: UpiApp) => void;
  onUpiId: (v: string) => void;
  onBank: (b: string) => void;
}) {
  const t = useTranslations("booking.s4");

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-col rounded-btn bg-s1 shadow-[inset_0_0_0_1px_rgba(184,146,58,.45)] md:hidden">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <span className="grid size-10 flex-none place-items-center rounded-pill bg-em9 text-g3">
            <Icon name={sum.icon} className="size-5" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span lang="en" className="font-display text-[19px] leading-[1.2] font-normal text-em9">
              {sum.name}
            </span>
            <span lang="hi" className="font-deva text-[13.5px] leading-[1.35] text-g7">
              {sum.hi}
            </span>
          </span>
        </div>
        <dl className="m-0 px-4 pb-1.5">
          {sum.rows.map((r) => (
            <div
              key={r.k}
              className="flex justify-between gap-3.5 border-t border-[rgba(184,146,58,.3)] py-[11px]"
            >
              <dt className="font-sans text-[11px] leading-[1.4] font-semibold tracking-[.12em] text-ink6 uppercase hi:tracking-normal">
                {r.k}
              </dt>
              <dd className="m-0 text-right font-sans text-[14px] leading-[1.4] font-semibold text-ink">{r.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div role="radiogroup" aria-labelledby="bk-l-pay" className="flex flex-col gap-2.5">
        <span id="bk-l-pay" className={cn(GROUP_TITLE, "mb-1")}>
          {t("pay")}
        </span>
        {(["upi", "card", "nb"] as const).map((m) => {
          const sel = pay === m;
          return (
            <div
              key={m}
              className={cn("rounded-btn bg-cream transition-shadow duration-200", pickRing(sel))}
            >
              <button
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => onPay(m)}
                className="grid min-h-16 w-full grid-cols-[18px_24px_minmax(0,1fr)_auto] items-center gap-3 border-0 bg-transparent px-4 py-2.5 text-left"
              >
                <RadioDot sel={sel} />
                <Icon name={METHOD_ICON[m]} className="size-[22px] text-em7" />
                <span className="flex min-w-0 flex-col gap-[3px]">
                  <span className="font-sans text-[15px] leading-[1.2] font-bold text-em9">{t(`methods.${m}.t`)}</span>
                  <span className="font-sans text-[12.5px] leading-[1.4] font-medium text-ink6">
                    {t(`methods.${m}.sub`)}
                  </span>
                </span>
                {m === "upi" && (
                  <span className="inline-flex h-[22px] items-center rounded-pill bg-em1 px-[9px] font-sans text-[10px] leading-none font-bold tracking-[.12em] text-em9 uppercase hi:tracking-normal">
                    {t("methods.upi.tag")}
                  </span>
                )}
              </button>

              {sel && m === "upi" && (
                <div className="flex flex-col gap-3 px-4 pt-1 pb-[18px]">
                  <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-4">
                    {UPI_APPS.map((a) => {
                      const on = app === a;
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => onApp(a)}
                          aria-pressed={on}
                          className={cn(
                            "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-btn border-0 p-2 transition-[box-shadow,background-color] duration-200",
                            on ? "bg-cream" : "bg-iv",
                            pickRing(on),
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-7 place-items-center rounded-pill font-sans text-[11px] leading-none font-bold",
                              on ? "bg-em7 text-iv" : "bg-s1 text-em7",
                            )}
                          >
                            {APP_ABBR[a]}
                          </span>
                          <span className="font-sans text-[12.5px] leading-[1.2] font-semibold text-ink">
                            {t(`apps.${a}`)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {app === "id" && (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="bk-upi"
                        className="font-sans text-[13px] leading-[1.2] font-semibold text-ink"
                      >
                        {t("upiLabel")}
                      </label>
                      <input
                        id="bk-upi"
                        type="text"
                        inputMode="email"
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        maxLength={60}
                        placeholder={t("upiPh")}
                        value={upiId}
                        onChange={(e) => onUpiId(e.target.value.trim())}
                        aria-invalid={!!errUpi}
                        aria-describedby={errUpi ? "bk-upi-err" : undefined}
                        className={cn(inputCls(!!errUpi), "h-[52px] bg-iv")}
                      />
                      {errUpi && <ErrorRow id="bk-upi-err">{errUpi}</ErrorRow>}
                    </div>
                  )}
                </div>
              )}

              {sel && m === "nb" && (
                <div className="flex flex-col gap-2.5 px-4 pt-1 pb-[18px]">
                  <div className="flex flex-wrap gap-2">
                    {BANKS.map((b) => {
                      const on = bank === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => onBank(b)}
                          aria-pressed={on}
                          className={cn(
                            "h-11 rounded-pill border-0 px-4 font-sans text-[13.5px] leading-none font-semibold",
                            on ? "bg-em7 text-iv" : "bg-iv text-em7 shadow-ring-sand",
                          )}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                  {errBank && <ErrorRow>{errBank}</ErrorRow>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span className="flex items-start gap-2 font-sans text-[13px] leading-[1.55] font-medium text-pretty text-ink6">
        <Icon name="shield" className="mt-0.5 size-[15px] flex-none text-g5" />
        {t("note")}
      </span>
    </div>
  );
}
