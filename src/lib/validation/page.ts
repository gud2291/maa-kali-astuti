import { z } from "zod";
import { POLICY_SLUGS } from "@/lib/domain/enums";
import { richDocSchema } from "./rich";

export function pageInputSchema(mediaBase: string) {
  return z.object({
    slug: z.enum(POLICY_SLUGS),
    titleEn: z
      .string()
      .trim()
      .min(1, "English title is required")
      .max(140, "Title must be ≤ 140 characters"),
    titleHi: z.string().trim().max(140, "Title must be ≤ 140 characters").default(""),
    bodyEn: richDocSchema(mediaBase),
    bodyHi: richDocSchema(mediaBase).nullable().optional().default(null),
  });
}

export type PageInput = z.infer<ReturnType<typeof pageInputSchema>>;
