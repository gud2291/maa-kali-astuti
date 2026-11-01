import "server-only";
import { and, asc, count, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import {
  orders,
  orderItems,
  orderEvents,
  payments,
  refunds,
} from "@/server/db/schema/commerce";
import { products } from "@/server/db/schema/catalog";
import { requireAdmin, type AdminUser } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { log } from "@/server/log";
import { AppError } from "@/server/result";
import { canMove, ORDER_FLOW } from "@/lib/domain/flows";
import { formatIst } from "@/lib/core/ist";
import { sendOrderStatusEmail } from "./emails";
import { after } from "next/server";
import { toCsv } from "@/server/csv";
import type {
  OrderListFilters,
  OrderAdminTab,
  TransitionInput,
  TrackingInput,
} from "@/lib/validation/order-admin";
import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/lib/domain/enums";

export type AdminOrderListItem = {
  id: number;
  number: string;
  name: string;
  phone: string;
  email: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalInr: number;
  itemsCount: number;
  createdAt: number;
  needsAttention: boolean;
  attentionReason: string | null;
  courier: string | null;
  awb: string | null;
};

export type AdminOrdersListResult = {
  rows: AdminOrderListItem[];
  total: number;
  page: number;
  totalPages: number;
};

export type AdminOrderDetail = {
  order: typeof orders.$inferSelect;
  items: (typeof orderItems.$inferSelect)[];
  events: (typeof orderEvents.$inferSelect)[];
  payments: (typeof payments.$inferSelect)[];
  refunds: (typeof refunds.$inferSelect)[];
};

export async function countByTab(): Promise<Record<OrderAdminTab, number>> {
  await requireAdmin("orders.view");

  const [statusCounts, attentionRows] = await Promise.all([
    db
      .select({
        status: orders.status,
        count: count(),
      })
      .from(orders)
      .groupBy(orders.status),
    db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.needsAttention, true)),
  ]);

  const map: Record<string, number> = {};
  let totalAll = 0;
  for (const row of statusCounts) {
    map[row.status] = row.count;
    totalAll += row.count;
  }

  const attentionCount = attentionRows[0]?.count ?? 0;

  return {
    all: totalAll,
    new: map["placed"] ?? 0,
    energizing: map["energizing"] ?? 0,
    packed: map["packed"] ?? 0,
    shipped: map["shipped"] ?? 0,
    delivered: map["delivered"] ?? 0,
    pending_payment: map["pending_payment"] ?? 0,
    cancelled: map["cancelled"] ?? 0,
    attention: attentionCount,
  };
}

export async function listOrders(
  filters: OrderListFilters,
): Promise<AdminOrdersListResult> {
  await requireAdmin("orders.view");

  const conditions = [];

  // Tab condition
  if (filters.tab === "new") {
    conditions.push(eq(orders.status, "placed"));
  } else if (filters.tab === "energizing") {
    conditions.push(eq(orders.status, "energizing"));
  } else if (filters.tab === "packed") {
    conditions.push(eq(orders.status, "packed"));
  } else if (filters.tab === "shipped") {
    conditions.push(eq(orders.status, "shipped"));
  } else if (filters.tab === "delivered") {
    conditions.push(eq(orders.status, "delivered"));
  } else if (filters.tab === "pending_payment") {
    conditions.push(eq(orders.status, "pending_payment"));
  } else if (filters.tab === "cancelled") {
    conditions.push(eq(orders.status, "cancelled"));
  } else if (filters.tab === "attention") {
    conditions.push(eq(orders.needsAttention, true));
  }

  // Search filter
  if (filters.search && filters.search.trim().length > 0) {
    const s = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        like(orders.number, s),
        like(orders.phone, s),
        like(orders.email, s),
        like(orders.name, s),
      ),
    );
  }

  // Payment method filter
  if (filters.method) {
    conditions.push(eq(orders.paymentMethod, filters.method));
  }

  // Date range filter
  if (filters.from) {
    const fromDate = new Date(`${filters.from}T00:00:00+05:30`);
    if (!isNaN(fromDate.getTime())) {
      conditions.push(gte(orders.createdAt, fromDate));
    }
  }
  if (filters.to) {
    const toDate = new Date(`${filters.to}T23:59:59.999+05:30`);
    if (!isNaN(toDate.getTime())) {
      conditions.push(lte(orders.createdAt, toDate));
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const pageSize = 20;
  const page = Math.max(1, filters.page || 1);
  const offset = (page - 1) * pageSize;

  const [countRes, orderRows] = await Promise.all([
    db
      .select({ count: count() })
      .from(orders)
      .where(whereClause),
    db
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
        courier: orders.courier,
        awb: orders.awb,
      })
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset),
  ]);

  const total = countRes[0]?.count ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  if (orderRows.length === 0) {
    return { rows: [], total, page, totalPages };
  }

  const orderIds = orderRows.map((r) => r.id);
  const itemsCountRows = await db
    .select({
      orderId: orderItems.orderId,
      sumQty: sql<number>`SUM(${orderItems.qty})`.mapWith(Number),
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);

  const countMap = new Map<number, number>();
  for (const row of itemsCountRows) {
    countMap.set(row.orderId, Number(row.sumQty) || 0);
  }

  const rows: AdminOrderListItem[] = orderRows.map((o) => ({
    id: o.id,
    number: o.number,
    name: o.name,
    phone: o.phone,
    email: o.email,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    totalInr: o.totalInr,
    itemsCount: countMap.get(o.id) ?? 0,
    createdAt: o.createdAt.getTime(),
    needsAttention: o.needsAttention,
    attentionReason: o.attentionReason,
    courier: o.courier,
    awb: o.awb,
  }));

  return { rows, total, page, totalPages };
}

export async function getOrderAdmin(id: number): Promise<AdminOrderDetail | null> {
  await requireAdmin("orders.view");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) return null;

  const [items, events, payList, refList] = await Promise.all([
    db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id))
      .orderBy(asc(orderItems.id)),
    db
      .select()
      .from(orderEvents)
      .where(eq(orderEvents.orderId, id))
      .orderBy(desc(orderEvents.createdAt)),
    db
      .select()
      .from(payments)
      .where(and(eq(payments.entity, "order"), eq(payments.entityId, id)))
      .orderBy(desc(payments.createdAt)),
    db
      .select()
      .from(refunds)
      .where(and(eq(refunds.entity, "order"), eq(refunds.entityId, id)))
      .orderBy(desc(refunds.createdAt)),
  ]);

  return {
    order,
    items,
    events,
    payments: payList,
    refunds: refList,
  };
}

export async function transitionOrder(
  id: number,
  input: TransitionInput,
  actor: AdminUser,
): Promise<{ ok: boolean; restocked: boolean; productIds: string[] }> {
  await requireAdmin("orders.update");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  if (!canMove(ORDER_FLOW, order.status, input.to)) {
    throw new AppError(
      "VALIDATION",
      `Cannot move order from status "${order.status}" to "${input.to}"`,
    );
  }

  const now = new Date();
  const updates: Record<string, unknown> = {
    status: input.to,
    updatedAt: now,
  };

  if (input.to === "shipped") {
    updates.courier = input.courier ?? null;
    updates.awb = input.awb ?? null;
    updates.trackingUrl = input.trackingUrl || null;
    updates.shippedAt = now;
  } else if (input.to === "delivered") {
    updates.deliveredAt = now;
  } else if (input.to === "cancelled") {
    updates.cancelledAt = now;
  }

  let restocked = false;
  let restockedProductIds: string[] = [];

  // Stock was taken only if finalizePlacement ran, and that always issues the invoice number
  // (an amount-mismatch or paid-after-cancel order never took stock).
  const shouldRestock =
    input.to === "cancelled" &&
    order.invoiceNo !== null &&
    (order.paymentStatus === "paid" ||
      order.paymentStatus === "partially_refunded" ||
      order.paymentStatus === "cod_pending");

  await db.transaction(async (tx) => {
    // Guard on the status we validated: a concurrent change (e.g. a double cancel) must not
    // move the order twice or restock twice.
    const moved = await tx
      .update(orders)
      .set(updates)
      .where(and(eq(orders.id, id), eq(orders.status, order.status)))
      .returning({ id: orders.id });
    if (moved.length === 0) {
      throw new AppError("CONFLICT", "The order changed meanwhile. Reload and try again.");
    }

    if (shouldRestock) {
      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, id));

      restockedProductIds = items.map((it) => it.productId);

      for (const item of items) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.qty}` })
          .where(eq(products.id, item.productId));
      }
      restocked = true;
    }

    const statusMessage = input.note
      ? `Status changed from ${order.status} to ${input.to}: ${input.note}`
      : `Status changed from ${order.status} to ${input.to}`;

    await tx.insert(orderEvents).values({
      orderId: id,
      type: "status",
      fromStatus: order.status,
      toStatus: input.to,
      message: statusMessage,
      public: true,
      actorId: actor.id,
    });
  });

  await audit({
    actorId: actor.id,
    action: "order.transition",
    entity: "order",
    entityId: id,
    summary: `Order ${order.number} transitioned from ${order.status} to ${input.to}`,
    diff: { status: [order.status, input.to] },
  });

  if (input.notify) {
    after(() => {
      sendOrderStatusEmail(id, input.to).catch((e) =>
        log.error("email.orderStatus_failed", {
          orderId: id,
          status: input.to,
          error: e instanceof Error ? e.message : String(e),
        }),
      );
    });
  }

  return { ok: true, restocked, productIds: restockedProductIds };
}

export async function setEnergizationDate(
  date: string,
  scope: "placed",
  actor: AdminUser,
): Promise<{ count: number }> {
  await requireAdmin("orders.update");

  const placedOrders = await db
    .select({ id: orders.id, number: orders.number })
    .from(orders)
    .where(eq(orders.status, scope));

  if (placedOrders.length === 0) {
    return { count: 0 };
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        energizationOn: date,
        updatedAt: now,
      })
      .where(eq(orders.status, scope));

    for (const ord of placedOrders) {
      await tx.insert(orderEvents).values({
        orderId: ord.id,
        type: "status",
        message: `Energization scheduled for ${date}`,
        public: true,
        actorId: actor.id,
      });
    }
  });

  await audit({
    actorId: actor.id,
    action: "orders.energization_date_bulk",
    entity: "orders",
    entityId: "placed",
    summary: `Set energization date ${date} for ${placedOrders.length} placed orders`,
  });

  return { count: placedOrders.length };
}

export async function updateTracking(
  id: number,
  input: TrackingInput,
  actor: AdminUser,
): Promise<{ ok: boolean }> {
  await requireAdmin("orders.update");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  const now = new Date();
  await db
    .update(orders)
    .set({
      courier: input.courier,
      awb: input.awb,
      trackingUrl: input.trackingUrl || null,
      updatedAt: now,
    })
    .where(eq(orders.id, id));

  await db.insert(orderEvents).values({
    orderId: id,
    type: "tracking",
    message: `Tracking updated: ${input.courier} (AWB: ${input.awb})`,
    public: true,
    actorId: actor.id,
  });

  await audit({
    actorId: actor.id,
    action: "order.tracking_update",
    entity: "order",
    entityId: id,
    summary: `Updated tracking for order ${order.number}: ${input.courier} ${input.awb}`,
  });

  return { ok: true };
}

export async function markCodCollected(
  id: number,
  actor: AdminUser,
): Promise<{ ok: boolean }> {
  await requireAdmin("orders.update");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  if (order.paymentMethod !== "cod") {
    throw new AppError("VALIDATION", "Order is not COD");
  }

  // ARCH §7: COD money in hand = `cod_collected` (refunds and reports rely on it).
  if (order.paymentStatus !== "cod_pending") {
    return { ok: true };
  }

  const now = new Date();

  await db.transaction(async (tx) => {
    const moved = await tx
      .update(orders)
      .set({
        paymentStatus: "cod_collected",
        paidAt: now,
        updatedAt: now,
      })
      .where(and(eq(orders.id, id), eq(orders.paymentStatus, "cod_pending")))
      .returning({ id: orders.id });
    if (moved.length === 0) return;

    await tx.insert(payments).values({
      entity: "order",
      entityId: id,
      provider: "cod",
      amountInr: order.totalInr,
      status: "captured",
      method: "cash",
    });

    await tx.insert(orderEvents).values({
      orderId: id,
      type: "paid",
      fromStatus: order.status,
      toStatus: order.status,
      message: `COD payment of ₹${order.totalInr} collected in cash`,
      public: true,
      actorId: actor.id,
    });
  });

  await audit({
    actorId: actor.id,
    action: "order.cod_collected",
    entity: "order",
    entityId: id,
    summary: `Marked COD payment collected (₹${order.totalInr}) for order ${order.number}`,
    diff: { paymentStatus: [order.paymentStatus, "cod_collected"] },
  });

  return { ok: true };
}

export async function addOrderNote(
  id: number,
  note: string,
  actor: AdminUser,
): Promise<{ ok: boolean }> {
  await requireAdmin("orders.update");

  const [order] = await db
    .select({ id: orders.id, number: orders.number, adminNote: orders.adminNote })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  await db.transaction(async (tx) => {
    await tx.insert(orderEvents).values({
      orderId: id,
      type: "note",
      message: note,
      public: false,
      actorId: actor.id,
    });

    const updatedNote = order.adminNote
      ? `${order.adminNote}\n[${formatIst(new Date(), { time: true })}]: ${note}`
      : `[${formatIst(new Date(), { time: true })}]: ${note}`;

    await tx
      .update(orders)
      .set({ adminNote: updatedNote, updatedAt: new Date() })
      .where(eq(orders.id, id));
  });

  await audit({
    actorId: actor.id,
    action: "order.add_note",
    entity: "order",
    entityId: id,
    summary: `Added private note to order ${order.number}`,
  });

  return { ok: true };
}

export async function resolveAttention(
  id: number,
  actor: AdminUser,
): Promise<{ ok: boolean }> {
  await requireAdmin("orders.update");

  const [order] = await db
    .select({ id: orders.id, number: orders.number })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        needsAttention: false,
        attentionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    await tx.insert(orderEvents).values({
      orderId: id,
      type: "attention",
      message: "Attention flag resolved",
      public: false,
      actorId: actor.id,
    });
  });

  await audit({
    actorId: actor.id,
    action: "order.resolve_attention",
    entity: "order",
    entityId: id,
    summary: `Resolved attention flag on order ${order.number}`,
  });

  return { ok: true };
}

export async function exportOrdersCsv(
  filters: OrderListFilters,
  actor: AdminUser,
): Promise<string> {
  await requireAdmin("exports.run");

  const conditions = [];

  if (filters.tab === "new") conditions.push(eq(orders.status, "placed"));
  else if (filters.tab === "energizing") conditions.push(eq(orders.status, "energizing"));
  else if (filters.tab === "packed") conditions.push(eq(orders.status, "packed"));
  else if (filters.tab === "shipped") conditions.push(eq(orders.status, "shipped"));
  else if (filters.tab === "delivered") conditions.push(eq(orders.status, "delivered"));
  else if (filters.tab === "pending_payment") conditions.push(eq(orders.status, "pending_payment"));
  else if (filters.tab === "cancelled") conditions.push(eq(orders.status, "cancelled"));
  else if (filters.tab === "attention") conditions.push(eq(orders.needsAttention, true));

  if (filters.search && filters.search.trim().length > 0) {
    const s = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        like(orders.number, s),
        like(orders.phone, s),
        like(orders.email, s),
        like(orders.name, s),
      ),
    );
  }

  if (filters.method) {
    conditions.push(eq(orders.paymentMethod, filters.method));
  }

  if (filters.from) {
    const fromDate = new Date(`${filters.from}T00:00:00+05:30`);
    if (!isNaN(fromDate.getTime())) conditions.push(gte(orders.createdAt, fromDate));
  }
  if (filters.to) {
    const toDate = new Date(`${filters.to}T23:59:59.999+05:30`);
    if (!isNaN(toDate.getTime())) conditions.push(lte(orders.createdAt, toDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(orders)
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(5000);

  const csv = toCsv(rows, [
    { header: "Order Number", value: (o) => o.number },
    { header: "Date (IST)", value: (o) => formatIst(o.createdAt, { time: true }) },
    { header: "Status", value: (o) => o.status },
    { header: "Payment Method", value: (o) => o.paymentMethod },
    { header: "Payment Status", value: (o) => o.paymentStatus },
    { header: "Total (INR)", value: (o) => o.totalInr },
    { header: "Customer Name", value: (o) => o.name },
    { header: "Customer Phone", value: (o) => o.phone },
    { header: "Customer Email", value: (o) => o.email },
    { header: "City", value: (o) => o.shipAddress?.city ?? "" },
    { header: "State", value: (o) => o.shipAddress?.state ?? "" },
    { header: "Pincode", value: (o) => o.shipAddress?.pincode ?? "" },
    { header: "Courier", value: (o) => o.courier ?? "" },
    { header: "AWB", value: (o) => o.awb ?? "" },
    { header: "Tracking URL", value: (o) => o.trackingUrl ?? "" },
    { header: "Energization Date", value: (o) => o.energizationOn ?? "" },
  ]);

  await audit({
    actorId: actor.id,
    action: "export.orders",
    entity: "orders",
    entityId: "all",
    summary: `Exported ${rows.length} orders to CSV`,
  });

  return csv;
}
