"use client";
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { PERIODS, type Period } from "@/lib/astro/predict";
import { RASHI } from "@/lib/astro/rashi";

/* Shared state of the two Rashifal pages (Rashifal.dc.html 204–215, Rashi-Detail.dc.html 174–188).
   - period: `?p=today|tomorrow|week|month|year` (design `#p=`). Read once on mount; a tab pick
     rewrites the query in place with replaceState (no navigation), as the design does.
   - day: the build date in the HTML, the viewer's today after hydration (predictions are seeded
     by date, INV gotcha 14).
   - mine: the rashi remembered on this device (`localStorage 'mka-my-rashi'`). */

const MINE_KEY = "mka-my-rashi";

export const isPeriod = (p: string | null | undefined): p is Period => PERIODS.some(([k]) => k === p);

const noop = () => () => {};
const dayStart = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

type Ctx = {
  per: Period;
  setPer: (p: Period) => void;
  /** Start of the viewer's day (ms). */
  day: number;
  mine: string | null;
  setMine: (k: string) => void;
};

const PeriodCtx = createContext<Ctx | null>(null);

export function RashifalProvider({ buildNow, children }: { buildNow: number; children: ReactNode }) {
  const day = useSyncExternalStore(
    noop,
    () => dayStart(Date.now()),
    () => dayStart(buildNow),
  );
  const [per, setPerState] = useState<Period>("today");
  const [mine, setMineState] = useState<string | null>(null);

  // URL + device state → state, once on mount (didMount).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("p");
    let m: string | null = null;
    try {
      m = localStorage.getItem(MINE_KEY);
    } catch {}
    if (isPeriod(p)) setPerState(p);
    if (m && RASHI.some((r) => r.key === m)) setMineState(m);
  }, []);

  const setPer = useCallback((p: Period) => {
    setPerState(p);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("p", p);
      window.history.replaceState(window.history.state, "", u.pathname + u.search + u.hash);
    } catch {}
  }, []);

  const setMine = useCallback((k: string) => {
    try {
      localStorage.setItem(MINE_KEY, k);
    } catch {}
    setMineState(k);
  }, []);

  return <PeriodCtx.Provider value={{ per, setPer, day, mine, setMine }}>{children}</PeriodCtx.Provider>;
}

export function useRashifal(): Ctx {
  const c = useContext(PeriodCtx);
  if (!c) throw new Error("useRashifal must be used inside <RashifalProvider>");
  return c;
}

/** Five overall / area dots (7px, brass ring). `on` = filled colour, `ring` = the dot outline. */
export function Dots({ n, label, on, ring }: { n: number; label: string; on: string; ring: string }) {
  return (
    <span role="img" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="size-[7px] rounded-pill"
          style={{ backgroundColor: i <= n ? on : "transparent", boxShadow: `inset 0 0 0 1px ${ring}` }}
        />
      ))}
    </span>
  );
}
