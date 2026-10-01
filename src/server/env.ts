import "server-only";
import { z } from "zod";

const emptyToUndef = (v: unknown): unknown => (v === "" ? undefined : v);
const opt = z.preprocess(emptyToUndef, z.string().trim().min(1).optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /* Core */
  APP_URL: z.url(),
  AUTH_SECRET: z.string().min(32),

  /* Database */
  TURSO_DATABASE_URL: z.string().min(1),
  TURSO_AUTH_TOKEN: z.string().min(1),

  /* Seed */
  SEED_OWNER_EMAIL: opt,
  SEED_OWNER_NAME: opt,

  /* Cloudflare */
  CF_ACCOUNT_ID: opt,
  R2_ACCESS_KEY_ID: opt,
  R2_SECRET_ACCESS_KEY: opt,
  R2_BUCKET_PUBLIC: opt,
  R2_BUCKET_PRIVATE: opt,
  NEXT_PUBLIC_MEDIA_URL: z.preprocess(emptyToUndef, z.url().optional()),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: opt,
  TURNSTILE_SECRET_KEY: opt,
  CF_BROWSER_TOKEN: opt,

  /* Email */
  RESEND_API_KEY: opt,
  EMAIL_FROM: opt,
  EMAIL_REPLY_TO: opt,

  /* Payments */
  RAZORPAY_KEY_ID: opt,
  RAZORPAY_KEY_SECRET: opt,
  RAZORPAY_WEBHOOK_SECRET: opt,

  /* Cron */
  CRON_SECRET: opt,
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const names = parsed.error.issues.map((i) => i.path.join("."));
  throw new Error("Invalid environment variables: " + names.join(", "));
}

export const env = parsed.data;

export function isConfigured(
  f: "r2" | "turnstile" | "email" | "razorpay" | "pdf" | "cron",
): boolean {
  switch (f) {
    case "r2":
      return !!(
        env.CF_ACCOUNT_ID &&
        env.R2_ACCESS_KEY_ID &&
        env.R2_SECRET_ACCESS_KEY &&
        env.R2_BUCKET_PUBLIC &&
        env.R2_BUCKET_PRIVATE &&
        env.NEXT_PUBLIC_MEDIA_URL
      );
    case "turnstile":
      return !!(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
    case "email":
      return !!(env.RESEND_API_KEY && env.EMAIL_FROM);
    case "razorpay":
      return !!(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_WEBHOOK_SECRET);
    case "pdf":
      return !!(env.CF_ACCOUNT_ID && env.CF_BROWSER_TOKEN);
    case "cron":
      return !!env.CRON_SECRET;
  }
}
