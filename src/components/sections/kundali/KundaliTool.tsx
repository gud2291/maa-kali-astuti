"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { scrollToId } from "@/components/layout/scroll";
import { Chakra } from "@/components/signature/Chakra";
import { Starfield } from "@/components/signature/Starfield";
import { Corner } from "@/components/ui/ornaments/Corner";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import type { Kundali } from "@/lib/astro/kundali";
import type { SelectedPlace } from "@/components/forms/PlaceInput";
import { computeChartAction, createKundaliOrderAction } from "@/server/kundali/actions";
import { openRazorpay } from "@/lib/payments/razorpay-client";
import { confirmPaymentAction } from "@/server/payments/actions";
import { toKundali } from "@/lib/astro/from-snapshot";
import { t12 } from "@/lib/astro/slots";
import { MON, MONH } from "@/lib/core/dates";
import { fmt } from "@/lib/core/format";
import { cn } from "@/lib/utils/cn";
import { checkKundali99, type K99Draft, type K99Errors } from "@/lib/validation/astro";
import { useUi } from "@/stores/ui";
import { IS_DEV } from "@/lib/core/runtime";
import { KundaliForm } from "./KundaliForm";
import { PaySheet, type PayApp, type PayState } from "./PaySheet";

/* Kundali ₹99 tool (Kundali-99.dc.html 32–259 + 331–389, script 392–497). State machine:
     form → gen (chakra ramp S7 + 7 messages, 820 ms each; result after 5.3 s)
          → preview (the #preview section appears; the page scrolls to it)
          → pay sheet (1.8 s mock) → done (success band + Download) | failed (retry keeps the chart)
   "Edit details" returns to the form and drops the chart. Night hero: intro / card / facts as
   grid areas (card on the right from 1024). Below 768 in preview a fixed "Pay ₹99" bar shows.
   QA-only demo states (INV §C): ?demo=generating|preview|success and ?pay=fail. */

type Phase = "form" | "gen" | "preview" | "done";

/* The preview carries ~80 KB of report-page SVG, so it loads on demand: the chunk is requested when
   generation starts (5.3 s ahead). The fallback keeps #preview in the DOM for the scroll. */
const loadPreview = () => import("./KundaliPreview");
const KundaliPreview = dynamic(() => loadPreview().then((m) => m.KundaliPreview), {
  loading: () => <section id="preview" className="min-h-[100svh] scroll-mt-[60px] bg-iv" />,
});

const EMPTY: K99Draft = { name: "", dob: "", tob: "", unknown: false, place: "", lang: "en", phone: "", email: "" };
const DEMO: K99Draft = {
  name: "Ravi Sharma",
  dob: "1986-11-12",
  tob: "06:40",
  unknown: false,
  place: "Varanasi, Uttar Pradesh",
  lang: "en",
  phone: "9876543210",
  email: "ravi.sharma@example.com",
};
const MSG_N = 7;

const noop = () => () => {};
const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const dayStart = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

type Props = {
  buildNow: number;
  /** Server-rendered hero blocks (breadcrumb → price, and the facts list). */
  intro: ReactNode;
  facts: ReactNode;
  priceInr?: number;
  mrpInr?: number;
  enabled?: boolean;
};

export function KundaliTool({
  buildNow,
  intro,
  facts,
  priceInr = 99,
  mrpInr = 499,
  enabled = true,
}: Props) {
  const t = useTranslations("k99");
  const hiUi = useLocale() === "hi";
  const today = isoDay(
    useSyncExternalStore(
      noop,
      () => dayStart(Date.now()),
      () => dayStart(buildNow),
    ),
  );

  const [phase, setPhase] = useState<Phase>("form");
  const [f, setF] = useState<K99Draft>(EMPTY);
  const [city, setCity] = useState<SelectedPlace | null>(null);
  const [tried, setTried] = useState(false);
  const [msg, setMsg] = useState(0);
  const [K, setK] = useState<Kundali | null>(null);
  const [sheet, setSheet] = useState(false);
  const [pay, setPay] = useState<PayState>("idle");
  const [app, setApp] = useState<PayApp>("gpay");
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [accessKey, setAccessKey] = useState<string | null>(null);

  const failPay = useRef(false);
  const msgTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const genTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const payTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const formRef = useRef<HTMLDivElement>(null);

  const stopGen = () => {
    clearInterval(msgTimer.current);
    clearTimeout(genTimer.current);
  };
  const toPreview = () => {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => scrollToId("preview", 60), 90);
  };

  /** gen(loop): loop = the demo "generating" state, which cycles the messages forever. */
  const gen = (draft: K99Draft, picked: SelectedPlace | null, loop: boolean) => {
    stopGen();
    void loadPreview();
    setCity(picked);
    setMsg(0);
    setPhase("gen");
    msgTimer.current = setInterval(
      () => setMsg((m) => (loop ? (m + 1) % MSG_N : Math.min(m + 1, MSG_N - 1))),
      820,
    );
    if (loop) return;

    const calcPromise = (async () => {
      let p = picked;
      if (!p) {
        const q = draft.place.split(",")[0].trim();
        try {
          const res = await fetch(`/api/places?q=${encodeURIComponent(q)}`);
          if (res.ok) {
            const list = (await res.json()) as SelectedPlace[];
            if (list.length > 0) p = list[0];
          }
        } catch {
          // ignore
        }
      }
      const finalPlace: SelectedPlace = p ?? {
        id: "default_varanasi",
        name: "Varanasi",
        region: "Uttar Pradesh",
        country: "IN",
        lat: 25.3176,
        lon: 82.9739,
        tz: "Asia/Kolkata",
      };

      const result = await computeChartAction({
        name: draft.name,
        dob: draft.dob,
        tob: draft.tob || null,
        tobUnknown: draft.unknown,
        place: {
          name: finalPlace.region ? `${finalPlace.name}, ${finalPlace.region}` : finalPlace.name,
          lat: finalPlace.lat,
          lon: finalPlace.lon,
          tz: finalPlace.tz,
        },
      });

      if (result.ok) {
        return toKundali(result.data);
      }
      return null;
    })();

    genTimer.current = setTimeout(async () => {
      clearInterval(msgTimer.current);
      const computedK = await calcPromise;
      if (computedK) {
        setK(computedK);
        setPhase("preview");
        toPreview();
      } else {
        setPhase("form");
        useUi.getState().toast({ msg: "Could not generate Kundali. Please check details.", tone: "rose" });
      }
    }, 5300);
  };

  // QA demo states, read once (the design's Tweaks props demoState / payOutcome).
  useEffect(() => {
    if (!IS_DEV) return;
    const q = new URLSearchParams(window.location.search);
    failPay.current = q.get("pay") === "fail";
    const st = q.get("demo");
    if (st !== "generating" && st !== "preview" && st !== "success") return;
    const demoPlace: SelectedPlace = {
      id: "demo_varanasi",
      name: "Varanasi",
      region: "Uttar Pradesh",
      country: "IN",
      lat: 25.3176,
      lon: 82.9739,
      tz: "Asia/Kolkata",
    };
    setF(DEMO);
    setCity(demoPlace);
    if (st === "generating") gen(DEMO, demoPlace, true);
    else {
      computeChartAction({
        name: DEMO.name,
        dob: DEMO.dob,
        tob: DEMO.tob,
        tobUnknown: DEMO.unknown,
        place: {
          name: `${demoPlace.name}, ${demoPlace.region}`,
          lat: demoPlace.lat,
          lon: demoPlace.lon,
          tz: demoPlace.tz,
        },
      }).then((res) => {
        if (res.ok) {
          setK(toKundali(res.data));
          setPhase(st === "success" ? "done" : "preview");
        }
      });
    }
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      stopGen();
      clearTimeout(payTimer.current);
      clearTimeout(scrollTimer.current);
    },
    [],
  );

  const err: K99Errors = tried && phase === "form" ? checkKundali99(f, today) : {};

  const set = <Key extends keyof K99Draft>(k: Key, v: K99Draft[Key]) => setF((d) => ({ ...d, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(checkKundali99(f, today)).length) {
      setTried(true);
      setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 60);
      return;
    }
    gen(f, city, false);
  };

  const edit = () => {
    setPhase("form");
    setK(null);
    setPay("idle");
  };

  const payNow = async () => {
    if (!enabled) {
      useUi.getState().toast({
        msg: hiUi ? "कुंडली सेवा वर्तमान में अनुपलब्ध है" : "Kundali orders are temporarily unavailable",
        tone: "warn",
      });
      return;
    }

    setPay("processing");

    // QA ?pay=fail support (Task T6: The ?demo= params stay untouched)
    if (failPay.current) {
      setTimeout(() => setPay("failed"), 1200);
      return;
    }

    try {
      const res = await createKundaliOrderAction({
        name: f.name,
        dob: f.dob,
        tob: f.unknown ? null : (f.tob || null),
        tobUnknown: f.unknown,
        place: {
          name: f.place,
          lat: city?.lat ?? 25.3176,
          lon: city?.lon ?? 82.9739,
          tz: city?.tz ?? "Asia/Kolkata",
        },
        reportLang: (f.lang as "en" | "hi") || "en",
        phone: f.phone,
        email: f.email || undefined,
        locale: hiUi ? "hi" : "en",
        payPref: app === "card" ? "card" : "upi",
      });

      if (!res.ok) {
        setPay("failed");
        return;
      }

      const rzpRes = await openRazorpay(res.data.rzp);
      if (rzpRes.status === "dismissed") {
        setPay("idle");
        return;
      }
      if (rzpRes.status === "failed") {
        setPay("failed");
        return;
      }

      const confirmRes = await confirmPaymentAction({
        entity: "kundali",
        ref: res.data.ref,
        razorpay_order_id: rzpRes.razorpay_order_id,
        razorpay_payment_id: rzpRes.razorpay_payment_id,
        razorpay_signature: rzpRes.razorpay_signature,
      });

      if (!confirmRes.ok) {
        setPay("failed");
        return;
      }

      setOrderRef(res.data.ref);
      setAccessKey(res.data.accessKey);
      setPay("idle");
      setSheet(false);
      setPhase("done");
      toPreview();
    } catch {
      setPay("failed");
    }
  };

  const closeSheet = useCallback(() => {
    setSheet(false);
    setPay("idle");
  }, []);

  const first = f.name.trim().split(/\s+/)[0] || "";
  const d = f.dob ? new Date(`${f.dob}T12:00`) : null;
  const dateS = d ? `${d.getDate()} ${(hiUi ? MONH : MON)[d.getMonth()]} ${d.getFullYear()}` : "";
  const timeS = f.unknown || !f.tob ? t("tool.noonTime") : t12(f.tob);
  const birthLine = `${dateS} · ${timeS} · ${f.place.split(",")[0] || ""}`;
  const phoneMask = `+91 ${f.phone ? `${f.phone.slice(0, 2)}•••••${f.phone.slice(-3)}` : ""}`;
  const done = phase === "done";
  const hiReport = f.lang === "hi";

  const download = () => {
    useUi.getState().toast({
      msg: hiUi ? "कृपया नीचे दिए गए डाउनलोड बटन से PDF प्राप्त करें" : "Please use the Download button below for your report PDF",
      tone: "ok",
    });
  };

  const msgs = t.raw("tool.msgs") as string[];
  const corner = (cls: string) => (
    <span aria-hidden="true" className={cn("absolute block size-[26px]", cls)}>
      <Corner col="#B8923A" />
    </span>
  );

  return (
    <>
      <section data-screen-label="Kundali tool" className="relative overflow-hidden bg-n9 text-em1">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Starfield seed="k99-sky" n={28} nMob={16} w={1440} h={820} />
          <svg
            viewBox="0 0 1440 820"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 block"
          >
            <g transform="translate(1320 110)" opacity=".09">
              <MandalaG R={320} col="#D9B96A" sw={0.8} />
            </g>
          </svg>
        </div>
        <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-x-[clamp(32px,5vw,80px)] gap-y-[clamp(24px,4vw,40px)] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,48px)] pb-[clamp(56px,8vw,112px)] [grid-template-areas:'intro'_'card'_'facts'] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] lg:[grid-template-areas:'intro_card'_'facts_card']">
          <div className="flex min-w-0 flex-col gap-4 [grid-area:intro]">{intro}</div>
          <div className="flex min-w-0 flex-col gap-[18px] [grid-area:facts]">{facts}</div>

          <div
            ref={formRef}
            className="relative min-w-0 rounded-btn bg-iv p-[clamp(20px,3vw,32px)] text-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,.7),inset_0_0_0_1px_rgba(217,185,106,.55)] [grid-area:card]"
          >
            {corner("top-2 left-2")}
            {corner("top-2 right-2 -scale-x-100")}
            {corner("bottom-2 left-2 -scale-y-100")}
            {corner("right-2 bottom-2 -scale-100")}

            {phase === "form" && (
              <KundaliForm
                f={f}
                err={err}
                today={today}
                set={set}
                onPlace={(v) => {
                  set("place", v);
                  setCity(null);
                }}
                onPick={(c) => {
                  set("place", `${c[0]}, ${c[1]}`);
                  setCity(c);
                }}
                onSubmit={submit}
              />
            )}

            {phase === "gen" && (
              <div role="status" aria-live="polite" className="flex flex-col items-center gap-5 px-1 py-2 text-center">
                <Chakra
                  mode="ramp"
                  inset="6%"
                  className="aspect-square w-[min(200px,58vw)] rounded-pill bg-n9 shadow-[0_0_0_1px_rgba(184,146,58,.5),0_24px_48px_-24px_rgba(10,31,26,.8)]"
                />
                <div className="flex flex-col gap-1.5">
                  <span className="font-title text-[24px] leading-[1.2] text-em9">
                    {first ? t("tool.genTitle", { name: first }) : t("tool.genTitleAnon")}
                  </span>
                  <span lang="hi" className="font-deva text-[16px] leading-[1.35] text-g7">
                    आपकी कुंडली बन रही है
                  </span>
                </div>
                <ol className="m-0 flex w-full max-w-[360px] list-none flex-col p-0 text-left">
                  {msgs.map((m, i) => {
                    const isDone = i < msg;
                    const cur = i === msg;
                    return (
                      <li
                        key={m}
                        className="grid grid-cols-[22px_minmax(0,1fr)] items-center gap-2.5 border-t border-s2 py-2 transition-opacity duration-300"
                        style={{ opacity: i <= msg ? 1 : 0.45 }}
                      >
                        <span
                          className="grid size-5 place-items-center rounded-pill text-iv"
                          style={{
                            backgroundColor: isDone ? "#164E3F" : "transparent",
                            boxShadow: isDone ? "none" : cur ? "inset 0 0 0 1.5px #B8923A" : "inset 0 0 0 1px #EAE0CA",
                          }}
                        >
                          {isDone && (
                            <span className="block size-3">
                              <Icon name="check" />
                            </span>
                          )}
                        </span>
                        <span
                          className={cn(
                            "font-sans text-[14px] leading-[1.4]",
                            cur ? "font-bold text-em9" : isDone ? "font-medium text-ink" : "font-medium text-ink6",
                          )}
                        >
                          {cur ? `${m}…` : m}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <span aria-hidden="true" className="relative block h-0.5 w-full max-w-[360px] overflow-hidden bg-s2">
                  <span
                    className="absolute inset-0 origin-left bg-g5 transition-transform duration-800 ease-linear"
                    style={{ transform: `scaleX(${(msg + 1) / MSG_N})` }}
                  />
                </span>
              </div>
            )}

            {(phase === "preview" || done) && (
              <div className="flex flex-col gap-[18px] px-1.5 py-1">
                <span className="grid size-[52px] place-items-center rounded-pill bg-em9 text-g3">
                  <span className="block size-[26px]">
                    <Icon name="kundali" />
                  </span>
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="font-title text-[26px] leading-[1.15] text-em9">
                    {done ? t("tool.doneT") : t("tool.readyT")}
                  </span>
                  <span className="font-sans text-[14px] leading-[1.55] font-medium text-ink6">
                    {done ? (f.email ? t("tool.doneDEmail") : t("tool.doneD")) : t("tool.readyD")}
                  </span>
                </div>
                <dl className="m-0 flex flex-col">
                  {[
                    { k: t("tool.rows.name"), v: f.name || "—" },
                    { k: t("tool.rows.born"), v: `${dateS} · ${timeS}` },
                    { k: t("tool.rows.place"), v: f.place || "—" },
                    { k: t("tool.rows.report"), v: hiReport ? "हिंदी · PDF" : "English · PDF" },
                  ].map((r) => (
                    <div key={r.k} className="flex justify-between gap-3.5 border-t border-s2 py-[11px]">
                      <dt className="font-sans text-[10.5px] leading-[1.5] font-semibold tracking-[.14em] text-ink6 uppercase hi:tracking-normal">
                        {r.k}
                      </dt>
                      <dd className="m-0 text-right font-sans text-[14px] leading-[1.45] font-semibold text-ink">{r.v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={toPreview}
                    className="inline-flex h-[50px] flex-auto cursor-pointer items-center justify-center gap-[9px] rounded-btn border-none bg-em7 px-5 font-sans text-[14.5px] leading-none font-semibold text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5"
                  >
                    {done ? t("tool.ctaDone") : t("tool.cta")}
                    <span className="block size-4 rotate-90">
                      <Icon name="arrowR" />
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={edit}
                    className="inline-flex h-[50px] cursor-pointer items-center gap-2 rounded-btn border-none bg-iv px-[18px] font-sans text-[14.5px] leading-none font-semibold text-em7 shadow-[inset_0_0_0_1px_#164E3F] hover:bg-em1"
                  >
                    <span className="block size-4">
                      <Icon name="edit" />
                    </span>
                    {t("tool.edit")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {K && (phase === "preview" || done) && (
        <KundaliPreview
          K={K}
          name={f.name}
          hiReport={hiReport}
          unknown={K.unknown}
          birthLine={birthLine}
          done={done}
          phoneMask={phoneMask}
          orderRef={orderRef ?? undefined}
          accessKey={accessKey ?? undefined}
          priceInr={priceInr}
          mrpInr={mrpInr}
          onPay={() => {
            setSheet(true);
            setPay("idle");
          }}
          onDownload={download}
        />
      )}

      {phase === "preview" && !sheet && (
        <div className="fixed inset-x-0 bottom-0 z-[58] bg-iv px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-[inset_0_1px_0_#EAE0CA,0_-12px_32px_-18px_rgba(14,59,48,.3)] md:hidden">
          <div className="flex items-center justify-between gap-3">
            <span className="flex flex-col gap-1">
              <span className="flex items-baseline gap-2">
                <span className="font-sans text-[20px] leading-none font-bold text-em9">₹{priceInr}</span>
                <span className="font-sans text-[13px] leading-none font-medium text-ink6 line-through">
                  {fmt(mrpInr)}
                </span>
              </span>
              <span className="font-sans text-[12px] leading-[1.2] font-semibold text-ink6">{t("bar.sub")}</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setSheet(true);
                setPay("idle");
              }}
              className="inline-flex h-[52px] cursor-pointer items-center gap-2 rounded-btn border-none bg-em7 px-[22px] font-sans text-[15px] leading-none font-semibold text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]"
            >
              <span className="block size-4">
                <Icon name="lock" />
              </span>
              {t("bar.pay")}
            </button>
          </div>
        </div>
      )}

      {sheet && (
        <PaySheet
          name={f.name}
          phoneMask={phoneMask}
          priceInr={priceInr}
          mrpInr={mrpInr}
          pay={pay}
          app={app}
          onApp={setApp}
          onPay={payNow}
          onRetry={() => setPay("idle")}
          onClose={closeSheet}
        />
      )}
    </>
  );
}
