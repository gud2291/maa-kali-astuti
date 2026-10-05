"use client";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { drawChart, onView, prime } from "@/components/motion/draw";
import { stagger } from "@/components/motion/fx";
import { KundaliChart } from "@/components/signature/KundaliChart";
import { Corner } from "@/components/ui/ornaments/Corner";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { DEMO_K, type City, type Kundali } from "@/lib/astro/kundali";
import { PlaceInput, type SelectedPlace } from "@/components/forms/PlaceInput";
import { computeChartAction } from "@/server/kundali/actions";
import { toKundali } from "@/lib/astro/from-snapshot";
import { RASHI } from "@/lib/astro/rashi";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { checkKundali, type KundaliDraft, type KundaliErrors, type KundaliField } from "@/lib/validation/astro";

/* §7 Kundali mini (Home.dc.html 449–519, kSubmit/kSet 1118–1130, vTools 1188–1215, S12).
   Emerald card: name, date + time of birth ("I don't know" → noon), place combobox (32 towns,
   prefix-first, max 6). The demo chart draws itself when 35% visible. Generate dims the chart
   to .18 over 400 ms, shows "Calculating…" for 1.3 s, then redraws the new chart (lines 1.2 s,
   planets pop) and staggers in Lagna / Moon sign / Nakshatra. */

type Phase = "form" | "gen" | "ready";

const noop = () => () => {};
const pad = (n: number) => String(n).padStart(2, "0");
/** Local yyyy-mm-dd for a day start. */
const isoDay = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const dayStart = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

const EMPTY: KundaliDraft = { name: "", dob: "", tob: "", unknown: false, place: "", city: null };

const inputCls = "h-[50px] w-full rounded-field border-none bg-iv font-sans font-medium text-ink outline-none";
const labelCls = "font-sans text-[13px] leading-[1.2] font-semibold text-em1";

function ErrLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      role="alert"
      className={cn(
        "flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.4] font-semibold text-rose",
        className,
      )}
    >
      <span className="block size-3.5 flex-none">
        <Icon name="alert" />
      </span>
      {children}
    </span>
  );
}

export function KundaliMini({ buildNow }: { buildNow: number }) {
  const t = useTranslations("home.tools.k");
  const day = useSyncExternalStore(
    noop,
    () => dayStart(Date.now()),
    () => dayStart(buildNow),
  );
  const today = isoDay(day);

  const [kf, setKf] = useState<KundaliDraft>(EMPTY);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [err, setErr] = useState<KundaliErrors>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [res, setRes] = useState<{ K: Kundali; n: number } | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const genTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(genTimer.current);
    },
    [],
  );

  // Demo chart: prime before paint, draw once 35% of it is visible.
  useLayoutEffect(() => {
    const el = chartRef.current;
    prime(el);
    return onView(el, () => drawChart(el, { dur: 1200 }), 0.35);
  }, []);

  // New result: stop the dim, re-prime the fresh chart and draw it on the next frame.
  useLayoutEffect(() => {
    const el = chartRef.current;
    if (!res || !el) return;
    el.getAnimations().forEach((a) => a.cancel());
    prime(el);
    const rq = requestAnimationFrame(() => drawChart(el, { dur: 1200 }));
    return () => cancelAnimationFrame(rq);
  }, [res]);

  // Result facts stagger in (y 10, 420 ms, 90 ms apart).
  useLayoutEffect(() => {
    if (phase === "ready") stagger(resRef.current, ":scope > *", { y: 10, dur: 420, step: 90 });
  }, [phase]);

  const set = <K extends keyof KundaliDraft>(k: K, v: KundaliDraft[K]) => {
    setKf((f) => ({ ...f, [k]: v, ...(k === "place" ? { city: null } : {}) }));
    setErr((e) => {
      const n = { ...e };
      delete n[k as KundaliField];
      if (k === "unknown" && v) delete n.tob;
      return n;
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // checkKundali only needs to know a place was given; the real place is resolved below.
    const city: City | null = selectedPlace
      ? [selectedPlace.name, "", selectedPlace.lat, selectedPlace.lon]
      : kf.place.trim()
        ? [kf.place, "", 0, 0]
        : null;
    const errors = checkKundali({ ...kf, city }, today);
    if (Object.keys(errors).length) {
      setErr(errors);
      return;
    }
    setErr({});
    setPhase("gen");

    const reduced = isReduced();
    if (chartRef.current && !reduced)
      chartRef.current.animate([{ opacity: 1 }, { opacity: 0.18 }], { duration: 400, fill: "forwards" });

    const calcPromise = (async () => {
      let p = selectedPlace;
      if (!p && kf.place.trim()) {
        try {
          const res = await fetch(`/api/places?q=${encodeURIComponent(kf.place.split(",")[0].trim())}`);
          if (res.ok) {
            const list = (await res.json()) as SelectedPlace[];
            if (list.length > 0) p = list[0];
          }
        } catch {}
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
        name: kf.name,
        dob: kf.dob,
        tob: kf.tob || null,
        tobUnknown: kf.unknown,
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

    clearTimeout(genTimer.current);
    genTimer.current = setTimeout(
      async () => {
        const computedK = await calcPromise;
        if (computedK) {
          setRes((r) => ({ K: computedK, n: (r?.n ?? 0) + 1 }));
          setPhase("ready");
        } else {
          setPhase("form");
        }
      },
      reduced ? 0 : 1300,
    );
  };

  const ring = (k: KundaliField) => (err[k] ? "#EBCFC9" : "transparent");
  const busy = phase === "gen";
  const K = res?.K;
  const facts = K
    ? [
        { k: t("lagna"), v: RASHI[K.lagna].en, h: RASHI[K.lagna].hi },
        { k: t("moon"), v: RASHI[K.rashi].en, h: RASHI[K.rashi].hi },
        { k: t("nak"), v: K.nak, h: `पद ${K.pada}` },
      ]
    : [];
  const dtErr = err.dob || err.tob;
  const corner = (cls: string) => (
    <span aria-hidden="true" className={cn("absolute block size-7", cls)}>
      <Corner col="#D9B96A" />
    </span>
  );

  return (
    <article
      data-reveal="0"
      className="relative overflow-hidden rounded-btn bg-em7 p-[clamp(22px,3vw,40px)] text-em1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.5),0_40px_80px_-50px_rgba(14,59,48,.8)]"
    >
      {corner("top-2 left-2")}
      {corner("top-2 right-2 -scale-x-100")}
      {corner("bottom-2 left-2 -scale-y-100")}
      {corner("right-2 bottom-2 -scale-x-100 -scale-y-100")}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[200px] -right-[200px] size-[500px] opacity-[.08]"
      >
        <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
          <MandalaG R={296} col="#D9B96A" sw={1} />
        </svg>
      </div>

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase">
            {t.rich("eyebrow", {
              d: (c) => (
                <span lang="hi" className="font-hi text-[1.12em] font-medium tracking-normal normal-case">
                  {c}
                </span>
              ),
            })}
          </span>
          <h3 className="m-0 font-display text-[clamp(26px,2.8vw,38px)] leading-[1.12] font-normal tracking-[-.012em] text-balance text-iv font-soft">
            {t.rich("title", { em: (c) => <em className="text-g3 italic">{c}</em> })}
          </h3>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
            <span className="font-sans text-[30px] leading-none font-bold text-iv tabular">₹99</span>
            <span className="font-sans text-[16px] leading-none font-medium text-sg5 tabular line-through">
              {t("mrp")}
            </span>
            <span className="inline-flex h-6 items-center rounded-pill bg-sin px-2.5 font-sans text-[11px] leading-none font-bold tracking-[.06em] text-iv">
              {t("off")}
            </span>
            <span className="font-sans text-[12.5px] leading-none font-medium text-sg3">{t("tax")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-[clamp(22px,3vw,40px)] min-[700px]:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
          <form onSubmit={submit} noValidate className="order-2 flex min-w-0 flex-col gap-4 min-[700px]:order-1">
            <div className="flex flex-col gap-2">
              <label htmlFor="hk-name" className={labelCls}>
                {t("name")}
              </label>
              <input
                id="hk-name"
                type="text"
                autoComplete="name"
                value={kf.name}
                onChange={(e) => set("name", e.target.value)}
                aria-invalid={!!err.name}
                className={cn(inputCls, "px-3.5 text-[16px] leading-[1.2]")}
                style={{ boxShadow: `inset 0 0 0 1.5px ${ring("name")}` }}
              />
              {err.name && <ErrLine>{t(`err.${err.name}`)}</ErrLine>}
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="hk-dob" className={labelCls}>
                  {t("dob")}
                </label>
                <input
                  id="hk-dob"
                  type="date"
                  min="1900-01-01"
                  max={today}
                  value={kf.dob}
                  onChange={(e) => set("dob", e.target.value)}
                  aria-invalid={!!err.dob}
                  className={cn(inputCls, "px-2.5 text-[15px] leading-[1.2]")}
                  style={{ boxShadow: `inset 0 0 0 1.5px ${ring("dob")}` }}
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <label htmlFor="hk-tob" className={labelCls}>
                  {t("tob")}
                </label>
                <input
                  id="hk-tob"
                  type="time"
                  value={kf.tob}
                  onChange={(e) => set("tob", e.target.value)}
                  disabled={kf.unknown}
                  aria-invalid={!!err.tob}
                  className={cn(inputCls, "px-2.5 text-[15px] leading-[1.2]")}
                  style={{
                    backgroundColor: kf.unknown ? "#E4EEE8" : "#FBF7EE",
                    boxShadow: `inset 0 0 0 1.5px ${ring("tob")}`,
                  }}
                />
              </div>
            </div>
            {dtErr && <ErrLine className="-mt-1.5">{t(`err.${dtErr}`)}</ErrLine>}

            <label className="-mt-1 flex min-h-8 cursor-pointer items-center gap-2.5 font-sans text-[14px] leading-[1.4] font-medium text-em1">
              <input
                type="checkbox"
                checked={kf.unknown}
                onChange={(e: ChangeEvent<HTMLInputElement>) => set("unknown", e.target.checked)}
                className="m-0 size-[18px] accent-g3"
              />
              {t("unknown")}
            </label>

            <div className="relative flex flex-col gap-2">
              <label htmlFor="hk-place" className={labelCls}>
                {t("place")}
              </label>
              <PlaceInput
                id="hk-place"
                value={kf.place}
                onChange={(val) => {
                  set("place", val);
                  setSelectedPlace(null);
                }}
                onSelect={(p) => {
                  const placeStr = p.region ? `${p.name}, ${p.region}` : p.name;
                  set("place", placeStr);
                  setSelectedPlace(p);
                  setErr((e) => {
                    const n = { ...e };
                    delete n.place;
                    return n;
                  });
                }}
                placeholder={t("placeHint")}
                icon={<Icon name="pin" />}
                hasError={!!err.place}
                className={cn(inputCls, "pr-3.5 pl-[42px] text-[16px] leading-[1.2]")}
                style={{ boxShadow: `inset 0 0 0 1.5px ${ring("place")}` }}
              />
              {err.place && <ErrLine>{t(`err.${err.place}`)}</ErrLine>}
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-1 flex h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-btn border-none bg-g3 font-sans text-[15px] leading-none font-bold tracking-[.02em] whitespace-nowrap text-n9 transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-g4"
              style={{ opacity: busy ? 0.75 : 1 }}
            >
              <span className="block size-[19px]">
                <Icon name="kundali" />
              </span>
              {busy ? t("btnBusy") : phase === "ready" ? t("btnAgain") : t("btn")}
            </button>
            <span className="flex items-center gap-[7px] font-sans text-[12.5px] leading-[1.4] font-medium text-sg3">
              <span className="block size-3.5 flex-none text-g3">
                <Icon name="lock" />
              </span>
              {t("privacy")}
            </span>
          </form>

          <div className="order-1 flex min-w-0 flex-col gap-4 min-[700px]:order-2">
            <div className="relative mx-auto w-full max-w-[300px] rounded-btn bg-em9 p-3.5 shadow-[inset_0_0_0_1px_rgba(217,185,106,.35)] min-[700px]:max-w-[360px]">
              <div ref={chartRef} className="relative aspect-square w-full">
                <KundaliChart
                  key={res ? `r${res.n}` : "demo"}
                  K={K ?? DEMO_K}
                  col="#D9B96A"
                  ink="#FBF7EE"
                  sub="#9FB3AA"
                  fs={16}
                  label={t("chartAria")}
                />
              </div>
              {busy && (
                <span
                  role="status"
                  className="absolute inset-0 flex items-center justify-center p-6 text-center font-sans text-[13.5px] leading-[1.4] font-semibold text-g1"
                >
                  {t("gen")}
                </span>
              )}
            </div>
            {phase === "ready" && K && (
              <div ref={resRef} className="flex flex-col gap-3.5">
                <dl className="m-0 grid grid-cols-3 gap-2.5">
                  {facts.map((x) => (
                    <div
                      key={x.k}
                      className="flex flex-col gap-[5px] rounded-3 bg-em9 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(217,185,106,.3)]"
                    >
                      <dt className="font-sans text-[9.5px] leading-[1.2] font-semibold tracking-[.14em] text-sg5 uppercase">
                        {x.k}
                      </dt>
                      <dd className="m-0 font-display text-[17px] leading-[1.15] text-iv">{x.v}</dd>
                      <span lang="hi" className="font-deva text-[13px] leading-[1.2] text-g3">
                        {x.h}
                      </span>
                    </div>
                  ))}
                </dl>
                {K.unknown && (
                  <span className="font-sans text-[12.5px] leading-[1.5] font-medium text-sg3">{t("noon")}</span>
                )}
                <Link
                  href={routes.kundali99}
                  className="flex h-[50px] items-center justify-center gap-[9px] rounded-btn font-sans text-[14.5px] leading-none font-semibold text-g1 no-underline shadow-[inset_0_0_0_1px_#D9B96A] hover:bg-[rgba(217,185,106,.1)] hover:text-iv"
                >
                  <span className="block size-[17px]">
                    <Icon name="download" />
                  </span>
                  {t("report")}
                </Link>
              </div>
            )}
            {phase === "form" && (
              <p className="m-0 font-sans text-[14.5px] leading-[1.65] text-pretty text-sg3">{t("idle")}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
