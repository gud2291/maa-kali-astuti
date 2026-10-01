import { z } from "zod";
import { WRIST_SIZES } from "@/lib/domain/enums";

export const energizationSchema = z.object({
  name: z.string().trim().min(2).max(60),
  gotra: z.string().trim().min(2).max(40),
});

export const cartLineSchema = z.object({
  pid: z.string().trim().min(1).max(40),
  variant: z.enum(WRIST_SIZES).nullable(),
  qty: z.int().min(1).max(50),
  energ: energizationSchema.nullable(),
});

export type CartLineInput = z.infer<typeof cartLineSchema>;

export const checkCouponSchema = z.object({
  code: z.string().trim().min(1).max(30),
  lines: z.array(cartLineSchema).min(1).max(30),
});

export type CheckCouponInput = z.infer<typeof checkCouponSchema>;
