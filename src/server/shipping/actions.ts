"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { shiprocketStatus, type CourierOption } from "./shiprocket";
import {
  bookCourier,
  cancelShipment,
  createShipment,
  getLabelUrl,
  listCourierOptions,
  refreshTracking,
} from "./service";

const idSchema = z.coerce.number().int().positive();

const parcelSchema = z
  .object({
    weightKg: z.coerce.number().min(0.05).max(50),
    lengthCm: z.coerce.number().min(1).max(200),
    breadthCm: z.coerce.number().min(1).max(200),
    heightCm: z.coerce.number().min(1).max(200),
  })
  .optional();

export async function createShipmentAction(
  orderId: number,
  parcel?: z.input<typeof parcelSchema>,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const id = idSchema.parse(orderId);
    await createShipment({ orderId: id, parcel: parcelSchema.parse(parcel), actorId: actor.id });
    await audit({
      actorId: actor.id,
      action: "shipment.create",
      entity: "order",
      entityId: id,
      summary: `Sent order ${id} to Shiprocket`,
    });
    return { ok: true as const };
  });
}

export async function courierOptionsAction(orderId: number): Promise<ActionResult<CourierOption[]>> {
  return runAction(async () => {
    await requireAdmin("orders.update");
    return listCourierOptions(idSchema.parse(orderId));
  });
}

export async function bookCourierAction(
  orderId: number,
  courierId?: number,
): Promise<ActionResult<{ awb: string | null; courier: string | null }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const id = idSchema.parse(orderId);
    const cid = courierId ? idSchema.parse(courierId) : undefined;
    const s = await bookCourier({ orderId: id, courierId: cid, actorId: actor.id });
    await audit({
      actorId: actor.id,
      action: "shipment.book",
      entity: "order",
      entityId: id,
      summary: `Booked ${s.courier ?? "courier"} (AWB ${s.awb ?? "-"}) for order ${id}`,
    });
    return { awb: s.awb, courier: s.courier };
  });
}

export async function shippingLabelAction(orderId: number): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    await requireAdmin("orders.update");
    return { url: await getLabelUrl(idSchema.parse(orderId)) };
  });
}

export async function cancelShipmentAction(orderId: number): Promise<ActionResult<{ result: string }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const id = idSchema.parse(orderId);
    const result = await cancelShipment(id, actor.id);
    await audit({
      actorId: actor.id,
      action: "shipment.cancel",
      entity: "order",
      entityId: id,
      summary: `Cancel shipment for order ${id}: ${result}`,
    });
    return { result };
  });
}

export async function refreshTrackingAction(orderId: number): Promise<ActionResult<{ status: string | null }>> {
  return runAction(async () => {
    await requireAdmin("orders.update");
    const { snapshot } = await refreshTracking(idSchema.parse(orderId));
    return { status: snapshot.status };
  });
}

export async function shippingStatusAction(): Promise<ActionResult<{ enabled: boolean; missing: string[]; webhookTokenSet: boolean }>> {
  return runAction(async () => {
    await requireAdmin("orders.view");
    const s = shiprocketStatus();
    return { enabled: s.enabled, missing: s.missing, webhookTokenSet: s.webhookTokenSet };
  });
}
