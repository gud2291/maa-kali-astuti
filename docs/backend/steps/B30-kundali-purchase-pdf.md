# B30 — Kundali ₹99: purchase, PDF, delivery, My Kundali, admin
**Risk:** H · **Needs:** B29 · **Agent:** Claude recommended · **User setup before QA:** USER-SETUP §3 (Browser Rendering + R2), §5 (Razorpay)

## Goal
Customers pay ₹99 on `/kundali-99`, get the full report as a web page and a PDF (email + download), and find it later under "My Kundali". Generation is retried safely; the team sees every Kundali order in admin.

## Read first (only these)
- `docs/backend/RULES.md` §2–§5
- `docs/backend/ARCHITECTURE.md` §7, §8 (private files), §10
- `docs/backend/DATA-MODEL.md` §G (`kundali_orders`), §I (`kundali`)
- `src/server/kundali/engine/index.ts`, `src/server/kundali/report/model.ts`, `src/server/kundali/report/html.tsx`, `src/server/kundali/report/ReportDocument.tsx`, `src/server/kundali/actions.ts`
- `src/server/payments/dispatch.ts`, `src/server/payments/actions.ts`, `src/server/payments/razorpay.ts`, `src/lib/payments/razorpay-client.ts`, `src/server/storage/r2.ts`, `src/server/media/service.ts`
- `src/components/sections/kundali/KundaliTool.tsx`, `PaySheet.tsx`, `k99-data.ts`, `src/lib/astro/kundali-download.ts`, `src/app/[locale]/kundali-99/page.tsx`
- `src/components/sections/account/AccountNav.tsx`, `src/components/admin/nav.ts`

## Install
None.

## Files
Create:
- `src/server/kundali/service.ts`, `src/server/kundali/pdf.ts`, `src/server/kundali/queries.ts`, `src/server/kundali/emails.ts`, `src/server/kundali/admin.ts`, `src/server/kundali/admin-actions.ts`
- `src/app/api/kundali/[ref]/generate/route.ts`
- `src/app/[locale]/kundali/report/[ref]/page.tsx`, `src/app/[locale]/account/kundali/page.tsx`
- `src/server/email/templates/KundaliReadyEmail.tsx`, `src/components/sections/kundali/ReportStatus.tsx`, `src/components/sections/account/KundaliList.tsx`
- `src/app/admin/(panel)/kundali/page.tsx`, `kundali/[id]/page.tsx`, `src/components/admin/kundali/KundaliActions.tsx`
Modify: `src/server/kundali/actions.ts` (purchase + status actions), `src/lib/validation/kundali.ts` (order schema), `src/server/payments/dispatch.ts` + `actions.ts` (entity `kundali`), `KundaliTool.tsx`, `PaySheet.tsx`, `kundali-99/page.tsx` (price from settings), `k99-data.ts` (remove price constants once unused), `AccountNav.tsx` (+ My Kundali), `src/components/admin/nav.ts` (+ Kundali orders `kundali`, group "Kundali", `kundali.view`), `messages/en.json`, `messages/hi.json`

## Tasks
- [ ] T1. `validation/kundali.ts`: `kundaliOrderSchema` = `chartInputSchema` + `reportLang` + phone `^[6-9]\d{9}$` + email (optional) + `locale` + `payPref`.
- [ ] T2. `kundali/service.ts`: `createKundaliOrder(input, ctx)` (settings `kundali.enabled` else `NOT_CONFIGURED`; price from settings; chart computed now and stored; `ref = refCode("MKA-K", 6)`; `accessKey = accessKeyFor("kundali", ref)`; `pending_payment`); `markKundaliPaid(...)` (first-time update → `paid` + payments row; first → `after()` trigger generation); `generateKundaliReport(id)`: lock with one `UPDATE … SET status = "generating", gen_started_at = now, gen_attempts + 1 WHERE id = ? AND gen_attempts < 5 AND (status IN ("paid", "failed") OR (status = "generating" AND gen_started_at < now − 120 s)) RETURNING …` (no row → return the current status); model → `renderReportHtml` → `renderPdf` → `putObject` private `prv/kundali/<yyyy>/<mm>/<ref>.pdf` → `media` row (pdf, private, ready, owner kundali) → `ready` + `pdf_media_id`; then `sendKundaliReady`. Error → `failed` + short `error`; after the 5th failure alert the admin.
- [ ] T3. `kundali/pdf.ts`: `renderPdf(html: string): Promise<Uint8Array>` → `POST https://api.cloudflare.com/client/v4/accounts/<CF_ACCOUNT_ID>/browser-rendering/pdf`, Bearer `CF_BROWSER_TOKEN`, JSON `{ html, gotoOptions: { waitUntil: "networkidle0" }, pdfOptions: { format: "a4", printBackground: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } } }`, 45 s timeout; non-PDF response → throw with the status. Not configured → `NOT_CONFIGURED`.
- [ ] T4. `POST /api/kundali/[ref]/generate` (`export const maxDuration = 60`): body `{ k }` (customer access key) **or** header `x-internal-key = hmacHex("gen:" + ref)` (server-to-server); runs `generateKundaliReport` and returns `{ status }`. Webhook/confirm paths trigger it from `after()` with a `fetch` to `absoluteUrl(...)` (2 s timeout, result ignored).
- [ ] T5. `kundali/actions.ts`: `createKundaliOrderAction` (`rateLimit("k99:ip", ip, 10, 600)` → order → `createRzpOrder({ amountInr, receipt: ref, notes: { entity: "kundali", id } })` → `{ ref, accessKey, rzp }`), `kundaliStatusAction({ ref, k })` (`{ status, pdfUrl? }` — signed URL only when ready), `kundaliPdfLinkAction({ ref, k? })` (owner or key). Payments: `dispatchPaid` case `kundali` → `markKundaliPaid`; `confirmPaymentAction` accepts `entity: "kundali"`.
- [ ] T6. `/kundali-99` wiring: page passes `{ priceInr, mrpInr, enabled }` from `getSetting("kundali")`; `PaySheet` runs create → `openRazorpay` → confirm; the existing success state shows `ReportStatus` (calls the generate route once, then polls `kundaliStatusAction` every 3 s up to 90 s; ready → "Download PDF" + "View online" + "Also emailed"); dismissed/failed → existing retry copy. The one-page SVG download (`kundali-download.ts`) is replaced by the PDF; remove that file if unused. The `?demo=` params stay untouched (B44 handles them).
- [ ] T7. `/kundali/report/[ref]` (dynamic; `?k=` or owner; noindex): `ready`/`paid`/`generating` → `<ReportDocument>` web view (model built from the stored chart) + "Download PDF" (`kundaliPdfLinkAction`); `pending_payment` → pay prompt; unknown → 404.
- [ ] T8. `kundali/emails.ts` + `KundaliReadyEmail` (EN/HI by `report_lang`): links to the web report and the PDF; attaches the PDF when ≤ 5 MB; sets `emailed_at`.
- [ ] T9. `/account/kundali` + `KundaliList` (cards: name, birth date, status, view/download); `AccountNav` tab "My Kundali".
- [ ] T10. Admin: `kundali/admin.ts` (`kundali.view` / `kundali.update`): `listKundaliOrders({ status, search, page })`, `getKundaliOrderAdmin(id)`, `regenerate(id)` (resets `gen_attempts` to 0 and triggers), `resendEmail(id)`; pages list + detail (birth data, chart summary, status, error, actions); nav item.
- [ ] T11. Messages (EN + HI) for every new string.
- [ ] T12. Finish per AGENTS.md §1 step 8.

## Must not
- Never generate twice in parallel (always through the lock). PDFs only in the private bucket via signed URLs. No Chromium/puppeteer.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `/kundali-99`: fill the form → preview → pay ₹99 (test) → "Preparing…" → within ~20 s "Download PDF" works; the email has the PDF and links.
2. The PDF is ~28 A4 pages, Hindi version renders Devanagari correctly.
3. `/account/kundali` lists it; `/kundali/report/<ref>?k=…` opens the web report.
4. Admin → Kundali orders → regenerate and resend work; a wrong `k` → 404.
5. Settings → Offers → Kundali off → buying shows "temporarily unavailable".
6. `pnpm build` passes.
