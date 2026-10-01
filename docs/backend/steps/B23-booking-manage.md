# B23 — Booking manage page, reschedule, account bookings
**Risk:** M · **Needs:** B22 · **Agent:** any · **User setup before QA:** a paid test booking from B22

## Goal
Customers open their booking from the email link or their account, see time/mode/status, join link and report when the admin adds them, and reschedule once (rule from settings).

## Read first (only these)
- `docs/backend/RULES.md` §2, §5, §6
- `docs/backend/DATA-MODEL.md` §G (`bookings`), §I (`consult`)
- `src/server/bookings/service.ts`, `src/server/bookings/availability.ts`, `src/server/bookings/actions.ts`, `src/server/bookings/emails.ts`, `src/server/media/service.ts` (`signedPrivateUrl`), `src/lib/astro/calendar.ts`
- `src/components/sections/booking/StepSlot.tsx` (calendar + slot UI to reuse), `src/components/sections/account/AccountNav.tsx`
- `messages/en.json` → `booking` namespace

## Install
None.

## Files
Create:
- `src/server/bookings/queries.ts`, `src/server/email/templates/BookingRescheduledEmail.tsx`
- `src/app/[locale]/booking/[ref]/page.tsx`, `src/app/[locale]/account/bookings/page.tsx`
- `src/components/sections/booking/BookingManage.tsx`, `src/components/sections/booking/RescheduleCard.tsx`, `src/components/sections/account/BookingList.tsx`
Modify: `src/server/bookings/service.ts` (`rescheduleBooking`), `src/server/bookings/actions.ts` (`rescheduleBookingAction`, `bookingReportLinkAction`), `src/server/bookings/emails.ts`, `AccountNav.tsx` (+ Bookings tab), `messages/en.json`, `messages/hi.json` (namespace `bookingManage`)

## Tasks
- [ ] T1. `bookings/queries.ts`: `getBookingView(ref, accessKey)` (key check like orders), `getBookingViewForUser(userId, ref)`, `listMyBookings(userId)` (upcoming first, then past). DTO: ref, service/tier names, mode, start/end ms, status, meeting link (only when confirmed), has report, can reschedule (+ reason when not), price.
- [ ] T2. `rescheduleBooking({ bookingId, start, by: "customer" | "admin" })`: customer rules — `confirmed`, `reschedule_count < maxReschedules`, now ≤ old start − `rescheduleMinHours`, new day open and in the window, new slot free; one atomic `UPDATE … SET start_at, end_at, reschedule_count + 1 WHERE id = ? AND NOT EXISTS (overlapping confirmed/held booking other than this one)` → no row = `SLOT_TAKEN`. Admin skips the count/time rules (B24 uses it). After success → `sendBookingRescheduled` (customer + admin, with a new `.ics`).
- [ ] T3. Actions: `rescheduleBookingAction({ ref, accessKey?, start })` (owner session **or** valid key; `rateLimit("reschedule:ip", ip, 10, 3600)`), `bookingReportLinkAction({ ref, accessKey? })` → `signedPrivateUrl(report_media_id, "report-<ref>.pdf")` (10 min).
- [ ] T4. `/booking/[ref]` page (dynamic, `?k=` or owner; noindex) → `BookingManage`: status, service, package, mode, IST date/time (or "written report"), join link button when present, "Download report" when present, add-to-calendar buttons, `RescheduleCard` when allowed (date + slots from `/api/slots`, confirm dialog), otherwise the reason, WhatsApp help.
- [ ] T5. `/account/bookings` (`requireCustomerPage`) → `BookingList` (upcoming / past cards linking to `/booking/<ref>`); `AccountNav` gets the Bookings tab.
- [ ] T6. `BookingRescheduledEmail` (EN/HI) + `.ics`.
- [ ] T7. Messages `bookingManage` (EN + HI).
- [ ] T8. Finish per AGENTS.md §1 step 8.

## Must not
- No cancellation by customers (admin only, B24). Never move a booking without the atomic overlap check.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. Open the manage link from the confirmation email → details correct in IST.
2. Reschedule to another free slot → new email + calendar file; the old slot becomes free on `/book/…`.
3. Try again → "already rescheduled once"; a booking starting within 12 hours → reschedule not offered.
4. Signed in → `/account/bookings` lists it.
5. `pnpm build` passes.
