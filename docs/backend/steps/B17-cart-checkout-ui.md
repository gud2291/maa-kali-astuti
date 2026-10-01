# B17 — Cart page + checkout UI (COD end-to-end)
**Risk:** M · **Needs:** B16 · **Agent:** any · **User setup before QA:** Turnstile test keys or none (dev)

## Goal
`/cart` and a distraction-free `/checkout` (Contact → Address → Delivery → Payment → Review) built from the theme and the Booking stepper patterns. Prices come from the server quote. A customer can place a **COD** order and lands on the success page.

## Read first (only these)
- `docs/backend/RULES.md` §5, §6, §8; `docs/frontend/CODING-RULES.md` (Forms section)
- `design-brief/DESIGN-BRIEF.md` lines 490–513 (§7.4 cart, §7.5 checkout)
- `src/components/layout/CartDrawer.tsx`, `src/components/layout/chrome-config.ts`
- `src/components/sections/booking/BookingFlow.tsx`, `ui.tsx`, `BookingSummary.tsx`, `StepPay.tsx` (stepper, progress line, summary, pay-choice patterns)
- `src/stores/cart.ts`, `src/stores/catalog.ts`, `src/lib/validation/checkout.ts`, `src/lib/domain/india.ts`, `src/lib/hooks/usePincode.ts`
- `src/server/cart/actions.ts`, `src/server/orders/actions.ts` (exported names + input types only), `src/components/auth/TurnstileWidget.tsx`
- `messages/en.json` → `cart`, `drawer`, `booking` namespaces (reuse wording)

## Install
None.

## Files
Create:
- `src/components/commerce/CartLine.tsx`, `CouponField.tsx`, `CartEmpty.tsx` (extracted from `CartDrawer.tsx`)
- `src/components/sections/cart/CartPageView.tsx`, `src/components/sections/cart/RitualUpsell.tsx`
- `src/components/sections/checkout/CheckoutFlow.tsx`, `StepContact.tsx`, `StepAddress.tsx`, `StepDelivery.tsx`, `StepPayment.tsx`, `StepReview.tsx`, `CheckoutSummary.tsx`, `useCheckout.ts`, `useQuote.ts`
Modify: `src/components/layout/CartDrawer.tsx` (use the 3 extracted components; same look), `src/components/layout/chrome-config.ts` (minimal checkout header on `/checkout` if not already), `src/app/[locale]/cart/page.tsx`, `src/app/[locale]/checkout/page.tsx`, `messages/en.json`, `messages/hi.json` (namespaces `cartPage`, `checkout`)

## Tasks
- [x] T1. Extract `CartLine` (image, title, variant, energization line, qty stepper, remove + undo toast, price), `CouponField` (async apply, messages) and `CartEmpty` (kalash + diya empty state) from `CartDrawer` **without visual change**; the drawer uses them. — antigravity
- [x] T2. `/cart` page (static shell) → `CartPageView` (client): 8/4 grid ≥ 1024 px (stacked on mobile), `CartLine` list, `CouponField`, sticky summary (subtotal, savings, energization, discount, shipping/free-shipping bar, total — from `useCartTotals`), estimated delivery from the store days, "Checkout" + "Continue shopping", `RitualUpsell` (4 snapshot products not in the cart, Bitter Havan first), `CartEmpty` when empty. `metadata` noindex. — antigravity
- [x] T3. `useCheckout.ts` (zustand persisted in `sessionStorage`, key `mka.checkout`): step, contact, address, delivery, method, payPref, gift, giftMessage, note, draftToken. Cart lines stay in the cart store. — antigravity
- [x] T4. `useQuote.ts`: calls `quoteAction` on mount and (debounced 300 ms) whenever lines, coupon, delivery, method or gift change; exposes `{ quote, pending, error }`. — antigravity
- [x] T5. `/checkout` page → `CheckoutFlow` (client): minimal header (logo, "Secure checkout" lock, back to cart), progress line that fills per step (Booking pattern), right sticky `CheckoutSummary` ≥ 1024 px / collapsible summary at the top on mobile, sticky bottom button on mobile ("Continue" / "Place order · ₹X"). Empty cart → redirect to `/cart`. `metadata` noindex. — antigravity
- [x] T6. `StepContact` (name, mobile `inputMode="tel"`, email; validates with `contactSchema`; on Continue calls `saveDraftAction` without waiting and stores the token). — antigravity
- [x] T7. `StepAddress` (pincode first → `usePincode` fills city/state when found; line1, line2, landmark, city, state `<select>` of `INDIAN_STATES`; `addressSchema`). — antigravity
- [x] T8. `StepDelivery` (Standard / Express radio cards with fees and date ranges from the pincode result or store days). — antigravity
- [x] T9. `StepPayment`: COD card (fee, disabled with the reason from `quote.codReason`); only COD in this step — the Online card arrives in B18. — antigravity
- [x] T10. `StepReview`: items (read-only), address, delivery, payment, gift wrap toggle + message, order note, `TurnstileWidget` (action `order`), **Place order** → `placeOrderAction` → success: clear cart + checkout state, `router.replace("/order/success?no=…&k=…")`; errors: `OUT_OF_STOCK` refreshes the quote and shows per-line issues with "Update cart"; others show `t("errors.<CODE>")`. Button disabled while pending or while the quote has blocking issues. — antigravity
- [x] T11. `CheckoutSummary`: lines with thumbs, coupon field (re-quotes), breakdown (subtotal, energization, discount, gift wrap, shipping, express, COD fee, total), trust badges. — antigravity
- [x] T12. `messages` namespaces `cartPage`, `checkout` (EN + HI). — antigravity
- [x] T13. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No online payment UI (B18). No account/login prompts (B19). Never compute final totals on the client for placing — always the quote.

## Done-notes
- Extracted `CartLine.tsx`, `CouponField.tsx`, and `CartEmpty.tsx` to `src/components/commerce/`; `CartDrawer.tsx` updated without visual changes.
- Built `/cart` client view `CartPageView.tsx` with 8/4 grid, sticky totals, free-shipping bar, and `RitualUpsell.tsx`.
- Created checkout state in `useCheckout.ts` (`sessionStorage`, key `mka.checkout`) and debounced `useQuote.ts`.
- Built `/checkout` flow: `CheckoutFlow.tsx` stepper, `StepContact.tsx` (background draft saving), `StepAddress.tsx` (pincode lookup), `StepDelivery.tsx`, `StepPayment.tsx` (COD card), `StepReview.tsx` (Turnstile + place order), and `CheckoutSummary.tsx`.
- Updated `chrome-config.ts` for checkout minimal header; updated `/cart` and `/checkout` pages with noindex metadata.
- Added `cartPage` and `checkout` namespaces to `messages/en.json` and `messages/hi.json`.
- Migration added: no.
- Note for B18: Online payment options (Razorpay) will be added into `StepPayment.tsx`.

## Manual QA (user)
1. `/cart` at 390 / 1440 px: lines, qty, remove + undo, coupon, upsell, empty state.
2. `/checkout`: go through all steps; pincode `110001` fills Delhi; refresh the page mid-way → values remain.
3. Place a COD order → success page with number, energization date, timeline; email arrives (or is logged); `pnpm db:studio` shows the order, items, stock reduced, invoice number set.
4. Set a product's stock to 1, put 2 in the cart → checkout shows the stock issue and blocks placing.
5. Settings → Store: COD off → COD card disabled with the reason.
6. `pnpm build` passes.
