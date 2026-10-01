# B15 — Product page (PDP)
**Risk:** M · **Needs:** B14 · **Agent:** any · **User setup before QA:** none

## Goal
`/product/[slug]` becomes a real, premium product page built from the existing theme and components (design-brief §7.3 + §12), with a live pincode delivery check. Mobile-first.

## Read first (only these)
- `docs/backend/RULES.md` §5, §6, §8; `docs/frontend/CODING-RULES.md`
- `design-brief/DESIGN-BRIEF.md` lines 458–489 (§7.3) and 780–797 (§12)
- `src/app/[locale]/product/[slug]/page.tsx`, `src/components/layout/chrome-config.ts`
- `src/components/commerce/ProductCard.tsx`, `ProductImage.tsx`, `QuickAdd.tsx` (energization + size UI to mirror), `useProductActions.ts`
- `src/components/ui/Badge.tsx`, `Price.tsx`, `Rating.tsx`, `Chip.tsx`, `QtyStepper.tsx`, `FaqList.tsx`, `Button.tsx`, `SectionHeader.tsx`
- `src/components/sections/home/RitualSteps.tsx`, `src/components/sections/home/VideoPlayer.tsx` (props only)
- `src/stores/history.ts`, `src/stores/catalog.ts`, `src/lib/core/stock.ts`, `src/lib/core/pin.ts`
- `src/server/catalog/queries.ts`, `src/server/settings/queries.ts`
- `messages/en.json` → `product`, `quick` namespaces
- `grep -rn "core/pin" src` (current demo pincode users)

## Install
None.

## Files
Create:
- `src/server/catalog/pincode.ts`, `src/app/api/pincode/[pin]/route.ts`, `src/lib/hooks/usePincode.ts`
- `src/components/sections/pdp/ProductGallery.tsx`, `ProductInfo.tsx`, `EnergizationFields.tsx`, `PincodeCheck.tsx`, `SizeGuide.tsx`, `ProductAccordions.tsx`, `PlacementGuide.tsx`, `RelatedRail.tsx`, `RecentlyViewed.tsx`, `StickyBuyBar.tsx`, `TrackView.tsx`
Modify: `src/server/catalog/queries.ts` (add `getProductDetail`), `src/app/[locale]/product/[slug]/page.tsx`, `src/components/layout/chrome-config.ts` (hide the bottom tab bar on product pages), every file from the `core/pin` grep, `messages/en.json`, `messages/hi.json` (new namespace `pdp`)

## Tasks
- [ ] T1. `getProductDetail(slug): Promise<{ product: Product; content: ProductContent; related: Product[]; certificate: MediaRef | null } | null>` — `cached("product-detail", …, () => [TAG.catalog])`; related = `related_ids` (active only) else 8 products of the same category by popularity (excluding itself).
- [ ] T2. `src/server/catalog/pincode.ts`: `lookupPincode(pin): Promise<{ city: string; state: string }>` — India Post `https://api.postalpincode.in/pincode/<pin>` (5 s timeout), first PostOffice's `District` + `State`; failures **throw** (so they are never cached); wrapped in `cached("pincode", fn, () => [])`. `deliveryEstimate(store, now): { standard: [string, string]; express: [string, string] | null }` (IST day keys from `standardDays` / `expressDays`).
- [ ] T3. `GET /api/pincode/[pin]`: `^[1-9]\d{5}$` else 400 `VALIDATION`; city/state from `lookupPincode` (on failure `null`s); response `{ pin, city, state, cod: store.codEnabled, standard, express }`; `Cache-Control: public, s-maxage=3600`.
- [ ] T4. `usePincode()` hook (client): `{ check(pin), state: { status, data, error } }`, remembers the last pin in `localStorage` (`mka.pin`, read after mount). Switch every `core/pin` user from the grep to this hook with the same markup; delete `src/lib/core/pin.ts` only if no user is left (list it in Done-notes).
- [ ] T5. `page.tsx`: `generateStaticParams` (all active slugs), `dynamicParams = true`, `generateMetadata` (title = SEO title or name per locale; description = SEO description or the first 160 chars of the description; `openGraph.images` = first image; indexable). Layout: breadcrumb → 7/5 grid (gallery | info) on ≥ 1024 px, stacked on mobile → accordions → placement guide (when present) → "How we energize" band (`RitualSteps` if its props allow, else omit) → related rail → recently viewed. `notFound()` for unknown slugs.
- [ ] T6. `ProductGallery` (client): uploaded images via `MediaImg`, else legacy slots via `ProductImage` (`main`, `alt`, `detail`); desktop vertical thumbs + main 4:5; mobile scroll-snap swipe + dots; tap opens a full-screen radix Dialog (native pinch-zoom); extra thumbs for the certificate image and the YouTube video (`VideoPlayer` facade or a simple youtube-nocookie facade).
- [ ] T7. `ProductInfo` (client): badges, title (`font-title`) + Hindi line (`font-deva`), rating, price block (MRP, % off, "incl. all taxes"), stock note, size chips + "Size guide" (`SizeGuide` sheet, bracelets), `EnergizationFields` when `energizable` (checkbox + name + gotra, same look as QuickAdd, fee from `useFees()`), `QtyStepper`, **Add to cart** (`useProductActions`, existing morph/fly) and **Buy now** (add, then go to `/checkout`), `PincodeCheck`, trust row (Secure payment · 7-day return · COD · Pan-India shipping, existing icons), Share (`navigator.share`, fallback copy link + toast).
- [ ] T8. `ProductAccordions` (server): Description, Benefits, How to wear, Specifications, Shipping & returns (i18n text with the store day ranges), Authenticity (i18n) — styled like `FaqList`; empty sections are omitted.
- [ ] T9. `PlacementGuide` (3 cards with `temple`, `locker`, `office` icons + the placement lines), `RelatedRail` (ProductCards in a snap rail), `RecentlyViewed` (client: history store + catalog snapshot, excludes the current product, hidden when empty), `TrackView` (adds the product to history on mount).
- [ ] T10. `StickyBuyBar` (client): appears when the main Add-to-cart button leaves the viewport (IntersectionObserver) — bottom on mobile (safe-area aware; the tab bar is hidden on product pages via `chrome-config.ts`), top on desktop; shows thumb, name, price and Add to cart; respects reduced motion.
- [ ] T11. `messages` namespace `pdp` (EN + HI) for every new string.
- [ ] T12. Finish per AGENTS.md §1 step 8.

## Must not
- No reviews list (B38). No JSON-LD (B43). No new colours/fonts.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `/product/copper-12-nag`, `/product/5-mukhi-rudraksha`, a bracelet, an amulet — at 390 px and 1440 px, EN and `/hi`.
2. Gallery swipe/thumbs/full-screen; bracelet size chips + size guide; energization add-on adds name/gotra and fee to the cart line.
3. Pincode `110001` → Delhi + dates; `000000` → error message. COD line follows the store setting.
4. Buy now → `/checkout` (still the old page until B17) with the item in the cart.
5. Scroll past the button → sticky bar appears; product shows in "Recently viewed" on another product.
6. A product created in admin (B13) has a working page.
7. `pnpm build` passes.
