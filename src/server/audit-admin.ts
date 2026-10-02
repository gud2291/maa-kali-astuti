import "server-only";

import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/server/db/client";
import { auditLogs, users } from "@/server/db/schema/core";
import { requireAdmin } from "@/server/auth/guards";

export type AuditLogItem = {
  id: number;
  actorId: number | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  diff: Record<string, [unknown, unknown]> | null;
  ip: string | null;
  createdAt: Date;
};

export type AuditListResult = {
  items: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AuditListFilters = {
  entity?: string;
  actorId?: number;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

/**
 * List audit logs with pagination and filters.
 * Requires "audit.view" permission.
 */
export async function listAudit(filters: AuditListFilters = {}): Promise<AuditListResult> {
  await requireAdmin("audit.view");

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (filters.entity && filters.entity.trim().length > 0 && filters.entity !== "all") {
    conditions.push(eq(auditLogs.entity, filters.entity.trim()));
  }

  if (filters.actorId && !isNaN(filters.actorId)) {
    conditions.push(eq(auditLogs.actorId, filters.actorId));
  }

  if (filters.from) {
    const fromDate = new Date(`${filters.from}T00:00:00+05:30`);
    if (!isNaN(fromDate.getTime())) {
      conditions.push(gte(auditLogs.createdAt, fromDate));
    }
  }

  if (filters.to) {
    const toDate = new Date(`${filters.to}T23:59:59.999+05:30`);
    if (!isNaN(toDate.getTime())) {
      conditions.push(lte(auditLogs.createdAt, toDate));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRes, rows] = await Promise.all([
    db.select({ count: count() }).from(auditLogs).where(whereClause),
    db
      .select({
        id: auditLogs.id,
        actorId: auditLogs.actorId,
        actorName: users.name,
        actorEmail: users.email,
        action: auditLogs.action,
        entity: auditLogs.entity,
        entityId: auditLogs.entityId,
        summary: auditLogs.summary,
        diff: auditLogs.diff,
        ip: auditLogs.ip,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(pageSize)
      .offset(offset),
  ]);

  const total = totalRes[0]?.count ?? 0;

  return {
    items: rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}
