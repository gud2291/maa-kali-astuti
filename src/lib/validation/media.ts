import { z } from "zod";

export const PUBLIC_UPLOAD_PURPOSES = [
  "product",
  "category",
  "banner",
  "article",
  "testimonial",
  "setting",
] as const;

export const CUSTOMER_UPLOAD_PURPOSES = ["palm", "review"] as const;

export const ADMIN_PRIVATE_UPLOAD_PURPOSES = ["report"] as const;

export const UPLOAD_PURPOSES = [
  ...PUBLIC_UPLOAD_PURPOSES,
  ...CUSTOMER_UPLOAD_PURPOSES,
  ...ADMIN_PRIVATE_UPLOAD_PURPOSES,
] as const;

export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

const uploadFileItemSchema = z.object({
  w: z.int().min(1).max(4000),
  type: z.enum(["image/webp", "image/jpeg", "application/pdf"]),
  size: z.int().min(1).max(10_485_760),
});

export const createUploadSchema = z.object({
  purpose: z.enum(UPLOAD_PURPOSES),
  files: z.array(uploadFileItemSchema).min(1).max(3),
  width: z.int().min(1).max(10000).nullable().optional(),
  height: z.int().min(1).max(10000).nullable().optional(),
  blur: z.string().max(600).nullable().optional(),
});

export type CreateUploadInput = z.infer<typeof createUploadSchema>;

export const confirmUploadSchema = z.object({
  mediaId: z.int(),
});

export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
