import { z } from "zod";
import { LOCALES } from "@/lib/domain/enums";

const NEWSLETTER_SOURCES = ["footer", "home", "checkout", "account"] as const;

export const newsletterSchema = z.object({
  email: z.string().trim().email({ error: "email_invalid" }).max(120, { error: "email_max" }),
  locale: z.enum(LOCALES),
  source: z.enum(NEWSLETTER_SOURCES, { error: "source_invalid" }),
  turnstileToken: z.string().optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
