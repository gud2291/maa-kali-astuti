import "server-only";
import { and, count, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { messages, subscribers } from "@/server/db/schema/crm";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { toCsv } from "@/server/csv";
import type { MessageStatus, SubscriberStatus } from "@/lib/domain/enums";

/* ---------- Messages ---------- */

export type MessageAdminItem = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  topic: string;
  body: string;
  locale: string;
  status: MessageStatus;
  ip: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MessageStatusCounts = Record<MessageStatus | "all", number>;

export type MessageListResult = {
  items: MessageAdminItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: MessageStatusCounts;
};

export async function listMessages(opts: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<MessageListResult> {
  await requireAdmin("messages.view");

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(messages.status, opts.status as MessageStatus));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ count: count() })
    .from(messages)
    .where(whereClause);
  const total = totalRow?.count ?? 0;

  const statusRows = await db
    .select({ status: messages.status, count: count() })
    .from(messages)
    .groupBy(messages.status);

  const counts: MessageStatusCounts = { all: 0, new: 0, replied: 0, closed: 0 };
  let allCount = 0;
  for (const row of statusRows) {
    const s = row.status as MessageStatus;
    if (s in counts) {
      counts[s] = row.count;
      allCount += row.count;
    }
  }
  counts.all = allCount;

  const rows = await db
    .select({
      id: messages.id,
      name: messages.name,
      phone: messages.phone,
      email: messages.email,
      topic: messages.topic,
      body: messages.body,
      locale: messages.locale,
      status: messages.status,
      ip: messages.ip,
      createdAt: messages.createdAt,
      updatedAt: messages.updatedAt,
    })
    .from(messages)
    .where(whereClause)
    .orderBy(desc(messages.createdAt))
    .limit(pageSize)
    .offset(offset);

  const items: MessageAdminItem[] = rows.map((r) => ({
    ...r,
    status: r.status as MessageStatus,
  }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    counts,
  };
}

export async function setMessageStatus(
  id: number,
  status: MessageStatus,
): Promise<{ success: true }> {
  const admin = await requireAdmin("messages.view");

  const [row] = await db
    .select({ status: messages.status })
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);

  if (!row) {
    throw new AppError("NOT_FOUND", "Message not found");
  }

  const from = row.status;

  await db
    .update(messages)
    .set({ status, updatedAt: new Date() })
    .where(eq(messages.id, id));

  await audit({
    actorId: admin.id,
    action: "messages.status",
    entity: "message",
    entityId: id,
    summary: `Changed message #${id} status from ${from} to ${status}`,
  });

  return { success: true };
}

/* ---------- Subscribers ---------- */

export type SubscriberAdminItem = {
  id: number;
  email: string;
  locale: string;
  source: string;
  status: SubscriberStatus;
  createdAt: Date;
  unsubscribedAt: Date | null;
};

export type SubscriberListResult = {
  items: SubscriberAdminItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listSubscribers(opts: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<SubscriberListResult> {
  await requireAdmin("messages.view");

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [];
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(subscribers.status, opts.status as SubscriberStatus));
  }
  if (opts.search && opts.search.trim()) {
    conditions.push(like(subscribers.email, `%${opts.search.trim()}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRow] = await db
    .select({ count: count() })
    .from(subscribers)
    .where(whereClause);
  const total = totalRow?.count ?? 0;

  const rows = await db
    .select({
      id: subscribers.id,
      email: subscribers.email,
      locale: subscribers.locale,
      source: subscribers.source,
      status: subscribers.status,
      createdAt: subscribers.createdAt,
      unsubscribedAt: subscribers.unsubscribedAt,
    })
    .from(subscribers)
    .where(whereClause)
    .orderBy(desc(subscribers.createdAt))
    .limit(pageSize)
    .offset(offset);

  const items: SubscriberAdminItem[] = rows.map((r) => ({
    ...r,
    status: r.status as SubscriberStatus,
  }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function countSubscribers(): Promise<{ subscribed: number; unsubscribed: number; total: number }> {
  await requireAdmin("messages.view");

  const rows = await db
    .select({ status: subscribers.status, count: count() })
    .from(subscribers)
    .groupBy(subscribers.status);

  let subscribed = 0;
  let unsubscribed = 0;
  for (const r of rows) {
    if (r.status === "subscribed") subscribed = r.count;
    else if (r.status === "unsubscribed") unsubscribed = r.count;
  }

  return { subscribed, unsubscribed, total: subscribed + unsubscribed };
}

export async function exportSubscribersCsv(): Promise<string> {
  const admin = await requireAdmin("exports.run");

  const rows = await db
    .select({
      email: subscribers.email,
      locale: subscribers.locale,
      source: subscribers.source,
      status: subscribers.status,
      createdAt: subscribers.createdAt,
      unsubscribedAt: subscribers.unsubscribedAt,
    })
    .from(subscribers)
    .orderBy(desc(subscribers.createdAt));

  const csv = toCsv(rows, [
    { header: "Email", value: (r) => r.email },
    { header: "Locale", value: (r) => r.locale },
    { header: "Source", value: (r) => r.source },
    { header: "Status", value: (r) => r.status },
    { header: "Subscribed At", value: (r) => (r.createdAt ? new Date(r.createdAt).toISOString() : "") },
    { header: "Unsubscribed At", value: (r) => (r.unsubscribedAt ? new Date(r.unsubscribedAt).toISOString() : "") },
  ]);

  await audit({
    actorId: admin.id,
    action: "subscribers.export",
    entity: "subscriber",
    entityId: "all",
    summary: `Exported ${rows.length} subscribers to CSV`,
  });

  return csv;
}

export async function deleteSubscriber(id: number): Promise<{ success: true }> {
  const admin = await requireAdmin("messages.view");

  const [row] = await db
    .select({ email: subscribers.email })
    .from(subscribers)
    .where(eq(subscribers.id, id))
    .limit(1);

  if (!row) {
    throw new AppError("NOT_FOUND", "Subscriber not found");
  }

  await db.delete(subscribers).where(eq(subscribers.id, id));

  await audit({
    actorId: admin.id,
    action: "subscribers.delete",
    entity: "subscriber",
    entityId: id,
    summary: `Deleted subscriber ${row.email}`,
  });

  return { success: true };
}
