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

/* §7 Love Calculator by name (Home.dc.html 521–557, lCalc/lReset 1132–1148, vTools 1205–1214, S13).
   Two medallions (initials) drift closer as the names grow, converge on Calculate (700 ms), then
   the gold ring fills to the score (1400 ms, EASE) while the number counts up (easeOutCubic);
   the result line staggers in 1450 ms later. Editing a name resets to idle but keeps the names.
   The medallion offset is a share of the stage width; --lw mirrors the prototype's estimate of
   that width (L2 lStageW) in CSS so the server HTML already sits right. */

type Phase = "idle" | "converge" | "result";

export function LoveMini() {
  const t = useTranslations("home.tools.l");
  const [la, setLa] = useState("");
  const [lb, setLb] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [res, setRes] = useState<LoveResult | null>(null);
  const [tried, setTried] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const raf = useRef(0);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    cancelAnimationFrame(raf.current);
    const ring = stageRef.current?.querySelector<SVGElement>("[data-ring]");
    if (ring) {
      ring.getAnimations().forEach((a) => a.cancel());
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

  // Result block staggers in (y 12, 420 ms, 90 ms apart).
  useLayoutEffect(() => {
    if (phase === "result") stagger(resRef.current, ":scope > *", { y: 12, dur: 420, step: 90 });
  }, [phase]);

  const reset = (keep: boolean) => {
    clear();
    setPhase("idle");
    setRes(null);
    if (!keep) {
      setLa("");
      setLb("");
    }
  };

  const calc = (e: FormEvent) => {
    e.preventDefault();
    const bad = checkLove(la, lb);
    if (bad.a || bad.b) {
      setTried(true);
      return;
    }
    clear();
    const r = love(la, lb);
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
          const eased = 1 - Math.pow(1 - k, 3);
          if (num) num.textContent = String(Math.round(pct * eased));
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
  const drift = Math.min(0.085, (la.trim().length + lb.trim().length) * 0.0055);
  const g = conv ? 0.118 : 0.3 - drift;
  const bad = checkLove(la, lb);
  const badA = tried && bad.a;
  const badB = tried && bad.b;
  const isRes = phase === "result" && !!res;
  const medCls =
    "absolute top-1/2 left-1/2 grid size-16 place-items-center rounded-pill transition-transform duration-700 ease-mka md:size-[72px]";
  const inputCls =
    "h-[50px] w-full rounded-field border-none bg-iv px-3.5 font-sans text-[16px] leading-[1.2] font-medium text-ink outline-none focus:shadow-[inset_0_0_0_1.5px_#164E3F]";

  return (
    <article
      data-reveal="1"
      className="relative flex flex-col gap-[18px] overflow-hidden rounded-btn bg-cream p-[clamp(22px,3vw,36px)] shadow-[inset_0_0_0_1px_rgba(184,146,58,.5),0_30px_60px_-44px_rgba(14,59,48,.4)]"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-rose" />
      <div className="flex flex-col gap-2.5">
        <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase">
          {t.rich("eyebrow", {
            d: (c) => (
              <span lang="hi" className="font-hi text-[1.12em] font-medium tracking-normal normal-case">
                {c}
              </span>
            ),
          })}
        </span>
        <h3 className="m-0 font-display text-[clamp(26px,2.6vw,34px)] leading-[1.12] font-normal tracking-[-.012em] text-em9 font-soft">
          {t.rich("title", { em: (c) => <em className="text-g5 italic">{c}</em> })}
        </h3>
      </div>

      <div
        ref={stageRef}
        className="relative h-[190px] w-full [--lw:max(260px,calc(min(100vw_-_32px,700px)_-_44px))] md:h-[210px] lg:[--lw:max(260px,calc((min(100vw,1320px)_-_92px)*5/12_-_72px))]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 240 240"
          fill="none"
          className="absolute top-1/2 left-1/2 size-[176px] -translate-x-1/2 -translate-y-1/2 -rotate-90 overflow-visible md:size-[196px]"
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
          <circle cx="120" cy="120" r="104" stroke="#F4EDDD" strokeWidth="3" />
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
          <span className="font-display text-[28px] leading-none md:text-[32px]">{initial(la) || "·"}</span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            medCls,
            "z-[1] bg-em9 text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.7),0_14px_28px_-16px_rgba(14,59,48,.55)]",
          )}
          style={{ transform: `translate(calc(-50% + var(--lw) * ${g}),-50%)` }}
        >
          <span className="font-display text-[28px] leading-none md:text-[32px]">{initial(lb) || "·"}</span>
        </span>
        <span
          className="absolute inset-x-0 -bottom-0.5 z-[3] flex items-baseline justify-center gap-0.5 transition-opacity duration-300"
          style={{ opacity: conv ? 1 : 0 }}
        >
          <span ref={numRef} aria-hidden="true" className="font-display text-[30px] leading-none text-em9 tabular" />
          <span aria-hidden="true" className="font-display text-[18px] leading-none text-g5">
            %
          </span>
        </span>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {isRes && res ? t("sr", { pct: res.pct, label: res.label, line: res.line }) : ""}
      </span>

      {isRes && res && (
        <div ref={resRef} className="flex flex-col items-center gap-2 text-center">
          <span className="flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1">
            <span className="font-display text-[23px] leading-[1.15] text-em9">
              {res.pct}% · {res.label}
            </span>
            <span lang="hi" className="font-deva text-[17px] leading-[1.35] text-g7">
              {res.labelHi}
            </span>
          </span>
          <span className="font-sans text-[14.5px] leading-[1.6] font-medium text-pretty text-ink">{res.line}</span>
        </div>
      )}

      <form onSubmit={calc} noValidate className="mt-auto flex flex-col gap-3.5">
        <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 min-[480px]:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="hl-a" className="font-sans text-[13px] leading-[1.2] font-semibold text-ink">
              {t("a")}
            </label>
            <input
              id="hl-a"
              type="text"
              autoComplete="given-name"
              value={la}
              onChange={edit(setLa)}
              aria-invalid={badA}
              className={cn(inputCls, badA ? "shadow-[inset_0_0_0_1px_#A8322D]" : "shadow-[inset_0_0_0_1px_#EAE0CA]")}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="hl-b" className="font-sans text-[13px] leading-[1.2] font-semibold text-ink">
              {t("b")}
            </label>
            <input
              id="hl-b"
              type="text"
              autoComplete="off"
              value={lb}
              onChange={edit(setLb)}
              aria-invalid={badB}
              className={cn(inputCls, badB ? "shadow-[inset_0_0_0_1px_#A8322D]" : "shadow-[inset_0_0_0_1px_#EAE0CA]")}
            />
          </div>
        </div>
        {(badA || badB) && (
          <span
            role="alert"
            className="-mt-1 flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.4] font-semibold text-sin"
          >
            <span className="block size-3.5 flex-none">
              <Icon name="alert" />
            </span>
            {t("err")}
          </span>
        )}
        {!isRes && (
          <button
            type="submit"
            disabled={phase === "converge"}
            className="flex h-[52px] cursor-pointer items-center justify-center gap-2.5 rounded-btn border-none bg-em7 font-sans text-[15px] leading-none font-semibold text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5"
            style={{ opacity: phase === "converge" ? 0.7 : 1 }}
          >
            <span className="block size-[18px]">
              <Icon name="heart" />
            </span>
            {phase === "converge" ? t("btnBusy") : t("btn")}
          </button>
        )}
        {isRes && (
          <>
            <Link
              href={bookHref("kundali", "premium")}
              className="flex h-[52px] items-center justify-center gap-[9px] rounded-btn bg-em7 font-sans text-[14.5px] leading-none font-semibold text-iv no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5 hover:text-iv"
            >
              <span className="block size-[17px]">
                <Icon name="calendar" />
              </span>
              {t("book")}
            </Link>
            <button
              type="button"
              onClick={() => reset(false)}
              className="inline-flex min-h-10 cursor-pointer items-center gap-[7px] self-center border-0 bg-transparent font-sans text-[13.5px] leading-none font-semibold text-em7"
            >
              <span className="block size-[15px]">
                <Icon name="returns" />
              </span>
              {t("again")}
            </button>
          </>
        )}
      </form>

      <span className="flex items-start gap-2.5 border-t border-s2 pt-3.5 font-display text-[15px] leading-[1.5] text-ink italic">
        <span className="mt-[3px] block size-4 flex-none text-g5">
          <Icon name="heart" />
        </span>
        {t("note")}
      </span>
    </article>
  );
}
