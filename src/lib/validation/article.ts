import { z } from "zod";
import { ARTICLE_CATEGORIES, CONTENT_STATUS } from "@/lib/domain/enums";
import { richDocSchema } from "./rich";

export const locFieldSchema = z.object({
  en: z.string().trim().max(2000).default(""),
  hi: z.string().trim().max(2000).default(""),
});

export function articleInputSchema(mediaBase: string) {
  return z.object({
    slug: z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(80, "Slug must be ≤ 80 characters")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
    category: z.enum(ARTICLE_CATEGORIES),
    titleEn: z.string().trim().min(1, "English title is required").max(140, "Title must be ≤ 140 characters"),
    titleHi: z.string().trim().max(140, "Title must be ≤ 140 characters").default(""),
    excerptEn: z.string().trim().min(1, "English excerpt is required").max(300, "Excerpt must be ≤ 300 characters"),
    excerptHi: z.string().trim().max(300, "Excerpt must be ≤ 300 characters").default(""),
    bodyEn: richDocSchema(mediaBase),
    bodyHi: richDocSchema(mediaBase).nullable().optional().default(null),
    coverMediaId: z.number().int().positive().nullable().optional().default(null),
    legacyArt: z.string().trim().nullable().optional().default(null),
    readMins: z.coerce.number().int().min(1, "Read mins must be 1–60").max(60, "Read mins must be 1–60").default(5),
    faq: z
      .array(
        z.object({
          q: locFieldSchema,
          a: locFieldSchema,
        }),
      )
      .max(10, "FAQ must have at most 10 items")
      .default([]),
    productIds: z.array(z.string().trim()).max(6, "At most 6 products can be mentioned").default([]),
    status: z.enum(CONTENT_STATUS).default("draft"),
    publishedAt: z
      .union([z.string(), z.number(), z.date()])
      .nullable()
      .optional()
      .transform((val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
      })
      .default(null),
    seoTitleEn: z
      .string()
      .trim()
      .max(70)
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v ?? null))
      .default(null),
    seoTitleHi: z
      .string()
      .trim()
      .max(70)
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v ?? null))
      .default(null),
    seoDescEn: z
      .string()
      .trim()
      .max(170)
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v ?? null))
      .default(null),
    seoDescHi: z
      .string()
      .trim()
      .max(170)
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v ?? null))
      .default(null),
  });
}

export type ArticleInput = z.infer<ReturnType<typeof articleInputSchema>>;
