"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { invalidate, TAG } from "@/server/cache";
import {
  savePeriodEntries,
  getPeriodEntries,
  coverage,
  type RashifalAdminEntry,
  type PeriodCoverage,
} from "./admin";
import {
  savePeriodEntriesSchema,
  type SavePeriodEntriesInput,
} from "@/lib/validation/rashifal";
import { RASHIFAL_PERIODS, type RashifalPeriod } from "@/lib/domain/enums";

export async function savePeriodEntriesAction(
  rawInput: SavePeriodEntriesInput,
): Promise<ActionResult<{ count: number }>> {
  return runAction(async () => {
    const input = savePeriodEntriesSchema.parse(rawInput);
    await savePeriodEntries(input.period, input.startsOn, input.entries);
    invalidate(TAG.rashifal);
    return { count: input.entries.length };
  });
}

export async function getPeriodEntriesAction(
  period: RashifalPeriod,
  startsOn: string,
): Promise<ActionResult<RashifalAdminEntry[]>> {
  return runAction(async () => {
    const validPeriod = z.enum(RASHIFAL_PERIODS).parse(period);
    const validStartsOn = z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .parse(startsOn);

    return getPeriodEntries(validPeriod, validStartsOn);
  });
}

export async function getCoverageAction(
  fromKey: string,
  toKey: string,
): Promise<ActionResult<PeriodCoverage[]>> {
  return runAction(async () => {
    const validFrom = z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .parse(fromKey);
    const validTo = z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .parse(toKey);

    return coverage(validFrom, validTo);
  });
}
