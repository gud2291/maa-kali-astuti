"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import type { Mode, ModeKey, Service, TierKey } from "@/lib/api/consult";
import { isReport } from "@/lib/core/services";
import { fmt } from "@/lib/core/format";
import { cn } from "@/lib/utils/cn";
import { GROUP_TITLE, RadioDot, pickRing } from "./ui";

/* Step 1 · Service & mode (Booking.dc.html 57–99): the four services as 2-column radio cards
   (icon circle turns night/gold when chosen), the service's meeting modes as pills with a note,
   and the three packages as radio rows ("Most chosen" pill on the recommended one). */
export function StepService({
  services,
  modes,
  svc,
  mode,
  tier,
  onService,
  onMode,
  onTier,
}: {
  services: Service[];
  modes: Record<ModeKey, Mode>;
  svc: Service;
  mode: ModeKey;
  tier: TierKey;
  onService: (s: Service) => void;
  onMode: (m: ModeKey) => void;
  onTier: (k: TierKey) => void;
}) {
  const t = useTranslations("booking");
  const tc = useTranslations("consult");
  const palmReport = svc.key === "palm" && mode === "report";

  return (
    <div className="flex flex-col gap-[34px]">
      <div role="radiogroup" aria-labelledby="bk-l-svc" className="flex flex-col gap-3.5">
        <span id="bk-l-svc" className={GROUP_TITLE}>
          {t("s1.svc")}
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {services.map((x) => {
            const sel = x.key === svc.key;
            const dur = isReport(x)
              ? tc("dur.reportLower")
              : tc("dur.range", { a: x.tiers[0].mins, b: x.tiers[2].mins });
            return (
              <button
                key={x.key}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => onService(x)}
                className={cn(
                  "relative flex flex-col items-start gap-3 rounded-btn border-0 p-4 text-left transition-[box-shadow,background-color] duration-200 hover:shadow-ring-g5",
                  sel
                    ? "bg-cream shadow-[inset_0_0_0_1.5px_#164E3F,0_14px_30px_-20px_rgba(14,59,48,.4)]"
                    : "bg-iv shadow-ring-sand",
                )}
              >
                <span
                  className={cn(
                    "grid size-[42px] place-items-center rounded-pill transition-colors duration-[250ms]",
                    sel ? "bg-em9 text-g3" : "bg-s1 text-em7",
                  )}
                >
                  <Icon name={x.icon} className="size-[22px]" />
                </span>
                <span className="flex flex-col gap-[3px] pr-[18px]">
                  <span lang="en" className="font-display text-[18px] leading-[1.2] font-normal text-em9">
                    {x.name}
                  </span>
                  <span lang="hi" className="font-deva text-[14px] leading-[1.35] text-g7">
                    {x.hi}
                  </span>
                </span>
                <span className="font-sans text-[12.5px] leading-[1.35] font-semibold text-ink6 tabular">
                  {t("s1.fromDur", { price: fmt(x.tiers[0].price), dur })}
                </span>
                <RadioDot sel={sel} className="absolute top-3.5 right-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      <div role="radiogroup" aria-labelledby="bk-l-mode" className="flex flex-col gap-3.5">
        <span id="bk-l-mode" className={GROUP_TITLE}>
          {t("s1.mode")}
        </span>
        <div className="flex flex-wrap gap-2">
          {svc.modes.map((m) => {
            const sel = m === mode;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => onMode(m)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-pill border-0 pr-4 pl-3 font-sans text-[14px] leading-none font-semibold transition-colors duration-200",
                  sel ? "bg-em9 text-iv" : "bg-cream text-em7 shadow-ring-sand",
                )}
              >
                <Icon name={modes[m].icon} className="size-[17px]" />
                {tc(`modes.${m}`)}
              </button>
            );
          })}
        </div>
        <span className="font-sans text-[13.5px] leading-[1.5] font-medium text-ink6">{t(`s1.modeNote.${mode}`)}</span>
      </div>

      <div role="radiogroup" aria-labelledby="bk-l-tier" className="flex flex-col gap-3.5">
        <span id="bk-l-tier" className={GROUP_TITLE}>
          {t("s1.tier")}
        </span>
        <div className="flex flex-col gap-2.5">
          {svc.tiers.map((x) => {
            const sel = x.k === tier;
            // Palmistry as a written report: tiers without the video walkthrough read "Written report".
            const mins =
              palmReport && !/video/i.test(x.inc.join(" ")) ? t("written") : tc("dur.mins", { n: x.mins });
            return (
              <button
                key={x.k}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => onTier(x.k)}
                className={cn(
                  "grid grid-cols-[18px_minmax(0,1fr)_auto] items-start gap-3.5 rounded-btn border-0 px-[18px] py-4 text-left transition-[box-shadow,background-color] duration-200 hover:shadow-ring-g5",
                  sel ? "bg-cream" : "bg-iv",
                  pickRing(sel),
                )}
              >
                <RadioDot sel={sel} className="mt-px" />
                <span className="flex min-w-0 flex-col gap-[5px]">
                  <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span lang="en" className="font-sans text-[15.5px] leading-[1.2] font-bold text-em9">
                      {x.t}
                    </span>
                    <span className="font-sans text-[12.5px] leading-none font-semibold text-ink6">{mins}</span>
                    {x.rec ? (
                      <span className="inline-flex h-[22px] items-center rounded-pill bg-em9 px-[9px] font-sans text-[10px] leading-none font-bold tracking-[.12em] text-g3 uppercase hi:tracking-normal">
                        {t("s1.rec")}
                      </span>
                    ) : null}
                  </span>
                  <span
                    lang="en"
                    className="font-sans text-[13.5px] leading-[1.5] font-medium text-pretty text-ink6"
                  >
                    {x.inc[1] || x.inc[0]}
                  </span>
                </span>
                <span className="font-sans text-[17px] leading-[1.2] font-bold text-em9 tabular">{fmt(x.price)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
