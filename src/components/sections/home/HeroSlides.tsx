"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { magneticHandlers } from "@/components/motion/Magnetic";
import { EXIT } from "@/components/motion/easing";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/* Hero text column (Home.dc.html 57–159; script 993–1015, 1406–1408).
   Three slides, one per locale variant. Entrance: masked lines rise 900 ms (60 + i·60 ms) and
   the rest fades up 16px 700 ms (150 + i·80 ms) — CSS keyframes on [data-slide], so the first
   slide animates straight from the server HTML. Exit: lines slide up −110% (380 ms, i·40 ms,
   EXIT easing) and fades go out in 260 ms; the next slide mounts at 420 ms.
   A 6 s gold progress bar advances the slider; it pauses on hover, via the toggle, when the
   hero is < 5% visible and while the tab is hidden. Reduced motion: no auto-advance (the bar
   shows full), instant swaps. Arrow keys on the controls step the slides. */

type SlideKey = "s1" | "s2" | "s3";
type Slide = { k: SlideKey; icon: IconName; href1: string; href2: string; icon2?: IconName };

const SLIDES: Slide[] = [
  { k: "s1", icon: "bag", href1: routes.shop, href2: routes.consultations },
  { k: "s2", icon: "calendar", href1: routes.consultations, href2: routes.about },
  { k: "s3", icon: "kundali", href1: routes.kundali99, href2: routes.loveCalculator, icon2: "heart" },
];

/** Stagger index for the CSS entrance ([data-slide] keyframes in globals.css). */
const v = (i: number) => ({ "--i": i }) as CSSProperties;

const ctaBase = "inline-flex h-[54px] items-center justify-center rounded-btn no-underline";

export function HeroSlides({ children }: { children?: ReactNode }) {
  const t = useTranslations("home.hero");
  const hi = useLocale() === "hi";
  const [slide, setSlide] = useState(0);
  const [play, setPlay] = useState(true);

  const colRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLSpanElement>(null);
  const anim = useRef<Animation | null>(null);
  const cur = useRef(0);
  const playRef = useRef(true);
  const hold = useRef(false);
  const vis = useRef(true);
  const sliding = useRef(false);
  const swapT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const syncProg = useCallback(() => {
    const a = anim.current;
    if (!a) return;
    const run = playRef.current && !hold.current && vis.current && !document.hidden;
    try {
      if (run && a.playState === "paused") a.play();
      else if (!run && a.playState === "running") a.pause();
    } catch {
      /* cancelled */
    }
  }, []);

  const go = useCallback((dir: number) => {
    if (sliding.current) return;
    const next = (cur.current + dir + 3) % 3;
    const el = slideRef.current;
    const swap = () => {
      sliding.current = false;
      cur.current = next;
      setSlide(next);
    };
    if (!el || isReduced()) {
      swap();
      return;
    }
    sliding.current = true;
    el.querySelectorAll("[data-ln]").forEach((l, i) =>
      l.animate([{ transform: "translateY(0)" }, { transform: "translateY(-110%)" }], {
        duration: 380,
        delay: i * 40,
        easing: EXIT,
        fill: "forwards",
      }),
    );
    el.querySelectorAll("[data-fade]").forEach((f) =>
      f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" }),
    );
    clearTimeout(swapT.current);
    swapT.current = setTimeout(swap, 420);
  }, []);

  // 6 s progress per slide → next slide.
  useEffect(() => {
    const el = progRef.current;
    if (!el) return;
    anim.current?.cancel();
    anim.current = null;
    if (isReduced()) {
      el.style.transform = "scaleX(1)";
      return;
    }
    const a = el.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: 6000,
      fill: "forwards",
    });
    a.onfinish = () => go(1);
    anim.current = a;
    syncProg();
    return () => a.cancel();
  }, [slide, go, syncProg]);

  useEffect(() => {
    playRef.current = play;
    syncProg();
  }, [play, syncProg]);

  // Mirror the slide on the hero section: Hero.tsx swaps the art for the banner image on 2–3.
  useEffect(() => {
    const sec = colRef.current?.closest("section");
    if (!sec) return;
    sec.setAttribute("data-slide", String(slide));
    sec.toggleAttribute("data-bg", slide !== 0);
  }, [slide]);

  // Pause while the hero is (almost) offscreen or the tab is hidden.
  useEffect(() => {
    const target = colRef.current?.closest("section") ?? colRef.current;
    if (!target) return;
    const io = new IntersectionObserver(
      ([e]) => {
        vis.current = e.isIntersecting;
        syncProg();
      },
      { threshold: 0.05 },
    );
    io.observe(target);
    document.addEventListener("visibilitychange", syncProg);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", syncProg);
      clearTimeout(swapT.current);
    };
  }, [syncProg]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const s = SLIDES[slide];
  const k = `slides.${s.k}` as const;
  // Slides 2–3 sit on a dark banner image: ivory copy, gold accents.
  const dark = slide !== 0;
  const em = (c: ReactNode) => <em className={hi ? "text-g5 not-italic" : "text-g5 italic"}>{c}</em>;
  const line = hi ? "-mb-[.1em] block overflow-hidden pb-[.1em]" : "-mb-[.12em] block overflow-hidden pb-[.12em]";
  const btn = cn(
    "grid size-11 place-items-center rounded-pill border-0 bg-transparent shadow-ring-g5-55 transition-colors duration-150",
    dark ? "text-iv hover:bg-iv/10" : "text-em7 hover:bg-s1",
  );

  return (
    <div
      ref={colRef}
      onMouseEnter={() => {
        hold.current = true;
        syncProg();
      }}
      onMouseLeave={() => {
        hold.current = false;
        syncProg();
      }}
      className="order-1 flex min-w-0 flex-col gap-[22px] lg:gap-5"
    >
      <div className="flex flex-col justify-center lg:min-h-[372px]">
        <div
          key={`${slide}-${hi ? "hi" : "en"}`}
          ref={slideRef}
          data-slide=""
          className={cn("flex flex-col", hi ? "gap-4 lg:gap-3" : "gap-[18px] lg:gap-3.5")}
        >
          <span
            data-fade=""
            style={v(0)}
            className={cn(
              hi
                ? "font-hi text-[15px] leading-[1.35] font-medium"
                : "font-sans text-[12px] leading-[1.2] font-semibold tracking-[.2em]",
              dark ? "text-g5" : "text-g7",
            )}
          >
            {t(`${k}.eyebrow`)}
          </span>
          <h1
            className={cn(
              hi
                ? "m-0 font-deva text-[clamp(26px,3.8vw,40px)] leading-[1.3] font-normal lg:text-[clamp(30px,2.8vw,44px)]"
                : "m-0 font-display text-[clamp(25px,4vw,38px)] leading-[1.08] font-normal tracking-[-.018em] font-soft md:text-[clamp(28px,3.5vw,42px)] lg:text-[clamp(34px,3vw,46px)]",
              dark ? "text-iv" : "text-em9",
            )}
          >
            <span className={line}>
              <span data-ln="" style={v(0)} className="block lg:whitespace-nowrap">
                {t(`${k}.l1`)}
              </span>
            </span>
            <span className={line}>
              <span data-ln="" style={v(1)} className="block lg:whitespace-nowrap">
                {t.rich(`${k}.l2`, { em })}
              </span>
            </span>
          </h1>
          <span
            data-fade=""
            lang={hi ? "en" : "hi"}
            style={v(1)}
            className={cn(
              hi
                ? "font-display text-[clamp(18px,1.8vw,22px)] leading-[1.35] italic"
                : "font-deva text-[clamp(19px,2vw,24px)] leading-[1.35]",
              dark ? "text-g5" : "text-g7",
            )}
          >
            {t(`${k}.sub`)}
          </span>
          <p
            data-fade=""
            style={v(2)}
            className={cn(
              hi
                ? "m-0 max-w-[520px] font-hi text-[17px] leading-[1.7] lg:text-[16px] lg:leading-[1.6]"
                : "m-0 max-w-[500px] font-sans text-[clamp(16px,1.3vw,18px)] leading-[1.65] text-pretty lg:text-[16px] lg:leading-[1.6]",
              dark ? "text-iv/80" : "text-ink6",
            )}
          >
            {t(`${k}.body`)}
          </p>
          <div data-fade="" style={v(3)} className="mt-2 flex flex-col flex-wrap gap-3 md:flex-row lg:mt-1">
            <Link
              href={s.href1}
              {...magneticHandlers}
              className={cn(
                ctaBase,
                "gap-[10px] bg-em7 px-[26px] text-iv shadow-ring-gold hover:text-iv",
                hi
                  ? "font-hi text-[17px] leading-none font-medium transition-transform duration-[250ms] ease-mka hover:bg-em5"
                  : "sheen font-sans text-[15px] leading-none font-semibold tracking-[.03em]",
              )}
            >
              <span className="block size-[18px]">
                <Icon name={s.icon} />
              </span>
              {t(`${k}.cta1`)}
            </Link>
            <Link
              href={s.href2}
              {...magneticHandlers}
              className={cn(
                ctaBase,
                "bg-iv px-6 text-em7 shadow-ring-em transition-[background-color,transform] duration-[150ms,250ms] ease-mka hover:bg-em1 hover:text-em7",
                hi
                  ? "font-hi text-[17px] leading-none font-medium"
                  : "gap-2 font-sans text-[15px] leading-none font-semibold",
              )}
            >
              {s.icon2 && !hi && (
                <span className="block size-[17px]">
                  <Icon name={s.icon2} />
                </span>
              )}
              {t(`${k}.cta2`)}
            </Link>
          </div>
        </div>
      </div>

      <div role="group" aria-label={t("carousel")} onKeyDown={onKey} className="flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className={cn(
            "font-sans text-[12px] leading-none font-semibold tracking-[.14em] whitespace-nowrap tabular",
            dark ? "text-iv" : "text-ink",
          )}
        >
          0{slide + 1}
          <span className="mx-1.5 text-g5">/</span>
          <span className={dark ? "text-iv/70" : "text-ink6"}>03</span>
        </span>
        <span aria-hidden="true" className={cn("relative h-px max-w-[220px] flex-1", dark ? "bg-iv/25" : "bg-s2")}>
          <span
            ref={progRef}
            className="absolute inset-x-0 -top-[.5px] block h-0.5 origin-left bg-g5"
            style={{ transform: "scaleX(0)" }}
          />
        </span>
        <div className="ml-auto flex gap-1.5">
          <button type="button" onClick={() => go(-1)} aria-label={t("prev")} className={btn}>
            <span className="block size-[18px]">
              <Icon name="chevL" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPlay((p) => !p)}
            aria-label={play ? t("pause") : t("play")}
            className={btn}
          >
            <span className="block size-4">
              <Icon name={play ? "pause" : "play"} />
            </span>
          </button>
          <button type="button" onClick={() => go(1)} aria-label={t("next")} className={btn}>
            <span className="block size-[18px]">
              <Icon name="chevR" />
            </span>
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}
