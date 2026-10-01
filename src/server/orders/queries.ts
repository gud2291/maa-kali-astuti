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
