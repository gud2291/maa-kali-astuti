# B24 — Admin: consultations (services, availability, bookings)
**Risk:** M · **Needs:** B23 · **Agent:** any · **User setup before QA:** a few test bookings

## Goal
The team edits services and prices, sets working days/times and blocked dates, and runs bookings from a week calendar: details, palm photos, meeting link, report upload, reschedule, cancel/refund, notes.

## Read first (only these)
- `docs/backend/RULES.md` §2, §6, §7
- `docs/backend/DATA-MODEL.md` §B (`BOOKING_FLOW`, `ServiceContent`), §E (`services`, `service_tiers`), §G (`bookings`), §I (`consult`)
- `design-brief/DESIGN-BRIEF.md` lines 648–649 (bookings admin)
- `src/server/settings/admin.ts`, `src/server/bookings/service.ts`, `src/server/bookings/availability.ts`, `src/server/bookings/emails.ts`, `src/server/orders/refunds.ts` (`applyRefundWebhook`), `src/server/payments/razorpay.ts`, `src/server/media/service.ts`, `src/server/consult/queries.ts`
- `src/components/admin/nav.ts`, `src/components/admin/products/LocListEditor.tsx`, `src/components/media/useUpload.ts`, admin kit file list

## Install
None.

## Files
Create:
- `src/lib/validation/consult-admin.ts`, `src/server/consult/admin.ts`, `src/server/consult/admin-actions.ts`
- `src/server/bookings/admin.ts`, `src/server/bookings/admin-actions.ts`, `src/server/email/templates/BookingUpdateEmail.tsx`
- `src/app/admin/(panel)/services/page.tsx`, `services/[key]/page.tsx`, `availability/page.tsx`, `bookings/page.tsx`, `bookings/[id]/page.tsx`
- `src/components/admin/consult/ServiceForm.tsx`, `TierEditor.tsx`, `AvailabilityForm.tsx`, `src/components/admin/bookings/WeekCalendar.tsx`, `DayList.tsx`, `BookingDetail.tsx`, `BookingActions.tsx`, `PalmPhotos.tsx`, `ReportUpload.tsx`, `AdminReschedule.tsx`
Modify: `src/server/settings/admin.ts` (export `writeSetting(key, value, actor)` used by `updateSetting`), `src/server/orders/refunds.ts` (refund webhook branches on `entity`), `src/server/bookings/emails.ts`, `src/components/admin/nav.ts` (+ Bookings `calendar` · Services `report` · Availability `clock`, group "Consultations")

## Tasks
- [ ] T1. `consult-admin.ts` schemas: service (names EN/HI, modes ⊆ `MODE_KEYS` ≥ 1, guarantee, content Loc fields ≤ 300, covered ≤ 10 rows `{ icon, t, d }`, samples ≤ 6, sort, visible), tier (title EN/HI, price 1–200000, mins 15–180, recommended, inclusions ≤ 8), consult settings (startTimes per length `HH:mm` sorted unique, openDays ⊆ 0–6, window 1–120, lead 0–72, hold 5–30, reschedule hours 0–72, max reschedules 0–3, blocked ranges ≤ 50 with from < to), booking status/meeting link (https URL ≤ 300)/note ≤ 500/cancel (refund boolean, reason).
- [ ] T2. `consult/admin.ts` (`consult.edit`): `listServicesAdmin()`, `updateService(key, input)`, `updateTier(serviceKey, tierKey, input)` (exactly one recommended tier per service), `getConsultSettings()`, `updateConsultSettings(input)` via `writeSetting("consult", …)`. Audit all. `admin-actions.ts`: invalidate `TAG.consult` (services) / `TAG.settings` (availability).
- [ ] T3. `bookings/admin.ts` (`bookings.view` / `bookings.update`; audit writes): `listBookings({ view: "upcoming" | "pending" | "past" | "all", search, page })`, `getWeek(weekStartDayKey)` (Mon–Sun IST), `getBookingAdmin(id)` (+ signed palm URLs + report flag), `updateBookingStatus(id, to, note)` (`canMove(BOOKING_FLOW)`), `setMeetingLink(id, url)` (+ email), `attachReport(id, mediaId)` (+ email "report ready"), `rescheduleByAdmin(id, start)` (`rescheduleBooking(…, "admin")`), `cancelBooking(id, { refund, reason })` (status `cancelled`; refund → `refundPayment` + `refunds` row with entity `booking`; email), `addBookingNote(id, note)`, `adminSlots(serviceKey, tierKey, day)` (wraps `getDaySlots`). `admin-actions.ts` wraps them.
- [ ] T4. `refunds.ts`: `applyRefundWebhook` handles `entity = "booking"` (update the refund row + email) besides orders.
- [ ] T5. `BookingUpdateEmail` (EN/HI) for: meeting link added, report ready (manage link), cancelled (with refund note). `bookings/emails.ts` gets the senders.
- [ ] T6. `/admin/services` (cards with from-price, visible badge) + `/admin/services/[key]` (`ServiceForm` + three `TierEditor`s).
- [ ] T7. `/admin/availability` → `AvailabilityForm` (start times per session length as chip lists with add/remove, open-day toggles, window/lead/hold/reschedule numbers, blocked ranges list with date-time pickers and notes).
- [ ] T8. `/admin/bookings`: view switch Calendar | List; `WeekCalendar` (`next/dynamic`; ≥ 768 px 7-day grid 08:00–21:00 IST with booking blocks coloured by status, prev/next week) and `DayList` (< 768 px, day switcher); List = `DataTable` with tabs and search; links to detail.
- [ ] T9. `/admin/bookings/[id]` → `BookingDetail` (customer + WhatsApp/call, service/package/mode/time, birth details, question, numerology inputs, `PalmPhotos` (signed images, open full size), status badge, notes) + `BookingActions` (status buttons, meeting link form, `ReportUpload` (PDF via `useUpload("report")` → `attachReport`), `AdminReschedule` (day + `adminSlots`), cancel/refund dialog).
- [ ] T10. `nav.ts`: add the three items.
- [ ] T11. Finish per AGENTS.md §1 step 8.

## Must not
- No new tables or columns. Palm photos only through signed URLs (never public).

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. Services: change a tier price/inclusions → `/consultations/<service>` and booking step 1 show it.
2. Availability: block tomorrow 10:00–14:00 and close Saturdays → `/book/…` reflects it.
3. Bookings calendar on laptop (week) and phone (day list); open a booking: palm photos load, add a meeting link → customer email + manage page shows "Join".
4. Upload a PDF report → customer email; manage page "Download report" works.
5. Reschedule as admin; cancel with refund (test payment) → refund row → webhook processed (preview).
6. `pnpm build` passes.
