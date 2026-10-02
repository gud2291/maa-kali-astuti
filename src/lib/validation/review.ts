import { z } from "zod";
import { LOCALES, REVIEW_STATUS } from "@/lib/domain/enums";

export const reviewSubmitSchema = z.object({
  productId: z.string().trim().min(1, { error: "product_required" }),
  name: z.string().trim().min(2, { error: "name_min" }).max(60, { error: "name_max" }),
  city: z.string().trim().max(60, { error: "city_max" }).optional().or(z.literal("")),
  rating: z.number().int().min(1, { error: "rating_min" }).max(5, { error: "rating_max" }),
  title: z.string().trim().max(80, { error: "title_max" }).optional().or(z.literal("")),
  body: z.string().trim().min(20, { error: "body_min" }).max(1500, { error: "body_max" }),
  orderNumber: z.string().trim().optional().or(z.literal("")),
  contact: z.string().trim().max(120).optional().or(z.literal("")),
  photos: z
    .array(
      z.object({
        mediaId: z.number().int(),
        claimKey: z.string().trim().min(1),
      }),
    )
    .max(4)
    .default([]),
  locale: z.enum(LOCALES).default("en"),
  turnstileToken: z.string().optional(),
});

export type ReviewSubmitInput = z.infer<typeof reviewSubmitSchema>;

export const moreReviewsSchema = z.object({
  productId: z.string().trim().min(1),
  offset: z.number().int().min(0).default(0),
});

export type MoreReviewsInput = z.infer<typeof moreReviewsSchema>;

export const listReviewsSchema = z.object({
  status: z.enum(REVIEW_STATUS).optional(),
  page: z.number().int().min(1).default(1),
});

export type ListReviewsInput = z.infer<typeof listReviewsSchema>;
