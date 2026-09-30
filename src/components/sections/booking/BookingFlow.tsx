"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/icons/Icon";
import { jumpToTop, scrollToTop, scrollToY } from "@/components/layout/scroll";
import { routing } from "@/i18n/routing";
import { submitBooking } from "@/lib/api/booking";
import type { Mode, ModeKey, Service, ServiceKey, TierKey } from "@/lib/api/consult";
import { recTier } from "@/lib/core/services";
import type { CalEvent } from "@/lib/astro/calendar";
import { istDate, isoDay, t12 } from "@/lib/astro/slots";
import { addDays, dfmt, dlong } from "@/lib/core/dates";
import { fmt } from "@/lib/core/format";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { bookHref } from "@/lib/routes";
import { waLink } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import {
  bookingDefaults,
  checkBookingStep,
  needsSlot as slotNeeded,
  type BookingDetails,
  type BookingDraft,
  type BookingErrors,
  type BookingField,
  type PayMethod,
  type UpiApp,
} from "@/lib/validation/booking";
import { useUi } from "@/stores/ui";
import { rich } from "@/components/sections/consult/ui";
import { BookingDone } from "./BookingDone";
import { BookingSummary, type SummaryData } from "./BookingSummary";
import { StepDetails, type PalmFile, type PalmSide } from "./StepDetails";
import { StepPay } from "./StepPay";
import { StepService } from "./StepService";
import { StepSlot } from "./StepSlot";

/* Booking stepper (design/Booking.dc.html, `/book/[service]?tier=`).
   1 Service & mode → 2 Your details → 3 Date & time (or Delivery for written reports) → 4 Payment
   → confirmation. Steps are client state (the design has no step param, INV §C); the service and
   tier live in the URL and are rewritten in place (`replaceState`) when changed on step 1.
   - Stepper: 4 numbered circles on a hairline; the brass fill grows by thirds (700 ms EASE);
     completed steps turn emerald with a ✓ and are the only clickable ones (go back).
   - Continue validates the step (errs 495–511). A failed attempt marks the step as tried (errors
     then update live), focuses the first invalid field and scrolls it 140px under the top.
   - Step 4 → the processing overlay (chakra 8 / −6 / 4 s) for 2 s → the confirmation.
   Layout: one column; the night summary aside from 1024 (sticky 88px); the nav row from 768; the
   fixed bottom bar with price + Back/Continue below 768 (the page reserves 132px for it). */

type Step = 1 | 2 | 3 | 4 | 5;

type State = {
  step: Step;
  svc: ServiceKey;
  mode: ModeKey;
  tier: TierKey;
  f: BookingDetails;
  palm: Record<PalmSide, PalmFile | null>;
  tried: Partial<Record<Step, boolean>>;
  month: number;
  date: Date | null;
  time: string | null;
  pay: PayMethod;
  app: UpiApp;
  upiId: string;
  bank: string;
  processing: boolean;
  bid: string;
};

const MAX_PHOTO = 15 * 1024 * 1024;
const CHAKRA = [
  { ring: "outer", amb: "spin:8" },
  { ring: "middle", amb: "spin:-6" },
  { ring: "inner", amb: "spin:4" },
] as const;

export function BookingFlow({
  services,
  modes,
  stepIcons,
  initialKey,
}: {
  services: Service[];
  modes: Record<ModeKey, Mode>;
  /** "What happens next" icons (A.STEPS). */
  stepIcons: IconName[];
  initialKey: ServiceKey;
}) {
  const t = useTranslations("booking");
  const tc = useTranslations("consult");
  const locale = useLocale();
  const hi = locale === "hi";
  const hydrated = useHydrated();

  const [s, setS] = useState<State>(() => {
    const d = services.find((x) => x.key === initialKey) ?? services[0];
    return {
      step: 1,
      svc: d.key,
      mode: d.modes[0],
      tier: recTier(d).k,
      f: bookingDefaults(),
      palm: { left: null, right: null },
      tried: {},
      month: 0,
      date: null,
      time: null,
      pay: "upi",
      app: "gpay",
      upiId: "",
      bank: "",
      processing: false,
      bid: "",
    };
  });
  const patch = useCallback((p: Partial<State> | ((st: State) => Partial<State>)) => {
    setS((st) => ({ ...st, ...(typeof p === "function" ? p(st) : p) }));
  }, []);

  const d = services.find((x) => x.key === s.svc) ?? services[0];
  const tier = d.tiers.find((x) => x.k === s.tier) ?? d.tiers[0];
  const need = slotNeeded(s.mode);
  const step = s.step;

  /* `?tier=` from the URL (design fromHash 488–492: an unknown tier falls back to the recommended). */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("tier");
    if (q && d.tiers.some((x) => x.k === q)) patch({ tier: q as TierKey });
    // Mount only: later tier changes come from the page itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The footer only shows with the confirmation (Booking 446). */
  const setFlowDone = useUi((u) => u.setFlowDone);
  useEffect(() => {
    setFlowDone(step === 5);
  }, [step, setFlowDone]);
  useEffect(() => () => setFlowDone(false), [setFlowDone]);

  /* Palm previews are object URLs: release them when replaced (below) and on unmount. */
  const palmRef = useRef(s.palm);
  useEffect(() => {
    palmRef.current = s.palm;
  }, [s.palm]);
  useEffect(
    () => () => {
      Object.values(palmRef.current).forEach((p) => p && URL.revokeObjectURL(p.url));
    },
    [],
  );

  const alive = useRef(true);
  useEffect(
    () => () => {
      alive.current = false;
    },
    [],
  );

  /* Step changes (not the first render): move focus to the heading for screen readers. */
  const headRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    if (step <= 4) headRef.current?.focus({ preventScroll: true });
  }, [step]);

  /** Rewrite the URL for the current service/tier without navigating (design replaceState 548, 552). */
  const writeUrl = (key: ServiceKey, tk: TierKey) => {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    try {
      window.history.replaceState(null, "", prefix + bookHref(key, tk));
    } catch {
      /* ignore */
    }
  };

  const todayIso = hydrated ? isoDay(addDays(0)) : "";
  const draft: BookingDraft = {
    svc: s.svc,
    mode: s.mode,
    f: s.f,
    palm: { left: !!s.palm.left, right: !!s.palm.right },
    date: s.date,
    time: s.time,
    pay: s.pay,
    app: s.app,
    upiId: s.upiId,
    bank: s.bank,
  };
  const E: BookingErrors = s.tried[step] && step <= 4 ? checkBookingStep(step, draft, todayIso) : {};
  const errMsg = (k: BookingField) => (E[k] ? t(`err.${E[k]}`) : undefined);

  /* ---------- actions ---------- */
  const go = (n: Step) => {
    patch({ step: n });
    scrollToTop();
  };

  const next = async () => {
    if (s.processing) return;
    const e = checkBookingStep(step, draft, isoDay(addDays(0)));
    if (Object.keys(e).length) {
      patch((st) => ({ tried: { ...st.tried, [step]: true } }));
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>('#main [aria-invalid="true"]');
        if (!el) return;
        el.focus({ preventScroll: true });
        scrollToY(el.getBoundingClientRect().top + window.scrollY - 140);
      }, 60);
      return;
    }
    if (step < 4) {
      go((step + 1) as Step);
      return;
    }
    patch({ processing: true });
    const start = need && s.date && s.time ? istDate(s.date, s.time).toISOString() : null;
    const { id } = await submitBooking({
      svc: s.svc,
      tier: tier.k,
      mode: s.mode,
      details: s.f,
      start,
      price: tier.price,
      pay: s.pay,
      palms: (s.palm.left ? 1 : 0) + (s.palm.right ? 1 : 0),
    });
    if (!alive.current) return;
    patch({ processing: false, step: 5, bid: id });
    jumpToTop();
  };

  const back = () => {
    if (step > 1 && step <= 4) go((step - 1) as Step);
  };

  const pickService = (x: Service) => {
    if (x.key === s.svc) return;
    const nt = recTier(x).k;
    patch({ svc: x.key, mode: x.modes[0], tier: nt, date: null, time: null, tried: {} });
    writeUrl(x.key, nt);
  };
  const pickTier = (k: TierKey) => {
    patch({ tier: k, time: null });
    writeUrl(s.svc, k);
  };
  const pickMode = (m: ModeKey) => patch((st) => ({ mode: m, time: m === "report" ? null : st.time }));

  const setField = <K extends keyof BookingDetails>(key: K, v: BookingDetails[K]) =>
    patch((st) => ({ f: { ...st.f, [key]: v } }));

  const onPalm = (side: PalmSide, file: File | null) => {
    if (file) {
      if (!/^image\//.test(file.type)) {
        useUi.getState().toast({ msg: t("s2.palms.notImage"), tone: "err" });
        return;
      }
      if (file.size > MAX_PHOTO) {
        useUi.getState().toast({ msg: t("s2.palms.tooBig"), tone: "err" });
        return;
      }
    }
    // Side effects stay outside the state updater (StrictMode runs updaters twice).
    const old = s.palm[side];
    if (old) URL.revokeObjectURL(old.url);
    const nextFile = file ? { url: URL.createObjectURL(file), name: file.name } : null;
    patch((st) => ({ palm: { ...st.palm, [side]: nextFile } }));
  };

  /* ---------- derived copy ---------- */
  const modeT = (m: ModeKey) => tc(`modes.${m}`);
  const minsL = s.svc === "palm" && s.mode === "report" ? t("written") : tc("dur.mins", { n: tier.mins });
  const deliver = hydrated ? addDays(2) : null;
  const chosen = need && s.date && s.time;
  const whenV = need
    ? chosen
      ? t("sum.at", { date: dfmt(s.date!, hi), time: t12(s.time!) })
      : t("sum.notChosen")
    : deliver
      ? t("sum.reportBy", { date: dfmt(deliver, hi) })
      : "";
  const sum: SummaryData = {
    icon: d.icon,
    name: d.name,
    hi: d.hi,
    price: fmt(tier.price),
    short: `${tier.t} · ${minsL} · ${modeT(s.mode)}`,
    rows: [
      { k: t("sum.package"), v: `${tier.t} · ${minsL}` },
      { k: t("sum.mode"), v: modeT(s.mode) },
      { k: need ? t("sum.when") : t("sum.delivery"), v: whenV, muted: need && !chosen },
      { k: t("sum.language"), v: t(`sum.langName.${s.f.lang}`) },
    ],
  };
  const trust: { icon: IconName; t: string }[] = [
    { icon: "returns", t: t("sum.trust.reschedule") },
    { icon: "lock", t: t("sum.trust.private") },
    d.guarantee ? { icon: "seal", t: t("sum.trust.guarantee") } : { icon: "chat", t: t("sum.trust.followup") },
  ];

  const headKey = step === 3 && !need ? "3r" : String(Math.min(step, 4));
  const STEPT = [t("steps.service"), t("steps.details"), need ? t("steps.slot") : t("steps.delivery"), t("steps.pay")];
  const ctaKey = step === 2 && !need ? "2r" : String(Math.min(step, 4));
  const cta = t(`nav.cta.${ctaKey}` as "nav.cta.1", { price: fmt(tier.price) });
  const ctaS = step === 4 ? t("nav.payShort", { price: fmt(tier.price) }) : t("nav.continue");

  /* ---------- confirmation ---------- */
  if (step === 5) {
    const payT =
      s.pay === "upi"
        ? t("done.payT.upi", { app: t(`s4.apps.${s.app}`) })
        : s.pay === "card"
          ? t("done.payT.card")
          : t("done.payT.nb", { bank: s.bank });
    const reportBy = deliver ?? addDays(2);
    const evt: CalEvent | null =
      need && s.date && s.time
        ? {
            id: s.bid,
            start: istDate(s.date, s.time),
            mins: tier.mins,
            title: t("ev.title", { name: d.name }),
            desc: t("ev.desc", { tier: tier.t, mode: modeT(s.mode), id: s.bid }),
            loc: s.mode === "video" ? t("ev.locVideo") : t("ev.locCall"),
          }
        : null;
    const phone = s.f.phone.replace(/(\d{5})(\d{5})/, "$1 $2");
    const line = `${s.f.email ? t("done.sentEmail", { phone, email: s.f.email }) : t("done.sent", { phone })} ${
      need ? t("done.slotNote") : t("done.reportNote", { date: dlong(reportBy, hi) })
    }`;
    const rows = [
      { k: t("done.consult"), v: d.name },
      { k: t("sum.package"), v: `${tier.t} · ${minsL}` },
      { k: t("sum.mode"), v: modeT(s.mode) },
      {
        k: need ? t("sum.when") : t("sum.delivery"),
        v:
          need && s.date && s.time
            ? t("sum.at", { date: dlong(s.date, hi), time: t12(s.time) })
            : t("done.by", { date: dlong(reportBy, hi) }),
      },
      { k: t("done.paid"), v: t("done.paidV", { price: fmt(tier.price), method: payT }) },
    ];
    return <BookingDone id={s.bid} line={line} rows={rows} evt={evt} steps={stepIcons} />;
  }

  /* ---------- stepper ---------- */
  return (
    <>
      <section data-screen-label="Booking stepper" className="bg-iv">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,4vw,64px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,3vw,40px)] pb-[132px] md:pb-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-[clamp(24px,3vw,32px)]">
            <div className="flex flex-col gap-2.5">
              <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase hi:tracking-normal">
                {t.rich("eyebrow", rich())}
              </span>
              <h1
                ref={headRef}
                tabIndex={-1}
                lang="en"
                className="m-0 font-display text-[clamp(34px,4.4vw,56px)] leading-[1.05] font-normal tracking-[-.02em] text-balance text-em9 font-soft focus:outline-none"
              >
                {t.rich(`head.${headKey}` as "head.1", rich())}
              </h1>
            </div>

            <ol
              aria-label={t("stepsAria")}
              className="relative m-0 grid list-none grid-cols-[repeat(4,minmax(0,1fr))] gap-1 p-0"
            >
              <span aria-hidden="true" className="absolute top-[22px] right-[12.5%] left-[12.5%] h-px bg-s2" />
              <span
                aria-hidden="true"
                className="absolute top-[22px] right-[12.5%] left-[12.5%] h-px origin-left bg-g5 transition-transform duration-700 ease-mka"
                style={{ transform: `scaleX(${Math.min(step - 1, 3) / 3})` }}
              />
              {STEPT.map((label, i) => {
                const n = i + 1;
                const done = n < step;
                const cur = n === step;
                return (
                  <li key={n} className="relative flex justify-center">
                    <button
                      type="button"
                      onClick={() => done && go(n as Step)}
                      disabled={!done}
                      aria-current={cur ? "step" : undefined}
                      aria-label={t("stepAria", { n, t: label, state: done ? "done" : cur ? "cur" : "other" })}
                      className={cn(
                        "flex min-w-11 flex-col items-center gap-2 border-0 bg-transparent px-0.5",
                        done ? "cursor-pointer" : "cursor-default",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-11 place-items-center rounded-pill font-sans text-[14px] leading-none font-bold transition-colors duration-300",
                          done
                            ? "bg-em7 text-iv"
                            : cur
                              ? "bg-em9 text-iv shadow-[inset_0_0_0_1px_#0E3B30,0_0_0_4px_rgba(184,146,58,.28)]"
                              : "bg-iv text-ink6 shadow-ring-sand",
                        )}
                      >
                        {done ? <Icon name="check" className="size-[18px]" /> : n}
                      </span>
                      <span
                        className={cn(
                          "text-center font-sans text-[12px] leading-[1.25] font-semibold",
                          cur ? "text-em9" : done ? "text-em7" : "text-ink6",
                        )}
                      >
                        {label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {step === 1 && (
              <StepService
                services={services}
                modes={modes}
                svc={d}
                mode={s.mode}
                tier={tier.k}
                onService={pickService}
                onMode={pickMode}
                onTier={pickTier}
              />
            )}
            {step === 2 && (
              <StepDetails
                svc={s.svc}
                f={s.f}
                set={setField}
                E={E}
                palm={s.palm}
                onPalm={onPalm}
                todayIso={todayIso}
              />
            )}
            {step === 3 && (
              <StepSlot
                svc={s.svc}
                needsSlot={need}
                mins={tier.mins}
                month={s.month}
                date={s.date}
                time={s.time}
                error={errMsg("slot")}
                onMonth={(m) => patch({ month: m })}
                onDate={(dt) => patch({ date: dt, time: null })}
                onTime={(tm) => patch({ time: tm })}
              />
            )}
            {step === 4 && (
              <StepPay
                sum={sum}
                pay={s.pay}
                app={s.app}
                upiId={s.upiId}
                bank={s.bank}
                errUpi={errMsg("upi")}
                errBank={errMsg("bank")}
                onPay={(p) => patch({ pay: p })}
                onApp={(a) => patch({ app: a })}
                onUpiId={(v) => patch({ upiId: v })}
                onBank={(b) => patch({ bank: b })}
              />
            )}

            <div className="flex items-center justify-between gap-3.5 border-t border-s2 pt-6 max-md:hidden">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={back}
                  className="inline-flex min-h-11 items-center gap-2 border-0 bg-transparent px-1 font-sans text-[14.5px] leading-none font-semibold text-em7"
                >
                  <Icon name="arrowL" className="size-4" />
                  {t("nav.back")}
                </button>
              ) : (
                <a
                  href={waLink()}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 font-sans text-[14px] leading-none font-semibold text-em7 no-underline"
                >
                  <Icon name="whatsapp" className="size-[17px]" />
                  {t("nav.wa")}
                </a>
              )}
              <button
                type="button"
                onClick={next}
                disabled={s.processing}
                className="inline-flex h-[52px] items-center gap-2.5 rounded-btn border-0 bg-em7 sheen px-[26px] font-sans text-[15px] leading-none font-semibold tracking-[.02em] text-iv shadow-ring-gold hover:-translate-y-px hi:tracking-normal"
              >
                {step === 4 && <Icon name="lock" className="size-[17px]" />}
                {cta}
                {step !== 4 && <Icon name="arrowR" className="size-[17px]" />}
              </button>
            </div>
          </div>

          <BookingSummary
            sum={sum}
            labels={{ aria: t("sum.aria"), total: t("sum.total"), taxes: t("sum.taxes") }}
            trust={trust}
          />
        </div>
      </section>

      {!s.processing && (
        <div className="fixed inset-x-0 bottom-0 z-55 bg-iv px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[inset_0_1px_0_#EAE0CA,0_-12px_32px_-18px_rgba(14,59,48,.3)] md:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-sans text-[20px] leading-none font-bold text-em9 tabular">{sum.price}</span>
              <span className="overflow-hidden font-sans text-[12px] leading-[1.2] font-semibold text-ellipsis whitespace-nowrap text-ink6">
                {sum.short}
              </span>
            </span>
            <span className="flex flex-none items-center gap-1.5">
              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  aria-label={t("nav.backAria")}
                  className="grid size-[52px] place-items-center rounded-btn border-0 bg-iv text-em7 shadow-ring-em"
                >
                  <Icon name="arrowL" className="size-[18px]" />
                </button>
              )}
              <button
                type="button"
                onClick={next}
                className="inline-flex h-[52px] items-center gap-2 rounded-btn border-0 bg-em7 px-[22px] font-sans text-[15px] leading-none font-semibold text-iv shadow-ring-gold"
              >
                {ctaS}
                <Icon name="arrowR" className="size-4" />
              </button>
            </span>
          </div>
        </div>
      )}

      {s.processing && (
        <div
          role="status"
          aria-live="assertive"
          className="fixed inset-0 z-95 grid place-items-center bg-[rgba(10,31,26,.95)] p-6"
        >
          <div className="flex flex-col items-center gap-[22px] text-center">
            <div aria-hidden="true" className="relative size-[148px]">
              {CHAKRA.map((c) => (
                <span key={c.ring} data-amb={c.amb} className="absolute inset-0 block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/svg/chakra/${c.ring}-d9b96a.svg`}
                    alt=""
                    width={148}
                    height={148}
                    className="block size-full"
                  />
                </span>
              ))}
            </div>
            <span className="font-title text-[26px] leading-[1.2] font-normal text-iv">{t("proc.title")}</span>
            <span className="max-w-[300px] font-sans text-[14px] leading-[1.55] font-medium text-sg3">
              {t("proc.body")}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
