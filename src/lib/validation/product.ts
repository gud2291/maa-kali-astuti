import { z } from "zod";
import {
  CATEGORY_KEYS,
  INTENT_KEYS,
  STONE_KEYS,
  WRIST_SIZES,
  BADGE_KEYS,
  PRODUCT_STATUS,
} from "../domain/enums";

export const locSchema = z.object({
  en: z.string().max(4000).default(""),
  hi: z.string().max(4000).default(""),
});

export const productContentSchema = z.object({
  description: locSchema,
  benefits: z.array(locSchema).max(12).default([]),
  howToWear: locSchema,
  specs: z
    .array(
      z.object({
        k: locSchema,
        v: locSchema,
      }),
    )
    .max(20)
    .default([]),
  placement: z.array(locSchema).max(8).default([]),
  certificateMediaId: z.number().int().positive().nullable().default(null),
  youtubeId: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().regex(/^[\w-]{11}$/, "Invalid YouTube Video ID (must be 11 characters)").nullable())
    .default(null),
});

export type ProductContentInput = z.infer<typeof productContentSchema>;

export const productInputSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .max(80)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
    categoryKey: z.enum(CATEGORY_KEYS),
    sub: z
      .string()
      .trim()
      .max(50)
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional()
      .default(null),
    mukhi: z
      .number()
      .int()
      .min(1)
      .max(30)
      .nullable()
      .optional()
      .default(null),
    stone: z
      .enum(STONE_KEYS)
      .nullable()
      .optional()
      .default(null),
    stoneName: z
      .string()
      .trim()
      .max(60)
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional()
      .default(null),
    nameEn: z.string().trim().min(2, "English name must be at least 2 characters").max(120),
    nameHi: z.string().trim().max(120).default(""),
    longEn: z
      .string()
      .trim()
      .max(200)
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional()
      .default(null),
    longHi: z
      .string()
      .trim()
      .max(200)
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional()
      .default(null),
    intentEn: z.string().trim().min(2, "Intent line must be at least 2 characters").max(80),
    intentHi: z.string().trim().max(80).default(""),
    intentKey: z.enum(INTENT_KEYS),
    priceInr: z.number().int().min(1, "Price must be at least ₹1").max(500000),
    mrpInr: z.number().int().min(1, "MRP must be at least ₹1").max(500000),
    stock: z.number().int().min(0).max(100000).default(0),
    lowStockAt: z.number().int().min(0).max(1000).default(5),
    sizes: z.array(z.enum(WRIST_SIZES)).nullable().optional().default(null),
    badges: z.array(z.enum(BADGE_KEYS)).default([]),
    content: productContentSchema.default({
      description: { en: "", hi: "" },
      benefits: [],
      howToWear: { en: "", hi: "" },
      specs: [],
      placement: [],
      certificateMediaId: null,
      youtubeId: null,
    }),
    mediaIds: z.array(z.number().int().positive()).max(12).default([]),
    relatedIds: z.array(z.string()).max(12).default([]),
    energizable: z.boolean().default(true),
    gstRate: z.number().min(0).max(28).nullable().optional().default(null),
    hsn: z
      .string()
      .trim()
      .max(12)
      .transform((v) => (v === "" ? null : v))
      .nullable()
      .optional()
      .default(null),
    weightG: z.number().int().min(0).max(100000).nullable().optional().default(null),
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
    status: z.enum(PRODUCT_STATUS).default("draft"),
    featured: z.boolean().default(false),
    sort: z.number().int().default(0),
  })
  .superRefine((data, ctx) => {
    if (data.priceInr > data.mrpInr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price cannot be greater than MRP",
        path: ["priceInr"],
      });
    }

    if (data.categoryKey !== "bracelets") {
      if (data.sizes && data.sizes.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sizes are only allowed for bracelets",
          path: ["sizes"],
        });
      }
      if (data.stone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stone is only allowed for bracelets",
          path: ["stone"],
        });
      }
      if (data.stoneName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Stone name is only allowed for bracelets",
          path: ["stoneName"],
        });
      }
    }

    if (data.categoryKey !== "rudraksha") {
      if (data.sub) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sub-filter is only allowed for rudraksha",
          path: ["sub"],
        });
      }
      if (data.mukhi != null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mukhi is only allowed for rudraksha",
          path: ["mukhi"],
        });
      }
    }
  });

export type ProductInput = z.infer<typeof productInputSchema>;
