import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, orderItems, orderEvents } from "@/server/db/schema/commerce";
import { safeEqualHex, sha256Hex } from "@/server/ids";
import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  Locale,
  WristSize,
} from "@/lib/domain/enums";
import type { Loc } from "@/lib/domain/loc";
import type { ShipAddress } from "@/lib/domain/types";

export type OrderViewItem = {
  id: number;
  productId: string;
  name: Loc;
  slug: string;
  image: string | null;
  variant: WristSize | null;
  qty: number;
  priceInr: number;
  mrpInr: number;
  energInr: number;
  energName: string | null;
  energGotra: string | null;
  lineTotalInr: number;
};

export type OrderViewEvent = {
  id: number;
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  message: string | null;
  createdAt: number;
};

export type OrderViewTotals = {
  items: number;
  mrp: number;
  energ: number;
  discount: number;
  gift: number;
  shipping: number;
  express: number;
  cod: number;
  total: number;
};

export type OrderView = {
  id: number;
  number: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  placedAt: number | null;
  paidAt: number | null;
  shippedAt: number | null;
  deliveredAt: number | null;
  cancelledAt: number | null;
  createdAt: number;
  energizationOn: string | null;
  items: OrderViewItem[];
  totals: OrderViewTotals;
  address: ShipAddress;
  events: OrderViewEvent[];
  courier: string | null;
  awb: string | null;
  trackingUrl: string | null;
  locale: Locale;
  invoiceNo: string | null;
};

async function assembleOrderView(row: typeof orders.$inferSelect): Promise<OrderView> {
  const [itemsRows, eventRows] = await Promise.all([
    db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, row.id))
      .orderBy(asc(orderItems.id)),
    db
      .select()
      .from(orderEvents)
      .where(and(eq(orderEvents.orderId, row.id), eq(orderEvents.public, true)))
      .orderBy(asc(orderEvents.createdAt)),
  ]);

  const items: OrderViewItem[] = itemsRows.map((it) => ({
    id: it.id,
    productId: it.productId,
    name: { en: it.nameEn, hi: it.nameHi },
    slug: it.slug,
    image: it.image,
    variant: it.variant as WristSize | null,
    qty: it.qty,
    priceInr: it.priceInr,
    mrpInr: it.mrpInr,
    energInr: it.energInr,
    energName: it.energName,
    energGotra: it.energGotra,
    lineTotalInr: it.lineTotalInr,
  }));

  const events: OrderViewEvent[] = eventRows.map((ev) => ({
    id: ev.id,
    type: ev.type,
    fromStatus: ev.fromStatus,
    toStatus: ev.toStatus,
    message: ev.message,
    createdAt: ev.createdAt.getTime(),
  }));

  return {
    id: row.id,
    number: row.number,
    status: row.status as OrderStatus,
    paymentStatus: row.paymentStatus as PaymentStatus,
    paymentMethod: row.paymentMethod as PaymentMethod,
    placedAt: row.placedAt ? row.placedAt.getTime() : null,
    paidAt: row.paidAt ? row.paidAt.getTime() : null,
    shippedAt: row.shippedAt ? row.shippedAt.getTime() : null,
    deliveredAt: row.deliveredAt ? row.deliveredAt.getTime() : null,
    cancelledAt: row.cancelledAt ? row.cancelledAt.getTime() : null,
    createdAt: row.createdAt.getTime(),
    energizationOn: row.energizationOn,
    items,
    totals: {
      items: row.itemsInr,
      mrp: row.mrpInr,
      energ: row.energInr,
      discount: row.discountInr,
      gift: row.giftInr,
      shipping: row.shippingInr,
      express: row.expressInr,
      cod: row.codInr,
      total: row.totalInr,
    },
    address: row.shipAddress,
    events,
    courier: row.courier,
    awb: row.awb,
    trackingUrl: row.trackingUrl,
    locale: row.locale as Locale,
    invoiceNo: row.invoiceNo,
  };
}

export async function getOrderView(
  number: string,
  accessKey: string,
): Promise<OrderView | null> {
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.number, number))
    .limit(1);

  if (!row) return null;

  const keyHash = sha256Hex(accessKey);
  if (!safeEqualHex(keyHash, row.accessHash)) {
    return null;
  }

  return assembleOrderView(row);
}

export async function getOrderViewForUser(
  userId: number,
  number: string,
): Promise<OrderView | null> {
  const [row] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.number, number), eq(orders.userId, userId)))
    .limit(1);

  if (!row) return null;

  return assembleOrderView(row);
}

export type OrderTrackingItem = {
  id: number;
  name: Loc;
  qty: number;
  variant?: WristSize | null;
  image?: string | null;
};

export type OrderTrackingEvent = {
  id: number;
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  message: string | null;
  createdAt: number;
};

export type OrderTrackingView = {
  number: string;
  status: OrderStatus;
  city: string;
  state: string;
  courier: string | null;
  awb: string | null;
  trackingUrl: string | null;
  energizationOn: string | null;
  items: OrderTrackingItem[];
  events: OrderTrackingEvent[];
};

export async function lookupOrderForTracking({
  number,
  contact,
}: {
  number: string;
  contact: string;
}): Promise<OrderTrackingView | null> {
  const cleanNumber = number.trim().toUpperCase();
  if (!cleanNumber || !contact.trim()) {
    return null;
  }

  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.number, cleanNumber))
    .limit(1);

  if (!row) {
    return null;
  }

  // contact must equal its phone (10 digits) or email (case-insensitive)
  const inputContact = contact.trim();
  const inputEmail = inputContact.toLowerCase();
  const digits = inputContact.replace(/\D/g, "");
  const inputPhone = digits.length >= 10 ? digits.slice(-10) : digits;

  const orderEmail = (row.email ?? "").trim().toLowerCase();
  const orderPhoneDigits = (row.phone ?? "").replace(/\D/g, "");
  const orderPhone = orderPhoneDigits.length >= 10 ? orderPhoneDigits.slice(-10) : orderPhoneDigits;

  const matchesEmail = inputEmail.length > 0 && orderEmail === inputEmail;
  const matchesPhone = inputPhone.length === 10 && orderPhone === inputPhone;

  if (!matchesEmail && !matchesPhone) {
    return null;
  }

  const [itemsRows, eventRows] = await Promise.all([
    db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, row.id))
      .orderBy(asc(orderItems.id)),
    db
      .select()
      .from(orderEvents)
      .where(and(eq(orderEvents.orderId, row.id), eq(orderEvents.public, true)))
      .orderBy(asc(orderEvents.createdAt)),
  ]);

  const items: OrderTrackingItem[] = itemsRows.map((it) => ({
    id: it.id,
    name: { en: it.nameEn, hi: it.nameHi },
    qty: it.qty,
    variant: it.variant as WristSize | null,
    image: it.image,
  }));

  const events: OrderTrackingEvent[] = eventRows.map((ev) => ({
    id: ev.id,
    type: ev.type,
    fromStatus: ev.fromStatus,
    toStatus: ev.toStatus,
    message: ev.message,
    createdAt: ev.createdAt.getTime(),
  }));

  return {
    number: row.number,
    status: row.status as OrderStatus,
    city: row.shipAddress?.city ?? "",
    state: row.shipAddress?.state ?? "",
    courier: row.courier,
    awb: row.awb,
    trackingUrl: row.trackingUrl,
    energizationOn: row.energizationOn,
    items,
    events,
  };
}


