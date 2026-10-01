# B20 — Track order, wishlist page, search page
**Risk:** L · **Needs:** B19 · **Agent:** any · **User setup before QA:** none

## Goal
Three storefront pages that are still "coming soon": guest order tracking, the wishlist grid, and the full search results page. Built from the theme; mobile-first.

## Read first (only these)
- `docs/backend/RULES.md` §5, §6, §8
- `design-brief/DESIGN-BRIEF.md` lines 520–523 (§7.7)
- `src/app/[locale]/track-order/page.tsx`, `wishlist/page.tsx`, `search/page.tsx`
- `src/components/commerce/ProductCard.tsx` (props type), `src/stores/wishlist.ts`, `src/stores/catalog.ts`, `src/components/layout/SearchOverlay.tsx` (search + tabs behaviour to mirror), `src/lib/core/search.ts`
- `src/server/orders/queries.ts`, `src/server/orders/actions.ts`, `src/components/sections/order/OrderTimeline.tsx`, `src/components/auth/TurnstileWidget.tsx`

## Install
None.

## Files
Create: `src/components/sections/track/TrackOrderForm.tsx`, `src/components/sections/track/TrackResult.tsx`, `src/components/sections/wishlist/WishlistView.tsx`, `src/components/sections/search/SearchView.tsx`
Modify: `src/server/orders/queries.ts` (`lookupOrderForTracking`), `src/server/orders/actions.ts` (`trackOrderAction`), `src/components/commerce/ProductCard.tsx` (prop type only), the 3 page files, `messages/en.json`, `messages/hi.json` (namespaces `track`, `wishlistPage`, `searchPage`)

## Tasks
- [ ] T1. `lookupOrderForTracking({ number, contact })`: order by `number`; `contact` must equal its phone (10 digits) or email (case-insensitive); returns a reduced view (status, public events, items name + qty, courier/AWB/tracking URL, city + state only) or null.
- [ ] T2. `trackOrderAction({ number, contact, turnstileToken })` → `verifyTurnstile` → `rateLimit("track:ip", ip, 10, 600)` → lookup → `NOT_FOUND` when null (same message for wrong number or wrong contact).
- [ ] T3. `/track-order` page (static) → `TrackOrderForm` (order number + phone or email + Turnstile) → `TrackResult` (`OrderTimeline`, items, courier link, "Sign in to see full details" link).
- [ ] T4. `ProductCard.tsx`: change only the prop type to `ProductCardData` = the fields the card actually reads, exported from the same file, so both `Product` and `ProductLite` fit. No markup change.
- [ ] T5. `/wishlist` page (static) → `WishlistView` (client): grid of `ProductCard`s from the wishlist store + snapshot, "Move to cart" (bracelets open QuickAdd for the size), remove, skeleton while the snapshot loads, empty state with a link to bestsellers.
- [ ] T6. `/search` page (static) → `SearchView` (client): reads `?q` after mount, big search input (updates `?q` with `replaceState`), tabs Products · Consultations · Articles with counts, product grid, service cards, article list; empty state with trending chips. Same search core as the overlay.
- [ ] T7. Messages `track`, `wishlistPage`, `searchPage` (EN + HI); page metadata (search and wishlist `noindex`).
- [ ] T8. Finish per AGENTS.md §1 step 8.

## Must not
- No server search endpoint (the snapshot is enough). No changes to the overlay.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `/track-order` with a real order number + its phone → timeline; wrong phone → "not found".
2. `/wishlist` (heart a few products first) → grid, move to cart, remove, empty state.
3. `/search?q=mukhi` → results in tabs; typing updates the URL; `/hi/search` works.
4. `pnpm build` passes.
