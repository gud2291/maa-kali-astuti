import { z } from "zod";
import {
  RASHIFAL_PERIODS,
  RASHI_KEYS,
  CONTENT_STATUS,
  type RashifalPeriod,
  type RashiKey,
  type ContentStatus,
} from "@/lib/domain/enums";
import { addDaysKey, weekdayOfKey } from "@/lib/core/ist";

function computePeriodStart(period: string, dayKey: string): string {
  if (period === "day") return dayKey;
  if (period === "week") {
    const wd = weekdayOfKey(dayKey);
    const daysSinceMonday = (wd + 6) % 7;
    return addDaysKey(dayKey, -daysSinceMonday);
  }
  if (period === "month") {
    return `${dayKey.slice(0, 7)}-01`;
  }
  return `${dayKey.slice(0, 4)}-01-01`;
}

export const rashifalEntrySchema = z.object({
  rashi: z.enum(RASHI_KEYS),
  textEn: z
    .string()
    .trim()
    .min(20, "English text must be 20–1500 characters")
    .max(1500, "English text must be 20–1500 characters"),
  textHi: z
    .string()
    .trim()
    .max(1500, "Hindi text must be ≤ 1500 characters")
    .default(""),
  scores: z
    .object({
      love: z.number().int().min(1, "Love score 1–5").max(5, "Love score 1–5"),
      career: z.number().int().min(1, "Career score 1–5").max(5, "Career score 1–5"),
      health: z.number().int().min(1, "Health score 1–5").max(5, "Health score 1–5"),
      finance: z.number().int().min(1, "Finance score 1–5").max(5, "Finance score 1–5"),
    })
    .nullable()
    .optional()
    .default(null),
  lucky: z
    .object({
      number: z.number().int().min(1, "Lucky number 1–99").max(99, "Lucky number 1–99"),
      colour: z.object({
        en: z.string().trim().min(1, "English colour name required").max(80),
        hi: z.string().trim().max(80).default(""),
      }),
    })
    .nullable()
    .optional()
    .default(null),
  status: z.enum(CONTENT_STATUS).default("published"),
});

export const savePeriodEntriesSchema = z
  .object({
    period: z.enum(RASHIFAL_PERIODS),
    startsOn: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    entries: z
      .array(rashifalEntrySchema)
      .min(1, "At least 1 entry is required")
      .max(12, "At most 12 entries"),
  })
  .refine(
    (data) => data.startsOn === computePeriodStart(data.period, data.startsOn),
    {
      message: "startsOn must equal the period start date",
      path: ["startsOn"],
    },
  )
  .refine(
    (data) => {
      const keys = data.entries.map((e) => e.rashi);
      return new Set(keys).size === keys.length;
    },
    {
      message: "Duplicate rashis are not allowed in the same period",
      path: ["entries"],
    },
  );

export type SavePeriodEntriesInput = z.infer<typeof savePeriodEntriesSchema>;
export type RashifalEntryInput = z.infer<typeof rashifalEntrySchema>;
