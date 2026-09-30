"use client";

import { useEffect, useRef, useState } from "react";
import { drawYantra } from "@/components/motion/draw";
import { EASE } from "@/components/motion/easing";
import { InlineArt } from "@/components/ui/InlineArt";
import type { Chapter } from "@/lib/api/content";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";

/* §2 "Six chapters" story (About.dc.html 76–107, measure 210–216, drawArt 217–227).
   - ≥1024: sticky column (top 110) with the six Devanagari dots on a rail whose gold fill steps to
     ch / 5 (500 ms), and the arch "window" where the chapter arts cross-fade (700 ms) under the year
     pill. Chapters are 72vh tall; the active one is opaque, the rest .38.
   - <1024: each chapter has its own dot and a small arch art; a gold line fills down the list:
     p = clamp((.6·vh − top) / height).
   Active chapter = the last one whose top is above .55·vh. On change the window's art redraws:
   [data-cd] strokes 1400 ms (+90 ms each, EASE), yantra [data-d] via drawYantra 1600; the "today"
   chakra ring ([data-spin]) turns once started (90 s a turn), paused offscreen / on a hidden tab.
   Reduced motion: no draw, no spin, mobile line full. */

const DOT = "grid size-11 place-items-center rounded-pill font-deva text-[17px] leading-none";
const ARCH = "rounded-[50%_50%_4px_4px/39.5%_39.5%_4px_4px]";

export function StoryChapters({ chapters, arts }: { chapters: Chapter[]; arts: Record<string, string> }) {
  const [ch, setCh] = useState(0);
  const chapsRef = useRef<HTMLOListElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const spinRef = useRef<Animation | null>(null);
  const last = chapters.length - 1;

  // measure(): active chapter + the mobile fill, on scroll / resize (one rAF per frame).
  useEffect(() => {
    let rq = 0;
    const measure = () => {
      rq = 0;
      const root = chapsRef.current;
      if (!root) return;
      const vh = window.innerHeight;
      let best = 0;
      root.querySelectorAll("[data-chap]").forEach((el, i) => {
        if (el.getBoundingClientRect().top < vh * 0.55) best = i;
      });
      setCh(best);
      const f = fillRef.current;
      if (f && f.offsetParent) {
        const r = root.getBoundingClientRect();
        const p = isReduced() ? 1 : Math.max(0, Math.min(1, (vh * 0.6 - r.top) / Math.max(1, r.height)));
        f.style.transform = `scaleY(${p})`;
      }
    };
    const on = () => {
      if (!rq) rq = requestAnimationFrame(measure);
    };
    rq = requestAnimationFrame(measure);
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(rq);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);

  // drawArt(ch): only the desktop window draws (it is display:none below 1024).
  useEffect(() => {
    const win = winRef.current;
    if (!win || !win.offsetParent) return;
    const art = win.querySelector(`[data-art="${ch}"]`);
    if (!art) return;
    if (!isReduced()) {
      art.querySelectorAll<SVGElement>("[data-cd]").forEach((p, j) => {
        p.getAnimations().forEach((a) => a.cancel());
        p.style.strokeDasharray = "1";
        p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
          duration: 1400,
          delay: j * 90,
          easing: EASE,
          fill: "both",
        });
      });
      if (art.querySelector("[data-d]")) drawYantra(art, 1600);
      const sp = art.querySelector<SVGElement>("[data-spin]");
      if (sp && !spinRef.current)
        spinRef.current = sp.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
          duration: 90000,
          iterations: Infinity,
        });
    }
  }, [ch]);

  // The chakra spin pauses while the window is offscreen or the tab is hidden.
  useEffect(() => {
    const win = winRef.current;
    if (!win) return;
    let seen = false;
    const sync = () => {
      const a = spinRef.current;
      if (a) (seen && !document.hidden ? a.play() : a.pause());
    };
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      sync();
    });
    io.observe(win);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      spinRef.current?.cancel();
      spinRef.current = null;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 items-start gap-[clamp(32px,6vw,104px)] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
      <div className="sticky top-[110px] hidden grid-cols-[44px_minmax(0,1fr)] items-center gap-6 lg:grid">
        <ol aria-hidden="true" className="relative m-0 flex list-none flex-col gap-[30px] p-0">
          <span className="absolute top-2.5 bottom-2.5 left-[21.5px] w-px bg-[rgba(217,185,106,.25)]" />
          <span
            className="absolute top-2.5 left-[21px] h-[calc(100%-20px)] w-0.5 origin-top bg-g3 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{ transform: `scaleY(${(ch / last).toFixed(3)})` }}
          />
          {chapters.map((x, i) => (
            <li
              key={x.k}
              className={cn(DOT, "relative transition-[background-color,color,box-shadow] duration-[400ms]")}
              style={{
                backgroundColor: i <= ch ? "#D9B96A" : "#0A1F1A",
                color: i <= ch ? "#0A1F1A" : "#D9B96A",
                boxShadow: i === ch ? "0 0 0 6px rgba(217,185,106,.16)" : "inset 0 0 0 1px rgba(217,185,106,.5)",
              }}
            >
              {x.dev}
            </li>
          ))}
        </ol>
        <div
          ref={winRef}
          className={cn(
            ARCH,
            "relative aspect-[300/380] w-full max-w-[400px] overflow-hidden bg-n8 shadow-[inset_0_0_0_1px_rgba(217,185,106,.55),0_40px_80px_-50px_rgba(0,0,0,.8)]",
          )}
        >
          <span
            aria-hidden="true"
            className="absolute inset-2 rounded-[50%_50%_2px_2px/39.5%_39.5%_2px_2px] shadow-[inset_0_0_0_1px_rgba(217,185,106,.28)]"
          />
          {chapters.map((x, i) => (
            <span
              key={x.k}
              data-art={i}
              className="absolute inset-0 block transition-opacity duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
              style={{ opacity: i === ch ? 1 : 0 }}
            >
              <InlineArt svg={arts[x.k] ?? ""} uid={`abw${x.k}`} />
            </span>
          ))}
          <span className="absolute right-0 bottom-[18px] left-0 flex justify-center">
            <span className="inline-flex h-7 items-center rounded-pill bg-[rgba(10,31,26,.75)] px-3 font-sans text-[11.5px] leading-none font-bold tracking-[.1em] text-g1 tabular shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)]">
              {chapters[ch]?.yr}
            </span>
          </span>
        </div>
      </div>

      <ol ref={chapsRef} className="relative m-0 list-none p-0">
        <span
          aria-hidden="true"
          className="absolute top-[22px] bottom-[22px] left-[21.5px] w-px bg-[rgba(217,185,106,.25)] lg:hidden"
        />
        <span
          ref={fillRef}
          aria-hidden="true"
          className="absolute top-[22px] bottom-[22px] left-[21px] w-0.5 origin-top bg-g3 lg:hidden"
          style={{ transform: "scaleY(0)" }}
        />
        {chapters.map((c, i) => (
          <li
            key={c.k}
            data-chap={i}
            className={cn(
              "relative grid grid-cols-[44px_minmax(0,1fr)] gap-[18px] pb-11 transition-opacity duration-500 lg:min-h-[72vh] lg:grid-cols-1 lg:pb-0",
              i === ch ? "lg:opacity-100" : "lg:opacity-[.38]",
            )}
          >
            <span
              className={cn(DOT, "relative shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] lg:hidden")}
              style={{ backgroundColor: i <= ch ? "#D9B96A" : "#0A1F1A", color: i <= ch ? "#0A1F1A" : "#D9B96A" }}
            >
              {c.dev}
            </span>
            <div className="flex min-w-0 flex-col gap-3">
              <span className="font-sans text-[12px] leading-[1.2] font-bold tracking-[.16em] text-g3 tabular">
                {c.yr}
              </span>
              <h3
                lang="en"
                className="m-0 font-display text-[clamp(26px,3vw,40px)] leading-[1.12] font-normal tracking-[-.012em] text-balance text-iv font-soft"
              >
                {c.t}
              </h3>
              <span lang="hi" className="font-deva text-[19px] leading-[1.35] text-g3">
                {c.hi}
              </span>
              <span
                className={cn(
                  ARCH,
                  "my-1.5 block aspect-[300/380] w-[180px] overflow-hidden bg-n8 shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)] lg:hidden",
                )}
              >
                <InlineArt svg={arts[c.k] ?? ""} uid={`abm${c.k}`} />
              </span>
              <p lang="en" className="m-0 max-w-[560px] font-sans text-[17px] leading-[1.75] text-pretty text-em1">
                {c.d}
              </p>
              <p
                lang="en"
                className="m-0 max-w-[540px] pl-4 font-display text-[17px] leading-[1.55] font-normal text-pretty text-sg3 italic shadow-[inset_1px_0_0_rgba(217,185,106,.5)]"
              >
                {c.note}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
