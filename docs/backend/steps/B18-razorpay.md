# B18 — Online payments (Razorpay) for orders
**Risk:** H · **Needs:** B17 · **Agent:** Claude recommended · **User setup before QA:** USER-SETUP §5 (test keys; webhook on a Vercel preview)

## Goal
Customers pay online (UPI first, cards, netbanking, wallets) through Razorpay Checkout. Payment is confirmed by signature from the browser **and** by an idempotent webhook, so an order is fulfilled exactly once even if the customer closes the tab.

## Read first (only these)
- `docs/backend/RULES.md` §2–§4
- `docs/backend/ARCHITECTURE.md` §5 (first-time-paid pattern), §7 (all)
- `docs/backend/DATA-MODEL.md` §C (`webhook_events`), §F (`orders`, `payments`)
- `src/server/orders/service.ts`, `src/server/orders/actions.ts`, `src/server/orders/emails.ts`, `src/server/orders/queries.ts`, `src/server/cart/quote.ts`, `src/server/ids.ts`, `src/server/env.ts`
- `src/components/sections/checkout/StepPayment.tsx`, `StepReview.tsx`, `useCheckout.ts`, `src/components/sections/order/OrderSuccess.tsx`
- `src/components/sections/booking/StepPay.tsx` (UPI-first choice styling to mirror)

## Install
None (plain `fetch`, no Razorpay SDK).

## Files
Create: `src/server/payments/razorpay.ts`, `src/server/payments/dispatch.ts`, `src/server/payments/actions.ts`, `src/app/api/webhooks/razorpay/route.ts`, `src/lib/payments/razorpay-client.ts`, `src/components/sections/order/PayNow.tsx`
Modify: `src/server/orders/service.ts` (add `markOrderPaid`, `recordPaymentFailure`), `src/server/orders/actions.ts` (online branch), `src/server/cart/quote.ts` (add `onlineAllowed`), `StepPayment.tsx`, `StepReview.tsx`, `useCheckout.ts`, `OrderSuccess.tsx`, `messages/en.json`, `messages/hi.json` (`checkout`, `order` additions)

## Tasks
- [ ] T1. `src/server/payments/razorpay.ts` exactly per ARCH §7: base `https://api.razorpay.com/v1`, Basic auth, 8 s timeout, typed responses (`RzpOrder`, `RzpPayment`, `RzpRefund`, `RzpPaymentLink`); amounts converted with `Math.round(inr * 100)`; non-2xx → `AppError("PAYMENT_FAILED")` + log (no secrets). Signatures: checkout = HMAC-SHA256(`orderId + "|" + paymentId`, key secret); webhook = HMAC-SHA256(raw body, webhook secret); compare with `safeEqualHex`. Not configured → `NOT_CONFIGURED`. (`refundPayment` and `createPaymentLink` are implemented now; B21 and B31 use them.)
- [ ] T2. `orders/service.ts` → `markOrderPaid({ orderId, rzpOrderId, rzpPaymentId, amountInr, method }): Promise<{ first: boolean }>`: transaction A = first-time-paid update (`payment_status "paid"`, `status` → `"placed"` when it was `pending_payment`, `paid_at`, `placed_at`) + `payments` row (`captured`, unique `rzp_payment_id`) + event `paid` (public); no row updated → `{ first: false }`. Amount ≠ `total_inr` → `needs_attention` + `attention` event, skip finalize. Otherwise transaction B = `finalizePlacement(tx, orderId, "paid")`. `recordPaymentFailure({ orderId, rzpOrderId, rzpPaymentId, error })` → `payments` row `failed` + private event.
- [ ] T3. `src/server/payments/dispatch.ts`: `dispatchPaid({ entity, entityId, rzpOrderId, rzpPaymentId, amountInr, method })` → `order` → `markOrderPaid`; when `first` → `after()` `sendOrderPlacedEmails(orderId)` + `invalidateLater(TAG.catalog, product tags)`; other entities → `log.warn("payment.unhandledEntity")` (B22, B30, B31 add theirs). `dispatchFailed(...)` likewise.
- [ ] T4. `src/server/payments/actions.ts` (`"use server"`): `confirmPaymentAction({ entity: "order", ref, razorpay_order_id, razorpay_payment_id, razorpay_signature })` → verify signature → load the order by number and require the same `razorpay_order_id` → `fetchPayment` for amount + method → `dispatchPaid` → `{ ok: true }`. `retryPaymentAction({ entity: "order", ref, accessKey })` → verify access key, order still `pending_payment` → returns the same checkout options with the **existing** Razorpay order id.
- [ ] T5. `orders/actions.ts` online branch (replaces the `NOT_CONFIGURED` throw): requires `isConfigured("razorpay")` and `store.onlinePayments`; `rateLimit("order:ip", …)`; `placeOrder` (pending) → `createRzpOrder({ amountInr: total, receipt: number, notes: { entity: "order", id: String(orderId) } })` → save `razorpay_order_id` + `payments` row `created` → return `{ number, accessKey, rzp: { key, orderId, amountPaise, name: "Maa Kali Astuti", description: "Order <number>", prefill: { name, email, contact, method: payPref } } }`.
- [ ] T6. `POST /api/webhooks/razorpay`: `await request.text()`; verify `x-razorpay-signature` (bad → 400); insert `webhook_events` (`x-razorpay-event-id`) with `onConflictDoNothing` — duplicate → 200; `payment.captured` / `order.paid` → `notes.entity` + `notes.id` → `dispatchPaid`; `payment.failed` → `dispatchFailed`; other events → 200 (B21 adds refunds, B31 payment links); set `processed_at`; always answer within a few seconds (side effects in `after()`).
- [ ] T7. `src/lib/payments/razorpay-client.ts`: `loadRazorpay()` (inject `https://checkout.razorpay.com/v1/checkout.js` once) and `openRazorpay(opts): Promise<{ status: "paid"; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string } | { status: "dismissed" } | { status: "failed"; reason: string }>` (theme colour `#164E3F`, `modal.ondismiss`, `payment.failed` event).
- [ ] T8. `quote.ts`: add `onlineAllowed = isConfigured("razorpay") && store.onlinePayments` to `Quote`.
- [ ] T9. `StepPayment.tsx`: **Online** card first when allowed ("UPI, cards, netbanking, wallets · Secured by Razorpay") with preference chips UPI / Card / Netbanking / Wallet (→ `payPref`), then COD. `useCheckout.ts`: add `pendingOrder: { number; accessKey } | null`.
- [ ] T10. `StepReview.tsx` online flow: first press → `placeOrderAction` → `openRazorpay` → `paid` → `confirmPaymentAction` → clear cart/checkout → success page; `dismissed` / `failed` → keep `pendingOrder`, show "Payment not completed — try again"; the next press uses `retryPaymentAction` (no second order).
- [ ] T11. `PayNow.tsx` (client) + `OrderSuccess.tsx`: for `pending_payment` show "Payment pending" with **Pay now** (`retryPaymentAction` → modal → confirm → `router.refresh()`).
- [ ] T12. Messages for all new strings (EN + HI).
- [ ] T13. Finish per AGENTS.md §1 step 8.

## Must not
- Never mark an order paid without a verified signature or a verified webhook. Never create a second order on retry. No refunds UI (B21).

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. Test keys in `.env.local` → checkout shows Online first.
2. Pay with Razorpay test UPI `success@razorpay` (or a test card) → success page "Order confirmed"; studio: order `paid`, payment row `captured`, stock reduced once, invoice number set; email sent.
3. Start a payment and close the modal → "try again" works without creating a second order; or leave → success page shows "Pay now".
4. On a Vercel preview with the webhook configured: pay, then in the Razorpay dashboard re-send the webhook → nothing doubles (stock, emails).
5. `pnpm build` passes.
