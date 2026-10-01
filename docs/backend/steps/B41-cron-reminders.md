# B41 — Cron jobs: reminders, cleanup, recovery
**Risk:** M · **Needs:** B40 · **Agent:** any · **User setup before QA:** `CRON_SECRET` in `.env.local` (USER-SETUP §6)

## Goal
Scheduled, idempotent jobs: expire unpaid orders and booking holds, booking reminders (day before + 1 hour before), review requests, abandoned-checkout reminders, palm-photo deletion after 30 days, media cleanup, Kundali PDF retries, low-stock and daily admin digests, and table cleanup.

## Read first (only these)
- `docs/backend/RULES.md` §2, §3
- `docs/backend/ARCHITECTURE.md` §10
- `docs/backend/DATA-MODEL.md` §C (`sessions`, `otp_codes`, `rate_limits`, `media`, `webhook_events`), §F (`orders`, `order_events`, `checkout_drafts`), §G
- `src/server/orders/service.ts`, `src/server/bookings/service.ts`, `src/server/bookings/emails.ts`, `src/server/kundali/service.ts`, `src/server/media/service.ts`, `src/server/email/components.tsx`, `src/server/ids.ts`, `src/lib/core/ist.ts`

## Install
None.

## Files
Create:
- `src/server/cron/jobs.ts`, `src/server/cron/daily.ts`, `src/server/cron/frequent.ts`
- `src/app/api/cron/daily/route.ts`, `src/app/api/cron/frequent/route.ts`, `vercel.json`
- `src/server/email/templates/BookingReminderEmail.tsx`, `ReviewRequestEmail.tsx`, `AbandonedCheckoutEmail.tsx`, `AdminDigestEmail.tsx`
Modify: none other

## Tasks
- [ ] T1. `jobs.ts` — each job: `async (now: Date) => { done: number }`, at most 100 rows, idempotent:
  `expireUnpaidOrders` (online `pending_payment` > 24 h → `cancelled` + event; no stock change) · `expireBookingHolds` (`pending_payment` with hold expired > 1 h → `expired`) · `bookingDayReminders` (confirmed, starting tomorrow IST, `reminder_day_at` null → email → set) · `bookingHourReminders` (confirmed, starting in 45–75 min, `reminder_hour_at` null → email with the join link when set → set) · `reviewRequests` (orders `delivered` 5–30 days ago without an order event `review_request` → `ReviewRequestEmail` with product links → add that event) · `abandonedCheckouts` (drafts with `order_id` null, `reminded_at` null, updated 1–48 h ago; skip — and mark reminded — when the same email ordered after the draft; else `AbandonedCheckoutEmail` → `reminded_at`) · `deleteOldPalmPhotos` (bookings completed/cancelled/no_show/expired whose `end_at ?? created_at` < now − 30 days with palm media → `deleteMedia` each, `palm_media_ids = []`) · `cleanupMedia` (`pending` > 24 h, unclaimed customer uploads > 24 h → `deleteMedia`) · `retryKundali` (status `paid`/`failed`, `gen_attempts` < 5, `updated_at` > 10 min ago → internal POST to the generate route, ≤ 5 per run) · `lowStockDigest` + `adminDigest` (today's bookings, yesterday's orders + revenue, low stock → one `AdminDigestEmail` to `notify.adminEmails`) · `cleanupTables` (expired sessions, OTP codes > 1 day, rate-limit windows > 2 days, webhook events > 30 days).
- [ ] T2. `daily.ts`: runs expireUnpaidOrders, expireBookingHolds, bookingDayReminders, reviewRequests, abandonedCheckouts, deleteOldPalmPhotos, cleanupMedia, retryKundali, adminDigest, cleanupTables — each in its own try/catch; returns and logs `{ job: done | "error" }`. `frequent.ts`: expireBookingHolds, bookingHourReminders, retryKundali.
- [ ] T3. Routes `GET /api/cron/daily` and `/api/cron/frequent` (`export const maxDuration = 60`): `Authorization: Bearer <CRON_SECRET>` checked with `safeEqualHex(sha256Hex(given), sha256Hex(secret))`; missing/wrong → 401; not configured → 503; respond with the summary JSON, `Cache-Control: no-store`.
- [ ] T4. `vercel.json`: `{ "crons": [{ "path": "/api/cron/daily", "schedule": "30 2 * * *" }] }` (08:00 IST).
- [ ] T5. Templates (EN/HI where customer-facing): booking reminder (day/hour variants, join link, reschedule link), review request, abandoned checkout (items + "Complete your order" → `/cart`), admin digest (EN).
- [ ] T6. Finish per AGENTS.md §1 step 8 (Done-notes: how to set up the optional 15-minute pinger — USER-SETUP §6).

## Must not
- No job without a "done" flag or state change that prevents repeats. No unbounded loops.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `curl -H "Authorization: Bearer <CRON_SECRET>" http://localhost:3000/api/cron/daily` → JSON summary; run it twice → the second run sends nothing new.
2. A booking tomorrow gets a reminder email (once); an online order left unpaid for > 24 h (edit `created_at` in studio) becomes cancelled.
3. Wrong/missing secret → 401.
4. On Vercel, Settings → Cron Jobs shows the daily job.
5. `pnpm build` passes.
