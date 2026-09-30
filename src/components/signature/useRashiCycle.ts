"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type UIEvent } from "react";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { wheelActive } from "./RashiWheel";

/* S8 — the rashi wheel cycle (Home.dc.html 1082–1116, vRashi refs 1170–1175; Rashifal 226–247).
   - Every 4000 ms the wheel steps to the next rashi, but only while playing, not held, ≥25% in
     view, the tab is visible and motion is allowed.
   - Hover, focus, click, touch, prev/next and tab picks hold the cycle for 12000 ms.
   - Desktop: the [data-rot] ring turns by the shortest way (forward when auto-stepping), 900 ms
     cubic-bezier(.3,.7,.3,1) with a ±1.8° overshoot at 72%.
   - Mobile: the tick smooth-scrolls the card rail; the dial angle follows the rail
     (−scrollLeft / step × 30°) and the nearest card becomes the active rashi.
   `start` is today's rashi; it is used until the visitor (or the cycle) picks another. */

const TICK = 4000;
const HOLD = 12000;
/** Rail gap between cards (px). */
const GAP = 12;

const wrap = (j: number) => ((j % 12) + 12) % 12;

/** Card width + gap: one rail step (rStep). */
const railStep = (rail: HTMLElement | null) => {
  const c = rail?.querySelector<HTMLElement>("[data-card]");
  return c ? c.offsetWidth + GAP : 0;
};

const turn = (el: HTMLElement | null, deg: number) => {
  if (el) el.style.transform = `rotate(${deg}deg)`;
};

export function useRashiCycle(start: number, mobile: boolean) {
  const [picked, setPicked] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const idx = picked ?? start;

  const idxRef = useRef(idx);
  const playRef = useRef(playing);
  const mobileRef = useRef(mobile);
  const holdUntil = useRef(0);
  const inView = useRef({ wheel: false, dial: false });
  const ang = useRef(-idx * 30);
  const anim = useRef<Animation | null>(null);

  const wheelEl = useRef<HTMLDivElement | null>(null);
  const wheelRing = useRef<HTMLSpanElement | null>(null);
  const dialEl = useRef<HTMLDivElement | null>(null);
  const dialRing = useRef<HTMLSpanElement | null>(null);
  const railEl = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    idxRef.current = idx;
    playRef.current = playing;
    mobileRef.current = mobile;
  });

  // Untouched: sit on today's rashi (the server rendered the build date's; the client may differ).
  useLayoutEffect(() => {
    if (picked !== null) return;
    ang.current = -start * 30;
    turn(wheelRing.current, ang.current);
    turn(dialRing.current, ang.current);
    const st = railStep(railEl.current);
    if (railEl.current && st) railEl.current.scrollLeft = start * st;
  }, [start, picked]);

  // Light the active segment on both wheels.
  useLayoutEffect(() => {
    wheelActive(wheelEl.current, idx);
    wheelActive(dialEl.current, idx);
  }, [idx]);

  // Viewport switched to mobile: line the rail and the dial up with the current rashi.
  useEffect(() => {
    if (!mobile) return;
    const st = railStep(railEl.current);
    if (railEl.current && st) railEl.current.scrollLeft = idxRef.current * st;
    turn(dialRing.current, -idxRef.current * 30);
  }, [mobile]);

  const hold = useCallback(() => {
    holdUntil.current = Date.now() + HOLD;
  }, []);

  /** Go to rashi j (rGo + rRotate). dir 1 = always forward, −1 = always back, none = shortest. */
  const go = useCallback((target: number, dir?: 1 | -1) => {
    const j = wrap(target);
    const cur = idxRef.current;
    if (j === cur) return;
    let d = -((j - cur) * 30);
    d = (((d % 360) + 540) % 360) - 180;
    if (dir === 1 && d > 0) d -= 360;
    if (d === 180 && dir !== -1) d = -180;

    const el = wheelRing.current;
    const a0 = ang.current;
    const a1 = a0 + d;
    ang.current = a1;
    if (el) {
      anim.current?.cancel();
      turn(el, a1);
      if (!isReduced()) {
        const ov = d < 0 ? -1.8 : 1.8;
        anim.current = el.animate(
          [
            { transform: `rotate(${a0}deg)` },
            { transform: `rotate(${a1 + ov}deg)`, offset: 0.72 },
            { transform: `rotate(${a1}deg)` },
          ],
          { duration: 900, easing: "cubic-bezier(.3,.7,.3,1)" },
        );
      }
    }
    idxRef.current = j;
    setPicked(j);
  }, []);

  // The 4 s cycle.
  useEffect(() => {
    const id = setInterval(() => {
      if (!playRef.current || holdUntil.current > Date.now() || document.hidden || isReduced()) return;
      if (!inView.current.wheel && !inView.current.dial) return;
      if (mobileRef.current) {
        const r = railEl.current;
        const st = railStep(r);
        if (r && st) r.scrollTo({ left: wrap(idxRef.current + 1) * st, behavior: "smooth" });
      } else go(idxRef.current + 1, 1);
    }, TICK);
    return () => {
      clearInterval(id);
      anim.current?.cancel();
    };
  }, [go]);

  // In-view flags (IO .25). Only the wheel or the dial is displayed, so only one ever intersects.
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          inView.current[e.target === wheelEl.current ? "wheel" : "dial"] = e.isIntersecting;
        }),
      { threshold: 0.25 },
    );
    if (wheelEl.current) io.observe(wheelEl.current);
    if (dialEl.current) io.observe(dialEl.current);
    return () => io.disconnect();
  }, []);

  /** Rail scroll → dial angle + active card (onRail). */
  const onRail = useCallback((e: UIEvent<HTMLDivElement>) => {
    const st = railStep(e.currentTarget);
    if (!st) return;
    const fr = e.currentTarget.scrollLeft / st;
    turn(dialRing.current, -fr * 30);
    const j = Math.max(0, Math.min(11, Math.round(fr)));
    if (j === idxRef.current) return;
    idxRef.current = j;
    // Keep the (hidden) desktop ring in step for a later resize.
    ang.current = -j * 30;
    turn(wheelRing.current, ang.current);
    setPicked(j);
  }, []);

  /** Delegated click on a wheel segment (wheelRef click listener). */
  const onWheelClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const g = (e.target as Element).closest?.("[data-seg]");
      if (!g) return;
      hold();
      go(+(g.getAttribute("data-seg") || 0));
    },
    [go, hold],
  );

  const prev = useCallback(() => {
    hold();
    go(idxRef.current - 1, -1);
  }, [go, hold]);

  const next = useCallback(() => {
    hold();
    go(idxRef.current + 1, 1);
  }, [go, hold]);

  const toggle = useCallback(() => setPlaying((p) => !p), []);

  return {
    idx,
    playing,
    toggle,
    hold,
    prev,
    next,
    onWheelClick,
    onRail,
    refs: { wheelEl, wheelRing, dialEl, dialRing, railEl },
  };
}
