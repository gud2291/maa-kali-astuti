"use server";

import { z } from "zod";
import { runAction } from "@/server/result";
import {
  createCoupon,
  updateCoupon,
  setCouponActive,
  deleteCoupon,
  type CouponRow,
} from "./admin";
import { couponInputSchema } from "@/lib/validation/coupon";
import type { ActionResult } from "@/lib/domain/errors";

const updateCouponSchema = couponInputSchema.and(
  z.object({
    id: z.number().int().positive(),
  }),
);

const setActiveSchema = z.object({
  id: z.number().int().positive(),
  active: z.boolean(),
});

const deleteSchema = z.object({
  id: z.number().int().positive(),
});

export async function createCouponAction(
  input: unknown,
): Promise<ActionResult<CouponRow>> {
  return runAction(async () => {
    const data = couponInputSchema.parse(input);
    return await createCoupon(data);
  });
}

export async function updateCouponAction(
  input: unknown,
): Promise<ActionResult<CouponRow>> {
  return runAction(async () => {
    const { id, ...data } = updateCouponSchema.parse(input);
    return await updateCoupon(id, data);
  });
}

export async function setCouponActiveAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const { id, active } = setActiveSchema.parse(input);
    await setCouponActive(id, active);
    return { success: true };
  });
}

export async function deleteCouponAction(
  input: unknown,
): Promise<ActionResult<{ success: true }>> {
  return runAction(async () => {
    const { id } = deleteSchema.parse(input);
    await deleteCoupon(id);
    return { success: true };
  });
}
