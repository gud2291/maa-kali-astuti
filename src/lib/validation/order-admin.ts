import { z } from "zod";
import { ORDER_STATUS, PAYMENT_METHODS } from "@/lib/domain/enums";

export const ORDER_ADMIN_TABS = [
  "all",
  "new",
  "energizing",
  "packed",
  "shipped",
  "delivered",
  "pending_payment",
  "cancelled",
  "attention",
] as const;

export type OrderAdminTab = (typeof ORDER_ADMIN_TABS)[number];

export const orderListFilterSchema = z.object({
  tab: z.enum(ORDER_ADMIN_TABS).default("all"),
  search: z.string().trim().max(60).optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid from date (YYYY-MM-DD)")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid to date (YYYY-MM-DD)")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type OrderListFilters = z.infer<typeof orderListFilterSchema>;

// Rendered as a link on the customer's order page: only http(s), never `javascript:` and co.
const trackingUrlSchema = z
  .string()
  .trim()
  .max(500)
  .regex(/^https?:\/\/[^\s]+$/i, "Must start with https://")
  .optional()
  .or(z.literal(""));

export const transitionSchema = z
  .object({
    to: z.enum(ORDER_STATUS),
    note: z.string().trim().max(500).optional(),
    notify: z.boolean().default(true),
    courier: z.string().trim().max(60).optional(),
    awb: z.string().trim().max(40).optional(),
    trackingUrl: trackingUrlSchema,
  })
  .superRefine((data, ctx) => {
    if (data.to === "shipped") {
      if (!data.courier || data.courier.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Courier is required when shipping an order",
          path: ["courier"],
        });
      }
      if (!data.awb || data.awb.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "AWB / Tracking number is required when shipping an order",
          path: ["awb"],
        });
      }
    }
  });

export type TransitionInput = z.infer<typeof transitionSchema>;

export const refundSchema = z.object({
  amountInr: z.coerce.number().int().min(1, "Refund amount must be at least ₹1"),
  reason: z.string().trim().max(200).optional(),
});

export type RefundInput = z.infer<typeof refundSchema>;

export const orderNoteSchema = z.object({
  note: z.string().trim().min(1, "Note cannot be empty").max(2000, "Note too long"),
});

export type OrderNoteInput = z.infer<typeof orderNoteSchema>;

export const energizationBulkSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  scope: z.literal("placed"),
});

export type EnergizationBulkInput = z.infer<typeof energizationBulkSchema>;

export const trackingSchema = z.object({
  courier: z.string().trim().min(1, "Courier is required").max(60),
  awb: z.string().trim().min(1, "AWB is required").max(40),
  trackingUrl: trackingUrlSchema,
});

export type TrackingInput = z.infer<typeof trackingSchema>;
