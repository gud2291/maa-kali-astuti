import "server-only";
import { sql } from "drizzle-orm";
import { counters } from "@/server/db/schema/core";
import { istDayKey } from "@/lib/core/ist";
import type { db } from "@/server/db/client";

export function fiscalYear(now: Date | number = new Date()): string {
  const day = istDayKey(now);
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));

  if (month >= 4) {
    const nextYear2Digits = String((year + 1) % 100).padStart(2, "0");
    return `${year}-${nextYear2Digits}`;
  } else {
    const thisYear2Digits = String(year % 100).padStart(2, "0");
    return `${year - 1}-${thisYear2Digits}`;
  }
}

type TxOrDb = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function nextInvoiceNo(
  tx: TxOrDb,
  prefix: string,
  now: Date | number = new Date(),
): Promise<string> {
  const fy = fiscalYear(now);
  const key = `invoice:${fy}`;

  const rows = await tx
    .insert(counters)
    .values({ key, value: 1 })
    .onConflictDoUpdate({
      target: counters.key,
      set: { value: sql`${counters.value} + 1` },
    })
    .returning({ value: counters.value });

  const val = rows[0]?.value ?? 1;
  const numStr = String(val).padStart(5, "0");
  return `${prefix}/${fy}/${numStr}`;
}
