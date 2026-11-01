import "server-only";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, orderItems, orderEvents, shipments } from "@/server/db/schema/commerce";
import { AppError } from "@/server/result";
import { log } from "@/server/log";
import type { OrderStatus, ShipmentStatus } from "@/lib/domain/enums";
import {
  ShiprocketError,
  assignAwb,
  cancelAwb,
  cancelOrder,
  courierOptions,
  createAdhocOrder,
  generateLabel,
  pickupPincode,
  schedulePickup,
  shiprocketStatus,
  trackAwb,
  trackingPageUrl,
  type CourierOption,
  type TrackingSnapshot,
} from "./shiprocket";

export type ShipmentRow = typeof shipments.$inferSelect;

export type Parcel = { weightKg: number; lengthCm: number; breadthCm: number; heightCm: number };

/** Used when the admin does not enter a parcel size (Rudraksha / bracelets / small packs). */
export const DEFAULT_PARCEL: Parcel = { weightKg: 0.5, lengthCm: 15, breadthCm: 12, heightCm: 8 };

const SHIPPABLE_STATUSES: OrderStatus[] = ["placed", "energizing", "packed"];
const MONEY_OK = ["paid", "partially_refunded", "cod_pending", "cod_collected"];

/* --------------------------------- helpers --------------------------------- */

async function addEvent(
  orderId: number,
  message: string,
  opts: { public?: boolean; actorId?: number | null; from?: string; to?: string } = {},
): Promise<void> {
  await db.insert(orderEvents).values({
    orderId,
    type: "shipping",
    fromStatus: opts.from ?? null,
    toStatus: opts.to ?? null,
    message,
    public: opts.public ?? false,
    actorId: opts.actorId ?? null,
  });
}

const tenDigits = (phone: string): string => phone.replace(/\D/g, "").slice(-10);

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

function istDateTime(d: Date): string {
  const ist = new Date(d.getTime() + 330 * 60_000).toISOString();
  return `${ist.slice(0, 10)} ${ist.slice(11, 16)}`;
}

function parcelOrDefault(p?: Partial<Parcel> | null): Parcel {
  return {
    weightKg: p?.weightKg && p.weightKg > 0 ? p.weightKg : DEFAULT_PARCEL.weightKg,
    lengthCm: p?.lengthCm && p.lengthCm > 0 ? Math.round(p.lengthCm) : DEFAULT_PARCEL.lengthCm,
    breadthCm: p?.breadthCm && p.breadthCm > 0 ? Math.round(p.breadthCm) : DEFAULT_PARCEL.breadthCm,
    heightCm: p?.heightCm && p.heightCm > 0 ? Math.round(p.heightCm) : DEFAULT_PARCEL.heightCm,
  };
}

export async function getShipment(orderId: number): Promise<ShipmentRow | null> {
  const [row] = await db.select().from(shipments).where(eq(shipments.orderId, orderId)).limit(1);
  return row ?? null;
}

/** Order + items payload for Shiprocket's "adhoc order". Amounts are in rupees. */
async function buildPayload(orderId: number, parcel: Parcel, pickupLocation: string) {
  const [o] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!o) throw new AppError("NOT_FOUND", "Order not found");
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  const lineItems = items.map((i) => ({
    name: `${i.nameEn}${i.variant ? ` (${i.variant})` : ""}`.slice(0, 200),
    sku: i.productId,
    units: i.qty,
    selling_price: Math.round((i.lineTotalInr / i.qty) * 100) / 100,
    discount: 0,
    tax: 0,
    ...(i.hsn ? { hsn: i.hsn } : {}),
  }));
  const subTotal = items.reduce((s, i) => s + i.lineTotalInr, 0);
  // Whatever the customer actually pays beyond the item lines (shipping, express, COD fee, gift,
  // minus discounts) is passed as one charge / discount so Shiprocket's total equals ours exactly.
  const diff = o.totalInr - subTotal;
  const a = o.shipAddress;
  const nm = splitName(a.name || o.name);
  const address2 = [a.line2, a.landmark].filter(Boolean).join(", ");

  return {
    order: o,
    payload: {
      order_id: o.number,
      order_date: istDateTime(o.placedAt ?? o.createdAt),
      pickup_location: pickupLocation,
      comment: (o.customerNote ?? "").slice(0, 200),
      billing_customer_name: nm.first,
      billing_last_name: nm.last,
      billing_address: a.line1,
      billing_address_2: address2,
      billing_city: a.city,
      billing_pincode: a.pincode,
      billing_state: a.state,
      billing_country: "India",
      billing_email: o.email,
      billing_phone: tenDigits(a.phone || o.phone),
      shipping_is_billing: true,
      order_items: lineItems,
      payment_method: o.paymentMethod === "cod" ? "COD" : "Prepaid",
      shipping_charges: diff > 0 ? diff : 0,
      total_discount: diff < 0 ? -diff : 0,
      sub_total: subTotal,
      length: parcel.lengthCm,
      breadth: parcel.breadthCm,
      height: parcel.heightCm,
      weight: parcel.weightKg,
    },
  };
}

/* ------------------------------ create shipment ----------------------------- */

export type CreateShipmentInput = { orderId: number; parcel?: Partial<Parcel> | null; actorId?: number | null };

/**
 * Create the order inside Shiprocket (no courier yet). Idempotent: an order that already has a
 * shipment is returned untouched, and a failed attempt can be retried.
 */
export async function createShipment(input: CreateShipmentInput): Promise<ShipmentRow> {
  const sr = shiprocketStatus();
  if (!sr.enabled) {
    throw new AppError("VALIDATION", "Shiprocket is not connected yet (add the API user in Coolify).");
  }
  const { orderId, actorId = null } = input;
  const [o] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!o) throw new AppError("NOT_FOUND", "Order not found");
  if (!SHIPPABLE_STATUSES.includes(o.status)) {
    throw new AppError("VALIDATION", `An order that is "${o.status}" cannot be shipped.`);
  }
  if (!MONEY_OK.includes(o.paymentStatus)) {
    throw new AppError("VALIDATION", "This order has no confirmed payment (or COD) yet.");
  }

  // Claim the order: a second click or a parallel request sees the claim and stops.
  const parcel = parcelOrDefault(input.parcel);
  const [claimed] = await db
    .insert(shipments)
    .values({
      orderId,
      status: "creating",
      weightKg: parcel.weightKg,
      lengthCm: parcel.lengthCm,
      breadthCm: parcel.breadthCm,
      heightCm: parcel.heightCm,
    })
    .onConflictDoUpdate({
      target: shipments.orderId,
      set: {
        status: "creating",
        lastError: null,
        weightKg: parcel.weightKg,
        lengthCm: parcel.lengthCm,
        breadthCm: parcel.breadthCm,
        heightCm: parcel.heightCm,
        updatedAt: new Date(),
      },
      setWhere: sql`${shipments.status} = 'failed' OR (${shipments.status} = 'creating' AND ${shipments.updatedAt} < now() - interval '5 minutes')`,
    })
    .returning();
  if (!claimed) {
    const existing = await getShipment(orderId);
    if (existing) return existing;
    throw new AppError("CONFLICT", "Could not start the shipment. Try again.");
  }

  try {
    const { payload } = await buildPayload(orderId, parcel, sr.pickupLocation);
    const r = await createAdhocOrder(payload);
    if (!r?.order_id || !r.shipment_id) {
      throw new ShiprocketError("Shiprocket did not return an order / shipment id.");
    }
    const [saved] = await db
      .update(shipments)
      .set({
        status: r.awb_code ? "awb_assigned" : "created",
        providerOrderId: String(r.order_id),
        shipmentId: String(r.shipment_id),
        awb: r.awb_code || null,
        courier: r.courier_name || null,
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(shipments.orderId, orderId))
      .returning();
    await addEvent(orderId, `Sent to Shiprocket (order ${r.order_id}, shipment ${r.shipment_id}).`, { actorId });
    return saved!;
  } catch (err) {
    const message = (err instanceof Error ? err.message : String(err)).slice(0, 300);
    await db
      .update(shipments)
      .set({ status: "failed", lastError: message, updatedAt: new Date() })
      .where(eq(shipments.orderId, orderId));
    await addEvent(orderId, `Could not send the order to Shiprocket: ${message}`, { actorId });
    await db
      .update(orders)
      .set({ needsAttention: true, attentionReason: "Shipment could not be created — open Shipping on this order and retry.", updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    throw err instanceof AppError ? err : new ShiprocketError(message);
  }
}

/** Fire-and-forget hook after an order is paid / placed as COD. Never throws. */
export async function autoCreateShipment(orderId: number): Promise<void> {
  if (!shiprocketStatus().enabled) return;
  try {
    await createShipment({ orderId });
  } catch (err) {
    log.error("shipping.auto_create_failed", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/* ------------------------------ courier options ----------------------------- */

export async function listCourierOptions(orderId: number): Promise<CourierOption[]> {
  const sr = shiprocketStatus();
  if (!sr.enabled) throw new AppError("VALIDATION", "Shiprocket is not connected yet.");
  const [o] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!o) throw new AppError("NOT_FOUND", "Order not found");
  const ship = await getShipment(orderId);
  const pickupPin = await pickupPincode(sr.pickupLocation);
  if (!pickupPin) {
    throw new AppError("VALIDATION", `Pickup location "${sr.pickupLocation}" was not found in Shiprocket.`);
  }
  return courierOptions({
    pickupPin,
    deliveryPin: o.shipAddress.pincode,
    weightKg: ship?.weightKg ?? DEFAULT_PARCEL.weightKg,
    cod: o.paymentMethod === "cod",
    declaredValueInr: o.totalInr,
  });
}

/* ------------------------------ book courier -------------------------------- */

/** Assign a courier + tracking number (AWB) and schedule the pickup. */
export async function bookCourier(opts: {
  orderId: number;
  courierId?: number;
  actorId?: number | null;
}): Promise<ShipmentRow> {
  const { orderId, courierId, actorId = null } = opts;
  const s = await getShipment(orderId);
  if (!s || !s.shipmentId) throw new AppError("VALIDATION", "Send the order to Shiprocket first.");
  if (s.status === "cancelled") throw new AppError("VALIDATION", "This shipment was cancelled.");
  if (s.status === "in_transit" || s.status === "delivered") {
    throw new AppError("VALIDATION", "The courier already has this parcel.");
  }

  let awb = s.awb;
  let courier = s.courier;
  if (!awb) {
    const r = await assignAwb(s.shipmentId, courierId);
    awb = r?.response?.data?.awb_code || null;
    courier = r?.response?.data?.courier_name || courier;
    if (!awb) {
      throw new ShiprocketError(
        r?.response?.data?.awb_assign_error ||
          r?.message ||
          "No courier could be assigned. Check the Shiprocket wallet balance and the pickup address.",
      );
    }
  }

  let pickupNote = "Pickup requested.";
  try {
    await schedulePickup(s.shipmentId);
  } catch (err) {
    pickupNote = `Pickup was not scheduled automatically (${err instanceof Error ? err.message : "error"}) — schedule it in Shiprocket.`;
  }

  const trackingUrl = trackingPageUrl(awb);
  const saved = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(shipments)
      .set({ status: "awb_assigned", awb, courier, lastError: null, updatedAt: new Date() })
      .where(eq(shipments.orderId, orderId))
      .returning();
    await tx
      .update(orders)
      .set({ courier, awb, trackingUrl, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    await tx.insert(orderEvents).values({
      orderId,
      type: "shipping",
      message: `Courier booked: ${courier ?? "courier"}, tracking number ${awb}. ${pickupNote}`,
      public: true,
      actorId,
    });
    return row!;
  });
  return saved;
}

/* ----------------------------------- label ---------------------------------- */

export async function getLabelUrl(orderId: number): Promise<string> {
  const s = await getShipment(orderId);
  if (!s?.shipmentId || !s.awb) throw new AppError("VALIDATION", "Book the courier first.");
  if (s.labelUrl) return s.labelUrl;
  const r = await generateLabel(s.shipmentId);
  if (!r?.label_url) {
    throw new ShiprocketError(typeof r?.response === "string" ? r.response : "Shiprocket did not return a label.");
  }
  await db.update(shipments).set({ labelUrl: r.label_url, updatedAt: new Date() }).where(eq(shipments.orderId, orderId));
  return r.label_url;
}

/* ---------------------------------- cancel ---------------------------------- */

export type CancelShipmentResult = "cancelled" | "none" | "not_connected";

/** Cancel the shipment in Shiprocket (possible until the courier collects it). */
export async function cancelShipment(orderId: number, actorId: number | null = null): Promise<CancelShipmentResult> {
  const s = await getShipment(orderId);
  if (!s || !s.providerOrderId || s.status === "cancelled" || s.status === "failed") return "none";
  if (!shiprocketStatus().enabled) return "not_connected";
  if (s.status === "in_transit" || s.status === "delivered") {
    throw new ShiprocketError("The courier already has this parcel — it can't be cancelled here; ask Shiprocket for a return (RTO).");
  }
  if (s.awb) await cancelAwb(s.awb);
  else await cancelOrder(s.providerOrderId);
  await db.update(shipments).set({ status: "cancelled", updatedAt: new Date() }).where(eq(shipments.orderId, orderId));
  await addEvent(orderId, "Shipment cancelled in Shiprocket.", { actorId });
  return "cancelled";
}

/* ------------------------------ tracking updates ----------------------------- */

export type TrackingKind = "shipped" | "delivered" | "rto" | "rto_delivered" | "cancelled" | "problem" | "info";

const SHIPPED_STATES = [
  "PICKED UP", "SHIPPED", "IN TRANSIT", "OUT FOR DELIVERY", "REACHED AT DESTINATION HUB",
  "REACHED DESTINATION HUB", "IN TRANSIT-AT DESTINATION HUB", "MISROUTED", "DELAYED", "PICKUP DONE",
];
const PROBLEM_STATES = ["UNDELIVERED", "LOST", "DAMAGED", "DESTROYED", "PICKUP EXCEPTION", "DISPOSED OFF", "NDR"];

export function classifyTrackingStatus(status: string, isReturn: boolean): TrackingKind {
  const s = status.trim().toUpperCase();
  if (s === "RTO DELIVERED" || s === "RTO-DELIVERED") return "rto_delivered";
  if (isReturn || s.startsWith("RTO")) return "rto";
  if (s === "DELIVERED") return "delivered";
  if (s === "CANCELED" || s === "CANCELLED") return "cancelled";
  if (PROBLEM_STATES.some((p) => s === p || s.startsWith("UNDELIVERED"))) return "problem";
  if (SHIPPED_STATES.includes(s)) return "shipped";
  return "info";
}

export type TrackingUpdate = {
  orderId: number;
  kind: TrackingKind;
  status: string;
  awb: string | null;
  courier: string | null;
  /** First time this exact status is seen (repeated deliveries of the same update are ignored). */
  isNew: boolean;
  /** Set when the order status actually changed because of this update. */
  orderMovedTo: OrderStatus | null;
};

export type TrackingPayload = {
  awb?: string | number;
  current_status?: string;
  shipment_status?: string;
  order_id?: string | number;
  sr_order_id?: string | number;
  courier_name?: string;
  is_return?: number | boolean | string;
};

/** Move the order forward from a courier event. Never backwards, never out of cancelled/returned. */
async function moveOrderFromCourier(
  orderId: number,
  to: "shipped" | "delivered" | "returned",
  extra: { courier: string | null; awb: string | null },
): Promise<OrderStatus | null> {
  const allowedFrom: OrderStatus[] =
    to === "shipped" ? SHIPPABLE_STATUSES : to === "delivered" ? [...SHIPPABLE_STATUSES, "shipped"] : ["shipped", "delivered"];
  const now = new Date();
  const set: Partial<typeof orders.$inferInsert> = { status: to, updatedAt: now };
  if (to === "shipped") {
    set.shippedAt = now;
    if (extra.courier) set.courier = extra.courier;
    if (extra.awb) {
      set.awb = extra.awb;
      set.trackingUrl = trackingPageUrl(extra.awb);
    }
  }
  if (to === "delivered") set.deliveredAt = now;

  const [before] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!before || !allowedFrom.includes(before.status)) return null;
  const moved = await db
    .update(orders)
    .set(set)
    .where(and(eq(orders.id, orderId), inArray(orders.status, allowedFrom)))
    .returning({ id: orders.id });
  if (moved.length === 0) return null;
  await db.insert(orderEvents).values({
    orderId,
    type: "status",
    fromStatus: before.status,
    toStatus: to,
    message: `Status changed from ${before.status} to ${to} (courier update)`,
    public: true,
    actorId: null,
  });
  return to;
}

/** Apply one update from Shiprocket. Returns null when it doesn't belong to one of our orders. */
export async function applyTrackingUpdate(p: TrackingPayload): Promise<TrackingUpdate | null> {
  const status = String(p.current_status || p.shipment_status || "").trim();
  if (!status) return null;
  const awb = p.awb ? String(p.awb).trim() : null;
  const orderNo = p.order_id != null ? String(p.order_id) : "";
  const srOrderId = p.sr_order_id != null ? String(p.sr_order_id) : null;

  const conds = [];
  if (awb) conds.push(eq(shipments.awb, awb));
  if (srOrderId) conds.push(eq(shipments.providerOrderId, srOrderId));
  if (orderNo) conds.push(eq(orders.number, orderNo));
  if (conds.length === 0) return null;

  const [match] = await db
    .select({
      orderId: shipments.orderId,
      providerStatus: shipments.providerStatus,
      courier: shipments.courier,
    })
    .from(shipments)
    .innerJoin(orders, eq(orders.id, shipments.orderId))
    .where(or(...conds))
    .limit(1);
  if (!match) return null;

  const isReturn = p.is_return === 1 || p.is_return === true || p.is_return === "1";
  const kind = classifyTrackingStatus(status, isReturn);
  const isNew = (match.providerStatus ?? "").toUpperCase() !== status.toUpperCase();
  const courier = p.courier_name?.trim() || match.courier;
  const base = { orderId: match.orderId, kind, status, awb, courier, isNew };
  if (!isNew) return { ...base, orderMovedTo: null };

  const nextShipmentStatus: ShipmentStatus | null =
    kind === "delivered" ? "delivered"
    : kind === "rto" || kind === "rto_delivered" ? "rto"
    : kind === "cancelled" ? "cancelled"
    : kind === "shipped" ? "in_transit"
    : null;

  await db
    .update(shipments)
    .set({
      providerStatus: status.slice(0, 80),
      awb: awb ?? sql`${shipments.awb}`,
      courier: courier ?? sql`${shipments.courier}`,
      ...(nextShipmentStatus ? { status: nextShipmentStatus } : {}),
      updatedAt: new Date(),
    })
    .where(eq(shipments.orderId, match.orderId));

  await addEvent(
    match.orderId,
    `Courier update: ${status}${awb ? ` (AWB ${awb})` : ""}`,
    { public: true },
  );

  let moved: OrderStatus | null = null;
  if (kind === "shipped") moved = await moveOrderFromCourier(match.orderId, "shipped", { courier, awb });
  else if (kind === "delivered") moved = await moveOrderFromCourier(match.orderId, "delivered", { courier, awb });
  else if (kind === "rto_delivered") moved = await moveOrderFromCourier(match.orderId, "returned", { courier, awb });

  if (kind === "rto" || kind === "problem" || kind === "rto_delivered") {
    await db
      .update(orders)
      .set({
        needsAttention: true,
        attentionReason:
          kind === "problem"
            ? `Delivery problem: ${status}. Contact the customer / courier.`
            : `Parcel is returning to origin (RTO): ${status}. Contact the customer about re-delivery or a refund.`,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, match.orderId));
  }

  return { ...base, orderMovedTo: moved };
}

/** Pull the latest courier status on demand (useful until the webhook is configured). */
export async function refreshTracking(orderId: number): Promise<{ snapshot: TrackingSnapshot; update: TrackingUpdate | null }> {
  const s = await getShipment(orderId);
  if (!s?.awb) throw new AppError("VALIDATION", "No tracking number yet — book the courier first.");
  const snapshot = await trackAwb(s.awb);
  let update: TrackingUpdate | null = null;
  if (snapshot.status) {
    update = await applyTrackingUpdate({ awb: s.awb, current_status: snapshot.status, courier_name: snapshot.courier ?? undefined });
  }
  return { snapshot, update };
}
