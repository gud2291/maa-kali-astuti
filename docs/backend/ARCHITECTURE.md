# ARCHITECTURE — Phase B (backend · admin · commerce)

Steps point to sections ("ARCH §7"). Read only the sections your step names.
Names written here (files, functions, tags, cookies) are binding. Do not rename them.

---

## §1 System

```
Browser ──► Vercel · Next.js 16.3 App Router · Node runtime · functions region bom1 (Mumbai)
             ├─ storefront pages  static HTML, regenerated on demand by cache tags (§4)
             ├─ Server Actions    every mutation (src/server/**/actions.ts, admin-actions.ts)
             ├─ Route Handlers    /api/* : webhooks, cron, CDN-cached public JSON
             └─ src/proxy.ts      next-intl locale routing only (never auth)
Services ──► Turso (libSQL DB) · Cloudflare R2 (files) · Razorpay (payments) · Resend (email)
             Cloudflare Turnstile (bot check) · Cloudflare Browser Rendering (Kundali PDF)
             YouTube oEmbed (video titles) · India Post API (pincode → city/state)
```
- Admin lives in the same app at `/admin`: own root layout, English UI, always dynamic.
- `cacheComponents` stays **off**. Never use `"use cache"`.

---

## §2 Folders (new in phase B)

```
src/app/
  [locale]/…                       storefront (phase F pages + new ones: product, cart, checkout, order/success,
                                   account/**, track-order, wishlist, search, blog/**, contact, faq, policies/[slug],
                                   kundali/report/[ref], invoice/[number])
  admin/
    layout.tsx                     admin ROOT layout (<html>, fonts, globals.css, admin.css)
    login/page.tsx                 email-OTP login
    (panel)/layout.tsx             shell; redirects to /admin/login without an admin session
    (panel)/page.tsx               dashboard
    (panel)/<section>/…            orders, products, categories, coupons, customers, bookings, services,
                                   availability, kundali, inquiries, messages, subscribers, reviews,
                                   content/*, media, settings, staff, audit, health, search
  api/
    catalog/route.ts               GET client snapshot (CDN cached)
    pincode/[pin]/route.ts         GET city/state/ETA
    places/route.ts                GET birth-place search
    slots/route.ts                 GET consultation slots for a date
    rashifal/route.ts              GET published rashifal text
    kundali/[ref]/generate/route.ts POST build the PDF (maxDuration 60)
    webhooks/razorpay/route.ts     POST
    cron/daily/route.ts            GET (Vercel Cron)
    cron/frequent/route.ts         GET (external pinger)
src/server/                        SERVER ONLY (see §3)
  env.ts log.ts result.ts ids.ts cache.ts request.ts audit.ts rate-limit.ts
  db/client.ts  db/schema/{core,catalog,content,commerce,consult,crm,index}.ts
  auth/ email/ storage/ media/ payments/ settings/ staff/               platform
  catalog/ consult/ bookings/ courses/ rituals/ videos/ testimonials/
  faqs/ articles/ pages/ rashifal/ home/ cart/ orders/ coupons/
  reviews/ kundali/ inquiries/ messages/ customers/ account/ dashboard/ cron/ search/   domains
src/lib/
  domain/                          ISOMORPHIC shared code: enums.ts, types.ts, errors.ts, permissions.ts, loc.ts, media.ts
  validation/                      zod schemas shared by forms and actions (phase F folder, extended)
  media/prepare-image.ts           browser-side resize/encode before upload
  payments/razorpay-client.ts      loads checkout.js on demand, opens the modal
src/components/
  admin/                           admin UI kit (ui/) + admin section components (<section>/)
  media/MediaImg.tsx               <img srcset> for uploaded images
  sections/<page>/                 new storefront page sections (pdp/, cart/, checkout/, account/, blog/ …)
src/stores/catalog.ts              client catalog snapshot store (new)
scripts/db/{migrate,seed}.ts       run by the USER (pnpm db:migrate / db:seed)
scripts/data/build-places.mjs      builds the birth-place dataset (B25)
drizzle/                           generated SQL migrations — commit them, never edit by hand
```

### Domain folder convention (fixed file names)
Inside `src/server/<domain>/` use only these names:

| File | Starts with | Contains |
|---|---|---|
| `queries.ts` | `import "server-only"` | storefront reads, wrapped in `cached()` (§4) |
| `admin.ts` | `import "server-only"` | admin reads + writes; **every export first calls `await requireAdmin(perm)`** |
| `service.ts` | `import "server-only"` | business logic shared by actions, webhooks, cron. No auth checks inside. |
| `actions.ts` | `"use server"` | public / customer Server Actions |
| `admin-actions.ts` | `"use server"` | admin Server Actions (thin: parse → `admin.ts` → `invalidate()` → result) |
| other names | `import "server-only"` | only when the step lists them (e.g. `availability.ts`, `numbers.ts`) |

---

## §3 Layer rules

1. Pages, layouts and route handlers stay thin: read params → call a server module → render / respond.
2. `src/server/**` files start with `import "server-only"` — except `actions.ts` / `admin-actions.ts`, which start with `"use server"` and export only async functions.
3. Client components may import: `src/server/**/actions.ts`, `src/server/**/admin-actions.ts`, `src/lib/**`, `src/stores/**`, `src/components/**`. Nothing else from `src/server`.
4. Server Actions are public HTTP endpoints. Every action: `runAction(async () => { zod parse → guard (auth / permission / rate limit / Turnstile) → service or admin.ts → invalidate → return data })`.
5. Admin pages call `await requireAdminPage(perm)` on their first line. Layout checks are UX only (layouts don't re-run on client navigation).
6. Account pages call `await requireCustomerPage(locale, path)` first.
7. Shared zod schemas live in `src/lib/validation/<domain>.ts` so forms and actions use the same rules.
8. Isomorphic types/enums live in `src/lib/domain/*`. The DB schema imports enums from there.

---

## §4 Rendering & caching (Next "previous model")

- Storefront pages under `src/app/[locale]` stay **static**: no `cookies()`, `headers()` or `searchParams` in their server components (query params are read in client islands, as in phase F).
- **Dynamic pages** (may read cookies/searchParams): `/checkout`, `/order/success`, `/account/**`, `/kundali/report/[ref]`, `/invoice/[number]`, every `/admin/**` page.
- Product and article pages keep `generateStaticParams` and set `dynamicParams = true`, so items created later render on first visit and are then cached.

### `cached()` — `src/server/cache.ts`
```ts
export function cached<A extends (string | number | boolean | null)[], R>(
  name: string,
  fn: (...args: A) => Promise<R>,
  tags: (...args: A) => string[],
): (...args: A) => Promise<R>
// = React cache( (...args) => unstable_cache(() => fn(...args), [name, ...args.map(String)], { tags: tags(...args) })() )
```
- Results pass through JSON: **return plain data only** — numbers (epoch ms) instead of `Date`, no `Map`/`Set`/`undefined` inside arrays.
- Arguments must be primitives.

### Tags (`TAG` in `src/server/cache.ts`)
| Tag | Covers | Invalidated by |
|---|---|---|
| `catalog` | product lists, categories, shop/category pages, home bestsellers, `/api/catalog` | product/category saves, stock changes |
| `product:<id>` | one product (PDP) incl. media | product save, stock change, review approval |
| `settings` | all settings (fees, contact, social, SEO, home, announcement, videos…) | settings/home saves |
| `consult` | services + tiers | services admin |
| `courses` · `rituals` · `videos` · `testimonials` · `faqs` | that content | its admin |
| `articles` · `article:<slug>` | blog lists · one article | articles admin |
| `pages` · `page:<slug>` | policies | pages admin |
| `rashifal` | rashifal entries | rashifal admin |
| `reviews` · `reviews:<productId>` | home photo reviews · PDP reviews | review moderation |

### Invalidation helpers (`src/server/cache.ts`)
- `invalidate(...tags)` → `updateTag(tag)` each. **Only inside Server Actions.** The next visitor gets fresh data.
- `invalidateLater(...tags)` → `revalidateTag(tag, "max")` each. For route handlers (webhooks, cron) and `after()` callbacks.

### Client snapshot
`GET /api/catalog` returns `CatalogSnapshot` (`src/lib/domain/types.ts`): products (lite), categories, services (lite), articles (lite), trending, fees. Header `Cache-Control: public, s-maxage=60, stale-while-revalidate=600`. `src/stores/catalog.ts` loads it once after hydration; cart, wishlist, quick-add, mega menu and search resolve product ids from it. Checkout never trusts it — the server re-prices everything (§7).

---

## §5 Database access

- `import { db } from "@/server/db/client"`; tables from `@/server/db/schema`.
- Drizzle query builder (`db.select/insert/update/delete`) or `db.query.*` for reads. Raw SQL only through the `sql` template with bound values. Never string-concatenate SQL; never `sql.raw()` with input.
- Several writes that must succeed together → `db.batch([...])` (one round trip, atomic). Use `db.transaction()` only when a later statement needs an earlier result.
- **Atomic single-statement patterns** (use them exactly):
  - Stock: `update(products).set({ stock: sql\`${products.stock} - ${qty}\` }).where(and(eq(products.id, id), gte(products.stock, qty))).returning({ stock: products.stock })` → no row = `OUT_OF_STOCK`.
  - Restock: `update(products).set({ stock: sql\`${products.stock} + ${qty}\` }).where(eq(products.id, id))`.
  - First-time paid: `update(orders).set({...}).where(and(eq(orders.id, id), ne(orders.paymentStatus, "paid"))).returning({ id: orders.id })` → no row = already processed (skip side effects).
  - Slot claim: `INSERT INTO bookings (…) SELECT … WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE start_at < :end AND end_at > :start AND (status = 'confirmed' OR (status = 'pending_payment' AND hold_expires_at > :now))) RETURNING id` → no row = `SLOT_TAKEN`.
  - Counter: `insert(counters).values({ key, value: 1 }).onConflictDoUpdate({ target: counters.key, set: { value: sql\`${counters.value} + 1\` } }).returning({ value: counters.value })`.
  - Rate limit (`rateLimit(bucket, id, limit, windowSec)` in `src/server/rate-limit.ts`): `insert(rateLimits).values({ key, windowStart: w, count: 1 }).onConflictDoUpdate({ target: rateLimits.key, set: { count: sql\`CASE WHEN ${rateLimits.windowStart} = ${w} THEN ${rateLimits.count} + 1 ELSE 1 END\`, windowStart: w } }).returning({ count: rateLimits.count })` with `key = bucket + ":" + id`, `w = floor(now / windowSec) * windowSec`; `count > limit` → throw `AppError("RATE_LIMITED")`.
- Lists: `limit` + `offset`, page size 20 (admin) / max 100, always `orderBy` an indexed column.
- No N+1: load children with one `inArray()` query and group in JS.
- Foreign keys are declared for documentation; never rely on cascades — delete children explicitly in the same batch.

---

## §6 Auth

### Sessions — `src/server/auth/session.ts`
- Token = 32 random bytes, base64url, stored only in the cookie. DB `sessions.id = sha256Hex(token)`.
- Cookies: customer `mka_c` (30 days), admin `mka_a` (7 days). In production the names get the `__Host-` prefix. Flags: `httpOnly`, `secure` (production), `sameSite: "lax"`, `path: "/"`, fixed `maxAge` (no sliding renewal).
- Validate: row by id, `expiresAt > now`, user `status = "active"`; for `kind = "admin"` the role must be in `ADMIN_ROLES`.
- Logout deletes the row and the cookie. Staff admin can revoke all sessions of a user.

### Email OTP — `src/server/auth/otp.ts` + `src/server/auth/actions.ts`
1. `requestOtpAction({ email, purpose, turnstileToken, locale })` → zod → Turnstile → rate limits (`otp:email` 3 per 15 min per email, `otp:ip` 10 per hour per IP) → for `admin_login` continue only if an active admin user has that email (always answer `{ ok: true }`, so emails can't be probed) → consume older open codes → 6-digit code (`crypto.randomInt`) → store `hmacHex(email + ":" + code)`, expires in 10 min → **await** the OTP email.
2. `verifyOtpAction({ email, code, purpose, next })` → zod → rate limit (`otp:verify` 20 per hour per IP) → newest open code → expired/missing = `OTP_EXPIRED` → atomically `attempts + 1`; more than 5 = consume + `OTP_EXPIRED` → `safeEqualHex` mismatch = `OTP_INVALID` → consume.
   - customer: upsert the user by email (`emailVerifiedAt = now`), attach guest orders / bookings / kundali orders with the same email and `userId = null`, create a session.
   - admin: load the active admin user, create an admin session, write an audit row.

### Guards — `src/server/auth/guards.ts`
| Function | Use in | On failure |
|---|---|---|
| `getCustomer()` / `getAdmin()` | anywhere server-side | returns `null` (React-cached per request) |
| `requireCustomer()` | actions, account queries | throws `AppError("UNAUTHENTICATED")` |
| `requireAdmin(perm)` | `admin.ts`, `admin-actions.ts` | throws `UNAUTHENTICATED` / `FORBIDDEN` |
| `requireCustomerPage(locale, path)` | account pages | `redirect` to `/account?next=<path>` (locale-aware) |
| `requireAdminPage(perm)` | admin pages | `redirect("/admin/login")`; missing permission → `redirect("/admin?denied=1")` |

### Roles & permissions — `src/lib/domain/permissions.ts` (isomorphic, so the UI can hide buttons)
Permissions: `dashboard.view, orders.view, orders.update, orders.refund, products.view, products.edit, coupons.edit, customers.view, customers.edit, bookings.view, bookings.update, consult.edit, kundali.view, kundali.update, inquiries.view, inquiries.update, payment_links.create, messages.view, content.edit, reviews.moderate, media.upload, settings.edit, staff.manage, audit.view, exports.run, health.view`

| Role | Gets |
|---|---|
| `owner` | everything |
| `manager` | everything except `settings.edit`, `staff.manage` |
| `staff` | `dashboard.view, orders.view, orders.update, products.view, customers.view, bookings.view, bookings.update, kundali.view, kundali.update, inquiries.view, inquiries.update, messages.view, reviews.moderate, media.upload` |
| `editor` | `dashboard.view, products.view, content.edit, reviews.moderate, media.upload` |
| `customer` | nothing in admin |

`can(role, perm): boolean` is the only check function.

---

## §7 Payments (Razorpay)

- `src/server/payments/razorpay.ts`: plain `fetch` with Basic auth (`RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET`). Rupees → paise conversion happens **only here**.
  `createRzpOrder({ amountInr, receipt, notes })`, `verifyCheckoutSignature({ orderId, paymentId, signature })`, `verifyWebhookSignature(rawBody, signature)`, `fetchPayment(paymentId)`, `refundPayment({ paymentId, amountInr, notes })`, `createPaymentLink({ amountInr, description, customer, notes })`.
- Entities paid online: `order`, `booking`, `kundali` (checkout modal) and `link` (payment links).
- **Checkout flow**
  1. Action creates our row (`pending_payment`), then the Razorpay order (`receipt` = our ref, `notes = { entity, id }`), saves `razorpayOrderId`, returns `{ ref, accessKey, rzp: { orderId, amountPaise, keyId, name, description, prefill } }`.
  2. Client `openRazorpay()` (`src/lib/payments/razorpay-client.ts`) loads `https://checkout.razorpay.com/v1/checkout.js` on demand and opens the modal with `prefill.method` from the chosen pay method.
  3. Success → `confirmPaymentAction({ entity, ref, razorpay_order_id, razorpay_payment_id, razorpay_signature })` → verify signature → `dispatchPaid()`.
  4. Webhook `POST /api/webhooks/razorpay` (raw body, `X-Razorpay-Signature`, dedupe on `x-razorpay-event-id` in `webhook_events`) handles `payment.captured`, `order.paid`, `payment.failed`, `refund.processed`, `refund.failed`, `payment_link.paid` → same `dispatchPaid()`. Respond 200 fast; side effects through `after()`.
- `dispatchPaid({ entity, entityId, rzpOrderId, rzpPaymentId, amountInr, method })` in `src/server/payments/dispatch.ts` switches on entity → `markOrderPaid` / `markBookingPaid` / `markKundaliPaid` / `markLinkPaid`. Each is idempotent (first-time-paid pattern §5) and runs side effects only the first time. Unknown entity → log and ignore.
- Paid amount ≠ stored total → `needsAttention = true` + audit + log; never auto-fulfil.
- Refunds: admin action → `refundPayment` → `refunds` row `pending` → webhook sets `processed`/`failed` → order `refunded` / `partially_refunded`.
- COD: no Razorpay. Order `placed` + `cod_pending`; Turnstile + `cod:phone` 3 per day; admin marks `cod_collected`.
- Abandoned online orders stay `pending_payment`; daily cron cancels them after 24 h (no stock was taken).
- CSP hosts (set once in B01): script `https://checkout.razorpay.com`; frame `https://api.razorpay.com https://checkout.razorpay.com`; connect `https://api.razorpay.com https://lumberjack.razorpay.com`; img `https://cdn.razorpay.com`.

---

## §8 Uploads & media

- Buckets: public `R2_BUCKET_PUBLIC` (served from `NEXT_PUBLIC_MEDIA_URL`), private `R2_BUCKET_PRIVATE` (signed GET, 10 min).
- `src/server/storage/r2.ts` (aws4fetch, path-style `https://<CF_ACCOUNT_ID>.r2.cloudflarestorage.com/<bucket>/<key>`, `service: "s3"`, `region: "auto"`):
  `presignPut({ bucket, key, contentType, contentLength, expiresSec = 300 })` (signs `content-type` + `content-length` with `allHeaders: true`), `presignGet({ key, expiresSec = 600, filename? })`, `headObject(bucket, key)`, `putObject(bucket, key, body, contentType)`, `deleteObject(bucket, key)`, `publicUrl(key)`.
- **Flow:** browser `prepareImage(file, preset)` → `createUploadAction({ purpose, files: [{ w, type, size }], width, height, blur, ctx? })` → server checks who may upload this purpose, inserts a `media` row (`pending`, variant keys), returns presigned PUT URLs → browser PUTs in parallel → `confirmUploadAction(mediaId)` → `headObject` every key (exists, size ≤ limit, type matches) → `ready` → returns `MediaRef`.
- Presets (`src/lib/media/prepare-image.ts`):
  | Purpose | Bucket | Output |
  |---|---|---|
  | product, category, banner, article, testimonial, setting | public | WebP widths 480 / 960 / 1600 (never upscale), quality 0.82, + 16 px blur |
  | review | public | WebP 480 / 960 |
  | palm | private | one JPEG ≤ 2000 px, quality 0.85 (re-encoding strips EXIF/GPS) |
  | report, kundali | private | PDF uploaded by the server (`putObject`) |
- Keys: `pub/<purpose>/<yyyy>/<mm>/<uuid>-<w>.webp` · `prv/<purpose>/<yyyy>/<mm>/<uuid>.<ext>`.
- Limits: source image ≤ 15 MB (client check); each processed file ≤ 2 MB (server); PDFs ≤ 10 MB.
- Who may upload: admin purposes need `media.upload`. Customer purposes (`palm`, `review`) need no login but are rate-limited (`upload:ip` 20 per hour); `createUploadAction` returns a one-time `claimKey` (DB keeps `claim_hash = sha256Hex(claimKey)`), and the booking / review submit must send `{ mediaId, claimKey }` to attach the file (sets `owner_type/owner_id`, clears `claim_hash`). Unclaimed customer uploads are deleted by the daily cron after 24 h.
- `MediaRef` (`src/lib/domain/media.ts`): `{ id, w, h, src, srcSet, blur, alt }`, built by `toMediaRef(row)` on the server.
- `<MediaImg media sizes alt className priority? />` renders a plain `<img>` with `srcSet`/`sizes`, intrinsic `width`/`height`, lazy loading, and the blur as background. Uploaded images never go through `next/image` (no Vercel optimisation quota).
- Removing an image from its owner deletes the `media` row and its R2 objects (inside `after()`). Pending uploads older than 24 h are deleted by the daily cron.

---

## §9 Email & notifications

- `sendEmail({ to, subject, react, replyTo?, attachments?, devNote? })` in `src/server/email/send.ts`: renders with `render()` from `@react-email/components` (HTML + `plainText` version) and POSTs to `https://api.resend.com/emails` with `fetch` (Bearer `RESEND_API_KEY`, 8 s timeout). No Resend SDK. Without `RESEND_API_KEY`: development logs recipient + subject (+ `devNote`, e.g. the OTP code); production throws `AppError("NOT_CONFIGURED")`.
- Templates: `src/server/email/templates/<Name>.tsx`, all wrapped in `EmailShell` (`src/server/email/components.tsx`: emerald header with the wordmark, ivory body, gold hairline, footer with contact details from settings). Text per locale via a small dictionary inside each template.
- Send customer emails after the response: `after(() => sendOrderPlaced(id).catch((e) => log.error("email.orderPlaced", e)))`. Only the OTP email is awaited.
- Admin alerts go to `settings.notify.adminEmails`.
- WhatsApp in v1 = click-to-chat links in admin (`waLink(phone, text)` from `src/lib/core/commerce.ts`). The Cloud API is optional step O3.

---

## §10 Background work

- `after()` for emails and other non-critical follow-ups.
- `vercel.json` cron → `GET /api/cron/daily` at `30 2 * * *` (08:00 IST). Header `Authorization: Bearer ${CRON_SECRET}`.
- `GET /api/cron/frequent` (same secret, `?key=` not allowed) is called every 15 min by an external pinger (cron-job.org) for 1-hour booking reminders and Kundali PDF retries. Without a pinger the daily job still covers everything except the 1-hour reminder.
- Every job: idempotent (flags like `reminderDayAt`), at most 100 rows per run, logs a one-line summary.

---

## §11 i18n

- Storefront: next-intl as in phase F. New strings go to `messages/en.json` + `messages/hi.json` under the namespaces the step lists. Hindi written by us is listed in PLAN.md → "Client-confirm".
- DB content: `xxx_en` / `xxx_hi` columns, or `Loc = { en: string; hi: string }` inside JSON. Show it with `loc(value, locale)` (`src/lib/domain/loc.ts`): Hindi when non-empty, otherwise English.
- Admin is English only. Localized fields show **EN | हिंदी** tabs; Hindi is optional.
- Emails use the record's `locale`.

---

## §12 Errors & results

- Codes: `src/lib/domain/errors.ts` → `ERROR_CODES` (`VALIDATION, UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, RATE_LIMITED, BOT_CHECK_FAILED, OTP_INVALID, OTP_EXPIRED, OUT_OF_STOCK, PRICE_CHANGED, COUPON_INVALID, COUPON_MIN_CART, COUPON_EXPIRED, COUPON_USED, SLOT_TAKEN, PAYMENT_FAILED, PAYMENT_SIGNATURE, UPLOAD_INVALID, NOT_CONFIGURED, CONFLICT, INTERNAL`).
- `src/server/result.ts`: `class AppError(code, message?, fieldErrors?)`; `type ActionResult<T> = { ok: true; data: T } | { ok: false; code: ErrorCode; message?: string; fieldErrors?: Record<string, string> }`; `runAction(fn)` maps `AppError` → its code, `ZodError` → `VALIDATION` + fieldErrors, anything else → log + `INTERNAL`, and rethrows Next control-flow errors with `unstable_rethrow`.
- Storefront clients show `t("errors.<CODE>")` (namespace `errors`, added in B09). Admin shows `ADMIN_ERRORS[code]` (`src/components/admin/errors.ts`).
- Route handlers: `Response.json({ error: code }, { status })`.

---

## §13 Environments

| Env | DB | APP_URL | Razorpay | Email |
|---|---|---|---|---|
| Local dev | Turso `mka-dev` | http://localhost:3000 | test keys | Resend (or console) |
| Vercel Preview | Turso `mka-dev` | preview URL | test keys | Resend |
| Production | Turso `mka-prod` | https://sadhakpawanpandey.com | live keys | Resend, verified domain |

The user runs `pnpm db:migrate` against an environment's DB before deploying a step that added a migration (USER-SETUP §2).
