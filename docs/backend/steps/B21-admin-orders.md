# B21 — Admin: orders
**Risk:** H · **Needs:** B20 · **Agent:** any (refund code must follow the spec exactly) · **User setup before QA:** USER-SETUP §5 for refunds

## Goal
The team runs every order from phone or laptop: pipeline tabs, search, detail with timeline, status changes with customer emails, tracking, energization dates, cancel with restock, Razorpay refunds, COD collection, notes, invoice + packing slip printing, WhatsApp click-to-chat and CSV export.

## Read first (only these)
- `docs/backend/RULES.md` §2–§7
- `docs/backend/ARCHITECTURE.md` §5, §7 (refunds), §9
- `docs/backend/DATA-MODEL.md` §B (`ORDER_FLOW`), §F
- `design-brief/DESIGN-BRIEF.md` lines 645–647 (orders admin)
- `src/server/orders/service.ts`, `src/server/orders/queries.ts`, `src/server/orders/invoice.ts`, `src/server/payments/razorpay.ts`, `src/app/api/webhooks/razorpay/route.ts`, `src/server/email/components.tsx`, `src/server/audit.ts`
- `src/components/sections/order/InvoiceDocument.tsx`, `src/components/admin/nav.ts`, admin kit file list

## Install
None.

## Files
Create:
- `src/lib/validation/order-admin.ts`, `src/server/orders/admin.ts`, `src/server/orders/admin-actions.ts`, `src/server/orders/refunds.ts`, `src/server/email/templates/OrderStatusEmail.tsx`, `src/lib/core/whatsapp.ts`
- `src/app/admin/(panel)/orders/page.tsx`, `orders/[id]/page.tsx`, `orders/[id]/invoice/page.tsx`, `orders/[id]/packing-slip/page.tsx`
- `src/components/admin/orders/OrderTabs.tsx`, `OrderFilters.tsx`, `OrderActions.tsx`, `StatusDialog.tsx`, `RefundDialog.tsx`, `EnergizationBulk.tsx`, `OrderTimelineAdmin.tsx`, `CustomerCard.tsx`, `PackingSlip.tsx`, `ExportButton.tsx`, `wa-templates.ts`
Modify: `src/app/api/webhooks/razorpay/route.ts` (refund events), `src/server/orders/emails.ts` (`sendOrderStatusEmail`), `src/components/admin/nav.ts` (+ Orders `package`, Sales, `orders.view`)

## Tasks
- [ ] T1. `order-admin.ts` schemas: list filters (tab, search ≤ 60, method, from/to `yyyy-mm-dd`, page), `transitionSchema` (`to`, note ≤ 500, notify, courier ≤ 60 / awb ≤ 40 / trackingUrl url — required when `to = "shipped"`), refund (amount int ≥ 1, reason ≤ 200), note, energization bulk (date, scope `"placed"`), tracking.
- [ ] T2. `orders/admin.ts` (`requireAdmin` first; audit every write):
  `listOrders(filters)` (tabs: new = `placed`, energizing, packed, shipped, delivered, pending_payment, cancelled, attention = `needs_attention`, all; search by number, phone, email or name; newest first; 20/page) + `countByTab()` (one `GROUP BY status` + attention count) · `getOrderAdmin(id)` (order, items, all events, payments, refunds) · `transitionOrder(id, input, actor)` (must pass `canMove(ORDER_FLOW)`; sets `shipped_at` / `delivered_at` / `cancelled_at`; cancelling an order whose stock was taken (`payment_status` paid or cod_pending) restocks every item (ARCH §5); public event for customer-visible statuses; `notify` → `after(sendOrderStatusEmail)`) · `setEnergizationDate(date, scope)` (all `placed` orders, event + optional email) · `updateTracking` · `markCodCollected` · `addOrderNote` (private event) · `resolveAttention` · `exportOrdersCsv(filters)` (`exports.run`; ≤ 5000 rows; RFC-4180 quoting; cells starting with `= + - @` prefixed with `'`).
- [ ] T3. `orders/refunds.ts`: `refundOrder(id, { amountInr, reason }, actor)` (`orders.refund`): amount ≤ paid − refunded; online → `refundPayment` → `refunds` row `pending` (`rzp_refund_id`) + event; COD/manual → `refunds` row `processed`, `refunded_inr` += amount, status `refunded`/`partially_refunded` + event. `applyRefundWebhook(rzpRefundId, status)` → row `processed`/`failed`; processed adds to `refunded_inr` and sets `payment_status`; event + customer email.
- [ ] T4. `admin-actions.ts`: one action per write; stock-touching actions `invalidate(TAG.catalog, …product tags)`.
- [ ] T5. Webhook: `refund.processed` / `refund.failed` → `applyRefundWebhook` (idempotent through `webhook_events` as before).
- [ ] T6. `sendOrderStatusEmail(orderId, status)` + `OrderStatusEmail` (EN/HI copy per status: energizing with the date, packed, shipped with courier/AWB/link, delivered, cancelled, refund processed).
- [ ] T7. `src/lib/core/whatsapp.ts`: `waToCustomer(phone10: string, text: string): string` → `https://wa.me/91<phone>?text=<encoded>`; `wa-templates.ts`: EN/HI message per status with the order number (+ tracking).
- [ ] T8. `orders/page.tsx`: `OrderTabs` (with counts, scrollable on mobile), `OrderFilters` (search, method, date range), `DataTable` (number, customer, items count, total, method + payment badge, status badge, date IST, attention icon), `Pagination`, `ExportButton` (`exports.run`; downloads `orders-<date>.csv` from the action result), `EnergizationBulk` on the New tab.
- [ ] T9. `orders/[id]/page.tsx`: header (number, status, payment, attention banner with resolve), `CustomerCard` (name, `tel:` link, email, WhatsApp button with the template), items (energization name/gotra highlighted), totals, address (copy), `OrderTimelineAdmin` (all events), `OrderActions` (next-status buttons from `ORDER_FLOW` → `StatusDialog`; cancel with confirm; `RefundDialog` for `orders.refund`; COD collected; note; energization date; tracking), links to invoice and packing slip.
- [ ] T10. `orders/[id]/invoice/page.tsx` (reuses `InvoiceDocument`) and `packing-slip/page.tsx` (`PackingSlip`: number, items + qty + energization names, ship-to, no prices; print CSS like the invoice).
- [ ] T11. `nav.ts`: add Orders.
- [ ] T12. Finish per AGENTS.md §1 step 8.

## Must not
- Never skip `ORDER_FLOW`. Never refund more than was paid. Never restock twice (restock only on the cancel transition).

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `/admin/orders` on phone + laptop: tabs with counts, search by phone, date filter, CSV opens correctly in Excel.
2. Move a COD order New → Energizing (customer email) → Packed → Shipped (needs courier + AWB; email has the link) → Delivered; timeline shows each step; customer `/account` shows it.
3. Cancel a placed order → stock goes back up (studio) and the shop shows it.
4. Refund a test online order (partial, then the rest) → `pending` → after the webhook (preview) `processed`, order `refunded`.
5. Print invoice and packing slip; WhatsApp button opens a prefilled chat.
6. Staff role: can change status but has no refund button.
7. `pnpm build` passes.
