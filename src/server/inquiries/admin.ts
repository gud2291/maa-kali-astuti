import "server-only";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/server/db/client";
import { inquiries, inquiryEvents, paymentLinks } from "@/server/db/schema/crm";
import { users } from "@/server/db/schema/core";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { ADMIN_ROLES, type CourseKey, type InquiryKind, type InquiryStatus, type Locale } from "@/lib/domain/enums";
import type { PaymentLinkRow } from "./links";

export type InquiryAdminListItem = {
  id: number;
  ref: string;
  kind: InquiryKind;
  courseKey: CourseKey | null;
  name: string;
  phone: string;
  email: string | null;
  city: string;
  exp: string | null;
  area: string | null;
  lang: string;
  why: string;
  status: InquiryStatus;
  assignedTo: number | null;
  assigneeName: string | null;
  nextActionAt: Date | null;
  feeInr: number | null;
  paidInr: number;
  createdAt: Date;
};

export type InquiryStatusCounts = Record<InquiryStatus | "all", number>;

export type InquiryListResult = {
  items: InquiryAdminListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: InquiryStatusCounts;
};

export type InquiryEventAdmin = {
  id: number;
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  message: string | null;
  actorId: number | null;
  actorName: string | null;
  createdAt: Date;
};

export type InquiryDetailAdmin = InquiryAdminListItem & {
  locale: Locale;
  userId: number | null;
  ip: string | null;
  updatedAt: Date;
  events: InquiryEventAdmin[];
  links: PaymentLinkRow[];
};

export async function listInquiries(opts: {
  status?: string;
  kind?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<InquiryListResult> {
  await requireAdmin("inquiries.view");

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize || 20));
  const offset = (page - 1) * pageSize;

  // Build filter conditions
  const conditions = [];

  if (opts.status && opts.status !== "all") {
    conditions.push(eq(inquiries.status, opts.status as InquiryStatus));
  }

  if (opts.kind && opts.kind !== "all") {
    conditions.push(eq(inquiries.kind, opts.kind as InquiryKind));
  }

  if (opts.search && opts.search.trim()) {
    const s = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        ilike(inquiries.ref, s),
        ilike(inquiries.name, s),
        ilike(inquiries.phone, s),
        ilike(inquiries.city, s),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 1. Fetch total count for current query
  const [totalRow] = await db
    .select({ count: count() })
    .from(inquiries)
    .where(whereClause);
  const total = totalRow?.count ?? 0;

  // 2. Fetch status counts across all inquiries
  const statusRows = await db
    .select({
      status: inquiries.status,
      count: count(),
    })
    .from(inquiries)
    .groupBy(inquiries.status);

  const counts: InquiryStatusCounts = {
    all: 0,
    new: 0,
    contacted: 0,
    call_scheduled: 0,
    approved: 0,
    enrolled: 0,
    declined: 0,
    closed: 0,
  };

  let allCount = 0;
  for (const row of statusRows) {
    const s = row.status as InquiryStatus;
    if (s in counts) {
      counts[s] = row.count;
      allCount += row.count;
    }
  }
  counts.all = allCount;

  // 3. Fetch paginated list
  const rows = await db
    .select({
      inquiry: inquiries,
      assigneeName: users.name,
    })
    .from(inquiries)
    .leftJoin(users, eq(inquiries.assignedTo, users.id))
    .where(whereClause)
    .orderBy(desc(inquiries.createdAt))
    .limit(pageSize)
    .offset(offset);

  const items: InquiryAdminListItem[] = rows.map(({ inquiry, assigneeName }) => ({
    id: inquiry.id,
    ref: inquiry.ref,
    kind: inquiry.kind as InquiryKind,
    courseKey: inquiry.courseKey as CourseKey | null,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    city: inquiry.city,
    exp: inquiry.exp,
    area: inquiry.area,
    lang: inquiry.lang,
    why: inquiry.why,
    status: inquiry.status as InquiryStatus,
    assignedTo: inquiry.assignedTo,
    assigneeName,
    nextActionAt: inquiry.nextActionAt,
    feeInr: inquiry.feeInr,
    paidInr: inquiry.paidInr,
    createdAt: inquiry.createdAt,
  }));

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
    counts,
  };
}

export async function getInquiryAdmin(id: number): Promise<InquiryDetailAdmin> {
  await requireAdmin("inquiries.view");

  const [row] = await db
    .select({
      inquiry: inquiries,
      assigneeName: users.name,
    })
    .from(inquiries)
    .leftJoin(users, eq(inquiries.assignedTo, users.id))
    .where(eq(inquiries.id, id))
    .limit(1);

  if (!row) {
    throw new AppError("NOT_FOUND", "Inquiry not found");
  }

  const { inquiry, assigneeName } = row;

  // Load events
  const eventRows = await db
    .select({
      event: inquiryEvents,
      actorName: users.name,
    })
    .from(inquiryEvents)
    .leftJoin(users, eq(inquiryEvents.actorId, users.id))
    .where(eq(inquiryEvents.inquiryId, id))
    .orderBy(desc(inquiryEvents.createdAt));

  const events: InquiryEventAdmin[] = eventRows.map(({ event, actorName }) => ({
    id: event.id,
    type: event.type,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    message: event.message,
    actorId: event.actorId,
    actorName,
    createdAt: event.createdAt,
  }));

  // Load payment links
  const links = await db
    .select()
    .from(paymentLinks)
    .where(and(eq(paymentLinks.entity, "inquiry"), eq(paymentLinks.entityId, id)))
    .orderBy(desc(paymentLinks.createdAt));

  return {
    id: inquiry.id,
    ref: inquiry.ref,
    kind: inquiry.kind as InquiryKind,
    courseKey: inquiry.courseKey as CourseKey | null,
    locale: inquiry.locale as Locale,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    city: inquiry.city,
    exp: inquiry.exp,
    area: inquiry.area,
    lang: inquiry.lang,
    why: inquiry.why,
    status: inquiry.status as InquiryStatus,
    assignedTo: inquiry.assignedTo,
    assigneeName,
    nextActionAt: inquiry.nextActionAt,
    feeInr: inquiry.feeInr,
    paidInr: inquiry.paidInr,
    userId: inquiry.userId,
    ip: inquiry.ip,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
    events,
    links,
  };
}

export async function setInquiryStatus(
  id: number,
  to: InquiryStatus,
  note?: string,
): Promise<{ success: true }> {
  const admin = await requireAdmin("inquiries.update");

  const [inquiry] = await db
    .select({ status: inquiries.status })
    .from(inquiries)
    .where(eq(inquiries.id, id))
    .limit(1);

  if (!inquiry) {
    throw new AppError("NOT_FOUND", "Inquiry not found");
  }

  const fromStatus = inquiry.status;

  await db
    .update(inquiries)
    .set({
      status: to,
      updatedAt: new Date(),
    })
    .where(eq(inquiries.id, id));

  await db.insert(inquiryEvents).values({
    inquiryId: id,
    type: "status",
    fromStatus,
    toStatus: to,
    message: note?.trim() || `Status updated from ${fromStatus} to ${to}`,
    actorId: admin.id,
  });

  await audit({
    actorId: admin.id,
    action: "inquiries.status",
    entity: "inquiry",
    entityId: id,
    summary: `Changed inquiry #${id} status from ${fromStatus} to ${to}`,
  });

  return { success: true };
}

export async function assignInquiry(
  id: number,
  userId: number | null,
): Promise<{ success: true }> {
  const admin = await requireAdmin("inquiries.update");

  let assigneeName: string | null = null;
  if (userId) {
    const [user] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    assigneeName = user?.name ?? `User #${userId}`;
  }

  await db
    .update(inquiries)
    .set({
      assignedTo: userId,
      updatedAt: new Date(),
    })
    .where(eq(inquiries.id, id));

  await db.insert(inquiryEvents).values({
    inquiryId: id,
    type: "assigned",
    message: userId ? `Assigned to ${assigneeName}` : "Unassigned",
    actorId: admin.id,
  });

  await audit({
    actorId: admin.id,
    action: "inquiries.assign",
    entity: "inquiry",
    entityId: id,
    summary: userId ? `Assigned inquiry #${id} to ${assigneeName}` : `Unassigned inquiry #${id}`,
  });

  return { success: true };
}

export async function setNextAction(
  id: number,
  at: Date | null,
): Promise<{ success: true }> {
  const admin = await requireAdmin("inquiries.update");

  await db
    .update(inquiries)
    .set({
      nextActionAt: at,
      updatedAt: new Date(),
    })
    .where(eq(inquiries.id, id));

  await db.insert(inquiryEvents).values({
    inquiryId: id,
    type: "next_action",
    message: at
      ? `Next action scheduled for ${at.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}`
      : "Next action date cleared",
    actorId: admin.id,
  });

  await audit({
    actorId: admin.id,
    action: "inquiries.next_action",
    entity: "inquiry",
    entityId: id,
    summary: at
      ? `Set next action for inquiry #${id} to ${at.toISOString()}`
      : `Cleared next action for inquiry #${id}`,
  });

  return { success: true };
}

export async function setFee(
  id: number,
  feeInr: number | null,
): Promise<{ success: true }> {
  const admin = await requireAdmin("inquiries.update");

  await db
    .update(inquiries)
    .set({
      feeInr,
      updatedAt: new Date(),
    })
    .where(eq(inquiries.id, id));

  await db.insert(inquiryEvents).values({
    inquiryId: id,
    type: "fee",
    message: feeInr != null ? `Fee set to ₹${feeInr}` : "Fee cleared",
    actorId: admin.id,
  });

  await audit({
    actorId: admin.id,
    action: "inquiries.fee",
    entity: "inquiry",
    entityId: id,
    summary: feeInr != null ? `Set fee for inquiry #${id} to ₹${feeInr}` : `Cleared fee for inquiry #${id}`,
  });

  return { success: true };
}

export async function addInquiryNote(
  id: number,
  note: string,
): Promise<{ success: true }> {
  const admin = await requireAdmin("inquiries.update");

  const trimmed = note.trim();
  if (!trimmed) {
    throw new AppError("VALIDATION", "Note cannot be empty");
  }

  await db.insert(inquiryEvents).values({
    inquiryId: id,
    type: "note",
    message: trimmed,
    actorId: admin.id,
  });

  await audit({
    actorId: admin.id,
    action: "inquiries.note",
    entity: "inquiry",
    entityId: id,
    summary: `Added note to inquiry #${id}`,
  });

  return { success: true };
}

export async function listStaffUsers(): Promise<{ id: number; name: string | null; role: string }[]> {
  await requireAdmin("inquiries.view");

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      role: users.role,
    })
    .from(users)
    .where(inArray(users.role, [...ADMIN_ROLES]));

  return rows;
}
