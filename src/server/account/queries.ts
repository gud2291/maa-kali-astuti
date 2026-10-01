import "server-only";

import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema/core";
import { orders, orderItems, addresses } from "@/server/db/schema/commerce";
import type { OrderStatus, PaymentStatus, PaymentMethod } from "@/lib/domain/enums";
import type { Loc } from "@/lib/domain/loc";
import type { BirthProfile } from "@/lib/domain/types";

export type CustomerProfile = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  birth: BirthProfile | null;
  marketingOptIn: boolean;
  createdAt: number;
};

export type SavedAddress = {
  id: number;
  userId: number;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: number;
};

export type OrderSummaryItem = {
  id: number;
  number: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalInr: number;
  createdAt: number;
  itemsCount: number;
  firstItemThumb: string | null;
  firstItemName: Loc;
  items: {
    id: number;
    productId: string;
    name: Loc;
    slug: string;
    image: string | null;
    qty: number;
    priceInr: number;
  }[];
};

export type PaginatedOrders = {
  orders: OrderSummaryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AccountOverview = {
  profile: CustomerProfile | null;
  counts: {
    orders: number;
    addresses: number;
  };
  latestOrder: OrderSummaryItem | null;
};

export async function getMyProfile(userId: number): Promise<CustomerProfile | null> {
  const [u] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      birth: users.birth,
      marketingOptIn: users.marketingOptIn,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!u) return null;

  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    birth: u.birth,
    marketingOptIn: u.marketingOptIn,
    createdAt: u.createdAt.getTime(),
  };
}

export async function listMyAddresses(userId: number): Promise<SavedAddress[]> {
  const rows = await db
    .select()
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefault), desc(addresses.id));

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    phone: r.phone,
    line1: r.line1,
    line2: r.line2,
    landmark: r.landmark,
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    isDefault: r.isDefault,
    createdAt: r.createdAt.getTime(),
  }));
}

export async function listMyOrders(
  userId: number,
  page = 1,
  pageSize = 10,
): Promise<PaginatedOrders> {
  const currentPage = Math.max(1, page);
  const offset = (currentPage - 1) * pageSize;

  const [totalRow] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.userId, userId));

  const totalCount = totalRow?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const orderRows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset(offset);

  if (orderRows.length === 0) {
    return {
      orders: [],
      totalCount,
      page: currentPage,
      pageSize,
      totalPages,
    };
  }

  const orderIds = orderRows.map((o) => o.id);
  const itemsRows = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds))
    .orderBy(asc(orderItems.id));

  const itemsByOrder = new Map<number, typeof itemsRows>();
  for (const it of itemsRows) {
    const list = itemsByOrder.get(it.orderId) ?? [];
    list.push(it);
    itemsByOrder.set(it.orderId, list);
  }

  const resultOrders: OrderSummaryItem[] = orderRows.map((o) => {
    const its = itemsByOrder.get(o.id) ?? [];
    const first = its[0];
    const totalQty = its.reduce((sum, item) => sum + item.qty, 0);

    return {
      id: o.id,
      number: o.number,
      status: o.status as OrderStatus,
      paymentStatus: o.paymentStatus as PaymentStatus,
      paymentMethod: o.paymentMethod as PaymentMethod,
      totalInr: o.totalInr,
      createdAt: o.createdAt.getTime(),
      itemsCount: totalQty,
      firstItemThumb: first?.image ?? null,
      firstItemName: first
        ? { en: first.nameEn, hi: first.nameHi }
        : { en: "Sacred Item", hi: "पवित्र सामग्री" },
      items: its.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: { en: it.nameEn, hi: it.nameHi },
        slug: it.slug,
        image: it.image,
        qty: it.qty,
        priceInr: it.priceInr,
      })),
    };
  });

  return {
    orders: resultOrders,
    totalCount,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

export async function getAccountOverview(userId: number): Promise<AccountOverview> {
  const [profile, [orderCountRow], [addressCountRow], recentOrders] = await Promise.all([
    getMyProfile(userId),
    db.select({ count: count() }).from(orders).where(eq(orders.userId, userId)),
    db.select({ count: count() }).from(addresses).where(eq(addresses.userId, userId)),
    listMyOrders(userId, 1, 1),
  ]);

  return {
    profile,
    counts: {
      orders: orderCountRow?.count ?? 0,
      addresses: addressCountRow?.count ?? 0,
    },
    latestOrder: recentOrders.orders[0] ?? null,
  };
}
