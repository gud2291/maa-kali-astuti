"use client";

import { useEffect, useState } from "react";
import { istDayKey } from "@/lib/core/ist";
import type { Period as UiPeriod } from "@/lib/astro/predict";
import type { RashiKey } from "@/lib/domain/enums";
import type { Loc } from "@/lib/domain/loc";

export type RashifalHookEntry = {
  rashi: RashiKey;
  text: Loc;
  scores: {
    love: number;
    career: number;
    health: number;
    finance: number;
  } | null;
  lucky: {
    number: number;
    colour: Loc;
  } | null;
};

export type RashifalHookStatus = "idle" | "loading" | "success" | "error";

export type RashifalHookResult = {
  entries: Map<RashiKey, RashifalHookEntry>;
  status: RashifalHookStatus;
};

const cache = new Map<string, Map<RashiKey, RashifalHookEntry>>();
const inflight = new Map<string, Promise<Map<RashiKey, RashifalHookEntry>>>();

/**
 * Client hook fetching published rashifal entries for the viewer's current IST date and chosen period.
 * Returns Map<rashi, entry> and status. Caches responses per (period, day).
 */
export function useRashifal(p: UiPeriod = "today"): RashifalHookResult {
  const [day, setDay] = useState<string>("");
  const [status, setStatus] = useState<RashifalHookStatus>("idle");
  const [entries, setEntries] = useState<Map<RashiKey, RashifalHookEntry>>(
    () => new Map(),
  );

  // Compute viewer's IST day after mount to avoid hydration mismatch
  useEffect(() => {
    setDay(istDayKey(Date.now()));
  }, []);

  useEffect(() => {
    if (!day) return;

    const cacheKey = `${p}:${day}`;
    const cachedMap = cache.get(cacheKey);

    if (cachedMap) {
      setEntries(cachedMap);
      setStatus("success");
      return;
    }

    let isSubscribed = true;
    setStatus("loading");

    let promise = inflight.get(cacheKey);
    if (!promise) {
      promise = fetch(`/api/rashifal?p=${encodeURIComponent(p)}&d=${encodeURIComponent(day)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch rashifal");
          return res.json() as Promise<{
            period: string;
            startsOn: string;
            entries: RashifalHookEntry[];
          }>;
        })
        .then((data) => {
          const map = new Map<RashiKey, RashifalHookEntry>();
          for (const item of data.entries) {
            map.set(item.rashi, item);
          }
          cache.set(cacheKey, map);
          return map;
        })
        .finally(() => {
          inflight.delete(cacheKey);
        });

      inflight.set(cacheKey, promise);
    }

    promise
      .then((map) => {
        if (isSubscribed) {
          setEntries(map);
          setStatus("success");
        }
      })
      .catch(() => {
        if (isSubscribed) {
          setStatus("error");
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [p, day]);

  return { entries, status };
}
