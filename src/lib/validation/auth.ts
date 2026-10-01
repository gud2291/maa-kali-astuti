import { z } from "zod";
import { OTP_PURPOSES, LOCALES } from "@/lib/domain/enums";

const emailSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z.email().max(120),
);

export const otpRequestSchema = z.object({
  email: emailSchema,
  purpose: z.enum(OTP_PURPOSES),
  turnstileToken: z.string().max(2048).optional(),
  locale: z.enum(LOCALES),
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

export const otpVerifySchema = z.object({
  email: emailSchema,
  purpose: z.enum(OTP_PURPOSES),
  code: z.string().regex(/^\d{6}$/),
  next: z.string().max(200).optional(),
});

export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
