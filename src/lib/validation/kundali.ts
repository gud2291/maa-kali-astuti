import { z } from "zod";

import { LOCALES, PAY_PREFS } from "@/lib/domain/enums";

export const placeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  tz: z.string().trim().min(1).max(60),
});

export const chartInputBaseShape = {
  name: z.string().trim().min(2).max(60),
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: "dobBad" })
    .refine(
      (val) => {
        const today = new Date().toISOString().slice(0, 10);
        return val >= "1900-01-01" && val <= today;
      },
      { error: "dobBad" },
    ),
  tob: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "tobBad" })
    .nullable(),
  tobUnknown: z.boolean(),
  place: placeSchema,
};

export const chartInputSchema = z
  .object(chartInputBaseShape)
  .superRefine((data, ctx) => {
    if (!data.tobUnknown && !data.tob) {
      ctx.addIssue({
        code: "custom",
        path: ["tob"],
        message: "tobRequired",
      });
    }
  });

export type ChartInput = z.infer<typeof chartInputSchema>;

export const kundaliOrderSchema = z
  .object({
    ...chartInputBaseShape,
    reportLang: z.enum(LOCALES),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, { error: "phoneBad" }),
    email: z.preprocess(
      (val) => (val === "" || val === null ? undefined : val),
      z.string().trim().email({ error: "emailBad" }).optional(),
    ),
    locale: z.enum(LOCALES),
    payPref: z.enum(PAY_PREFS),
  })
  .superRefine((data, ctx) => {
    if (!data.tobUnknown && !data.tob) {
      ctx.addIssue({
        code: "custom",
        path: ["tob"],
        message: "tobRequired",
      });
    }
  });

export type KundaliOrderInput = z.infer<typeof kundaliOrderSchema>;

