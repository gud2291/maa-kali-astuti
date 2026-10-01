# B16 — Order engine (server): quote, COD placement, emails, success page
**Risk:** H · **Needs:** B15 · **Agent:** Claude recommended · **User setup before QA:** none (Resend for real emails) — end-to-end QA happens in B17

## Goal
The server side of buying: an authoritative price quote, safe COD order placement (stock, coupon, invoice number in one transaction), order numbering, confirmation emails, and the order success page. B17 builds the checkout UI on top; B18 adds online payment.

## Read first (only these)
- `docs/backend/RULES.md` §2–§5
- `docs/backend/ARCHITECTURE.md` §5 (atomic patterns), §7 (first and COD paragraphs), §9
- `docs/backend/DATA-MODEL.md` §B (`CartLineInput`, `ShipAddress`), §F, §I (`store`, `notify`, `contact`, `invoice`)
- `design-brief/DESIGN-BRIEF.md` lines 514–519 (§7.6 order success)
- `src/lib/core/cart.ts`, `src/lib/core/dates.ts` (`muhurat` only), `src/lib/validation/cart.ts`, `src/server/coupons/service.ts`, `src/server/cart/actions.ts`, `src/server/catalog/queries.ts`, `src/server/settings/queries.ts`, `src/server/email/components.tsx`, `src/server/auth/guards.ts`, `src/server/auth/turnstile.ts`, `src/server/ids.ts`, `src/server/rate-limit.ts`
- `src/components/ui/Price.tsx`, `src/lib/core/commerce.ts` (`waLink`)

## Install
None.

## Files
Create:
- `src/lib/domain/india.ts`, `src/lib/validation/checkout.ts`
- `src/server/cart/quote.ts`
- `src/server/orders/numbers.ts`, `src/server/orders/service.ts`, `src/server/orders/queries.ts`, `src/server/orders/emails.ts`, `src/server/orders/actions.ts`
- `src/server/email/templates/OrderPlacedEmail.tsx`, `src/server/email/templates/AdminOrderAlertEmail.tsx`
- `src/components/sections/order/OrderSuccess.tsx`, `src/components/sections/order/OrderTimeline.tsx`
Modify: `src/server/ids.ts` (add `accessKeyFor`), `src/server/cart/actions.ts` (add `quoteAction`, `saveDraftAction`), `src/app/[locale]/order/success/page.tsx`, `messages/en.json`, `messages/hi.json` (namespace `order`)

## Tasks
- [ ] T0. `src/server/ids.ts`: add `accessKeyFor(scope: "order" | "booking" | "kundali", ref: string): string` = first 32 chars of base64url `HMAC-SHA256(AUTH_SECRET, scope + ":" + ref)`. Access keys are derived, never stored; rows keep `access_hash = sha256Hex(accessKey)`. (Lets webhooks and cron rebuild customer links.)
- [ ] T1. `src/lib/domain/india.ts`: `INDIAN_STATES` (the 28 states + 8 UTs, official English names: Andhra Pradesh … West Bengal; Andaman and Nicobar Islands, Chandigarh, Dadra and Nagar Haveli and Daman and Diu, Delhi, Jammu and Kashmir, Ladakh, Lakshadweep, Puducherry) and `type IndianState`.
- [ ] T2. `src/lib/validation/checkout.ts`: `contactSchema` (name 2–80, phone `^[6-9]\d{9}$`, email ≤ 120), `addressSchema` (line1 3–120, line2 ≤ 120, landmark ≤ 80, city 2–60, state ∈ `INDIAN_STATES`, pincode `^[1-9]\d{5}$`), `checkoutSchema` (`locale`, `lines` 1–30 × `cartLineSchema`, `contact`, `address`, `delivery`, `method`, `payPref` nullable, `gift`, `giftMessage` ≤ 200, `note` ≤ 300, `couponCode` ≤ 30 nullable, `draftToken` ≤ 64 nullable, `turnstileToken` optional), `quoteSchema` (lines, delivery, method, gift, couponCode, email nullable), `draftSchema` (token nullable, email, phone optional, name optional, locale, lines, totalInr ≥ 0).
- [ ] T3. `src/server/cart/quote.ts`: `quoteCheckout(input): Promise<Quote>` — fresh DB read of the line products (`inArray`, `status = "active"`), images/names from the cached catalog. Per line: missing/inactive → issue `UNAVAILABLE` (line dropped); invalid size → `UNAVAILABLE`; energization on a non-energizable product → energization removed (issue `UNAVAILABLE`); qty > `maxLineQty` → clamped (issue `QTY_REDUCED`); stock < qty → issue `OUT_OF_STOCK` (line kept). Coupon via `evaluateCoupon(code, { subtotalInr, email })`. `codAllowed = codEnabled && total ≤ codMaxInr` (`codReason: "disabled" | "limit" | null`). Totals via `computeTotals(lines, fees, { coupon, gift, express, cod })`. Export the `Quote` type (lines with `name: Loc`, image URL, prices, energ, lineTotal; totals; coupon result; issues; codAllowed; codReason).
- [ ] T4. `cart/actions.ts`: `quoteAction(input)` (`rateLimit("quote:ip", ip, 60, 600)`) and `saveDraftAction(input)` (`rateLimit("draft:ip", ip, 20, 3600)`; upsert `checkout_drafts` by token, new token = `randomToken(24)`; returns `{ token }`).
- [ ] T5. `src/server/orders/numbers.ts`: `fiscalYear(now): string` ("2025-26", April–March, IST); `nextInvoiceNo(tx, prefix, now): Promise<string>` → counter `invoice:<fy>` (ARCH §5 counter pattern) → `"<prefix>/<fy>/<5-digit n>"`.
- [ ] T6. `src/server/orders/service.ts`:
  - `placeOrder(input: CheckoutInput, ctx: { userId: number | null; ip: string }): Promise<{ orderId: number; number: string; accessKey: string; totalInr: number }>` — quote first; any `OUT_OF_STOCK`/`UNAVAILABLE` issue → `AppError("OUT_OF_STOCK")`; coupon given but not ok → `COUPON_INVALID` / `COUPON_MIN_CART` / `COUPON_EXPIRED` / `COUPON_USED`; COD not allowed → `AppError("VALIDATION", …, { method: "cod" })`. `number = orderNumber()` (retry ≤ 3 on a unique-number clash), `accessKey = accessKeyFor("order", number)`. One `db.transaction`: insert order (COD: `status "placed"`, `payment_status "cod_pending"`, `placed_at`; online: `"pending_payment"`, `"unpaid"`), insert items (snapshot names/slug/image/prices/energization/GST), insert event `created` (public), and for COD call `finalizePlacement(tx, orderId, "strict")`. `energization_on` = `store.nextMahapuja ?? istDayKey(muhurat(now))`.
  - `finalizePlacement(tx, orderId, mode: "strict" | "paid"): Promise<void>` (B18 calls it with `"paid"` after an online payment): per item a conditional stock decrement (ARCH §5) — `strict`: a miss throws `OUT_OF_STOCK` (transaction rolls back); `paid`: a miss sets that product's stock to 0 and the order gets `needs_attention = true`, `attention_reason = "Oversold: <ids>"` + an `attention` event (the money is already taken, never roll back). Coupon: `used_count + 1` (`strict` guarded by `usage_limit` → `COUPON_USED`) + `coupon_redemptions` row. `invoice_no` via `nextInvoiceNo`. Link the checkout draft (`order_id`).
  - After commit (in the action): `after()` → `sendOrderPlacedEmails(orderId)` and `invalidateLater(TAG.catalog, …TAG.product(id) for each item)`.
- [ ] T7. `src/server/orders/queries.ts`: `getOrderView(number: string, accessKey: string): Promise<OrderView | null>` — by `number`, then `safeEqualHex(sha256Hex(accessKey), access_hash)`; returns a JSON-safe DTO (number, status, paymentStatus, method, times as ms, energizationOn, items, totals, address, public events, courier/awb/trackingUrl, locale).
- [ ] T8. `src/server/orders/emails.ts`: `sendOrderPlacedEmails(orderId: number): Promise<void>` — customer `OrderPlacedEmail` (order locale; link = `absoluteUrl` of `/order/success?no=…&k=<accessKeyFor("order", number)>`, `/hi/…` for Hindi) and, when `notify.orderAlerts`, `AdminOrderAlertEmail` to `notify.adminEmails` (link `/admin/orders/<id>`). Errors are caught and logged.
- [ ] T9. Templates: `OrderPlacedEmail` (EN/HI: thanks, number, items with qty and price, totals, payment method, address, energization date line, button to the order page) and `AdminOrderAlertEmail` (EN: number, total, method, item count, customer name/phone, admin link).
- [ ] T10. `src/server/orders/actions.ts` (`"use server"`): `placeOrderAction(input)` → parse `checkoutSchema` → `method === "online"` → `AppError("NOT_CONFIGURED")` (B18 replaces this branch) → COD: `verifyTurnstile`, `rateLimit("order:ip", ip, 10, 600)`, `rateLimit("cod:phone", phone, 3, 86400)` → `getCustomer()` → `placeOrder` → `after()` follow-ups → `{ number, accessKey }`.
- [ ] T11. `order/success/page.tsx` (dynamic; reads `searchParams` `no`, `k`): `getOrderView` → `notFound()` when invalid; metadata `robots: noindex`; renders `OrderSuccess`.
- [ ] T12. `OrderSuccess.tsx`: gold circle + check that draw in (stroke-dashoffset; reduced motion → drawn), "Order confirmed" (or "Payment pending" for `pending_payment`), number, energization line with the date, `OrderTimeline`, items with thumbnails, price breakdown, address, payment method, WhatsApp updates button (`waLink` with the order number), "While you wait" → consultations. `OrderTimeline.tsx`: steps placed → energizing → packed → shipped → delivered with the current one highlighted; cancelled/returned shows a clear end state.
- [ ] T13. `messages` namespace `order` (EN + HI).
- [ ] T14. Finish per AGENTS.md §1 step 8. Done-notes must say that `placeOrderAction`, `quoteAction`, `saveDraftAction` are used by B17.

## Must not
- No checkout or cart page UI (B17). No Razorpay (B18). Never decrement stock outside `finalizePlacement`.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
Nothing to click yet — B17 tests the full flow. Check `pnpm dev` and `pnpm build`; `/order/success?no=X&k=Y` returns the 404 page.
