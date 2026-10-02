import "server-only";

import { and, count, desc, eq, isNull, like, ne, or, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema/core";
import { orders } from "@/server/db/schema/commerce";
import { bookings, kundaliOrders } from "@/server/db/schema/consult";
import { inquiries } from "@/server/db/schema/crm";
import { requireAdmin } from "@/server/auth/guards";
import { revokeUserSessions } from "@/server/auth/session";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { toCsv } from "@/server/csv";
import { formatIst } from "@/lib/core/ist";
import type { UserStatus, OrderStatus, PaymentStatus, PaymentMethod, BookingStatus, KundaliStatus, InquiryStatus } from "@/lib/domain/enums";

export type CustomerListItem = {
  id: number;
  key: string;
  name: string | null;
  email: string;
  phone: string | null;
  status: UserStatus;
  ordersCount: number;
  totalSpentInr: number;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export type CustomerListResult = {
  items: CustomerListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type GuestListItem = {
  key: string;
  email: string;
  name: string | null;
  phone: string | null;
  ordersCount: number;
  totalSpentInr: number;
  lastOrderAt: Date;
};

export type GuestListResult = {
  items: GuestListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type CustomerProfile = {
  kind: "registered" | "guest";
  key: string;
  userId: number | null;
  name: string | null;
  email: string;
  phone: string | null;
  status: UserStatus | "guest";
  createdAt: Date | null;
  lastLoginAt: Date | null;
};

export type CustomerOrderRecord = {
  id: number;
  number: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalInr: number;
  createdAt: Date;
};

export type CustomerBookingRecord = {
  id: number;
  ref: string;
  serviceKey: string;
  mode: string;
  startAt: Date | null;
  status: BookingStatus;
  priceInr: number;
  createdAt: Date;
};

export type CustomerKundaliRecord = {
  id: number;
  ref: string;
  name: string;
  dob: string;
  place: string;
  status: KundaliStatus;
  priceInr: number;
  createdAt: Date;
};

export type CustomerInquiryRecord = {
  id: number;
  ref: string;
  kind: string;
  status: InquiryStatus;
  city: string;
  createdAt: Date;
};

export type CustomerDetail = {
  profile: CustomerProfile;
  ltv: number;
  ordersCount: number;
  firstOrderAt: Date | null;
  lastOrderAt: Date | null;
  orders: CustomerOrderRecord[];
  bookings: CustomerBookingRecord[];
  kundaliOrders: CustomerKundaliRecord[];
  inquiries: CustomerInquiryRecord[];
};

/**
 * List registered customers with pagination, search, and aggregate spend.
 */
export async function listRegistered(opts: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<CustomerListResult> {
  await requireAdmin("customers.view");

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [eq(users.role, "customer")];
  if (opts.search && opts.search.trim().length > 0) {
    const s = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        like(users.name, s),
        like(users.email, s),
        like(users.phone, s),
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [totalRes, rows] = await Promise.all([
    db.select({ count: count() }).from(users).where(whereClause),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        status: users.status,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        ordersCount: sql<number>`count(${orders.id})`,
        totalSpentInr: sql<number>`coalesce(sum(${orders.totalInr}), 0)`,
      })
      .from(users)
      .leftJoin(
        orders,
        and(
          eq(orders.userId, users.id),
          ne(orders.status, "cancelled"),
        ),
      )
      .where(whereClause)
      .groupBy(users.id)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset),
  ]);

  const total = totalRes[0]?.count ?? 0;

  return {
    items: rows.map((r) => ({
      id: r.id,
      key: `u-${r.id}`,
      name: r.name,
      email: r.email ?? "",
      phone: r.phone,
      status: r.status,
      ordersCount: Number(r.ordersCount ?? 0),
      totalSpentInr: Number(r.totalSpentInr ?? 0),
      createdAt: r.createdAt,
      lastLoginAt: r.lastLoginAt,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * List guest buyers (distinct order emails where user_id is null).
 */
export async function listGuests(opts: {
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<GuestListResult> {
  await requireAdmin("customers.view");

  const page = Math.max(1, opts.page || 1);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions = [isNull(orders.userId)];
  if (opts.search && opts.search.trim().length > 0) {
    const s = `%${opts.search.trim()}%`;
    conditions.push(
      or(
        like(orders.name, s),
        like(orders.email, s),
        like(orders.phone, s),
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [totalRes, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(distinct ${orders.email})` })
      .from(orders)
      .where(whereClause),
    db
      .select({
        email: orders.email,
        name: sql<string>`max(${orders.name})`,
        phone: sql<string>`max(${orders.phone})`,
        ordersCount: count(),
        totalSpentInr: sql<number>`coalesce(sum(${orders.totalInr}), 0)`,
        lastOrderAt: sql<Date>`max(${orders.createdAt})`,
      })
      .from(orders)
      .where(whereClause)
      .groupBy(orders.email)
      .orderBy(desc(sql`max(${orders.createdAt})`))
      .limit(pageSize)
      .offset(offset),
  ]);

  const total = Number(totalRes[0]?.count ?? 0);

  return {
    items: rows.map((r) => ({
      key: `e-${Buffer.from(r.email).toString("base64url")}`,
      email: r.email,
      name: r.name,
      phone: r.phone,
      ordersCount: Number(r.ordersCount ?? 0),
      totalSpentInr: Number(r.totalSpentInr ?? 0),
      lastOrderAt: new Date(r.lastOrderAt),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

/**
 * Get customer profile, lifetime value, and full history across orders, bookings, kundali, inquiries.
 * key: "u-<id>" or "e-<base64url email>"
 */
export async function getCustomer(key: string): Promise<CustomerDetail> {
  await requireAdmin("customers.view");

  let profile: CustomerProfile;
  let targetUserId: number | null = null;
  let targetEmail: string = "";
  let targetPhone: string | null = null;

  if (key.startsWith("u-")) {
    const uid = parseInt(key.slice(2), 10);
    if (isNaN(uid)) throw new AppError("VALIDATION_ERROR", "Invalid customer key");

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, uid))
      .limit(1);

    const user = userRows[0];
    if (!user) throw new AppError("NOT_FOUND", "Customer not found");

    targetUserId = user.id;
    targetEmail = user.email ?? "";
    targetPhone = user.phone;

    profile = {
      kind: "registered",
      key,
      userId: user.id,
      name: user.name,
      email: user.email ?? "",
      phone: user.phone,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  } else if (key.startsWith("e-")) {
    try {
      targetEmail = Buffer.from(key.slice(2), "base64url").toString("utf-8");
    } catch {
      throw new AppError("VALIDATION_ERROR", "Invalid email key");
    }

    // Check if a registered user exists with this email
    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.email, targetEmail))
      .limit(1);

    if (userRows[0]) {
      const user = userRows[0];
      targetUserId = user.id;
      targetPhone = user.phone;

      profile = {
        kind: "registered",
        key: `u-${user.id}`,
        userId: user.id,
        name: user.name,
        email: user.email ?? targetEmail,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      };
    } else {
      // Find guest order info
      const guestRows = await db
        .select({
          name: orders.name,
          phone: orders.phone,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.email, targetEmail))
        .orderBy(desc(orders.createdAt))
        .limit(1);

      if (guestRows.length === 0) {
        throw new AppError("NOT_FOUND", "Guest buyer not found");
      }

      targetPhone = guestRows[0]?.phone ?? null;

      profile = {
        kind: "guest",
        key,
        userId: null,
        name: guestRows[0]?.name ?? null,
        email: targetEmail,
        phone: targetPhone,
        status: "guest",
        createdAt: guestRows[0]?.createdAt ?? null,
        lastLoginAt: null,
      };
    }
  } else {
    throw new AppError("VALIDATION_ERROR", "Invalid customer key format");
  }

  // Build match conditions across all customer contact points
  const orderConditions = [];
  if (targetUserId) orderConditions.push(eq(orders.userId, targetUserId));
  if (targetEmail) orderConditions.push(eq(orders.email, targetEmail));
  if (targetPhone) orderConditions.push(eq(orders.phone, targetPhone));

  const bookingConditions = [];
  if (targetUserId) bookingConditions.push(eq(bookings.userId, targetUserId));
  if (targetEmail) bookingConditions.push(eq(bookings.email, targetEmail));
  if (targetPhone) bookingConditions.push(eq(bookings.phone, targetPhone));

  const kundaliConditions = [];
  if (targetUserId) kundaliConditions.push(eq(kundaliOrders.userId, targetUserId));
  if (targetEmail) kundaliConditions.push(eq(kundaliOrders.email, targetEmail));
  if (targetPhone) kundaliConditions.push(eq(kundaliOrders.phone, targetPhone));

  const inquiryConditions = [];
  if (targetUserId) inquiryConditions.push(eq(inquiries.userId, targetUserId));
  if (targetEmail) inquiryConditions.push(eq(inquiries.email, targetEmail));
  if (targetPhone) inquiryConditions.push(eq(inquiries.phone, targetPhone));

  const [orderList, bookingList, kundaliList, inquiryList] = await Promise.all([
    orderConditions.length > 0
      ? db
          .select({
            id: orders.id,
            number: orders.number,
            status: orders.status,
            paymentStatus: orders.paymentStatus,
            paymentMethod: orders.paymentMethod,
            totalInr: orders.totalInr,
            refundedInr: orders.refundedInr,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .where(or(...orderConditions))
          .orderBy(desc(orders.createdAt))
      : Promise.resolve([]),
    bookingConditions.length > 0
      ? db
          .select({
            id: bookings.id,
            ref: bookings.ref,
            serviceKey: bookings.serviceKey,
            mode: bookings.mode,
            startAt: bookings.startAt,
            status: bookings.status,
            priceInr: bookings.priceInr,
            paidAt: bookings.paidAt,
            createdAt: bookings.createdAt,
          })
          .from(bookings)
          .where(or(...bookingConditions))
          .orderBy(desc(bookings.createdAt))
      : Promise.resolve([]),
    kundaliConditions.length > 0
      ? db
          .select({
            id: kundaliOrders.id,
            ref: kundaliOrders.ref,
            name: kundaliOrders.name,
            dob: kundaliOrders.dob,
            place: kundaliOrders.place,
            status: kundaliOrders.status,
            priceInr: kundaliOrders.priceInr,
            createdAt: kundaliOrders.createdAt,
          })
          .from(kundaliOrders)
          .where(or(...kundaliConditions))
          .orderBy(desc(kundaliOrders.createdAt))
      : Promise.resolve([]),
    inquiryConditions.length > 0
      ? db
          .select({
            id: inquiries.id,
            ref: inquiries.ref,
            kind: inquiries.kind,
            status: inquiries.status,
            city: inquiries.city,
            createdAt: inquiries.createdAt,
          })
          .from(inquiries)
          .where(or(...inquiryConditions))
          .orderBy(desc(inquiries.createdAt))
      : Promise.resolve([]),
  ]);

  // Compute LTV: orders paid or delivered COD + paid kundali reports + paid bookings
  let ltv = 0;
  for (const o of orderList) {
    if (o.status === "cancelled") continue;
    if (
      o.paymentStatus === "paid" ||
      (o.paymentMethod === "cod" && o.status === "delivered")
    ) {
      ltv += Math.max(0, o.totalInr - (o.refundedInr ?? 0));
    }
  }

  for (const k of kundaliList) {
    if (k.status === "paid" || k.status === "generating" || k.status === "ready") {
      ltv += k.priceInr;
    }
  }

  for (const b of bookingList) {
    if (b.paidAt && (b.status === "confirmed" || b.status === "completed")) {
      ltv += b.priceInr;
    }
  }

  const sortedDates = orderList
    .map((o) => o.createdAt.getTime())
    .sort((a, b) => a - b);
  const firstOrderAt = sortedDates.length > 0 ? new Date(sortedDates[0]!) : null;
  const lastOrderAt = sortedDates.length > 0 ? new Date(sortedDates[sortedDates.length - 1]!) : null;

  return {
    profile,
    ltv,
    ordersCount: orderList.length,
    firstOrderAt,
    lastOrderAt,
    orders: orderList.map((o) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      totalInr: o.totalInr,
      createdAt: o.createdAt,
    })),
    bookings: bookingList.map((b) => ({
      id: b.id,
      ref: b.ref,
      serviceKey: b.serviceKey,
      mode: b.mode,
      startAt: b.startAt,
      status: b.status,
      priceInr: b.priceInr,
      createdAt: b.createdAt,
    })),
    kundaliOrders: kundaliList.map((k) => ({
      id: k.id,
      ref: k.ref,
      name: k.name,
      dob: k.dob,
      place: k.place,
      status: k.status,
      priceInr: k.priceInr,
      createdAt: k.createdAt,
    })),
    inquiries: inquiryList.map((i) => ({
      id: i.id,
      ref: i.ref,
      kind: i.kind,
      status: i.status,
      city: i.city,
      createdAt: i.createdAt,
    })),
  };
}

/**
 * Block or unblock a registered customer.
 * If blocking, revoke all active sessions immediately.
 */
export async function setCustomerBlocked(
  userId: number,
  blocked: boolean,
): Promise<{ success: true; blocked: boolean }> {
  const admin = await requireAdmin("customers.edit");

  const [target] = await db
    .select({ id: users.id, role: users.role, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!target) {
    throw new AppError("NOT_FOUND", "Customer not found");
  }

  if (target.role !== "customer") {
    throw new AppError("FORBIDDEN", "Only customers can be blocked from this interface");
  }

  await db
    .update(users)
    .set({
      status: blocked ? "blocked" : "active",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  if (blocked) {
    await revokeUserSessions(userId);
  }

  await audit({
    actorId: admin.id,
    action: "customer.block",
    entity: "user",
    entityId: String(userId),
    summary: `${blocked ? "Blocked" : "Unblocked"} customer #${userId} (${target.email})`,
    diff: { status: [target.role, blocked ? "blocked" : "active"] },
  });

  return { success: true, blocked };
}

/**
 * Export registered customers to CSV.
 */
export async function exportCustomersCsv(): Promise<string> {
  const admin = await requireAdmin("exports.run");

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      status: users.status,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      ordersCount: sql<number>`count(${orders.id})`,
      totalSpentInr: sql<number>`coalesce(sum(${orders.totalInr}), 0)`,
    })
    .from(users)
    .leftJoin(
      orders,
      and(
        eq(orders.userId, users.id),
        ne(orders.status, "cancelled"),
      ),
    )
    .where(eq(users.role, "customer"))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(5000);

  const csv = toCsv(rows, [
    { header: "Customer ID", value: (c) => `u-${c.id}` },
    { header: "Name", value: (c) => c.name ?? "" },
    { header: "Email", value: (c) => c.email ?? "" },
    { header: "Phone", value: (c) => c.phone ?? "" },
    { header: "Status", value: (c) => c.status },
    { header: "Orders Count", value: (c) => Number(c.ordersCount ?? 0) },
    { header: "Total Spent (INR)", value: (c) => Number(c.totalSpentInr ?? 0) },
    { header: "Joined Date (IST)", value: (c) => formatIst(c.createdAt, { time: true }) },
    { header: "Last Login (IST)", value: (c) => (c.lastLoginAt ? formatIst(c.lastLoginAt, { time: true }) : "") },
  ]);

  await audit({
    actorId: admin.id,
    action: "export.customers",
    entity: "users",
    entityId: "all",
    summary: `Exported ${rows.length} customers to CSV`,
  });

  return csv;
}
