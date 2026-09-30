"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

/* S7 Chakra — the three gold rings of A.chakra (mka-astro.js 158–170), served as static files
   (public/svg/chakra/{outer,middle,inner}-d9b96a.svg) and stacked in a square box.
   - mode "spin": each ring carries a `data-amb="spin:N"` loop (AmbientRoot pauses it offscreen /
     when the tab is hidden; reduced motion keeps it still).
   - mode "ramp" (Kundali-99 genRef, script 478): WAAPI rotations of 9000 / 7000 / 5000 ms (the
     middle ring reversed) start at playbackRate .12 and speed up by .1 every 100 ms to 2.6.
     Paused while offscreen or the tab is hidden; still under reduced motion. */

export type ChakraRing = "outer" | "middle" | "inner";

type Props = {
  mode?: "spin" | "ramp";
  /** spin mode: ring + seconds per turn (negative = reverse), e.g. [["outer", 6], ["inner", -4]]. */
  spin?: [ChakraRing, number][];
  /** Ring inset inside the box (Kundali generating 6%, pay sheet 8%). */
  inset?: string;
  className?: string;
};

const RAMP: { ring: ChakraRing; dur: number; dir: 1 | -1 }[] = [
  { ring: "outer", dur: 9000, dir: 1 },
  { ring: "middle", dur: 7000, dir: -1 },
  { ring: "inner", dur: 5000, dir: 1 },
];

function RingImg({ ring }: { ring: ChakraRing }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/svg/chakra/${ring}-d9b96a.svg`} alt="" width={200} height={200} className="block size-full" />
  );
}

export function Chakra({ mode = "spin", spin = [], inset = "6%", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (mode !== "ramp" || !root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rings = [...root.querySelectorAll<HTMLElement>("[data-ring]")];
    const an = rings.map((el, i) =>
      el.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${RAMP[i].dir * 360}deg)` }], {
        duration: RAMP[i].dur,
        iterations: Infinity,
      }),
    );
    an.forEach((a) => (a.playbackRate = 0.12));
    let t = 0;
    const ramp = setInterval(() => {
      t++;
      const r = Math.min(2.6, 0.12 + t * 0.1);
      an.forEach((a) => a.updatePlaybackRate(r));
      if (t > 26) clearInterval(ramp);
    }, 100);

    let seen = true;
    const sync = () => an.forEach((a) => (seen && !document.hidden ? a.play() : a.pause()));
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      sync();
    });
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearInterval(ramp);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      an.forEach((a) => a.cancel());
    };
  }, [mode]);

  return (
    <div ref={ref} aria-hidden="true" className={cn("relative", className)}>
      {mode === "ramp"
        ? RAMP.map((r) => (
            <span key={r.ring} data-ring="" className="absolute block" style={{ inset }}>
              <RingImg ring={r.ring} />
            </span>
          ))
        : spin.map(([ring, s]) => (
            <span key={ring} data-amb={`spin:${s}`} className="absolute block" style={{ inset }}>
              <RingImg ring={ring} />
            </span>
          ))}
    </div>
  );
}
