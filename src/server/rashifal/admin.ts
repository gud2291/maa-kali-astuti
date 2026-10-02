import "server-only";

import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { rashifalEntries } from "@/server/db/schema/content";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import type { RashifalPeriod, RashiKey } from "@/lib/domain/enums";
import type { Loc } from "@/lib/domain/loc";
import {
  savePeriodEntriesSchema,
  type RashifalEntryInput,
} from "@/lib/validation/rashifal";

export type RashifalAdminEntry = {
  id: number;
  rashi: RashiKey;
  period: RashifalPeriod;
  startsOn: string;
  textEn: string;
  textHi: string;
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
  status: "draft" | "published";
  updatedBy: number | null;
  updatedAt: Date;
};

export type PeriodCoverage = {
  period: RashifalPeriod;
  startsOn: string;
  count: number;
  complete: boolean;
};

/**
 * Loads all rashifal entries (both draft and published) for a given period and start date.
 */
export async function getPeriodEntries(
  period: RashifalPeriod,
  startsOn: string,
): Promise<RashifalAdminEntry[]> {
  await requireAdmin("content.edit");

  const rows = await db
    .select()
    .from(rashifalEntries)
    .where(
      and(
        eq(rashifalEntries.period, period),
        eq(rashifalEntries.startsOn, startsOn),
      ),
    );

  return rows as RashifalAdminEntry[];
}

/**
 * Saves (upserts) 1 to 12 rashifal entries in a single batch transaction.
 */
export async function savePeriodEntries(
  period: RashifalPeriod,
  startsOn: string,
  entries: RashifalEntryInput[],
): Promise<void> {
  const admin = await requireAdmin("content.edit");
  const parsed = savePeriodEntriesSchema.parse({ period, startsOn, entries });

  const now = new Date();
  const statements = parsed.entries.map((entry) =>
    db
      .insert(rashifalEntries)
      .values({
        rashi: entry.rashi,
        period: parsed.period,
        startsOn: parsed.startsOn,
        textEn: entry.textEn,
        textHi: entry.textHi,
        scores: entry.scores ?? null,
        lucky: entry.lucky ?? null,
        status: entry.status,
        updatedBy: admin.id,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          rashifalEntries.rashi,
          rashifalEntries.period,
          rashifalEntries.startsOn,
        ],
        set: {
          textEn: entry.textEn,
          textHi: entry.textHi,
          scores: entry.scores ?? null,
          lucky: entry.lucky ?? null,
          status: entry.status,
          updatedBy: admin.id,
          updatedAt: now,
        },
      }),
  );

  if (statements.length > 0) {
    await db.batch(statements as [typeof statements[0], ...typeof statements]);
  }

  await audit({
    actorId: admin.id,
    action: "rashifal.save",
    entity: "rashifal",
    entityId: `${parsed.period}:${parsed.startsOn}`,
    summary: `Saved ${parsed.entries.length} rashifal entries for ${parsed.period} starting ${parsed.startsOn}`,
  });
}

/**
 * Calculates which start dates have all 12 published signs within a date range.
 */
export async function coverage(
  fromKey: string,
  toKey: string,
): Promise<PeriodCoverage[]> {
  await requireAdmin("content.edit");

  const rows = await db
    .select({
      period: rashifalEntries.period,
      startsOn: rashifalEntries.startsOn,
      count: sql<number>`count(distinct ${rashifalEntries.rashi})`,
    })
    .from(rashifalEntries)
    .where(
      and(
        gte(rashifalEntries.startsOn, fromKey),
        lte(rashifalEntries.startsOn, toKey),
        eq(rashifalEntries.status, "published"),
      ),
    )
    .groupBy(rashifalEntries.period, rashifalEntries.startsOn);

  return rows.map((r) => {
    const count = Number(r.count);
    return {
      period: r.period as RashifalPeriod,
      startsOn: r.startsOn,
      count,
      complete: count >= 12,
    };
  });
}
