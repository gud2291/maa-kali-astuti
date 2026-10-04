# AUDIT-REPORT — B45 Final audit 1 (other agents' work)

Auditor: claude · started 2026-10-05.
Method per step: `git show --stat <commit>` → read the changed files as they are **now** (later steps may have edited them) → check against the step spec, `docs/backend/RULES.md`, ARCHITECTURE and DATA-MODEL → fix in place (specified behaviour kept) → note below.
Severity: **H** = security / money / data-loss / broken flow · **M** = wrong behaviour or rule break with user impact · **L** = robustness, spec drift, cosmetics.
`REDO` = too broken to repair here → Fix-list item in `PROGRESS.md`.

## T1. Steps to audit
Every step B01–B44 was done by `antigravity` (no Claude or mixed steps). Commits:

| Step | Commit | Step | Commit | Step | Commit | Step | Commit |
|---|---|---|---|---|---|---|---|
| B01 | 99dd23e | B12 | 180e2a5 | B23 | 928929c | B34 | c69b625 |
| B02 | dcd7432 | B13 | f6a0746 | B24 | edc55c5 | B35 | 9ecac44 |
| B03 | 1a9af59 | B14 | ae8a08b | B25 | ad181f3 | B36 | 4c16d12 |
| B04 | 728e587 | B15 | a652cc2 | B26 | 3ab1363 | B37 | 955327e |
| B05 | 597c451 | B16 | 1ffd4e6 | B27 | c2389f0 | B38 | 2634646 |
| B06 | 5f8b7bb | B17 | 2d05661 | B28 | 985fcb2 | B39 | 1997c9a |
| B07 | a69ca5a | B18 | 7590bcc¹ | B29 | dc1836a | B40 | 719c751 |
| B08 | 8ed5dcf | B19 | 7590bcc¹ | B30 | f2727cc | B41 | f0c7c01 |
| B09 | dc3be91 | B20 | 7590bcc | B31 | 2560a26 | B42 | be04375 |
| B10 | ca4e23a | B21 | a6495b4 | B32 | b3e6f69 | B43 | 8a3d92c |
| B11 | 74ea924 | B22 | c3faa1f | B33 | 236ea34 | B44 | f9b42e3 |

¹ B18 and B19 have no commit of their own: their files landed inside the B20 commit `7590bcc`.

## Global scan (RULES §9 greps, whole `src/` + `scripts/`)
- Clean: `any`, `@ts-ignore`/`@ts-expect-error`, `console.log`, TODO/FIXME/XXX/HACK, `sql.raw(`, `eval`/`new Function` in `src/`, `innerHTML`, `middleware.ts`, `"use cache"`, `runtime = "edge"`, direct `updateTag`/`revalidateTag` (only in `cache.ts`), `process.env` (only allowed files), `Math.random` (only phase-F client motion jitter).
- `dangerouslySetInnerHTML`: only trusted `src/lib/art` SVG + `JsonLd` (escapes `<`). OK.
- External `fetch`: all have `AbortSignal.timeout` (8 s; PDF 45 s; the cron→generate kick 2 s / 45 s). OK.
- `eslint-disable`: all `@next/next/no-img-element` except `BookingFlow.tsx:137` `react-hooks/exhaustive-deps` → checked under B22.
- No FK `.references()` anywhere in the schema (DM §A marks them "documentation"). Not added: it would need table-rebuild migrations on live tables and could switch on FK enforcement in libSQL. Accepted deviation (L).

## Cross-cutting checks (scripts, read-only)
Two throw-away scripts (not committed) were run over `src/`: (1) every local import resolves to a file and every named import is really exported; (2) no `"use client"` module reaches a `server-only` module through value imports. Plus greps for misuse of the shared APIs. Findings fixed here (all **H — build break or runtime crash**):
- `ActionResult` misuse: client code read `res.error` (the type only has `code` / `message`) → type errors, and at runtime messages showed `undefined`. Fixed in `StepReview.tsx`, `useQuote.ts` (B17), `ImageManager.tsx`, `ProductActions.tsx`, `StockAdjust.tsx` (B13), `StaffTable.tsx` (B14), `PayNow.tsx` (B18), `TrackOrderForm.tsx` (B20), `RescheduleCard.tsx` (B23), `AnnouncementForm.tsx`, `HeroSlidesForm.tsx`, `SectionToggles.tsx` (B34). Customer-facing errors now use the shared `errors` namespace.
- Admin toast misuse: 24 admin components (B13, B21–B24, B33–B36) called `toast.error()` / `toast.success()`, but the admin toast (B11) only has `ok` / `err` / `info` → `TypeError: toast.error is not a function` the moment a save finished. Renamed to `toast.err` / `toast.ok` / `toast.info`.
- `runAction` returned `message = code` for every `AppError` without a message (AppError falls back to the code). It now sends `message` only when the thrower gave one, so `res.message ?? errorText(res.code)` shows friendly text. (`src/server/result.ts`)
- Missing exports: `StoreSettings`, `ContactSettings`, `ConsultSettings`, `CourseSettings`, `InvoiceSettings` were imported from `@/lib/validation/settings` by B15/B21/B24/B31 files but never declared → added as aliases of `SettingsMap[key]`. `ActionState` imported from `@/server/result` (B24) does not exist → `ActionResult`. (`src/lib/validation/settings.ts`, `src/server/bookings/admin-actions.ts`, `src/server/consult/admin-actions.ts`)
- Client → server-only: `RashifalEditor.tsx` (client) imports `src/server/rashifal/periods.ts` (server-only) → see B35.

## T2. Per-step results

- [x] **B01 Foundation** — spec met (env, log, result, ids, cache, request, loc, ist, drizzle config, CSP, proxy matcher). Findings:
  - M `formatIst`: `{ date: false }` still printed the date (inverted ternary) → admin booking calendar row showed date + time. Fixed: date shows unless `date === false`. (`src/lib/core/ist.ts`)
  - L `addDaysKey` / `weekdayOfKey` used local-time `Date` → depended on the server time zone. Now pure UTC arithmetic. (`src/lib/core/ist.ts`)
  - L `safeEqualHex` threw `RangeError` on equal-length non-hex input (e.g. a forged Razorpay signature) → became `INTERNAL` instead of a clean mismatch. Now decodes first and returns false. (`src/server/ids.ts`)
- [x] **B02 Schema 1** — enums (with `satisfies` checks), types, flows, permissions (role table = ARCH §6), settings schemas + defaults (= DM §I, seo/videos copied literally), core/catalog/content tables, indexes and defaults all match DM. `audit()` never throws. No findings besides the FK note above.
- [x] **B03 Schema 2** — commerce / consult / crm tables: every column, nullability, default, unique and index matches DM §F–§H; `kundali.ts` = DM §B. Only two migrations exist and no later step touched the schema. No findings.
- [x] **B04 Seed** — 14 sections in order, `onConflictDoNothing`, empty-table guard for keyless tables, owner upsert, batches ≤ 50, own DB client without `server-only`, content builder per spec. (Sections 15–16 were added by B37 — audited there.) No findings.
- [x] **B05 Catalog data layer** — `getCatalog` (3 parallel queries, hidden categories dropped, JSON-safe), mappers = inverse of B04, `toMediaRef`, `lib/api/catalog.ts` server-only with same exports, `dynamicParams` removed, rashifal pages use `getProductsByIds`. Findings:
  - M `getSetting` caught **DB errors** and returned the defaults — inside `unstable_cache`, so one transient Turso error would pin default fees/contact/home settings until the next settings save. Now only a missing / invalid row falls back; DB errors propagate (not cached). (`src/server/settings/queries.ts`)
  - L `getCatalog` selected every product column incl. the big `content` JSON for the list (RULES §3 "select only the columns they show"). Now explicit list columns for products and categories. (`src/server/catalog/queries.ts`)
- [x] **B06 Content data layer** — all query files cached with the right tags/indexes and JSON-safe; consult mappers, `lib/api/consult.ts` / `content.ts` server-only, locale threaded through pages, search uses DB services/articles. Findings:
  - L `src/server/consult/mappers.ts` was missing its first line `import "server-only"` (RULES §2). Added (only server code imports it).
  - L `getRituals` / `getVideos` (`lib/api/content.ts`) have no explicit return type (RULES §1). Left as is: the inferred shapes feed phase-F components; adding hand-written types without `tsc` risks a build break. B46 can add them with a type-check run.
- [x] **B07 Home from DB** — one `Promise.all` in the home page, sections take props, JSON/products-index imports gone, markup unchanged. Findings:
  - L `getHomeReviews` formatted the fallback date with the server's local (UTC) day → off by one for reviews made 00:00–05:30 IST. Now uses `istDayKey`. (`src/lib/api/content.ts`)
  - (The home page `generateMetadata` was later rewritten by B43 — its bug is listed under B43.)
- [x] **B08 Snapshot, coupons, fees** — `rateLimit` = ARCH §5 pattern, snapshot + CDN headers, catalog store (load once, one retry), fees out of constants, `evaluateCoupon` rules (format, active, window, usage, min cart, per-customer, first order), `checkCouponAction` re-prices from the DB and rate-limits, cart store v2 migrate, `products-index` deleted, coupon messages EN+HI. Demo cart seeding is dev-only (B44). No findings.
- [x] **B09 Auth + email core** — sessions (hashed token, `__Host-` cookies in prod, fixed maxAge, admin role check), OTP (HMAC, 10 min, atomic attempts, consume), Turnstile, guards, guest-record claim batch, Resend REST sender, OTP email, EN+HI `errors`/`auth`. Findings:
  - **H — build break:** server modules named `*.ts` (as the specs require) contained **JSX** (`react: (<OtpEmail … />)`). `.ts` files are not parsed as JSX by SWC or tsc → `pnpm dev`/`build` fail as soon as the module loads. Rewritten with `createElement(…)` (same props, same behaviour) in: `src/server/auth/actions.ts` (B09), `src/server/orders/emails.ts` (B16/B21), `src/server/bookings/emails.ts` (B22–B24), `src/server/kundali/emails.ts` (B30), `src/server/inquiries/service.ts` (B31), `src/server/messages/actions.ts` (B32), `src/server/cron/jobs.ts` (B41). (`src/server/health.ts` B40 and `src/components/admin/form/useActionForm.ts` B12 have the same problem — see those steps.)
  - **M** `sendEmail` posted attachments raw: the booking `.ics` (plain text) and the Kundali PDF (`Buffer` → `{"type":"Buffer","data":[…]}` in JSON). The Resend REST API takes base64 `content`, so confirmation/reschedule emails with the calendar file and the Kundali email with the PDF would fail or carry broken files. Now every attachment is base64-encoded in `sendEmail`. (`src/server/email/send.ts`)
  - **M** customer OTP `next` accepted `/\evil.com` (browsers treat `/\` like `//`) → open redirect after login. Backslashes are now rejected. (`src/server/auth/actions.ts`)
  - L `alertKundaliGenerationFailed` logged a raw `Error` object inside `data` (serialises to `{}`); now logs the message. (`src/server/kundali/emails.ts`)
- [x] **B10 Media uploads** — aws4fetch R2 client (path-style, per-segment encoding, 8 s timeouts, signed PUT with content headers), create/confirm/claim/attach/delete/signed-URL service, admin vs customer guard split + `upload:ip` limit, browser `prepareImage`, XHR uploads, `MediaImg`, `ProductImage` switch. Findings:
  - **M** `createUpload` never checked the declared file type against the purpose: an anonymous `review` upload could put a PDF (or a JPEG under a `.webp` key) into the **public** bucket, and a private upload with 2 files reused one key. Now: public/review = `image/webp` or `image/jpeg`, palm = `image/jpeg`, report = `application/pdf`, all variants the same type, private = exactly one file. (`src/server/media/service.ts`)
  - L `blur` was any string ≤ 600 chars and is rendered as a CSS `url()` → customers could make review images load any URL. Now only `data:image/(webp|jpeg|png);base64,…`. (`src/lib/validation/media.ts`)
- [x] **B11 Admin shell + login** — root admin layout (noindex, theme colour, toaster), panel layout redirect, shell/sidebar/topbar/mobile nav, OTP admin login (always lands on `/admin`, no redirect param trust), 404. No findings.
- [x] **B12 Admin UI kit** — all listed primitives and form fields, `useActionForm` exactly as specified, dev-only `/admin/kit`. Findings:
  - **H — build break:** the kit's demo form (`KitDemoForm`) was written as JSX inside `useActionForm.ts`. Rewritten with `createElement` (same fields, same toast-only action), file name kept as specified. (`src/components/admin/form/useActionForm.ts`)
- [x] **B13 Admin products & categories** — schemas with the listed limits, list/edit/create/duplicate/status/stock/delete, media order batch + removed media in `after()`, audit diffs, invalidation of `catalog` + `product:<id>`, dnd-kit image manager, category editor. Findings:
  - **H — build break:** `new AppError("CONFLICT", "…", { fieldErrors: { slug: [...] } })` does not match `AppError(code, message?, fieldErrors?: Record<string, string>)` → type error. Now `{ slug: "This slug is already in use" }` (also shows inline on the slug field). (`src/server/catalog/admin.ts`)
  - **M** every write took an optional `actorArg?: AdminUser` and skipped `requireAdmin("products.edit")` when it was passed — breaks ARCH §2 "every export first calls `requireAdmin(perm)`" and is an auth-bypass waiting to happen. Removed; every write now always calls `requireAdmin`. (`src/server/catalog/admin.ts`)
  - L `deleteProduct` deleted links and the row in two round trips → now one `db.batch` (ARCH §5). `let` → `const` for an unchanged slug base.
  - Note (not changed, spec'd): saving the product form writes the loaded `stock` value back; if an order sells a unit between opening and saving the form, that sale is overwritten. Staff should change stock with **Adjust stock** (atomic) — listed for the user in the Fix-list hint below.
- [x] **B14 Admin settings, coupons, staff** — settings tabs/forms with the shared schemas, allowed-key list, coupon CRUD (unique code, delete only unused), staff add/role/status/remove with "no self-change" and "one active owner" rules, session revoke, invite email in `after()`. Findings:
  - **H — build break:** `new AppError("CONFLICT", { message: … })` / `{ code: … }` / `{ reason: … }` (object as the message argument) in 9 places → type errors. Fixed to `AppError(code, "message")`; the duplicate coupon code now also sets `fieldErrors.code`. (`src/server/staff/admin.ts`, `src/server/coupons/admin.ts`)
  - **M** coupon start/end dates from the date inputs were parsed as **UTC midnight** → a coupon "ending 31 Oct" stopped at 05:30 IST on 31 Oct, and the edit form showed UTC days. Now start = 00:00 IST, end = 23:59:59 IST of the chosen day, and the form shows IST days. (`src/lib/validation/coupon.ts`, `src/components/admin/coupons/CouponForm.tsx`)
  - L `notify.adminEmails` was validated as email only in the browser; the shared schema now requires valid emails (max 10). (`src/lib/validation/settings.ts`)
  - L (left) `updateSetting` / `writeSetting` accept an optional actor (same pattern as B13). No caller passes one from client input; this file was being edited by someone else during the audit, so it is left for B46.
  - L (left) `CouponForm` keeps two `as unknown as Date` casts for the date inputs (RULES §1). Needs a form-type refactor with `tsc` → B46.
- [x] **B15 Product page** — `getProductDetail` (tag `catalog` as specified, related fallback), India Post lookup (throws on failure so nothing bad is cached; 8 s timeout), `/api/pincode/[pin]` (validation, CDN header), `usePincode`, gallery/info/accordions/placement/related/recently-viewed/sticky bar, `pdp` messages EN+HI. B15's own code: no findings. (The page's `generateMetadata` and JSON-LD were rewritten by B43 and contain type errors → fixed under B43.)
- [x] **B16 Order engine** — quote re-prices from a fresh DB read, issues (unavailable / qty / stock), coupon via `evaluateCoupon`, COD limits; `placeOrder` one transaction (order + items + public event), COD → `finalizePlacement("strict")` (atomic stock, coupon `used_count` guarded by `usage_limit`, redemption row, invoice counter, draft link), retry on number clash; `markOrderPaid` first-time-paid pattern + payments row + mismatch → attention without fulfilment; access key HMAC-derived, `getOrderView` with `safeEqualHex`; emails in `after()`. Findings:
  - **M** checkout emails were stored with their original case. Guest-order claiming (`attachGuestRecords`) and the coupon checks (`per_customer_limit`, `first_order_only`) compare lower-case emails, so a customer typing `Ravi@Gmail.com` never saw the order in their account and could reuse a one-per-customer / first-order coupon by changing letter case. Contact, quote and draft emails are now lower-cased by the shared schema. (`src/lib/validation/checkout.ts`)
  - (JSX in `orders/emails.ts` → fixed under B09.)
- [x] **B17 Cart + checkout UI** — extracted cart pieces, `/cart` view + upsell, persisted checkout state, debounced quote, 5-step flow, review step with Turnstile, server quote used for totals. Findings:
  - **H** `StepReview` read `res.error` (does not exist) for every failed order → type error, and the shopper saw "undefined". Now `res.code` → `errors.<CODE>` (stock problems keep the checkout wording and re-quote). Raw exception text is no longer shown. Same fix in `useQuote`. (`StepReview.tsx`, `useQuote.ts`)
- [x] **B18 Razorpay** — REST client (Basic auth, paise only there, typed, 8 s), HMAC checkout/webhook signatures with constant-time compare, `markOrderPaid` (first-time-paid, mismatch → attention, no fulfilment), dispatch, confirm/retry actions, online checkout branch, webhook with raw-body verification + event-id dedupe, checkout.js loader, Pay-now. Findings:
  - **M** webhook processing errors were swallowed with **HTTP 200** after the event id had been stored → Razorpay never retried and a later retry would be skipped as a duplicate, so a missed `payment.captured` could leave a paid order unpaid. Now the event row is removed and the route answers 500 so the retry is processed. (`src/app/api/webhooks/razorpay/route.ts`)
  - **M** the webhook logged the raw `x-razorpay-signature` on failure (RULES §2 "never log signatures"). Now only `hasSignature`. (same file)
  - **M** `confirmPaymentAction` trusted any payment whose signature matched, without looking at its status, and put the client's `razorpay_payment_id` straight into the Razorpay URL. Now ids/signature are format-checked (`order_…`, `pay_…`, 64-hex) and only `captured` / `authorized` payments mark an entity paid; a bad signature returns `PAYMENT_SIGNATURE` (was `PAYMENT_FAILED`). (`src/server/payments/actions.ts`)
  - **H — type error:** `AppError("ALREADY_PAID")` is not an error code. Now `CONFLICT` ("already paid / processed"); `StepReview` and `PayNow` check `res.code === "CONFLICT"`. (`src/server/payments/actions.ts`)
  - L a payment first reported as `failed` and authorised later (Razorpay late auth) would hit the unique `rzp_payment_id` inside `markOrderPaid` and roll the whole "paid" transaction back. The insert now upserts that row to `captured`. (`src/server/orders/service.ts`)
- [x] **B19 Account** — account queries filter by the session user id, address actions own-rows-only with max 10 and one default, profile, invoice builder (Tax Invoice vs Bill of Supply, CGST/SGST vs IGST), invoice page (access key or owner session, noindex), checkout prefill + save address. Findings:
  - **H — type error:** `AppError("LIMIT_REACHED")` → `CONFLICT` with the "Maximum 10 addresses" message. (`src/server/account/actions.ts`)
  - **H — type error / broken labels:** `AccountLogin` typed six non-existent codes (`TURNSTILE_FAILED`, `LIMIT_REACHED`, …) as `ErrorCode` and missed real ones (e.g. `BOT_CHECK_FAILED`, `NOT_CONFIGURED`) → a failed bot check showed an empty error. Labels now come from the shared `errors` namespace for every `ERROR_CODES` entry. It also used the non-locale router, so Hindi users landed on the English page after login → `@/i18n/navigation`. (`src/components/sections/account/AccountLogin.tsx`)
  - L (left) `AccountLogin` and `AddressSheet` contain inline EN/HI copy instead of `messages` (RULES §8) — cosmetic, B46.
- [x] **B20 Track, wishlist, search** — reduced tracking view (contact must match phone or email, same `NOT_FOUND` for both), Turnstile + `track:ip` limit, static pages with client islands, `ProductCardData` prop type. Finding: the form's error handling (`res.error`) → fixed in the cross-cutting section. L (left): `ProductCard` keeps one new `as unknown as Product` cast → B46.
- [x] **B21 Admin orders & refunds** — tabs/counts, filters, detail, `canMove` transitions with timestamps and restock on cancel, energization bulk, tracking, notes, attention, CSV export (≤ 5000, RFC-4180, formula guard), invoice/packing slip, refunds (Razorpay pending → webhook; manual processed), status emails, WhatsApp templates. Findings:
  - **H — refunds:** `markCodCollected` set `payment_status = "paid"` instead of ARCH §7's `cod_collected`, and `refundOrder` only accepted `paid` / `partially_refunded`, so the whole COD/manual refund branch was unreachable for real COD orders (`cod_pending`/`cod_collected` never pass). Now COD collection sets `cod_collected` (only from `cod_pending`, conditional update), refunds accept `paid` for online and `cod_collected` for COD, the Refund button and the "Mark collected" button follow the same rule, and the digest/LTV sums count `cod_collected`. (`src/server/orders/admin.ts`, `src/server/orders/refunds.ts`, `src/components/admin/orders/OrderActions.tsx`, `src/server/cron/jobs.ts`, `src/server/customers/admin.ts`)
  - **M** `transitionOrder` checked the status outside the transaction and updated without a guard → two quick "Cancel" clicks (or two admins) restocked the items twice. The update is now conditional on the validated status inside the transaction; a lost race returns `CONFLICT`. (`src/server/orders/admin.ts`)
  - **H — type error:** `AppError("NOT_PAID")` → `CONFLICT`. (`src/server/orders/refunds.ts`)
  - L `applyRefundWebhook` treated every non-booking refund as an order refund; it now ignores other entities with a warning. (same file)
- [x] **B22 Booking backend** — day slots (open days, window, lead time, blocked ranges, overlap query on `bookings_start_idx`), `/api/slots` (no-store), atomic slot-claim `INSERT … WHERE NOT EXISTS … RETURNING` with bound values, HMAC access key, palm claim, Razorpay order + payments row, `markBookingPaid` first-time update + clash/mismatch notes, confirmation email with `.ics`, real booking flow in the UI. Findings:
  - **H** `createBooking` only checked for **overlaps**: the start time from the browser was never compared with the offered slots, so a crafted request could book 03:00, a Sunday, a blocked day, a past time or a time inside the lead window. The start must now be one of `getDaySlots()`'s free start times (exact match) before the atomic claim. Customer reschedules get the same check. (`src/server/bookings/service.ts`)
  - **M** a payment arriving after the daily cron turned the hold into `expired` was ignored (`status !== "pending_payment"` → no confirmation, no alert, money kept). `markBookingPaid` now also confirms `expired` bookings (the existing clash check flags overlaps for the admin), and its payments insert is idempotent on `rzp_payment_id`. The order side got the matching guard: a payment for an order the cron already cancelled now raises **needs attention** instead of silently fulfilling. (`src/server/bookings/service.ts`, `src/server/orders/service.ts`)
  - L `createBookingAction` created the booking (holding the slot for 10 min) before checking that Razorpay is configured → check moved first. `/api/slots` 400 body now `{ error: "VALIDATION" }` (ARCH §12). (`src/server/bookings/actions.ts`, `src/app/api/slots/route.ts`)
- [x] **B23 Booking manage** — key-or-owner views, upcoming/past list, atomic reschedule `UPDATE … WHERE NOT EXISTS` with customer rules (count, notice hours, open day, window), report link via signed URL, rescheduled email + `.ics`. Findings: exact-slot check (see B22); `RescheduleCard` read `res.error` (cross-cutting). L (left): `RescheduleCard` has inline EN/HI error copy → B46.
- [x] **B24 Admin consultations** — service/tier editors (one recommended tier), availability settings through `writeSetting("consult")`, booking list/week calendar/detail, status via `BOOKING_FLOW`, meeting link, report upload, admin reschedule, cancel with Razorpay refund (`entity: "booking"`), booking webhook branch, update emails. Findings: `ActionState` type and `toast.error/success` (cross-cutting) and JSX in `bookings/emails.ts` (B09). No other findings.
- [x] **B25 Kundali engine + places** — two-pass IANA birth time → UTC, IAU-2006 precession mean/true Lahiri (dpsi in arcsec), Sun/Moon/planets true-of-date, mean node, ascendant formula, nakshatra/pada/navamsa, whole-sign houses, Vimshottari with partial first MD, panchang, doshas, yogas, pure `computeChart`; GeoNames dataset (737 KB < 3 MB) + ranked search + `/api/places` CDN header; `computeChartAction` rate-limited. Findings:
  - L the place's `tz` was any string ≤ 60 chars; an unknown zone makes `Intl.DateTimeFormat` throw inside the engine → `INTERNAL`. It must now be a zone `Intl` accepts (→ `VALIDATION`). (`src/lib/validation/kundali.ts`)
  - Found outside this audit while it ran (someone else's uncommitted working-tree fix, not touched here): `src/server/kundali/actions.ts` imported `clientIp` from a non-existent `@/server/ip` (build break) → `@/server/request`.
- [x] **B26 / B27 / B28 Report content (EN, HI 1, HI 2)** — checked by loading the data modules (read-only transpile) and counting: EN and HI both complete — labels 12/9/27/30/27/11/7, 12 lagna, 12 moon signs, 27 nakshatras, 9×12 planet-in-house (keys 1–12), 6×12 life areas, 9 dashas, doshas, 9 yogas, 9 remedies, 12 gem rows; no empty strings; ≈14.2k EN / 15.2k HI words; every file starts with the `[client-review]` comment as specified. Findings: a Hindi planet-in-house line (`ke` 11th house) had an **unterminated string** (B28 build break) — already fixed in the working tree by someone else during this audit (left for them to commit). L (left): `content/index.ts` merges with an `as unknown as T` cast → B46.
- [x] **B29 Kundali report document** — report model (lagna/moon/nakshatra, planets in houses, life areas, Vimshottari table, doshas, yogas, gems, remedies), A4 CSS, D1/Chandra/D9 SVG charts, server-only document, HTML render, dev-only admin preview. No findings (rendering only; the parse scan is clean).
- [x] **B30 Kundali ₹99 purchase + PDF** — order creation with settings price and stored chart, `markKundaliPaid` first-time pattern + internal-key generation trigger, generation lock `UPDATE … WHERE gen_attempts < 5 AND (…) RETURNING`, Cloudflare PDF (45 s), private R2 + media row, ready email (PDF attached ≤ 5 MB), key-or-owner report page/status/PDF link, account list, admin list/detail/regenerate/resend. Findings:
  - **M — wrong paid report:** when the visitor typed a place without picking a suggestion, the preview used the first search match but the **paid order** was sent with hard-coded Varanasi coordinates (`city?.lat ?? 25.3176 …`), and a place with no match silently became Varanasi. Now the place resolved for the preview is stored and reused for the order; no match → back to the form, never a silent fallback. (`src/components/sections/kundali/KundaliTool.tsx`)
  - **M** Kundali emails were stored with their original case (guest claiming and lookups use lower case) → lower-cased by the schema. (`src/lib/validation/kundali.ts`)
  - L generate route answered `{ error: "Order not found" | "Unauthorized" }` → codes `NOT_FOUND` / `UNAUTHENTICATED` (ARCH §12). (`src/app/api/kundali/[ref]/generate/route.ts`)
  - L (left, file being edited by someone else): `createKundaliOrderAction` checks Razorpay configuration *after* inserting the order (harmless pending row) → B46. Stale "mock" wording in the `KundaliTool` / `PaySheet` header comments → B46.
- [ ] B31 Inquiries + payment links
- [ ] B32 Contact, newsletter, inbox
- [ ] B33 Content managers
- [ ] B34 Home & site settings
- [ ] B35 Rashifal manager
- [ ] B36 Blog, policies, FAQ
- [ ] B37 Starter content
- [ ] B38 Reviews
- [ ] B39 Dashboard, badges, search
- [ ] B40 Customers, audit log, health
- [ ] B41 Cron
- [ ] B42 SEO foundation
- [ ] B43 SEO pages
- [ ] B44 Hardening & go-live

## Files changed by this audit
- `src/lib/core/ist.ts` (B01)
- `src/server/ids.ts` (B01)
- `src/server/settings/queries.ts`, `src/server/catalog/queries.ts` (B05)
- `src/server/consult/mappers.ts` (B06)
- `src/lib/api/content.ts` (B07)
- `src/server/auth/actions.ts`, `src/server/email/send.ts` (B09)
- `src/server/media/service.ts`, `src/lib/validation/media.ts` (B10)
- `src/components/admin/form/useActionForm.ts` (B12)
- `src/server/catalog/admin.ts` (B13)
- `src/server/staff/admin.ts`, `src/server/coupons/admin.ts`, `src/lib/validation/coupon.ts`, `src/components/admin/coupons/CouponForm.tsx`, `src/lib/validation/settings.ts` (B14)
- `src/lib/validation/checkout.ts` (B16)
- `src/components/sections/checkout/StepReview.tsx`, `src/components/sections/checkout/useQuote.ts` (B17)
- Cross-cutting: `src/server/result.ts`, `src/lib/validation/settings.ts`, `src/server/bookings/admin-actions.ts`, `src/server/consult/admin-actions.ts`, `src/components/admin/products/{ImageManager,ProductActions,StockAdjust}.tsx`, `src/components/admin/staff/StaffTable.tsx`, `src/components/sections/order/PayNow.tsx`, `src/components/sections/track/TrackOrderForm.tsx`, `src/components/sections/booking/RescheduleCard.tsx`, `src/components/admin/home/{AnnouncementForm,HeroSlidesForm,SectionToggles}.tsx`, and the 24 files of the toast rename (`src/components/admin/{blog/ArticleForm,bookings/AdminReschedule,bookings/BookingActions,bookings/ReportUpload,consult/AvailabilityForm,consult/ServiceForm,consult/TierEditor,content/CourseForm,content/FaqForm,content/RitualForm,content/SortableList,content/TestimonialForm,content/VideoCategories,content/VideoForm,editor/RichEditor,home/*,pages/PageForm,products/*,rashifal/RashifalEditor}.tsx`, `src/components/sections/blog/ArticleView.tsx`)
- `src/server/payments/actions.ts`, `src/app/api/webhooks/razorpay/route.ts`, `src/server/orders/service.ts` (B18)
- `src/server/account/actions.ts`, `src/components/sections/account/AccountLogin.tsx` (B19)
- `src/server/orders/admin.ts`, `src/server/orders/refunds.ts`, `src/components/admin/orders/OrderActions.tsx`, `src/server/cron/jobs.ts`, `src/server/customers/admin.ts` (B21)
- `src/server/bookings/service.ts`, `src/server/bookings/actions.ts`, `src/app/api/slots/route.ts`, `src/server/orders/service.ts` (B22)
- `src/lib/validation/kundali.ts` (B25/B30), `src/components/sections/kundali/KundaliTool.tsx`, `src/app/api/kundali/[ref]/generate/route.ts` (B30)
- `src/server/health.ts` (B40), `src/server/email/templates/BookingReminderEmail.tsx` (B41)
- JSX → `createElement` (B09 finding): `src/server/orders/emails.ts`, `src/server/bookings/emails.ts`, `src/server/kundali/emails.ts`, `src/server/inquiries/service.ts`, `src/server/messages/actions.ts`, `src/server/cron/jobs.ts`

## Fix-list items added for the user
- (none yet)
