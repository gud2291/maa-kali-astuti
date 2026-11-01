import "server-only";

import { and, asc, count, desc, eq, gte, inArray, lt, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, orderItems, reviews } from "@/server/db/schema/commerce";
import { bookings, kundaliOrders } from "@/server/db/schema/consult";
import { inquiries, messages } from "@/server/db/schema/crm";
import { products } from "@/server/db/schema/catalog";
import { requireAdmin } from "@/server/auth/guards";
import { can } from "@/lib/domain/permissions";
import { addDaysKey, istDayKey, istWallToUtc, formatIst } from "@/lib/core/ist";
import type { OrderStatus, PaymentMethod, PaymentStatus, BookingStatus } from "@/lib/domain/enums";

export type DashboardKpis = {
  todayKey: string;
  monthStartKey: string;
  revenueToday: number;
  revenueMonth: number;
  ordersToday: number;
  pendingEnergization: number;
  bookingsToday: number;
  kundaliSalesCount: number;
  kundaliSalesInr: number;
  openInquiries: number;
  lowStockCount: number;
  needsAttentionOrders: number;
};

export type RevenueSeriesDay = {
  dayKey: string;
  label: string;
  revenue: number;
  ordersCount: number;
};

export type TopProductItem = {
  productId: string;
  nameEn: string;
  nameHi: string;
  slug: string;
  image: string | null;
  totalQty: number;
  totalRevenue: number;
};

export type RecentOrderItem = {
  id: number;
  number: string;
  name: string;
  phone: string;
  email: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalInr: number;
  createdAt: Date;
  needsAttention: boolean;
  attentionReason: string | null;
};

export type UpcomingBookingItem = {
  id: number;
  ref: string;
  name: string;
  phone: string;
  email: string | null;
  serviceKey: string;
  tierKey: string;
  mode: string;
  startAt: Date | null;
  endAt: Date | null;
  status: BookingStatus;
  priceInr: number;
  meetingLink: string | null;
};

export type LowStockProductItem = {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  priceInr: number;
  stock: number;
  lowStockAt: number;
  legacyPhoto: string | null;
};

export type BadgeCounts = {
  orders: number;
  attention: number;
  inquiries: number;
  messages: number;
  reviews: number;
};

/**
 * Fetch KPI aggregates for the admin dashboard.
 * Requires "dashboard.view" permission.
 */
export async function getKpis(): Promise<DashboardKpis> {
  await requireAdmin("dashboard.view");

  const now = new Date();
  const todayKey = istDayKey(now);
  const startOfTodayUtc = istWallToUtc(todayKey, "00:00");
  const tomorrowKey = addDaysKey(todayKey, 1);
  const endOfTodayUtc = istWallToUtc(tomorrowKey, "00:00");

  const [yStr, mStr] = todayKey.split("-");
  const monthStartKey = `${yStr}-${mStr}-01`;
  const startOfMonthUtc = istWallToUtc(monthStartKey, "00:00");

  // Revenue filter: orders paid or COD placed, not cancelled
  const revenueFilter = and(
    ne(orders.status, "cancelled"),
    or(eq(orders.paymentStatus, "paid"), eq(orders.paymentMethod, "cod")),
  );

  const [
    revTodayRes,
    revMonthRes,
    ordersTodayRes,
    pendingEnergRes,
    bookingsTodayRes,
    kundaliMonthRes,
    openInquiriesRes,
    lowStockRes,
    attentionRes,
  ] = await Promise.all([
    db
      .select({ revenue: sql<number>`coalesce(sum(${orders.totalInr}), 0)`.mapWith(Number) })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfTodayUtc),
          lt(orders.createdAt, endOfTodayUtc),
          revenueFilter,
        ),
      ),
    db
      .select({ revenue: sql<number>`coalesce(sum(${orders.totalInr}), 0)`.mapWith(Number) })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfMonthUtc),
          lt(orders.createdAt, endOfTodayUtc),
          revenueFilter,
        ),
      ),
    db
      .select({ count: count() })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, startOfTodayUtc),
          lt(orders.createdAt, endOfTodayUtc),
        ),
      ),
    db
      .select({ count: count() })
      .from(orders)
      .where(inArray(orders.status, ["placed", "energizing"])),
    db
      .select({ count: count() })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, "confirmed"),
          gte(bookings.startAt, startOfTodayUtc),
          lt(bookings.startAt, endOfTodayUtc),
        ),
      ),
    db
      .select({
        count: count(),
        totalInr: sql<number>`coalesce(sum(${kundaliOrders.priceInr}), 0)`.mapWith(Number),
      })
      .from(kundaliOrders)
      .where(
        and(
          inArray(kundaliOrders.status, ["paid", "generating", "ready"]),
          gte(kundaliOrders.createdAt, startOfMonthUtc),
          lt(kundaliOrders.createdAt, endOfTodayUtc),
        ),
      ),
    db
      .select({ count: count() })
      .from(inquiries)
      .where(inArray(inquiries.status, ["new", "contacted", "call_scheduled"])),
    db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.status, "active"),
          lte(products.stock, products.lowStockAt),
        ),
      ),
    db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.needsAttention, true)),
  ]);

  return {
    todayKey,
    monthStartKey,
    revenueToday: Number(revTodayRes[0]?.revenue ?? 0),
    revenueMonth: Number(revMonthRes[0]?.revenue ?? 0),
    ordersToday: ordersTodayRes[0]?.count ?? 0,
    pendingEnergization: pendingEnergRes[0]?.count ?? 0,
    bookingsToday: bookingsTodayRes[0]?.count ?? 0,
    kundaliSalesCount: kundaliMonthRes[0]?.count ?? 0,
    kundaliSalesInr: Number(kundaliMonthRes[0]?.totalInr ?? 0),
    openInquiries: openInquiriesRes[0]?.count ?? 0,
    lowStockCount: lowStockRes[0]?.count ?? 0,
    needsAttentionOrders: attentionRes[0]?.count ?? 0,
  };
}

/**
 * 30-day revenue series grouped by IST day.
 */
export async function getRevenueSeries(days = 30): Promise<RevenueSeriesDay[]> {
  await requireAdmin("dashboard.view");

  const now = new Date();
  const todayKey = istDayKey(now);
  const startDayKey = addDaysKey(todayKey, -(days - 1));
  const startUtc = istWallToUtc(startDayKey, "00:00");
  const endUtc = istWallToUtc(addDaysKey(todayKey, 1), "00:00");

  const dayCol = sql<string>`to_char(${orders.createdAt} AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD')`;

  const dbRows = await db
    .select({
      day: dayCol,
      revenue: sql<number>`coalesce(sum(${orders.totalInr}), 0)`.mapWith(Number),
      ordersCount: count(),
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, startUtc),
        lt(orders.createdAt, endUtc),
        ne(orders.status, "cancelled"),
        or(eq(orders.paymentStatus, "paid"), eq(orders.paymentMethod, "cod")),
      ),
    )
    .groupBy(dayCol)
    .orderBy(asc(dayCol));

  const map = new Map<string, { revenue: number; ordersCount: number }>();
  for (const row of dbRows) {
    if (row.day) {
      map.set(row.day, {
        revenue: Number(row.revenue ?? 0),
        ordersCount: Number(row.ordersCount ?? 0),
      });
    }
  }

  const series: RevenueSeriesDay[] = [];
  for (let i = 0; i < days; i++) {
    const k = addDaysKey(startDayKey, i);
    const item = map.get(k);
    const dUtc = istWallToUtc(k, "12:00");
    const label = formatIst(dUtc, { date: true });

    series.push({
      dayKey: k,
      label,
      revenue: item?.revenue ?? 0,
      ordersCount: item?.ordersCount ?? 0,
    });
  }

  return series;
}

/**
 * Top selling products in the last N days by quantity sold.
 */
export async function getTopProducts(days = 30, limit = 5): Promise<TopProductItem[]> {
  await requireAdmin("dashboard.view");

  const now = new Date();
  const todayKey = istDayKey(now);
  const startDayKey = addDaysKey(todayKey, -(days - 1));
  const startUtc = istWallToUtc(startDayKey, "00:00");
  const endUtc = istWallToUtc(addDaysKey(todayKey, 1), "00:00");

  const rows = await db
    .select({
      productId: orderItems.productId,
      nameEn: orderItems.nameEn,
      nameHi: orderItems.nameHi,
      slug: orderItems.slug,
      image: orderItems.image,
      totalQty: sql<number>`coalesce(sum(${orderItems.qty}), 0)`.mapWith(Number),
      totalRevenue: sql<number>`coalesce(sum(${orderItems.lineTotalInr}), 0)`.mapWith(Number),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        gte(orders.createdAt, startUtc),
        lt(orders.createdAt, endUtc),
        ne(orders.status, "cancelled"),
        or(eq(orders.paymentStatus, "paid"), eq(orders.paymentMethod, "cod")),
      ),
    )
    .groupBy(
      orderItems.productId,
      orderItems.nameEn,
      orderItems.nameHi,
      orderItems.slug,
      orderItems.image,
    )
    .orderBy(desc(sql`sum(${orderItems.qty})`))
    .limit(limit);

  return rows.map((r) => ({
    productId: r.productId,
    nameEn: r.nameEn,
    nameHi: r.nameHi,
    slug: r.slug,
    image: r.image,
    totalQty: Number(r.totalQty),
    totalRevenue: Number(r.totalRevenue),
  }));
}

/**
 * Get recent orders for the dashboard (compact list).
 */
export async function getRecentOrders(limit = 8): Promise<RecentOrderItem[]> {
  await requireAdmin("dashboard.view");

  const rows = await db
    .select({
      id: orders.id,
      number: orders.number,
      name: orders.name,
      phone: orders.phone,
      email: orders.email,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentMethod: orders.paymentMethod,
      totalInr: orders.totalInr,
      createdAt: orders.createdAt,
      needsAttention: orders.needsAttention,
      attentionReason: orders.attentionReason,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);

  return rows;
}

/**
 * Get upcoming confirmed/active bookings.
 */
export async function getUpcomingBookings(limit = 8): Promise<UpcomingBookingItem[]> {
  await requireAdmin("dashboard.view");

  const now = new Date();

  const rows = await db
    .select({
      id: bookings.id,
      ref: bookings.ref,
      name: bookings.name,
      phone: bookings.phone,
      email: bookings.email,
      serviceKey: bookings.serviceKey,
      tierKey: bookings.tierKey,
      mode: bookings.mode,
      startAt: bookings.startAt,
      endAt: bookings.endAt,
      status: bookings.status,
      priceInr: bookings.priceInr,
      meetingLink: bookings.meetingLink,
    })
    .from(bookings)
    .where(
      and(
        gte(bookings.startAt, now),
        ne(bookings.status, "cancelled"),
      ),
    )
    .orderBy(asc(bookings.startAt))
    .limit(limit);

  return rows;
}

/**
 * Low stock products list.
 */
export async function getLowStockProducts(limit = 8): Promise<LowStockProductItem[]> {
  await requireAdmin("dashboard.view");

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      nameEn: products.nameEn,
      nameHi: products.nameHi,
      priceInr: products.priceInr,
      stock: products.stock,
      lowStockAt: products.lowStockAt,
      legacyPhoto: products.legacyPhoto,
    })
    .from(products)
    .where(
      and(
        eq(products.status, "active"),
        lte(products.stock, products.lowStockAt),
      ),
    )
    .orderBy(asc(products.stock))
    .limit(limit);

  return rows;
}

/**
 * Get count badges for sidebar / navigation.
 * Runs queries in parallel.
 */
export async function getBadgeCounts(): Promise<BadgeCounts> {
  const admin = await requireAdmin();

  const [ordersRes, attentionRes, inquiriesRes, messagesRes, reviewsRes] =
    await Promise.all([
      can(admin.role, "orders.view")
        ? db
            .select({ count: count() })
            .from(orders)
            .where(eq(orders.status, "placed"))
        : Promise.resolve([{ count: 0 }]),
      can(admin.role, "orders.view")
        ? db
            .select({ count: count() })
            .from(orders)
            .where(eq(orders.needsAttention, true))
        : Promise.resolve([{ count: 0 }]),
      can(admin.role, "inquiries.view")
        ? db
            .select({ count: count() })
            .from(inquiries)
            .where(eq(inquiries.status, "new"))
        : Promise.resolve([{ count: 0 }]),
      can(admin.role, "messages.view")
        ? db
            .select({ count: count() })
            .from(messages)
            .where(eq(messages.status, "new"))
        : Promise.resolve([{ count: 0 }]),
      can(admin.role, "reviews.moderate")
        ? db
            .select({ count: count() })
            .from(reviews)
            .where(eq(reviews.status, "pending"))
        : Promise.resolve([{ count: 0 }]),
    ]);

  return {
    orders: ordersRes[0]?.count ?? 0,
    attention: attentionRes[0]?.count ?? 0,
    inquiries: inquiriesRes[0]?.count ?? 0,
    messages: messagesRes[0]?.count ?? 0,
    reviews: reviewsRes[0]?.count ?? 0,
  };
}
