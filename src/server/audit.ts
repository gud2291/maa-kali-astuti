import "server-only";
import { db } from "./db/client";
import { auditLogs } from "./db/schema/core";
import { log } from "./log";

export async function audit(e: {
  actorId: number | null;
  action: string;
  entity: string;
  entityId: string | number;
  summary: string;
  diff?: Record<string, [unknown, unknown]>;
  ip?: string | null;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorId: e.actorId,
      action: e.action,
      entity: e.entity,
      entityId: String(e.entityId),
      summary: e.summary,
      diff: e.diff,
      ip: e.ip ?? null,
    });
  } catch (err) {
    log.error("audit.failed", err);
  }
}

export function diffOf<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>,
  keys: readonly (keyof T)[],
): Record<string, [unknown, unknown]> {
  const diff: Record<string, [unknown, unknown]> = {};
  for (const k of keys) {
    if (k in after) {
      const bVal = before[k];
      const aVal = after[k];
      if (JSON.stringify(bVal) !== JSON.stringify(aVal)) {
        diff[k as string] = [bVal, aVal];
      }
    }
  }
  return diff;
}
