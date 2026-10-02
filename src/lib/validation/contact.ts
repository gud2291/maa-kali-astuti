import { z } from "zod";
import { MESSAGE_TOPICS, LOCALES } from "@/lib/domain/enums";

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, { error: "name_min" }).max(80, { error: "name_max" }),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, { error: "phone_invalid" })
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .email({ error: "email_invalid" })
      .max(120, { error: "email_max" })
      .optional()
      .or(z.literal("")),
    topic: z.enum(MESSAGE_TOPICS, { error: "topic_required" }),
    body: z.string().trim().min(10, { error: "body_min" }).max(2000, { error: "body_max" }),
    locale: z.enum(LOCALES),
    turnstileToken: z.string().optional(),
  })
  .refine(
    (d) => {
      const hasPhone = d.phone !== undefined && d.phone !== "";
      const hasEmail = d.email !== undefined && d.email !== "";
      return hasPhone || hasEmail;
    },
    { error: "phone_or_email_required" },
  );

export type ContactInput = z.infer<typeof contactSchema>;
