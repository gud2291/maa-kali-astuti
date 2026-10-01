# B08 — Data layer 4: client catalog snapshot, server coupons, settings fees
**Risk:** H · **Needs:** B07 · **Agent:** Claude recommended · **User setup before QA:** DB seeded

## Goal
Client islands (cart, drawer, quick-add, mega menu, search) stop bundling `products.json`; they use a CDN-cached snapshot from `/api/catalog`. Coupons are checked on the server against the DB. Fees come from the `store` setting. Behaviour stays the same.

## Read first (only these)
- `docs/backend/RULES.md` §2, §5
- `docs/backend/ARCHITECTURE.md` §4 (client snapshot), §5 (rate-limit pattern), §7 (first paragraph: never trust the client)
- `docs/backend/DATA-MODEL.md` §B (`CatalogSnapshot`, `ProductLite`, `CartLineInput`), §F (`coupons`, `coupon_redemptions`), §I (`store`)
- `src/lib/api/products-index.ts`, `src/lib/core/cart.ts`, `src/lib/core/commerce.ts`, `src/types/cart.ts`
- `src/stores/cart.ts`, `src/components/commerce/StoreHydrator.tsx`, `QuickAdd.tsx`, `ProductCard.tsx`
- `src/components/layout/CartDrawer.tsx`, `MegaMenu.tsx`, `SearchOverlay.tsx`
- `src/server/catalog/queries.ts`, `src/server/consult/queries.ts`, `src/server/articles/queries.ts`, `src/server/settings/queries.ts`, `src/server/request.ts`
- `messages/en.json` + `messages/hi.json` → `cart` namespace only
- Constant users: `grep -rn "FREE_SHIPPING\|\bSHIPPING\b\|\bEXPRESS\b\|COD_FEE\|GIFT_WRAP\|ENERGIZATION\|MAX_LINE_QTY\|COUPONS\|checkCoupon\|products-index" src` — read those lines.

## Install
None.

## Files
Create: `src/server/rate-limit.ts`, `src/server/catalog/snapshot.ts`, `src/app/api/catalog/route.ts`, `src/stores/catalog.ts`, `src/server/coupons/service.ts`, `src/server/cart/actions.ts`, `src/lib/validation/cart.ts`
Modify: `src/lib/core/cart.ts`, `src/lib/core/commerce.ts`, `src/types/cart.ts`, `src/stores/cart.ts`, `src/components/commerce/StoreHydrator.tsx`, `QuickAdd.tsx`, `ProductCard.tsx`, `src/components/layout/CartDrawer.tsx`, `MegaMenu.tsx`, `SearchOverlay.tsx`, every other file the constant grep finds, `messages/en.json`, `messages/hi.json`
Delete: `src/lib/api/products-index.ts`

## Tasks
- [ ] T1. `src/server/rate-limit.ts`: `rateLimit(bucket: string, id: string, limit: number, windowSec: number): Promise<void>` exactly as ARCH §5.
- [ ] T2. `src/server/catalog/snapshot.ts`: `buildSnapshot(): Promise<CatalogSnapshot>` from `getCatalog()`, `getConsultRows()` (service cards with `Loc` name/line, essential price, `"<mins> min"`), `getJournalRows(50)`, `src/lib/data/trending.json`, `getSetting("store")` (the 8 fee fields). `v = Date.now()`.
- [ ] T3. `src/app/api/catalog/route.ts`: `GET` → `Response.json(await buildSnapshot(), { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } })`.
- [ ] T4. `src/stores/catalog.ts` (`"use client"`-safe zustand, not persisted): state `{ snap, byId: Map<string, ProductLite>, status: "idle" | "loading" | "ready" | "error", load() }`; `load()` runs once (ignores calls while loading/ready), fetches `/api/catalog`, retries once after 1500 ms, sets `error` on failure. Exports: `useCatalog`, `useProductLite(id)`, `getProductLite(id)`, `DEFAULT_FEES` (from `SETTINGS_DEFAULTS.store`), `useFees()`, `getFees()`.
- [ ] T5. `src/lib/core/commerce.ts`: remove the fee constants and `COUPONS`; add `export type Fees = CatalogSnapshot["fees"]`. Keep `STORE_KEY`, `DEMO_SEED`, WhatsApp helpers.
- [ ] T6. `src/lib/core/cart.ts`: `clampQty(q: number, max: number)`; `computeTotals(ls: readonly { qty: number; energ: Energization | null; p: { price: number; mrp: number } }[], fees: Fees, o: { coupon: AppliedCoupon | null; gift: boolean; express?: boolean; cod?: boolean; noCoupon?: boolean }): CartTotals` — same maths as today with `fees` instead of constants; discount = `min(percent-or-flat, coupon.max ?? ∞, items)`. Delete `checkCoupon`.
- [ ] T7. `src/types/cart.ts`: `AppliedCoupon` gets `max: number | null`; `CouponResult = { ok: boolean; msg: "empty" | "applied" | "minCart" | "invalid" | "expired" | "used"; code?: string; off?: string; min?: string }`; `ResolvedLine = CartLine & { p: ProductLite }`.
- [ ] T8. `src/server/coupons/service.ts`: `evaluateCoupon(code: string, ctx: { subtotalInr: number; email: string | null; now?: Date }): Promise<{ ok: true; coupon: AppliedCoupon } | { ok: false; reason: "invalid" | "minCart" | "expired" | "used"; min?: number }>` — normalise (trim, upper, `^[A-Z0-9_-]{1,30}$` else invalid); not found / inactive → invalid; outside `starts_at`/`ends_at` → expired; `usage_limit` reached → used; below `min_cart_inr` → minCart (with min); when `email` is given: `per_customer_limit` (count `coupon_redemptions` by `coupon_id, email`) and `first_order_only` (any order with that email and `payment_status` in paid / cod_pending / cod_collected) → used.
- [ ] T9. `src/lib/validation/cart.ts`: `cartLineSchema` (pid ≤ 40, variant WRIST_SIZES|null, qty int 1–50, energ { name 2–60, gotra 2–40 } | null), `checkCouponSchema` ({ code ≤ 30, lines 1–30 }).
- [ ] T10. `src/server/cart/actions.ts` (`"use server"`): `checkCouponAction(input: unknown): Promise<ActionResult<{ result: CouponResult; coupon: AppliedCoupon | null }>>` → parse → `rateLimit("coupon:ip", ip, 20, 600)` → subtotal (items + energization) from DB prices (`getCatalog`) and `getSetting("store")` → `evaluateCoupon(code, { subtotalInr, email: null })` → `off` formatted with `fmt()` (`"10%"` or `"₹100"`), `min` formatted.
- [ ] T11. `src/stores/cart.ts`: persisted `version: 2` with `migrate` that keeps lines and drops `coupon`; `add`/`setQty` use `clampQty(q, getFees().maxLineQty)`; `applyCoupon(code): Promise<CouponResult>` calls `checkCouponAction` with the current lines; `useCartLines()` resolves through `useCatalog` (`byId`); `useCartTotals(o)` uses `useFees()`. Remove the `products-index` import.
- [ ] T12. `StoreHydrator.tsx`: after rehydration call `useCatalog.getState().load()`.
- [ ] T13. `CartDrawer.tsx`: lines/totals from the store hooks; free-shipping bar and energization fee from `useFees()`; coupon apply is async (button disabled + existing loading style while pending; result messages from T14 keys); no `products-index`.
- [ ] T14. `messages/en.json` + `hi.json` → `cart.coupon`: `applied` ("{off} off applied"), `minCart` ("{code} needs a cart of {min} or more"), `expired`, `used`; keep `empty`, `invalid`; remove `applied10`, `applied100` (Hindi written by us).
- [ ] T15. `QuickAdd.tsx`: product from `useProductLite(pid)`; while the catalog is loading show the sheet's existing skeleton/pending state; on `error` close the sheet and show the existing error toast style. Fees from `useFees()`.
- [ ] T16. `MegaMenu.tsx`, `SearchOverlay.tsx`: products, services, articles, trending from the snapshot (`loc()` for `Loc` fields with the current locale). Static `intents.json` may stay. Same markup.
- [ ] T17. `ProductCard.tsx`: eyebrow uses `p.catShort ?? ""` (no `categoryShort`). Every other constant hit from the grep switches to `useFees()` (client) or `getSetting("store")` (server).
- [ ] T18. Delete `src/lib/api/products-index.ts`; `grep -rn "products-index" src` must return nothing.
- [ ] T19. Finish per AGENTS.md §1 step 8.

## Must not
- Must not change visible layout or copy except the coupon messages. Must not add client-side fetching other than `/api/catalog`.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `pnpm dev`: add items from cards, quick-add sheet (size + energization), drawer qty/remove/undo, mega menu, search overlay — all as before. DevTools → Network: `/api/catalog` loads once per page load.
2. Coupons in the drawer: `SADHANA10` → 10% off; `FIRST100` below ₹999 → min-cart message, above → ₹100 off; `XYZ` → invalid.
3. Studio → `settings` row `store` → change `freeShippingInr` to 1500 → reload → drawer bar uses ₹1,500. Change it back.
4. `pnpm build` passes.
