import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { rashifalEntries } from "@/server/db/schema/content";
import { cached, TAG } from "@/server/cache";
import type { RashifalPeriod, RashiKey } from "@/lib/domain/enums";
import type { Loc } from "@/lib/domain/loc";

export type RashifalEntryItem = {
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

/**
 * Cached query returning published rashifal entries for a specific period and start date.
 */
export const getRashifal: (
  period: RashifalPeriod,
  startsOn: string,
) => Promise<RashifalEntryItem[]> = cached(
  "rashifal",
  async (period: RashifalPeriod, startsOn: string): Promise<RashifalEntryItem[]> => {
    const rows = await db
      .select({
        rashi: rashifalEntries.rashi,
        textEn: rashifalEntries.textEn,
        textHi: rashifalEntries.textHi,
        scores: rashifalEntries.scores,
        lucky: rashifalEntries.lucky,
      })
      .from(rashifalEntries)
      .where(
        and(
          eq(rashifalEntries.period, period),
          eq(rashifalEntries.startsOn, startsOn),
          eq(rashifalEntries.status, "published"),
        ),
      );

    return rows.map((r) => ({
      rashi: r.rashi as RashiKey,
      text: { en: r.textEn, hi: r.textHi },
      scores: r.scores ?? null,
      lucky: r.lucky ?? null,
    }));
  },
  () => [TAG.rashifal],
);
