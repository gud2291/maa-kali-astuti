# B19 — Customer account, invoices, checkout prefill
**Risk:** M · **Needs:** B18 · **Agent:** any · **User setup before QA:** Resend (or dev console codes)

## Goal
Customers sign in with an email code and see their orders (with timelines and invoices), manage addresses and profile (incl. saved birth details). Checkout pre-fills for signed-in customers and can save the address. Invoices are printable (Tax Invoice when a GSTIN is set, else Bill of Supply).

## Read first (only these)
- `docs/backend/RULES.md` §2, §5, §6, §8
- `docs/backend/ARCHITECTURE.md` §3 (rule 6), §4 (dynamic pages), §6
- `docs/backend/DATA-MODEL.md` §B (`BirthProfile`, `ShipAddress`), §C (`users`), §F (`addresses`, `orders`, `order_items`, `order_events`), §I (`invoice`, `contact`)
- `design-brief/DESIGN-BRIEF.md` lines 524–532 (§7.8 account)
- `src/server/auth/guards.ts`, `src/server/auth/actions.ts`, `src/components/auth/OtpForm.tsx`, `src/server/orders/queries.ts`, `src/server/orders/service.ts` (`placeOrder` signature), `src/lib/validation/checkout.ts`
- `src/components/sections/order/OrderTimeline.tsx`, `src/components/sections/checkout/CheckoutFlow.tsx`, `StepContact.tsx`, `StepAddress.tsx`
- `messages/en.json` → `auth`, `order` namespaces

## Install
None.

## Files
Create:
- `src/lib/validation/account.ts`, `src/server/account/queries.ts`, `src/server/account/actions.ts`, `src/server/orders/invoice.ts`
- `src/app/[locale]/account/layout.tsx`, `account/orders/page.tsx`, `account/orders/[number]/page.tsx`, `account/addresses/page.tsx`, `account/profile/page.tsx`
- `src/app/[locale]/invoice/[number]/page.tsx`
- `src/components/sections/account/AccountNav.tsx`, `AccountLogin.tsx`, `AccountOverview.tsx`, `OrderList.tsx`, `OrderDetail.tsx`, `AddressBook.tsx`, `AddressSheet.tsx`, `ProfileForm.tsx`, `ReorderButton.tsx`
- `src/components/sections/order/InvoiceDocument.tsx`, `src/components/sections/order/InvoiceDocument.module.css`, `src/components/sections/order/PrintButton.tsx`
Modify: `src/app/[locale]/account/page.tsx`, `src/app/[locale]/checkout/page.tsx` (dynamic prefill), `CheckoutFlow.tsx`, `StepContact.tsx`, `StepAddress.tsx` (saved addresses + "Save this address"), `src/lib/validation/checkout.ts` (`saveAddress: z.boolean()`), `src/server/orders/service.ts` (save address when asked and signed in), `src/server/orders/queries.ts` (owner queries), `OrderSuccess.tsx` (invoice link), `messages/en.json`, `messages/hi.json` (namespaces `account`, `invoice`)

## Tasks
- [x] T1. `account.ts` schemas: `profileSchema` (name 2–80, phone `^[6-9]\d{9}$` or empty, `birth` (`BirthProfile`: name, dob `yyyy-mm-dd` ≤ today, tob `HH:mm` or null, tobUnknown, place ≤ 120, lat/lon/tz nullable) or null, marketingOptIn) and `addressInputSchema` (`addressSchema` + name + phone + isDefault). — antigravity
- [x] T2. `account/queries.ts` (each takes the session user id, never a client id): `getAccountOverview(userId)` (counts + latest order), `listMyOrders(userId, page)` (`orders_user_idx`), `listMyAddresses(userId)`, `getMyProfile(userId)`. `orders/queries.ts`: `getOrderViewForUser(userId, number)`. — antigravity
- [x] T3. `account/actions.ts` (`"use server"`, `requireCustomer()` first): `saveAddressAction` (create/update own rows only; max 10; one default), `deleteAddressAction`, `setDefaultAddressAction`, `updateProfileAction`. — antigravity
- [x] T4. `orders/invoice.ts`: `buildInvoice(order, items, invoiceSettings, contact): InvoiceData` — `gstin` set → "Tax Invoice": per product line `taxable = total / (1 + rate/100)` (rate = item `gst_rate ?? 0`), tax split CGST+SGST when the ship-to state's code equals `invoice.stateCode` (state-code map in this file), else IGST; fee lines (energization, shipping, express, COD, gift wrap) at 18 %; amounts to 2 decimals. No GSTIN → "Bill of Supply", no tax columns. Invoice number = `orders.invoice_no` (null → "Not issued"). — antigravity
- [x] T5. `InvoiceDocument.tsx` (server-compatible) + CSS module (print: only the invoice is visible, A4 margins) + `PrintButton` (client, `window.print()`): seller block, buyer/ship-to, number + dates, lines, totals, tax summary, notes, "Computer-generated invoice". — antigravity
- [x] T6. `invoice/[number]/page.tsx` (dynamic): access with `?k=` (access key) **or** the owner's session; else `notFound()`; `robots` noindex. — antigravity
- [x] T7. `account/page.tsx`: no session → `AccountLogin` (OtpForm with `t("auth")` labels, purpose `login`, `next` from `?next=`), success → `router.replace(next)` + `router.refresh()`; session → `AccountOverview` ("Namaste, <name>", tiles Orders / Addresses / Profile / Wishlist, latest order with `OrderTimeline`). — antigravity
- [x] T8. `account/layout.tsx` + `AccountNav` (tabs: Overview, Orders, Addresses, Profile; horizontal scroll on mobile; later steps add Bookings and My Kundali). Sub-pages call `requireCustomerPage(locale, path)` first. — antigravity
- [x] T9. Orders list (cards: number, date, total, status badge, first item thumbs) + order detail (`OrderTimeline`, items, totals, address, payment, courier/AWB/tracking link, invoice link, `ReorderButton` adding the still-available items to the cart). — antigravity
- [x] T10. `AddressBook` + `AddressSheet` (add/edit with pincode autofill via `usePincode`, default star, delete with confirm). — antigravity
- [x] T11. `ProfileForm` (name, phone, birth details, marketing opt-in) + Sign out (`logoutAction("customer")`). — antigravity
- [x] T12. Checkout prefill: `/checkout` page reads `getCustomer()` → passes `prefill` (contact + addresses) to `CheckoutFlow`; `StepContact` uses it; `StepAddress` lists saved addresses as radio cards + "New address" + "Save this address" (signed in only); `placeOrder` saves it to `addresses` when `saveAddress` and a session exist. — antigravity
- [x] T13. `OrderSuccess`: "Download invoice" → `/invoice/<number>?k=…` when `invoice_no` exists. — antigravity
- [x] T14. Messages `account`, `invoice` (EN + HI). — antigravity
- [x] T15. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- Never read an order/address by an id without the session user check. No bookings/kundali tabs yet (B23, B30).

## Done-notes
- Created: `src/lib/validation/account.ts`, `src/server/account/{queries,actions}.ts`, `src/server/orders/invoice.ts`
- Created account pages: `layout.tsx`, `orders/page.tsx`, `orders/[number]/page.tsx`, `addresses/page.tsx`, `profile/page.tsx`, and `invoice/[number]/page.tsx`
- Created account & invoice components: `AccountNav`, `AccountLogin`, `AccountOverview`, `OrderList`, `OrderDetail`, `AddressBook`, `AddressSheet`, `ProfileForm`, `ReorderButton`, `InvoiceDocument` (+ CSS module), `PrintButton`
- Modified: `account/page.tsx`, `checkout/page.tsx`, `CheckoutFlow`, `StepContact`, `StepAddress`, `StepReview`, `checkout.ts`, `orders/service.ts`, `orders/queries.ts`, `OrderSuccess.tsx`, `messages/en.json`, `messages/hi.json`
- Decisions: Invoices calculate CGST+SGST vs IGST based on shipping state vs store stateCode, or Bill of Supply when GSTIN is empty; access is protected via HMAC key `?k=` or session ownership.
- Migration added: no. Next step: B20 (Track order, wishlist page, search page).

## Manual QA (user)
1. `/account` → sign in with your email → overview shows your earlier COD/online orders (guest orders with the same email are attached).
2. Orders → detail → timeline, invoice opens and prints one clean A4 page; with a GSTIN in Settings → Invoice the tax columns appear.
3. Addresses: add (pincode autofill), set default, delete.
4. Profile: save birth details; sign out.
5. Signed in → `/checkout` is pre-filled; "Save this address" adds it to the address book.
6. Another customer's order number at `/invoice/<number>` without the key → 404.
7. `pnpm build` passes.
