import { z } from "zod";
import { addressSchema } from "@/lib/validation/checkout";
import type { BirthProfile } from "@/lib/domain/types";

export const birthProfileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "dob_invalid" })
    .refine(
      (val) => {
        const today = new Date().toISOString().slice(0, 10);
        return val <= today;
      },
      { error: "dob_future" },
    ),
  tob: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "tob_invalid" })
    .nullable()
    .or(z.literal("").transform(() => null)),
  tobUnknown: z.boolean().default(false),
  place: z.string().trim().min(2).max(120),
  lat: z.number().nullable().default(null),
  lon: z.number().nullable().default(null),
  tz: z.string().nullable().default(null),
}) satisfies z.ZodType<BirthProfile>;

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, { error: "phone_invalid" })
    .or(z.literal(""))
    .default(""),
  birth: birthProfileSchema.nullable().default(null),
  marketingOptIn: z.boolean().default(false),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const addressInputSchema = addressSchema.extend({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, { error: "phone_invalid" }),
  isDefault: z.boolean().default(false),
});

export type AddressFormInput = z.infer<typeof addressInputSchema>;
