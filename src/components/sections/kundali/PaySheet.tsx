"use client";
import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { EASE } from "@/components/motion/easing";
import { Chakra } from "@/components/signature/Chakra";
import { fmt } from "@/lib/core/format";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { K99_MRP } from "./k99-data";

/* Kundali ₹99 mock payment (Kundali-99.dc.html 342–389). A bottom sheet below 768 (radius 8 8 0 0,
   rises 40px) and a centred 440px dialog above (rises 16px), 380 ms EASE, over a 62% night scrim.
   Idle: 4 app tiles (Google Pay selected) + "Pay ₹99". Processing (1.8 s): the chakra (outer 6 s,
   inner −4 s) and "Waiting for your bank". Failed: "No money was taken…" + Try again / Get help.
   Esc, the scrim and ✕ close it except while processing. Focus goes to ✕ on open, Tab stays
   inside, and returns to the opener on close. */

export type PayState = "idle" | "processing" | "failed";
export type PayApp = "gpay" | "phonepe" | "paytm" | "card";

const APPS: [PayApp, string][] = [
  ["gpay", "G"],
  ["phonepe", "Pe"],
  ["paytm", "P"],
  ["card", "Cd"],
];

type Props = {
  name: string;
  phoneMask: string;
  pay: PayState;
  app: PayApp;
  onApp: (a: PayApp) => void;
  onPay: () => void;
  onRetry: () => void;
  onClose: () => void;
};

export function PaySheet({ name, phoneMask, pay, app, onApp, onPay, onRetry, onClose }: Props) {
  const t = useTranslations("k99.sheet");
  const ref = useRef<HTMLDivElement>(null);
  const busy = pay === "processing";

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const opener = document.activeElement as HTMLElement | null;
    if (!isReduced()) {
      const mob = window.matchMedia("(max-width: 767.98px)").matches;
      el.animate([{ transform: mob ? "translateY(40px)" : "translateY(16px)", opacity: 0 }, { transform: "none", opacity: 1 }], {
        duration: 380,
        easing: EASE,
      });
    }
    el.querySelector("button")?.focus({ preventScroll: true });
    return () => opener?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  // Keep Tab inside the dialog.
  const trap = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !ref.current) return;
    const f = [...ref.current.querySelectorAll<HTMLElement>("button:not([disabled]),a[href]")];
    if (!f.length) return;
    const a = f[0];
    const z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) {
      e.preventDefault();
      z.focus();
    } else if (!e.shiftKey && document.activeElement === z) {
      e.preventDefault();
      a.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-[96] grid items-end justify-items-center bg-[rgba(10,31,26,.62)] p-0 md:items-center md:p-6">
      <div aria-hidden="true" onClick={() => !busy && onClose()} className="absolute inset-0" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="k-pay-t"
        onKeyDown={trap}
        className="relative max-h-[92vh] w-full max-w-[440px] overflow-auto rounded-t-lg bg-iv px-[22px] pt-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-[0_40px_80px_-30px_rgba(0,0,0,.6)] md:rounded-btn md:pb-7"
      >
        <div className="flex items-start justify-between gap-3 border-b border-s2 pb-4">
          <span className="flex flex-col gap-1">
            <span className="font-sans text-[10.5px] leading-[1.2] font-semibold tracking-[.14em] text-g7 uppercase">
              Maa Kali Astuti
            </span>
            <span id="k-pay-t" className="font-title text-[22px] leading-[1.2] text-em9">
              {t("title")}
            </span>
            <span className="font-sans text-[13px] leading-[1.3] font-medium text-ink6">{t("sub", { name })}</span>
          </span>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            aria-label={t("close")}
            className="-mt-2 -mr-2.5 grid size-11 flex-none cursor-pointer place-items-center rounded-btn border-none bg-transparent text-ink hover:bg-s1"
          >
            <span className="block size-5">
              <Icon name="close" />
            </span>
          </button>
        </div>

        <div className="flex items-baseline justify-between gap-3 py-4">
          <span className="font-sans text-[13px] leading-[1.3] font-semibold text-ink6">{t("amount")}</span>
          <span className="flex items-baseline gap-2">
            <span className="font-sans text-[14px] leading-none font-medium text-ink6 line-through">{fmt(K99_MRP)}</span>
            <span className="font-sans text-[28px] leading-none font-bold text-em9 tabular">₹99</span>
          </span>
        </div>

        {pay === "idle" && (
          <div className="flex flex-col gap-3.5">
            <span className="font-sans text-[13px] leading-[1.2] font-semibold text-ink">{t("payWith")}</span>
            <div className="grid grid-cols-4 gap-2">
              {APPS.map(([v, ab]) => {
                const sel = app === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onApp(v)}
                    aria-pressed={sel}
                    className={cn(
                      "flex min-h-[72px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-btn border-none px-1 py-2 transition-shadow duration-200",
                      sel ? "bg-cream shadow-[inset_0_0_0_1.5px_#164E3F]" : "bg-iv shadow-[inset_0_0_0_1px_#EAE0CA]",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-[30px] place-items-center rounded-pill font-sans text-[11px] leading-none font-bold",
                        sel ? "bg-em7 text-iv" : "bg-s1 text-em7",
                      )}
                    >
                      {ab}
                    </span>
                    <span className="text-center font-sans text-[11.5px] leading-[1.2] font-semibold text-ink">
                      {t(`apps.${v}`)}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="font-sans text-[12.5px] leading-[1.45] font-medium text-ink6">
              {t("to", { phone: phoneMask })}
            </span>
            <button
              type="button"
              onClick={onPay}
              className="mt-1 flex h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-btn border-none bg-em7 font-sans text-[15.5px] leading-none font-semibold text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5"
            >
              <span className="block size-[18px]">
                <Icon name="lock" />
              </span>
              {t("pay")}
            </button>
          </div>
        )}

        {busy && (
          <div role="status" aria-live="assertive" className="flex flex-col items-center gap-4 pt-[18px] pb-2 text-center">
            <Chakra
              mode="spin"
              spin={[
                ["outer", 6],
                ["inner", -4],
              ]}
              inset="8%"
              className="size-24 rounded-pill bg-n9"
            />
            <span className="font-title text-[20px] leading-[1.25] text-em9">{t("procT")}</span>
            <span className="font-sans text-[13.5px] leading-[1.5] font-medium text-ink6">{t("procD")}</span>
          </div>
        )}

        {pay === "failed" && (
          <div role="alert" className="flex flex-col gap-3.5 pt-1">
            <span className="flex items-center gap-3">
              <span className="grid size-11 flex-none place-items-center rounded-pill bg-[rgba(168,50,45,.1)] text-sin">
                <span className="block size-[22px]">
                  <Icon name="alert" />
                </span>
              </span>
              <span className="font-title text-[21px] leading-[1.25] text-em9">{t("failT")}</span>
            </span>
            <span className="font-sans text-[14px] leading-[1.6] font-medium text-pretty text-ink">{t("failD")}</span>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onRetry}
                className="h-[50px] flex-auto cursor-pointer rounded-btn border-none bg-em7 px-5 font-sans text-[14.5px] leading-none font-semibold text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]"
              >
                {t("retry")}
              </button>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[50px] items-center gap-2 rounded-btn px-[18px] font-sans text-[14.5px] leading-none font-semibold text-em7 no-underline shadow-[inset_0_0_0_1px_#164E3F]"
              >
                <span className="block size-4">
                  <Icon name="whatsapp" />
                </span>
                {t("help")}
              </a>
            </div>
          </div>
        )}

        <span className="mt-[18px] flex items-center justify-center gap-[7px] font-sans text-[11.5px] leading-[1.3] font-semibold text-ink6">
          <span className="block size-[13px] text-g5">
            <Icon name="shield" />
          </span>
          {t("secured")}
        </span>
      </div>
    </div>
  );
}
