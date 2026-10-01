# B01 — Foundation: env, helpers, tooling
**Risk:** M · **Needs:** B00 · **Agent:** any · **User setup before QA:** USER-SETUP §0, §1

## Goal
The base every later step uses: validated env, logger, errors/results, ids & hashes, cache helpers, IST + localisation helpers, drizzle tooling, CSP hosts for later services, and a proxy matcher that leaves `/admin` alone. No DB tables yet, no visible change on the site.

## Read first (only these)
- `docs/backend/RULES.md`
- `docs/backend/ARCHITECTURE.md` §2, §3, §4, §12
- `docs/backend/NEXT16.md`
- `docs/backend/USER-SETUP.md` §9
- `package.json`, `next.config.ts`, `src/proxy.ts`

## Install
```
pnpm add drizzle-orm@^0.45.3 @libsql/client@^0.18.0 server-only@^0.0.1
pnpm add -D drizzle-kit@^0.31.11 tsx@^4.23.15
```

## Files
Create: `.env.example`, `src/lib/domain/errors.ts`, `src/lib/domain/loc.ts`, `src/lib/core/ist.ts`, `src/server/env.ts`, `src/server/log.ts`, `src/server/result.ts`, `src/server/ids.ts`, `src/server/cache.ts`, `src/server/request.ts`, `drizzle.config.ts`
Modify: `package.json` (scripts only, besides the installs), `next.config.ts`, `src/proxy.ts`

## Tasks
- [x] T1. Run the two Install commands. — antigravity
- [x] T2. `.env.example`: every variable of USER-SETUP §9 in that order, grouped under comment headers `# Core`, `# Database`, `# Seed`, `# Cloudflare`, `# Email`, `# Payments`, `# Cron`. Each line has a one-line comment above it (where the value comes from) and an empty value, except `APP_URL=http://localhost:3000`.
- [x] T3. `src/lib/domain/errors.ts` (no imports): `export const ERROR_CODES = [...] as const` (exact list in ARCH §12), `export type ErrorCode`, and
  ```ts
  export type ActionResult<T> = { ok: true; data: T } | { ok: false; code: ErrorCode; message?: string; fieldErrors?: Record<string, string> };
  ```
- [x] T4. `src/server/env.ts`: — antigravity
  - `const emptyToUndef = (v: unknown) => (v === "" ? undefined : v);` `const opt = z.preprocess(emptyToUndef, z.string().trim().min(1).optional());`
  - required: `APP_URL: z.url()`, `AUTH_SECRET: z.string().min(32)`, `TURSO_DATABASE_URL: z.string().min(1)`, `TURSO_AUTH_TOKEN: z.string().min(1)`; `NODE_ENV: z.enum(["development", "production", "test"]).default("development")`.
  - optional (`opt`): `CF_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY R2_BUCKET_PUBLIC R2_BUCKET_PRIVATE NEXT_PUBLIC_TURNSTILE_SITE_KEY TURNSTILE_SECRET_KEY RESEND_API_KEY EMAIL_FROM EMAIL_REPLY_TO RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET RAZORPAY_WEBHOOK_SECRET CF_BROWSER_TOKEN CRON_SECRET`; `NEXT_PUBLIC_MEDIA_URL: z.preprocess(emptyToUndef, z.url().optional())`.
  - `safeParse(process.env)`; on failure `throw new Error("Invalid environment variables: " + names.join(", "))` — names only, never values. `export const env = parsed.data;`
  - `export function isConfigured(f: "r2" | "turnstile" | "email" | "razorpay" | "pdf" | "cron"): boolean` — r2: `CF_ACCOUNT_ID`, both R2 keys, both buckets, `NEXT_PUBLIC_MEDIA_URL`; turnstile: both Turnstile keys; email: `RESEND_API_KEY` + `EMAIL_FROM`; razorpay: the 3 Razorpay vars; pdf: `CF_ACCOUNT_ID` + `CF_BROWSER_TOKEN`; cron: `CRON_SECRET`.
- [x] T5. `src/server/log.ts`: `export const log = { info, warn, error }`, each `(event: string, data?: unknown) => void`, writing one JSON line with `console.info` / `console.warn` / `console.error`: `{ t: ISO time, level, event, ...data }`. An `Error` becomes `{ error: message, stack: first 5 stack lines joined by " | " }`; a non-object becomes `{ data }`. `export function maskEmail(e: string): string` (`"ravi.sharma@gmail.com"` → `"ra***@gmail.com"`), `export function maskPhone(p: string): string` (`"9876543210"` → `"******3210"`).
- [x] T6. `src/server/result.ts`: `export class AppError extends Error` (`code: ErrorCode`, optional `fieldErrors`; `name = "AppError"`), `export type { ActionResult }` (re-export), `export function zodFieldErrors(err: ZodError): Record<string, string>` (first message per `issue.path.join(".")`), `export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>>` — `unstable_rethrow(err)` first (from `next/navigation`), then `AppError` → `{ ok: false, code, message, fieldErrors }`, `ZodError` → `{ ok: false, code: "VALIDATION", fieldErrors }`, else `log.error("action.unhandled", err)` → `{ ok: false, code: "INTERNAL" }`.
- [x] T7. `src/server/ids.ts` (all from `node:crypto`; `CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"`):
  `randomToken(bytes = 32): string` (base64url) · `sha256Hex(s: string): string` · `hmacHex(s: string): string` (HMAC-SHA256 with `env.AUTH_SECRET`) · `safeEqualHex(a: string, b: string): boolean` (false on length mismatch, else `timingSafeEqual`) · `randomDigits(n: number): string` (`randomInt(0, 10)` per digit) · `randomCrockford(n: number): string` · `refCode(prefix: string, n: number): string` (= prefix + randomCrockford(n)) · `orderNumber(now = new Date()): string` → `"MKA-" + yymmdd (IST day of now) + "-" + randomCrockford(4)` · `newProductId(): string` → `"p" + randomCrockford(8).toLowerCase()`.
- [x] T8. `src/server/cache.ts`: `TAG` exactly as ARCH §4 (`catalog`, `product(id)`, `settings`, `consult`, `courses`, `rituals`, `videos`, `testimonials`, `faqs`, `articles`, `article(slug)`, `pages`, `page(slug)`, `rashifal`, `reviews`, `productReviews(id)` → `"reviews:" + id`).
  `cached(name, fn, tags)` per ARCH §4, plus: when `env.NODE_ENV === "development"` return `cache(fn)` only (dev always reads live data; production uses `unstable_cache`). `invalidate(...tags: string[]): void` → `updateTag` each. `invalidateLater(...tags: string[]): void` → `revalidateTag(tag, "max")` each.
- [x] T9. `src/server/request.ts`: `clientIp(): Promise<string>` (first `x-forwarded-for` value, else `x-real-ip`, else `"0.0.0.0"`; max 45 chars) · `userAgent(): Promise<string>` (≤ 200 chars) · `absoluteUrl(path: string): string` (against `env.APP_URL`) · `withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T>` (rejects with `Error(label + " timed out")`; clears its timer).
- [x] T10. `src/lib/domain/loc.ts` (no imports): `export type Loc = { en: string; hi: string }`; `loc(v: Loc | null | undefined, locale: string): string` (Hindi when locale is `"hi"` and `v.hi.trim()` is non-empty, else `v.en`; `""` for null); `emptyLoc(): Loc`; `locOf(en: string, hi = ""): Loc`.
- [x] T11. `src/lib/core/ist.ts` (no imports): `IST_TZ = "Asia/Kolkata"`; `istDayKey(d: Date | number): string` (yyyy-mm-dd of the IST calendar day); `istWallToUtc(dayKey: string, hhmm: string): Date` (IST is a fixed +05:30); `addDaysKey(dayKey: string, n: number): string`; `weekdayOfKey(dayKey: string): number` (0 = Sunday); `formatIst(d: Date | number, o: { date?: boolean; time?: boolean; weekday?: boolean; locale?: "en" | "hi" } = { date: true }): string` via `Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { timeZone: IST_TZ, numberingSystem: "latn", … })` — date = `d MMM yyyy`, time = `h:mm a`.
- [x] T12. `drizzle.config.ts`: — antigravity
  ```ts
  import { defineConfig } from "drizzle-kit";
  if (!process.env.TURSO_DATABASE_URL) {
    try { process.loadEnvFile(".env.local"); } catch { /* no .env.local: `db:generate` still works */ }
  }
  export default defineConfig({
    dialect: "turso",
    schema: "./src/server/db/schema/index.ts",
    out: "./drizzle",
    dbCredentials: { url: process.env.TURSO_DATABASE_URL ?? "", authToken: process.env.TURSO_AUTH_TOKEN },
  });
  ```
  `package.json` scripts: `"db:generate": "drizzle-kit generate"`, `"db:migrate": "drizzle-kit migrate"`, `"db:studio": "drizzle-kit studio"`, `"db:seed": "tsx scripts/db/seed.ts"`.
- [x] T13. `next.config.ts` — keep everything else; rebuild the CSP from these parts (keep dev `'unsafe-eval'` and `ws: wss:` as now):
  - `const mediaOrigin` = origin of `process.env.NEXT_PUBLIC_MEDIA_URL` (`""` if unset or invalid — use `try { new URL(…).origin }`); `const r2Origin = process.env.CF_ACCOUNT_ID ? "https://" + id + ".r2.cloudflarestorage.com" : ""`.
  - `script-src` + `https://checkout.razorpay.com https://challenges.cloudflare.com`
  - `img-src` + `https://cdn.razorpay.com` + mediaOrigin
  - `frame-src` + `https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com`
  - `connect-src` + `https://api.razorpay.com https://lumberjack.razorpay.com https://challenges.cloudflare.com` + r2Origin + mediaOrigin
  - empty origins are left out (no double spaces). `Permissions-Policy`: `payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")`, the rest unchanged.
  - extra `headers()` entries: `/admin/:path*` → `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`; `/api/:path*` → `X-Robots-Tag: noindex`.
- [x] T14. `src/proxy.ts`: matcher becomes `"/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)"` (keep the exact escaping style; update the comment).
- [x] T15. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- Must not create any DB schema, DB client or page. Must not import `src/server/env.ts` from any existing storefront file yet.

## Done-notes
Created: `.env.example`, `src/lib/domain/errors.ts`, `src/lib/domain/loc.ts`, `src/lib/core/ist.ts`, `src/server/env.ts`, `src/server/log.ts`, `src/server/result.ts`, `src/server/ids.ts`, `src/server/cache.ts`, `src/server/request.ts`, `drizzle.config.ts`.
Modified: `package.json` (added `db:generate`, `db:migrate`, `db:studio`, `db:seed` scripts), `next.config.ts` (CSP rebuilt with Razorpay/Turnstile/R2/media origins, Permissions-Policy payment, admin/api X-Robots-Tag headers), `src/proxy.ts` (added `admin` to matcher exclusion).
Installed: `drizzle-orm@0.45.3`, `@libsql/client@0.18.0`, `server-only@0.0.1` (deps); `drizzle-kit@0.31.11`, `tsx@4.23.15` (dev deps).
Migration added: no.
No existing storefront files were modified or import `src/server/env.ts`.

## Manual QA (user)
1. `pnpm install`. Copy `.env.example` → `.env.local`, fill USER-SETUP §0 + §1.
2. `pnpm dev`: home, `/shop`, `/videos` (open a video), `/hi` look exactly as before; DevTools console shows no CSP errors.
3. `http://localhost:3000/admin` shows a 404 (not a redirect to `/en/admin`).
4. `pnpm build` passes.
