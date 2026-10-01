"use server";

import { z } from "zod";
import { runAction, type ActionResult } from "@/server/result";
import { requireAdmin } from "@/server/auth/guards";
import { invalidate, TAG } from "@/server/cache";
import {
  transitionOrder,
  setEnergizationDate,
  updateTracking,
  markCodCollected,
  addOrderNote,
  resolveAttention,
  exportOrdersCsv,
} from "./admin";
import { refundOrder } from "./refunds";
import {
  orderListFilterSchema,
  transitionSchema,
  refundSchema,
  orderNoteSchema,
  energizationBulkSchema,
  trackingSchema,
  type TransitionInput,
  type RefundInput,
  type OrderNoteInput,
  type EnergizationBulkInput,
  type TrackingInput,
  type OrderListFilters,
} from "@/lib/validation/order-admin";
import { istDayKey } from "@/lib/core/ist";

export async function transitionOrderAction(
  orderId: number,
  input: TransitionInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const parsed = transitionSchema.parse(input);
    const validId = z.coerce.number().int().positive().parse(orderId);

    const res = await transitionOrder(validId, parsed, actor);
    if (res.restocked && res.productIds.length > 0) {
      invalidate(TAG.catalog, ...res.productIds.map((pid) => TAG.product(pid)));
    }
    return { ok: true };
  });
}

export async function setEnergizationDateAction(
  input: EnergizationBulkInput,
): Promise<ActionResult<{ count: number }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const parsed = energizationBulkSchema.parse(input);
    const res = await setEnergizationDate(parsed.date, parsed.scope, actor);
    return res;
  });
}

export async function updateTrackingAction(
  orderId: number,
  input: TrackingInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const parsed = trackingSchema.parse(input);
    const validId = z.coerce.number().int().positive().parse(orderId);

    return updateTracking(validId, parsed, actor);
  });
}

export async function markCodCollectedAction(
  orderId: number,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const validId = z.coerce.number().int().positive().parse(orderId);

    return markCodCollected(validId, actor);
  });
}

export async function addOrderNoteAction(
  orderId: number,
  input: OrderNoteInput,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const parsed = orderNoteSchema.parse(input);
    const validId = z.coerce.number().int().positive().parse(orderId);

    return addOrderNote(validId, parsed.note, actor);
  });
}

export async function resolveAttentionAction(
  orderId: number,
): Promise<ActionResult<{ ok: boolean }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.update");
    const validId = z.coerce.number().int().positive().parse(orderId);

    return resolveAttention(validId, actor);
  });
}

export async function refundOrderAction(
  orderId: number,
  input: RefundInput,
): Promise<ActionResult<{ ok: boolean; refundId: number; status: string }>> {
  return runAction(async () => {
    const actor = await requireAdmin("orders.refund");
    const parsed = refundSchema.parse(input);
    const validId = z.coerce.number().int().positive().parse(orderId);

    return refundOrder(validId, parsed, actor);
  });
}

export async function exportOrdersCsvAction(
  filters: OrderListFilters,
): Promise<ActionResult<{ csv: string; filename: string }>> {
  return runAction(async () => {
    const actor = await requireAdmin("exports.run");
    const parsed = orderListFilterSchema.parse(filters);
    const csv = await exportOrdersCsv(parsed, actor);
    const filename = `orders-${istDayKey(new Date())}.csv`;
    return { csv, filename };
  });
}
