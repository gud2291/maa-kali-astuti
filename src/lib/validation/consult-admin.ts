import { z } from "zod";
import {
  MODE_KEYS,
  SERVICE_KEYS,
  TIER_KEYS,
  BOOKING_STATUS,
} from "@/lib/domain/enums";

/* ---------- shared loc schema (<= 300 chars) ---------- */

export const loc300Schema = z.object({
  en: z.string().max(300, "English text too long (max 300 chars)"),
  hi: z.string().max(300, "Hindi text too long (max 300 chars)"),
});

export type Loc300 = z.infer<typeof loc300Schema>;

/* ---------- Service Admin Schema ---------- */

export const serviceCoveredRowSchema = z.object({
  icon: z.string().trim().max(50, "Icon name too long"),
  t: loc300Schema,
  d: loc300Schema,
});

export const serviceSampleRowSchema = z.object({
  kind: z.string().trim().max(50, "Sample kind too long"),
  cap: loc300Schema,
});

export const serviceContentAdminSchema = z.object({
  line: loc300Schema,
  deliver: loc300Schema,
  get: loc300Schema,
  modesLine: loc300Schema,
  covered: z
    .array(serviceCoveredRowSchema)
    .max(10, "Maximum 10 covered rows allowed"),
  samples: z
    .array(serviceSampleRowSchema)
    .max(6, "Maximum 6 sample rows allowed"),
});

export const serviceAdminSchema = z.object({
  nameEn: z.string().trim().min(1, "English name is required").max(80),
  nameHi: z.string().trim().min(1, "Hindi name is required").max(80),
  icon: z.string().trim().max(50).optional(),
  modes: z
    .array(z.enum(MODE_KEYS))
    .min(1, "At least one consultation mode is required"),
  guarantee: z.boolean().default(false),
  content: serviceContentAdminSchema,
  sort: z.coerce.number().int().min(0).default(0),
  visible: z.boolean().default(true),
});

export type ServiceAdminInput = z.infer<typeof serviceAdminSchema>;

/* ---------- Tier Admin Schema ---------- */

export const tierAdminSchema = z.object({
  titleEn: z.string().trim().min(1, "English title is required").max(80),
  titleHi: z.string().trim().max(80).default(""),
  priceInr: z.coerce
    .number()
    .int()
    .min(1, "Price must be at least ₹1")
    .max(200000, "Price cannot exceed ₹2,00,000"),
  mins: z.coerce
    .number()
    .int()
    .min(15, "Duration must be at least 15 minutes")
    .max(180, "Duration cannot exceed 180 minutes"),
  recommended: z.boolean().default(false),
  inclusions: z
    .array(loc300Schema)
    .max(8, "Maximum 8 inclusions allowed")
    .default([]),
});

export type TierAdminInput = z.infer<typeof tierAdminSchema>;

/* ---------- Consult Settings Admin Schema ---------- */

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const dayRegex = /^\d{4}-\d{2}-\d{2}$/;

const timeListSchema = z
  .array(z.string().regex(timeRegex, "Invalid time format (HH:mm)"))
  .transform((arr) => Array.from(new Set(arr)).sort());

export const blockedRangeSchema = z.object({
  from: z.string().regex(dayRegex, "Invalid from date (YYYY-MM-DD)"),
  to: z.string().regex(dayRegex, "Invalid to date (YYYY-MM-DD)"),
  note: z.string().trim().max(200, "Note too long (max 200 chars)").default(""),
});

export const consultSettingsAdminSchema = z
  .object({
    startTimes: z.object({
      "30": timeListSchema,
      "45": timeListSchema,
      "60": timeListSchema,
      "90": timeListSchema,
    }),
    openDays: z
      .array(z.coerce.number().int().min(0).max(6))
      .transform((arr) => Array.from(new Set(arr)).sort((a, b) => a - b)),
    bookingWindowDays: z.coerce
      .number()
      .int()
      .min(1, "Window must be at least 1 day")
      .max(120, "Window cannot exceed 120 days"),
    minLeadHours: z.coerce
      .number()
      .int()
      .min(0, "Lead time cannot be negative")
      .max(72, "Lead time cannot exceed 72 hours"),
    holdMinutes: z.coerce
      .number()
      .int()
      .min(5, "Hold time must be at least 5 minutes")
      .max(30, "Hold time cannot exceed 30 minutes"),
    rescheduleMinHours: z.coerce
      .number()
      .int()
      .min(0, "Reschedule lead time cannot be negative")
      .max(72, "Reschedule lead time cannot exceed 72 hours"),
    maxReschedules: z.coerce
      .number()
      .int()
      .min(0, "Max reschedules cannot be negative")
      .max(3, "Max reschedules cannot exceed 3"),
    blocked: z
      .array(blockedRangeSchema)
      .max(50, "Maximum 50 blocked ranges allowed")
      .default([]),
  })
  .superRefine((data, ctx) => {
    data.blocked.forEach((item, index) => {
      if (item.from > item.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "From date must be on or before To date",
          path: ["blocked", index, "to"],
        });
      }
    });
  });

export type ConsultSettingsAdminInput = z.infer<
  typeof consultSettingsAdminSchema
>;

/* ---------- Booking Admin Schemas ---------- */

export const BOOKING_ADMIN_VIEWS = ["upcoming", "pending", "past", "all"] as const;
export type BookingAdminView = (typeof BOOKING_ADMIN_VIEWS)[number];

export const bookingListFilterSchema = z.object({
  view: z.enum(BOOKING_ADMIN_VIEWS).default("upcoming"),
  search: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type BookingListFilters = z.infer<typeof bookingListFilterSchema>;

export const bookingStatusUpdateSchema = z.object({
  to: z.enum(BOOKING_STATUS),
  note: z.string().trim().max(500, "Note too long (max 500 chars)").optional(),
});

export type BookingStatusUpdateInput = z.infer<
  typeof bookingStatusUpdateSchema
>;

export const meetingLinkSchema = z.object({
  meetingLink: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(300, "URL cannot exceed 300 characters")
    .refine(
      (val) => val.startsWith("https://"),
      "Meeting link must start with https://",
    ),
});

export type MeetingLinkInput = z.infer<typeof meetingLinkSchema>;

export const bookingNoteSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, "Note cannot be empty")
    .max(500, "Note cannot exceed 500 characters"),
});

export type BookingNoteInput = z.infer<typeof bookingNoteSchema>;

export const bookingCancelSchema = z.object({
  refund: z.boolean().default(false),
  reason: z
    .string()
    .trim()
    .max(500, "Reason too long (max 500 chars)")
    .optional(),
});

export type BookingCancelInput = z.infer<typeof bookingCancelSchema>;

export const adminRescheduleSchema = z.object({
  start: z.coerce.number().int().positive("Invalid slot start time"),
});

export type AdminRescheduleInput = z.infer<typeof adminRescheduleSchema>;
