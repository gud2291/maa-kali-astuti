import { z } from "zod";
import { COUPON_KINDS } from "@/lib/domain/enums";

const dateOrNull = z
  .union([z.date(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (!val || val === "") return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  });

const positiveIntOrNull = z
  .union([z.number().int().positive(), z.literal(""), z.null(), z.undefined()])
  .transform((v) => (v === "" || v === undefined || v === null ? null : Number(v)));

export const couponInputSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Coupon code must be at least 3 characters")
      .max(30, "Coupon code cannot exceed 30 characters")
      .regex(
        /^[A-Za-z0-9_-]{3,30}$/,
        "Coupon code may only contain uppercase letters, numbers, underscores and hyphens",
      )
      .transform((val) => val.toUpperCase()),
    kind: z.enum(COUPON_KINDS),
    value: z.number().int({ message: "Discount value must be a whole number" }),
    minCartInr: z
      .number()
      .int()
      .min(0, "Minimum cart amount must be 0 or more")
      .default(0),
    maxDiscountInr: positiveIntOrNull,
    startsAt: dateOrNull,
    endsAt: dateOrNull,
    usageLimit: positiveIntOrNull,
    perCustomerLimit: positiveIntOrNull,
    firstOrderOnly: z.boolean().default(false),
    active: z.boolean().default(true),
    note: z
      .string()
      .trim()
      .max(200, "Internal note cannot exceed 200 characters")
      .nullable()
      .optional()
      .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "percent") {
      if (data.value < 1 || data.value > 90) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Percentage discount must be between 1% and 90%",
          path: ["value"],
        });
      }
    } else if (data.kind === "flat") {
      if (data.value < 1 || data.value > 100000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Flat discount must be between ₹1 and ₹1,00,000",
          path: ["value"],
        });
      }
      if (data.maxDiscountInr != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum discount cap is only allowed for percentage coupons",
          path: ["maxDiscountInr"],
        });
      }
    }

    if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
        path: ["endsAt"],
      });
    }
  });

export type CouponInput = z.infer<typeof couponInputSchema>;
