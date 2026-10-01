import { z } from "zod";
import { INDIAN_STATES } from "@/lib/domain/india";
import {
  LOCALES,
  DELIVERY_OPTIONS,
  PAYMENT_METHODS,
  PAY_PREFS,
} from "@/lib/domain/enums";
import { cartLineSchema } from "@/lib/validation/cart";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, { error: "phone_invalid" }),
  email: z.string().trim().email().max(120),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const addressSchema = z.object({
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).default(""),
  landmark: z.string().trim().max(80).default(""),
  city: z.string().trim().min(2).max(60),
  state: z.enum(INDIAN_STATES),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, { error: "pincode_invalid" }),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z.object({
  locale: z.enum(LOCALES),
  lines: z.array(cartLineSchema).min(1).max(30),
  contact: contactSchema,
  address: addressSchema,
  saveAddress: z.boolean().default(false),
  delivery: z.enum(DELIVERY_OPTIONS),
  method: z.enum(PAYMENT_METHODS),
  payPref: z.enum(PAY_PREFS).nullable(),
  gift: z.boolean(),
  giftMessage: z.string().trim().max(200).nullable(),
  note: z.string().trim().max(300).nullable(),
  couponCode: z.string().trim().max(30).nullable(),
  draftToken: z.string().trim().max(64).nullable(),
  turnstileToken: z.string().trim().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const quoteSchema = z.object({
  lines: z.array(cartLineSchema).min(1).max(30),
  delivery: z.enum(DELIVERY_OPTIONS),
  method: z.enum(PAYMENT_METHODS),
  gift: z.boolean(),
  couponCode: z.string().trim().max(30).nullable(),
  email: z.string().trim().email().max(120).nullable(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const draftSchema = z.object({
  token: z.string().trim().max(64).nullable(),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/).optional(),
  name: z.string().trim().max(80).optional(),
  locale: z.enum(LOCALES),
  lines: z.array(cartLineSchema).min(1).max(30),
  totalInr: z.int().min(0),
});

export type DraftInput = z.infer<typeof draftSchema>;
