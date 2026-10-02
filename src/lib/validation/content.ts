import { z } from "zod";
import {
  VIDEO_KINDS,
  TESTIMONIAL_KINDS,
  FAQ_SETS,
  COURSE_KEYS,
  type VideoKind,
  type TestimonialKind,
  type FaqSet,
  type CourseKey,
} from "@/lib/domain/enums";
import { ICON_PATHS } from "@/lib/art/icons";
import type { IconName } from "@/components/icons/Icon";
import type { Loc } from "@/lib/domain/loc";

const locFieldSchema = z.object({
  en: z.string().max(2000).default(""),
  hi: z.string().max(2000).default(""),
});

export const videoSchema = z.object({
  kind: z.enum(VIDEO_KINDS),
  youtubeId: z
    .string()
    .trim()
    .regex(/^[\w-]{11}$/, "Must be an 11-character YouTube video ID")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  category: z.string().trim().min(1, "Category is required").max(50),
  titleEn: z.string().trim().min(1, "English title is required").max(140),
  titleHi: z.string().trim().min(1, "Hindi title is required").max(140),
  descEn: z
    .string()
    .trim()
    .max(1000, "Description must be ≤ 1000 characters")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  descHi: z
    .string()
    .trim()
    .max(1000, "Description must be ≤ 1000 characters")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  duration: z
    .string()
    .trim()
    .regex(/^\d{1,2}:\d{2}(:\d{2})?$/, "Duration must be mm:ss or hh:mm:ss"),
  publishedOn: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
});

export type VideoInput = z.infer<typeof videoSchema>;

export const videoCategoryItemSchema = z.object({
  key: z.string().trim().min(1).max(50),
  label: z.object({
    en: z.string().trim().min(1, "English label is required").max(100),
    hi: z.string().trim().min(1, "Hindi label is required").max(100),
  }),
});

export const videoCategoriesSchema = z.array(videoCategoryItemSchema);

export type VideoCategoryItem = z.infer<typeof videoCategoryItemSchema>;

export const testimonialSchema = z.object({
  kind: z.enum(TESTIMONIAL_KINDS).default("text"),
  quoteEn: z
    .string()
    .trim()
    .min(10, "Quote must be at least 10 characters")
    .max(600, "Quote must be ≤ 600 characters"),
  quoteHi: z
    .string()
    .trim()
    .max(600, "Hindi quote must be ≤ 600 characters")
    .default(""),
  name: z.string().trim().min(1, "Name is required").max(100),
  city: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  tag: z
    .string()
    .trim()
    .max(100)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .nullable()
    .optional(),
  youtubeId: z
    .string()
    .trim()
    .regex(/^[\w-]{11}$/, "Must be an 11-character YouTube video ID")
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  mediaId: z.number().int().positive().nullable().optional(),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const faqSchema = z.object({
  setKey: z.enum(FAQ_SETS),
  qEn: z.string().trim().min(1, "English question is required").max(300),
  qHi: z.string().trim().max(300).default(""),
  aEn: z.string().trim().min(1, "English answer is required").max(2000),
  aHi: z.string().trim().max(2000).default(""),
  visible: z.boolean().default(true),
});

export type FaqInput = z.infer<typeof faqSchema>;

export const courseSchema = z.object({
  nameEn: z.string().trim().min(1, "English name is required").max(100),
  nameHi: z.string().trim().min(1, "Hindi name is required").max(100),
  deity: z.string().trim().min(1, "Deity is required").max(100),
  days: z.number().int().min(1).max(120),
  content: z.object({
    essence: locFieldSchema,
    overview: locFieldSchema,
    niyam: locFieldSchema,
    attain: z.array(locFieldSchema).max(8, "Attainments must be ≤ 8"),
  }),
  feeInr: z.number().int().nonnegative().nullable().optional(),
  visible: z.boolean().default(true),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const ritualSchema = z.object({
  icon: z.string().refine((val): val is IconName => val in ICON_PATHS, {
    message: "Invalid icon name",
  }),
  nameEn: z.string().trim().min(1, "English name is required").max(100),
  nameHi: z.string().trim().min(1, "Hindi name is required").max(100),
  lineEn: z.string().trim().min(1, "English line is required").max(300),
  lineHi: z.string().trim().max(300).default(""),
  visible: z.boolean().default(true),
});

export type RitualInput = z.infer<typeof ritualSchema>;

export const reorderSchema = z.object({
  ids: z.array(z.union([z.number().int(), z.string()])).max(200),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
