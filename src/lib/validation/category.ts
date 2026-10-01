import { z } from "zod";

export const categoryInputSchema = z.object({
  nameEn: z.string().trim().min(2, "English name must be at least 2 characters").max(120),
  nameHi: z.string().trim().max(120).default(""),
  shortEn: z.string().trim().min(1, "Short label is required").max(200),
  shortHi: z.string().trim().max(200).default(""),
  descEn: z.string().trim().max(600, "English description cannot exceed 600 characters").default(""),
  descHi: z.string().trim().max(600, "Hindi description cannot exceed 600 characters").default(""),
  seoTitleEn: z
    .string()
    .trim()
    .max(70)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .default(null),
  seoTitleHi: z
    .string()
    .trim()
    .max(70)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .default(null),
  seoDescEn: z
    .string()
    .trim()
    .max(170)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .default(null),
  seoDescHi: z
    .string()
    .trim()
    .max(170)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .default(null),
  sort: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
