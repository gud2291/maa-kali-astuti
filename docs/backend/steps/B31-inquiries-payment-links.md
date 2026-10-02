# B31 — Course & ritual inquiries, payment links, admin pipeline
**Risk:** M · **Needs:** B30 · **Agent:** any · **User setup before QA:** USER-SETUP §5 (payment links in test mode)

## Goal
The inquiry forms on `/sadhana-courses`, course pages and `/rituals` save to the DB (bot-checked, rate-limited, emailed). The team works them in a pipeline (status, assignee, next action, notes) and sends Razorpay payment links for course fees / instalments / ritual fees; paid links update the inquiry automatically.

## Read first (only these)
- `docs/backend/RULES.md` §2, §6, §7
- `docs/backend/ARCHITECTURE.md` §7 (payment links)
- `docs/backend/DATA-MODEL.md` §H (`inquiries`, `inquiry_events`, `payment_links`), §I (`courses`, `notify`)
- `src/lib/api/inquiry.ts`, `src/lib/validation/inquiry.ts`, `src/components/forms/InquiryForm.tsx`
- `src/server/payments/razorpay.ts` (`createPaymentLink`), `src/server/payments/dispatch.ts`, `src/app/api/webhooks/razorpay/route.ts`, `src/components/auth/TurnstileWidget.tsx`, `src/server/email/components.tsx`
- `src/components/admin/nav.ts`, admin kit file list

## Install
None.

## Files
Create:
- `src/server/inquiries/service.ts`, `src/server/inquiries/actions.ts`, `src/server/inquiries/links.ts`, `src/server/inquiries/admin.ts`, `src/server/inquiries/admin-actions.ts`
- `src/server/email/templates/InquiryReceivedEmail.tsx`, `src/server/email/templates/AdminInquiryAlertEmail.tsx`
- `src/app/admin/(panel)/inquiries/page.tsx`, `inquiries/[id]/page.tsx`, `src/components/admin/inquiries/InquiryDetail.tsx`, `InquiryPipeline.tsx`, `PaymentLinkDialog.tsx`, `InquiryNotes.tsx`
Modify: `src/lib/validation/inquiry.ts` (`inquirySubmitSchema` = values + kind + locale + turnstileToken), `src/lib/api/inquiry.ts` (real `submitInquiry`), `InquiryForm.tsx` (Turnstile + error states), `src/server/payments/dispatch.ts` (entity `link`), webhook route (`payment_link.paid`), `src/components/admin/nav.ts` (+ Inquiries `chat`, group "Leads", `inquiries.view`), `messages/en.json`, `messages/hi.json`

## Tasks
- [x] T1. `inquirySubmitSchema`: the existing per-kind rules (reuse `inquirySchema(kind)`) + `kind`, `locale`, `turnstileToken`; course key must be one of `COURSE_KEYS` for course inquiries. — antigravity
- [x] T2. `inquiries/service.ts`: `createInquiry(input, ctx): Promise<{ id; ref }>` — `ref` = `"MKA-S-"`/`"MKA-R-"` + `randomDigits(6)` (retry on clash), insert + event `created`; `after()` → customer `InquiryReceivedEmail` (when email given; EN/HI: what happens next, reply time) + `AdminInquiryAlertEmail` (when `inquiryAlerts`). — antigravity
- [x] T3. `inquiries/actions.ts` (`"use server"`): `submitInquiryAction(input)` → `verifyTurnstile` → `rateLimit("inquiry:ip", ip, 5, 3600)` + `rateLimit("inquiry:phone", phone, 3, 86400)` → `createInquiry` → `{ refNo }`. — antigravity
- [x] T4. `src/lib/api/inquiry.ts`: `submitInquiry(kind, values, turnstileToken)` calls the action (same return `{ refNo }`); remove the `localStorage` demo. `InquiryForm.tsx`: renders `TurnstileWidget` (action `inquiry`) near submit, passes the token, maps server error codes to the existing error copy (+ new `errors.*` keys); success state unchanged. — antigravity
- [x] T5. `inquiries/links.ts`: `createInquiryLink(inquiryId, { amountInr, purpose }, actor)` and `createCustomLink({ amountInr, purpose, customer }, actor)` (`payment_links.create`) → `createPaymentLink` (Razorpay notifies the customer by SMS/email; expire in 7 days; `notes = { entity: "link" }`) → `payment_links` row + inquiry event `payment_link`. `markLinkPaid({ rzpLinkId, rzpPaymentId, amountInr })` → first-time update `created → paid` + `payments` row (entity `link`) + inquiry `paid_inr += amount` + event `payment`. — antigravity
- [x] T6. Webhook: `payment_link.paid` → `markLinkPaid` (link id from `payload.payment_link.entity.id`); `dispatchPaid` case `link`. — antigravity
- [x] T7. `inquiries/admin.ts` (`inquiries.view` / `inquiries.update`; audit writes): `listInquiries({ status, kind, search, page })` + counts per status, `getInquiryAdmin(id)` (+ events + links), `setInquiryStatus(id, to, note)` (any → any), `assignInquiry(id, userId | null)`, `setNextAction(id, at | null)`, `setFee(id, feeInr | null)`, `addInquiryNote(id, note)`. `admin-actions.ts` wraps them + the two link creators. — antigravity
- [x] T8. `/admin/inquiries`: status tabs (new · contacted · call scheduled · approved · enrolled · declined · closed) with counts, kind filter, search, `DataTable` (ref, name, course/ritual, city, created, next action, assignee). — antigravity
- [x] T9. `/admin/inquiries/[id]` → `InquiryDetail` (all answers, tel + WhatsApp buttons, status select, assignee select (admin users), next-action date, fee, paid so far), `InquiryNotes` (timeline + add note), payment links list with copy / share-on-WhatsApp and `PaymentLinkDialog` (amount prefilled from fee or instalment amount, purpose). — antigravity
- [x] T10. Messages (EN + HI) for new form states; `nav.ts` item. — antigravity
- [x] T11. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No contact page or newsletter (B32). Never mark a link paid without a verified webhook.

## Done-notes
- Created `src/server/inquiries/{service,actions,links,admin,admin-actions}.ts` for inquiry lifecycle, rate limits, audit, and Razorpay payment links.
- Created `src/server/email/templates/{InquiryReceivedEmail,AdminInquiryAlertEmail}.tsx` for customer confirmation and admin alert emails.
- Created `/admin/inquiries` and `/admin/inquiries/[id]` with `InquiryPipeline`, `InquiryDetail`, `PaymentLinkDialog`, and `InquiryNotes`.
- Modified `inquirySubmitSchema`, `submitInquiry`, and `InquiryForm.tsx` to integrate Turnstile, rate limits, and server error mappings.
- Modified `dispatchPaid` (case `link`) and Razorpay webhook route (`payment_link.paid`) for idempotent payment fulfillment and inquiry `paid_inr` tracking.
- Added Inquiries nav item to `src/components/admin/nav.ts` under group "Leads" and updated error strings in `messages/{en,hi}.json`.
- Migration added: no.

## Manual QA (user)
1. Submit a course inquiry (`/sadhana-courses#enquire`) and a ritual inquiry → success with `MKA-S-…` / `MKA-R-…`; emails arrive; 4th submit from the same phone today → rate-limited message.
2. Admin → Inquiries: move through statuses, assign, set next action, add notes.
3. Create a ₹16,667 payment link → open the short URL → pay in test mode → (preview with webhook) the link shows Paid and the inquiry's "paid so far" updates.
4. `pnpm build` passes.
