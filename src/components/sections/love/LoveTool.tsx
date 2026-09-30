"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { EASE } from "@/components/motion/easing";
import { stagger } from "@/components/motion/fx";
import { initial, love, type LoveResult } from "@/lib/astro/love";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { bookHref } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { checkLove } from "@/lib/validation/astro";
import { useLoveNames } from "./LoveNames";

/* Love Calculator card (Love-Calculator.dc.html 42–97, script calc/reset 200–214, S13).
   Stage: a dotted brass ring + the score ring (r 104, pathLength 100) with two medallions (rose =
   your initial, emerald = partner's). They drift closer as the names grow (.3 − drift of the stage
   width) and converge on Calculate (.118 / .112 from 768, 700 ms EASE). +650 ms the ring fills
   to the score (1400 ms EASE) while the number counts up (easeOutCubic); +1450 ms the label, line
   and the two number chips stagger in (y 12, 420 ms, 90 ms apart). Result: Share on WhatsApp,
   Try another pair, Book a Kundali Milan consultation. Editing a name resets to idle.
   --lw mirrors the design's stage-width estimate (min(520, vw − 32 − 40 / 72)) in CSS. */

type Phase = "idle" | "converge" | "result";

const FIELD =
  "h-[52px] w-full rounded-field border-none bg-iv px-3.5 font-sans text-[16px] leading-[1.2] font-medium text-ink outline-none focus:shadow-[inset_0_0_0_1.5px_#164E3F]!";

export function LoveTool() {
  const t = useTranslations("love.tool");
  const { a, b, setA, setB } = useLoveNames();
  const [phase, setPhase] = useState<Phase>("idle");
  const [res, setRes] = useState<LoveResult | null>(null);
  const [tried, setTried] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raf = useRef(0);

  const clearFx = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimationFrame(raf.current);
    const ring = stageRef.current?.querySelector<SVGElement>("[data-ring]");
    if (ring) {
      ring.getAnimations().forEach((x) => x.cancel());
      ring.style.strokeDashoffset = "100";
    }
    if (numRef.current) numRef.current.textContent = "";
  };

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(raf.current);
    },
    [],
  );

  useLayoutEffect(() => {
    if (phase === "result") stagger(resRef.current, ":scope > *", { y: 12, dur: 420, step: 90 });
  }, [phase]);

  const reset = (keep: boolean) => {
    clearFx();
    setPhase("idle");
    setRes(null);
    if (!keep) {
      setA("");
      setB("");
      timers.current.push(setTimeout(() => document.getElementById("lv-a")?.focus(), 40));
    }
  };

  const calc = (e: FormEvent) => {
    e.preventDefault();
    const bad = checkLove(a, b);
    if (bad.a || bad.b) {
      setTried(true);
      return;
    }
    clearFx();
    const r = love(a, b);
    const pct = r.pct;
    const ring = stageRef.current?.querySelector<SVGElement>("[data-ring]");
    const num = numRef.current;
    setRes(r);
    setTried(false);
    setPhase("converge");
    if (isReduced()) {
      if (ring) ring.style.strokeDashoffset = String(100 - pct);
      if (num) num.textContent = String(pct);
      setPhase("result");
      return;
    }
    timers.current.push(
      setTimeout(() => {
        ring?.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 100 - pct }], {
          duration: 1400,
          easing: EASE,
          fill: "forwards",
        });
        const t0 = performance.now();
        const tick = (now: number) => {
          const k = Math.min(1, (now - t0) / 1400);
          if (num) num.textContent = String(Math.round(pct * (1 - Math.pow(1 - k, 3))));
          if (k < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        timers.current.push(setTimeout(() => setPhase("result"), 1450));
      }, 650),
    );
  };

  const edit = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.slice(0, 40);
    if (phase !== "idle") reset(true);
    setter(v);
  };

  const conv = phase !== "idle";
  const drift = Math.min(0.085, (a.trim().length + b.trim().length) * 0.0055);
  const g = conv ? "var(--gc)" : String(0.3 - drift);
  const bad = checkLove(a, b);
  const badA = tried && bad.a;
  const badB = tried && bad.b;
  const isRes = phase === "result" && !!res;
  const iniA = initial(a);
  const iniB = initial(b);
  const firstA = a.trim().split(/\s+/)[0];
  const firstB = b.trim().split(/\s+/)[0];
  const shareHref = res
    ? `https://wa.me/?text=${encodeURIComponent(t("share", { a: a.trim(), b: b.trim(), pct: res.pct, label: res.label }))}`
    : "#";
  const medCls =
    "absolute top-1/2 left-1/2 grid size-[78px] place-items-center rounded-pill transition-transform duration-700 ease-mka md:size-24";

  return (
    <div className="relative min-w-0 rounded-btn bg-cream p-[clamp(20px,3vw,36px)] shadow-[0_30px_60px_-36px_rgba(14,59,48,.35),inset_0_0_0_1px_rgba(184,146,58,.5)]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 rounded-t-btn bg-rose" />
      <div
        ref={stageRef}
        className="relative mx-auto h-[236px] w-full max-w-[520px] [--gc:.118] [--lw:min(520px,100vw_-_72px)] md:h-[280px] md:[--gc:.112] md:[--lw:min(520px,100vw_-_104px)]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 240 240"
          fill="none"
          className="absolute top-1/2 left-1/2 size-[220px] -translate-x-1/2 -translate-y-1/2 -rotate-90 overflow-visible md:size-[264px]"
        >
          <circle
            cx="120"
            cy="120"
            r="116"
            stroke="#B8923A"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="0 6.07"
            opacity=".55"
          />
          <circle cx="120" cy="120" r="104" stroke="#EAE0CA" strokeWidth="3" />
          <circle
            data-ring=""
            cx="120"
            cy="120"
            r="104"
            stroke="#B8923A"
            strokeWidth="3.2"
            strokeLinecap="round"
            pathLength={100}
            style={{ strokeDasharray: 100, strokeDashoffset: 100 }}
          />
        </svg>
        <span
          aria-hidden="true"
          className={cn(
            medCls,
            "z-[2] bg-rose text-em9 shadow-[inset_0_0_0_1px_rgba(184,146,58,.7),0_14px_28px_-16px_rgba(14,59,48,.45)]",
          )}
          style={{ transform: `translate(calc(-50% - var(--lw) * ${g}),-50%)` }}
        >
          {iniA ? (
            <span className="font-display text-[34px] leading-none [font-variation-settings:'SOFT'_50] md:text-[42px]">
              {iniA}
            </span>
          ) : (
            <span className="block size-[40%] opacity-60">
              <Icon name="user" />
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            medCls,
            "z-[1] bg-em9 text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.7),0_14px_28px_-16px_rgba(14,59,48,.55)]",
          )}
          style={{ transform: `translate(calc(-50% + var(--lw) * ${g}),-50%)` }}
        >
          {iniB ? (
            <span className="font-display text-[34px] leading-none [font-variation-settings:'SOFT'_50] md:text-[42px]">
              {iniB}
            </span>
          ) : (
            <span className="block size-[40%] opacity-70">
              <Icon name="user" />
            </span>
          )}
        </span>
      </div>

      <div className="flex min-h-[72px] flex-col items-center gap-1.5 text-center md:min-h-[88px]">
        <span
          className="flex h-16 items-baseline justify-center gap-0.5 transition-opacity duration-300 md:h-20"
          style={{ opacity: conv ? 1 : 0 }}
        >
          <span
            ref={numRef}
            aria-hidden="true"
            className="font-display text-[64px] leading-none tracking-[-.02em] text-em9 tabular font-soft md:text-[80px]"
          />
          <span aria-hidden="true" className="font-display text-[28px] leading-none text-g5 md:text-[34px]">
            %
          </span>
        </span>
        <span role="status" aria-live="polite" className="sr-only">
          {isRes && res ? t("sr", { pct: res.pct, label: res.label, line: res.line }) : ""}
        </span>
        {isRes && res && (
          <div ref={resRef} className="flex max-w-[420px] flex-col items-center gap-2.5">
            <span className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
              <span lang="en" className="font-display text-[26px] leading-[1.15] text-em9">
                {res.label}
              </span>
              <span lang="hi" className="font-deva text-[18px] leading-[1.35] text-g7">
                {res.labelHi}
              </span>
            </span>
            <span lang="en" className="font-sans text-[15px] leading-[1.6] font-medium text-pretty text-ink">
              {res.line}
            </span>
            <span className="mt-1 flex flex-wrap justify-center gap-2">
              {[
                { n: res.na, t: `${firstA} · ${res.pa}`, cls: "bg-rose text-em9" },
                { n: res.nb, t: `${firstB} · ${res.pb}`, cls: "bg-em9 text-g1" },
              ].map((c, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex h-8 items-center gap-2 rounded-pill px-3 font-sans text-[12.5px] leading-none font-semibold",
                    c.cls,
                  )}
                >
                  <span className="font-sans text-[13px] leading-none font-bold">{c.n}</span>
                  {c.t}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={calc} noValidate className="mt-[18px] flex flex-col gap-4 border-t border-s2 pt-[22px]">
        <div className="grid grid-cols-1 gap-x-3 gap-y-4 min-[480px]:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="lv-a" className="font-sans text-[13px] leading-[1.2] font-semibold text-ink">
              {t("a")}
            </label>
            <input
              id="lv-a"
              type="text"
              autoComplete="given-name"
              value={a}
              onChange={edit(setA)}
              aria-invalid={badA}
              aria-describedby={badA || badB ? "lv-err" : undefined}
              className={FIELD}
              style={{ boxShadow: `inset 0 0 0 1px ${badA ? "#A8322D" : "#EAE0CA"}` }}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="lv-b" className="font-sans text-[13px] leading-[1.2] font-semibold text-ink">
              {t("b")}
            </label>
            <input
              id="lv-b"
              type="text"
              autoComplete="off"
              value={b}
              onChange={edit(setB)}
              aria-invalid={badB}
              aria-describedby={badA || badB ? "lv-err" : undefined}
              className={FIELD}
              style={{ boxShadow: `inset 0 0 0 1px ${badB ? "#A8322D" : "#EAE0CA"}` }}
            />
          </div>
        </div>
        {(badA || badB) && (
          <span
            id="lv-err"
            role="alert"
            className="-mt-1 flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.4] font-semibold text-sin"
          >
            <span className="block size-3.5 flex-none">
              <Icon name="alert" />
            </span>
            {t("err")}
          </span>
        )}
        {!isRes ? (
          <button
            type="submit"
            disabled={phase === "converge"}
            className="sheen flex h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-btn border-none bg-em7 font-sans text-[15.5px] leading-none font-semibold tracking-[.02em] text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]"
            style={{ opacity: phase === "converge" ? 0.7 : 1 }}
          >
            <span className="block size-[18px]">
              <Icon name="heart" />
            </span>
            {phase === "converge" ? t("btnBusy") : t("btn")}
          </button>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2">
              <a
                href={shareHref}
                target="_blank"
                rel="noopener"
                className="flex h-[50px] items-center justify-center gap-[9px] rounded-btn bg-em7 font-sans text-[14.5px] leading-none font-semibold text-iv no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5 hover:text-iv"
              >
                <span className="block size-[17px]">
                  <Icon name="whatsapp" />
                </span>
                {t("shareBtn")}
              </a>
              <button
                type="button"
                onClick={() => reset(false)}
                className="flex h-[50px] cursor-pointer items-center justify-center gap-[9px] rounded-btn border-none bg-cream font-sans text-[14.5px] leading-none font-semibold text-em7 shadow-[inset_0_0_0_1px_#164E3F] hover:bg-em1"
              >
                <span className="block size-4">
                  <Icon name="returns" />
                </span>
                {t("again")}
              </button>
            </div>
            <Link
              href={bookHref("kundali", "premium")}
              className="inline-flex items-center gap-2 self-center bg-[linear-gradient(#B8923A,#B8923A)] bg-[length:100%_1px] bg-bottom bg-no-repeat py-1.5 font-sans text-[14px] leading-[1.3] font-semibold text-em7 no-underline"
            >
              {t("book")}
              <span className="block size-[15px] flex-none">
                <Icon name="arrowR" />
              </span>
            </Link>
          </>
        )}
      </form>
    </div>
  );
}
