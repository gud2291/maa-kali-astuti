# B22 — Consultation booking: availability, slot hold, payment, palm uploads, confirmation
**Risk:** H · **Needs:** B21 · **Agent:** Claude recommended · **User setup before QA:** USER-SETUP §3 (R2), §5 (Razorpay)

## Goal
The existing booking stepper (`/book/[service]`) becomes real: live slots in IST from the `consult` settings and existing bookings, an atomic 10-minute slot hold, private palm-photo uploads, Razorpay payment, and confirmation emails with a calendar file. Same design.

## Read first (only these)
- `docs/backend/RULES.md` §2–§5
- `docs/backend/ARCHITECTURE.md` §5 (slot-claim pattern), §7, §8
- `docs/backend/DATA-MODEL.md` §G (`bookings`), §I (`consult`)
- `src/lib/api/booking.ts`, `src/lib/validation/booking.ts`, `src/lib/astro/slots.ts`, `src/lib/astro/calendar.ts` (`ics`, `gcal` signatures), `src/lib/core/ist.ts`
- `src/components/sections/booking/BookingFlow.tsx`, `StepDetails.tsx`, `StepSlot.tsx`, `StepPay.tsx`, `BookingDone.tsx`, `src/app/[locale]/book/[service]/page.tsx`
- `src/server/payments/razorpay.ts`, `src/server/payments/dispatch.ts`, `src/server/payments/actions.ts`, `src/lib/payments/razorpay-client.ts`, `src/server/media/service.ts`, `src/components/media/useUpload.ts`, `src/server/consult/queries.ts`
- `messages/en.json` → `booking` namespace

## Install
None.

## Files
Create:
- `src/server/bookings/availability.ts`, `src/server/bookings/service.ts`, `src/server/bookings/actions.ts`, `src/server/bookings/emails.ts`
- `src/app/api/slots/route.ts`
- `src/server/email/templates/BookingConfirmedEmail.tsx`, `src/server/email/templates/AdminBookingAlertEmail.tsx`
Modify: `src/lib/validation/booking.ts` (server input schema), `src/lib/api/booking.ts` (real `submitBooking`), `src/server/payments/dispatch.ts` + `src/server/payments/actions.ts` (entity `booking`), `BookingFlow.tsx`, `StepDetails.tsx`, `StepSlot.tsx`, `StepPay.tsx`, `BookingDone.tsx`, `book/[service]/page.tsx`, `messages/en.json`, `messages/hi.json`

## Tasks
- [x] T1. `availability.ts`: `slotLen(mins): "30" | "45" | "60" | "90"` (same rounding as `slotsFor`); `ConsultRules` type (`openDays`, `bookingWindowDays`, `minLeadHours`, `blocked`); `getDaySlots({ serviceKey, tierKey, day }): Promise<{ t: string; free: boolean }[]>` — empty for a closed weekday, beyond the window or before today; each start time from `startTimes[len]`: `start = istWallToUtc(day, t)`, `end = start + tier mins`; not free when `start < now + minLeadHours`, inside a `blocked` range, or overlapping a booking that is `confirmed` or `pending_payment` with an unexpired hold (one query on `bookings_start_idx` for that day ± 2 h). — antigravity
- [x] T2. `GET /api/slots?service=&tier=&date=`: zod (keys from enums, date `yyyy-mm-dd`) → `getDaySlots` → `Cache-Control: no-store`. — antigravity
- [x] T3. `validation/booking.ts`: add `bookingCreateSchema` (`serviceKey`, `tierKey`, `mode`, `details` (existing step-2 rules re-checked on the server), `start` ISO or null — null only for `report` mode, `palms: { mediaId; claimKey }[]` exactly 2 for palm reading else empty, `payPref`, `locale`). Existing client functions stay. — antigravity
- [x] T4. `bookings/service.ts`: `createBooking(input, ctx): Promise<{ bookingId; ref; accessKey; priceInr; holdUntil: number }>` — tier price/mins from the DB; mode must be one of the service's modes; slotted modes run the **atomic slot-claim insert** (ARCH §5) with `hold_expires_at = now + holdMinutes` (no row → `SLOT_TAKEN`); `ref = refCode("MKA-B", 5)` (retry on clash); `accessKey = accessKeyFor("booking", ref)`; palms → `claimMedia(…, { type: "booking", id })`. `markBookingPaid({ bookingId, rzpOrderId, rzpPaymentId, amountInr, method })` — first-time update `pending_payment → confirmed` + `paid_at` + payments row; if the hold had expired and a confirmed booking now overlaps, still confirm but set `admin_note = "Slot clash — reschedule needed"` and alert the admin; amount mismatch → `admin_note` + alert; first time → `after()` emails. — antigravity
- [x] T5. `bookings/actions.ts` (`"use server"`): `createBookingAction(input)` → parse → `rateLimit("booking:ip", ip, 10, 600)` → `getCustomer()` → `createBooking` → `createRzpOrder({ amountInr, receipt: ref, notes: { entity: "booking", id } })` → save `razorpay_order_id` + payments row → `{ ref, accessKey, rzp }` (Razorpay not configured → `NOT_CONFIGURED`). — antigravity
- [x] T6. Payments: `dispatchPaid` case `booking` → `markBookingPaid`; `confirmPaymentAction` accepts `entity: "booking"` (lookup by `ref` + matching `razorpay_order_id`). — antigravity
- [x] T7. `bookings/emails.ts`: `sendBookingConfirmed(bookingId)` — customer `BookingConfirmedEmail` (EN/HI: service, package, mode, date/time IST or "written report in 48 hours", what to keep ready, "video/WhatsApp link 1 hour before", reschedule rule from settings, manage link `/booking/<ref>?k=<accessKeyFor("booking", ref)>`) with an `.ics` attachment built by `ics()`; admin `AdminBookingAlertEmail` to `notify.adminEmails` when `bookingAlerts`. — antigravity
- [x] T8. `src/lib/api/booking.ts`: keep `submitBooking(req)` as the seam: `createBookingAction` → `openRazorpay` → `confirmPaymentAction` → `{ id: ref }`; dismissed/failed → throw `Error("PAYMENT_FAILED")`; server error codes thrown as `Error(code)`. Remove the `localStorage` demo store. Extend `BookingRequest` with `palms` and `payPref`. — antigravity
- [x] T9. `book/[service]/page.tsx`: pass `rules: ConsultRules` from `getSetting("consult")` into `BookingFlow`. `StepSlot.tsx`: the calendar disables closed/blocked/out-of-window days from `rules`; picking a date fetches `/api/slots` (loading state; taken times disabled exactly like the demo's busy times). `slots.ts` demo function stays only if still used elsewhere (list in Done-notes). — antigravity
- [x] T10. `StepDetails.tsx`: palm inputs upload immediately with `useUpload("palm")` (progress, retry, replace); step validation needs both uploads finished. `StepPay.tsx`: the chosen method becomes `payPref` (UPI → `upi`, card → `card`, netbanking → `netbanking`); UPI-ID / bank sub-choices remain visual only. — antigravity
- [x] T11. `BookingFlow.tsx`: the 2 s mock overlay becomes the real flow (the existing "Confirming your payment" overlay shows while the modal/confirm run); `SLOT_TAKEN` → back to step 3 with a message and refreshed slots; `PAYMENT_FAILED` → stay on step 4 with a retry message. `BookingDone.tsx`: shows the server `ref`; calendar buttons unchanged. — antigravity
- [x] T12. Messages (EN + HI) for every new string (upload states, slot taken, payment failed). — antigravity
- [x] T13. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- Never check a slot and insert in two statements. No COD for bookings. No reschedule UI (B23), no admin screens (B24).

## Done-notes
- Created: `src/server/bookings/availability.ts`, `service.ts`, `actions.ts`, `emails.ts`, `src/app/api/slots/route.ts`, `BookingConfirmedEmail.tsx`, `AdminBookingAlertEmail.tsx`.
- Modified: `src/lib/validation/booking.ts`, `src/lib/api/booking.ts`, `payments/dispatch.ts`, `payments/actions.ts`, `BookingFlow.tsx`, `StepDetails.tsx`, `StepPay.tsx`, `StepSlot.tsx`, `book/[service]/page.tsx`, `messages/en.json`, `messages/hi.json`.
- Atomic slot-claim pattern implemented (single INSERT with WHERE NOT EXISTS against active holds/confirmed bookings).
- Private palm uploads with `useUpload("palm")` directly to R2 `mka-private`, claimed on booking creation.
- Live IST slots fetched from `/api/slots`; calendar disables closed/blocked/out-of-window dates.
- Razorpay payments verified server-side with slot clash & amount mismatch fallback alerts.
- Confirmation emails sent via Resend with dynamic `.ics` calendar invite attachment.
- `slotsFor` in `slots.ts` remains present but is no longer used (`StepSlot` now uses live `/api/slots`).
- Migrations added: no (schema already contains `bookings`, `payments`, `media` from B03).

## Manual QA (user)
1. `/book/kundali-reading`: Sundays/blocked/out-of-window days are disabled; a date shows real times.
2. Palm reading: both photos upload with progress (R2 `mka-private` shows 2 objects).
3. Pay with Razorpay test → confirmation page with your `MKA-B…` ref; email has the details + calendar file.
4. Book the same time again in another browser → that time is now taken; two browsers racing for one slot → only one gets it.
5. Close the payment modal → retry message; after 10 minutes the held slot is free again.
6. `pnpm build` passes.
