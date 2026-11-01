import "server-only";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, payments, refunds } from "@/server/db/schema/commerce";
import { istDayKey } from "@/lib/core/ist";
import { PAY_ENTITIES, PAYMENT_ROW_STATUS, type PayEntity, type PaymentRowStatus } from "@/lib/domain/enums";

export const PAYMENTS_PAGE_SIZE = 25;

export type PaymentListRow = {
  id: number;
  entity: PayEntity;
  entityId: number;
  /** Order number when the payment is for a shop order, otherwise null. */
  orderNumber: string | null;
  orderId: number | null;
  provider: string;
  method: string | null;
  amountInr: number;
  status: PaymentRowStatus;
  rzpPaymentId: string | null;
  error: string | null;
  createdAt: Date;
};

export type PaymentSummary = {
  capturedTodayInr: number;
  capturedMonthInr: number;
  failed7d: number;
  refundedMonthInr: number;
  awaiting: number;
};

export async function paymentSummary(): Promise<PaymentSummary> {
  const todayKey = istDayKey(new Date());
  const dayStart = new Date(`${todayKey}T00:00:00+05:30`);
  const monthStart = new Date(`${todayKey.slice(0, 7)}-01T00:00:00+05:30`);
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600_000);

  const captured = (since: Date) =>
    db
      .select({ v: sql<number>`coalesce(sum(${payments.amountInr}), 0)`.mapWith(Number) })
      .from(payments)
      .where(and(eq(payments.status, "captured"), gte(payments.createdAt, since)));

  const [[today], [month], [failed], [refunded], [awaiting]] = await Promise.all([
    captured(dayStart),
    captured(monthStart),
    db
      .select({ v: count() })
      .from(payments)
      .where(and(eq(payments.status, "failed"), gte(payments.createdAt, weekAgo))),
    db
      .select({ v: sql<number>`coalesce(sum(${refunds.amountInr}), 0)`.mapWith(Number) })
      .from(refunds)
      .where(and(eq(refunds.status, "processed"), gte(refunds.createdAt, monthStart))),
    db
      .select({ v: count() })
      .from(payments)
      .where(and(eq(payments.status, "created"), gte(payments.createdAt, weekAgo))),
  ]);

  return {
    capturedTodayInr: today?.v ?? 0,
    capturedMonthInr: month?.v ?? 0,
    failed7d: failed?.v ?? 0,
    refundedMonthInr: refunded?.v ?? 0,
    awaiting: awaiting?.v ?? 0,
  };
}

export async function listPayments(opts: {
  status?: string;
  entity?: string;
  page: number;
}): Promise<{ rows: PaymentListRow[]; total: number; totalPages: number }> {
  const conds = [];
  if (opts.status && (PAYMENT_ROW_STATUS as readonly string[]).includes(opts.status)) {
    conds.push(eq(payments.status, opts.status as PaymentRowStatus));
  }
  if (opts.entity && (PAY_ENTITIES as readonly string[]).includes(opts.entity)) {
    conds.push(eq(payments.entity, opts.entity as PayEntity));
  }
  const where = conds.length ? and(...conds) : undefined;
  const page = Math.max(1, opts.page);

  const [[totalRow], rows] = await Promise.all([
    db.select({ v: count() }).from(payments).where(where),
    db
      .select({
        id: payments.id,
        entity: payments.entity,
        entityId: payments.entityId,
        orderNumber: orders.number,
        orderId: orders.id,
        provider: payments.provider,
        method: payments.method,
        amountInr: payments.amountInr,
        status: payments.status,
        rzpPaymentId: payments.rzpPaymentId,
        error: payments.error,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .leftJoin(orders, and(eq(payments.entity, "order"), eq(orders.id, payments.entityId)))
      .where(where)
      .orderBy(desc(payments.createdAt), desc(payments.id))
      .limit(PAYMENTS_PAGE_SIZE)
      .offset((page - 1) * PAYMENTS_PAGE_SIZE),
  ]);

  const total = totalRow?.v ?? 0;
  return { rows, total, totalPages: Math.max(1, Math.ceil(total / PAYMENTS_PAGE_SIZE)) };
}
