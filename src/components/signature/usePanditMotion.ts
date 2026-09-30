"use client";
import { useEffect, type RefObject } from "react";
import { INOUT } from "@/components/motion/easing";
import { MALA_L, MALA_LUT, MALA_N } from "@/lib/art/mala";
import { isReduced } from "@/lib/hooks/useReducedMotion";

/* Pandit Ji motion (Home.dc.html 1016–1043, INV §E.1 S1–S4):
   S1 blink    — every 3–6 s: #eyelids scaleY 1 → .05 (@45%) → 1, 160 ms; 20% chance of a double blink 230 ms later.
   S2 japa     — every 1.2 s the 30 beads advance one bead spacing along the mala path (300 ms easeOutCubic)
                 and #hand-thumb nudges (1.2px, 1.8px) over 460 ms.
   S3 breath   — #torso + #torso-front scale 1 → 1.012 → 1 (4 s), #aura opacity .5 → .82 → .5 (5 s), INOUT, forever.
   S4 gaze     — ≥1024 px: pupils ease toward the cursor (max 2.2 × .9 units, lerp .12), anchored at the eye line.
   Everything pauses when the art is < 5% visible or the tab is hidden; reduced motion leaves the still pose. */

const LAST = MALA_LUT.length - 1;

/** Point at arc length `s` along the mala path (uniform LUT, linear interpolation). */
export function malaAt(s: number): [number, number] {
  const L = MALA_L;
  const x = ((((s % L) + L) % L) / L) * LAST;
  const i = Math.min(LAST - 1, Math.floor(x));
  const k = x - i;
  const a = MALA_LUT[i];
  const b = MALA_LUT[i + 1];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
}

/** Place every bead at `off` + its index × bead spacing (H.malaSet). */
export function malaSet(beads: readonly Element[], off: number) {
  const st = MALA_L / MALA_N;
  beads.forEach((b, i) => {
    const p = malaAt(off + i * st);
    b.setAttribute("transform", `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);
  });
}

export function usePanditMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const q = (s: string) => root.querySelector<SVGGElement>(s);
    const eyes = q("#eyelids");
    const pupils = q("#pupils");
    const thumb = q("#hand-thumb");
    const beads = [...root.querySelectorAll("[data-bead]")];

    let vis = true;
    const on = () => vis && !document.hidden;
    const loops: Animation[] = [];
    const sync = () =>
      loops.forEach((a) => {
        try {
          if (on()) a.play();
          else a.pause();
        } catch {
          /* animation already cancelled */
        }
      });

    const io = new IntersectionObserver(
      ([e]) => {
        vis = e.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", sync);

    if (isReduced()) {
      return () => {
        io.disconnect();
        document.removeEventListener("visibilitychange", sync);
      };
    }

    // S3 — breath + aura
    const breath: KeyframeAnimationOptions = { duration: 4000, iterations: Infinity, easing: INOUT };
    [q("#torso"), q("#torso-front")].forEach((el) => {
      if (el)
        loops.push(
          el.animate([{ transform: "scale(1)" }, { transform: "scale(1.012)" }, { transform: "scale(1)" }], breath),
        );
    });
    const aura = q("#aura");
    if (aura)
      loops.push(
        aura.animate([{ opacity: 0.5 }, { opacity: 0.82 }, { opacity: 0.5 }], {
          duration: 5000,
          iterations: Infinity,
          easing: INOUT,
        }),
      );
    sync();

    // S2 — japa mala
    let off = 0;
    let mr = 0;
    const malaStep = () => {
      if (!on() || !beads.length) return;
      const st = MALA_L / MALA_N;
      const from = off;
      const to = from + st;
      const t0 = performance.now();
      off = to;
      cancelAnimationFrame(mr);
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / 300);
        const e = 1 - Math.pow(1 - k, 3);
        malaSet(beads, from + (to - from) * e);
        if (k < 1) mr = requestAnimationFrame(tick);
      };
      mr = requestAnimationFrame(tick);
      thumb?.animate(
        [
          { transform: "translate(0,0)" },
          { transform: "translate(1.2px,1.8px)", offset: 0.45 },
          { transform: "translate(0,0)" },
        ],
        { duration: 460, easing: "ease-in-out" },
      );
    };
    const malaIv = setInterval(malaStep, 1200);

    // S1 — blink (timing jitter is client-only, so Math.random is fine here)
    let bt: ReturnType<typeof setTimeout> | undefined;
    let bt2: ReturnType<typeof setTimeout> | undefined;
    const blink = () =>
      eyes?.animate(
        [{ transform: "scaleY(1)" }, { transform: "scaleY(.05)", offset: 0.45 }, { transform: "scaleY(1)" }],
        {
          duration: 160,
          easing: "ease-in-out",
        },
      );
    const blinkLater = () => {
      bt = setTimeout(
        () => {
          if (on()) {
            blink();
            if (Math.random() < 0.2) bt2 = setTimeout(blink, 230);
          }
          blinkLater();
        },
        3000 + Math.random() * 3000,
      );
    };
    blinkLater();

    // S4 — gaze (desktop only)
    let gr = 0;
    const cur: [number, number] = [0, 0];
    let tgt: [number, number] = [0, 0];
    const onMove = (e: MouseEvent) => {
      if (!pupils || window.innerWidth < 1024 || !vis) return;
      const r = root.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width * 0.5);
      const dy = e.clientY - (r.top + r.height * 0.3426);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 260);
      tgt = [(dx / d) * k * 2.2, (dy / d) * k * 0.9];
      if (gr) return;
      const loop = () => {
        cur[0] += (tgt[0] - cur[0]) * 0.12;
        cur[1] += (tgt[1] - cur[1]) * 0.12;
        pupils.style.transform = `translate(${cur[0].toFixed(2)}px,${cur[1].toFixed(2)}px)`;
        gr = Math.abs(tgt[0] - cur[0]) + Math.abs(tgt[1] - cur[1]) > 0.01 ? requestAnimationFrame(loop) : 0;
      };
      gr = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("mousemove", onMove);
      loops.forEach((a) => a.cancel());
      clearInterval(malaIv);
      clearTimeout(bt);
      clearTimeout(bt2);
      cancelAnimationFrame(mr);
      cancelAnimationFrame(gr);
    };
  }, [ref]);
}
