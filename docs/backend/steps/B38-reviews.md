# B38 — Product reviews (with photos) + moderation
**Risk:** M · **Needs:** B37 · **Agent:** any · **User setup before QA:** USER-SETUP §3 (R2), Turnstile test keys or none

## Goal
Customers write reviews with up to 4 photos (verified-buyer tick when the purchase matches); the team approves, rejects or features them on the home page; product pages show the rating summary, distribution and reviews; product ratings are recalculated from approved reviews.

## Read first (only these)
- `docs/backend/RULES.md` §2, §4–§6
- `docs/backend/DATA-MODEL.md` §D (`products.rating_*`), §F (`reviews`)
- `design-brief/DESIGN-BRIEF.md` lines 473–486 (reviews part of §7.3)
- `src/server/reviews/queries.ts`, `src/server/media/service.ts` (`claimMedia`), `src/components/media/useUpload.ts`, `src/components/auth/TurnstileWidget.tsx`
- `src/app/[locale]/product/[slug]/page.tsx`, `src/components/sections/pdp/ProductInfo.tsx`, `src/components/ui/Rating.tsx`, `src/components/admin/nav.ts`

## Install
None.

## Files
Create:
- `src/lib/validation/review.ts`, `src/server/reviews/service.ts`, `src/server/reviews/actions.ts`, `src/server/reviews/admin.ts`, `src/server/reviews/admin-actions.ts`
- `src/components/sections/pdp/ReviewsSection.tsx`, `ReviewSummary.tsx`, `ReviewList.tsx`, `ReviewForm.tsx`
- `src/app/admin/(panel)/reviews/page.tsx`, `src/components/admin/reviews/ReviewCard.tsx`
Modify: `src/server/reviews/queries.ts` (`getProductReviews`), `src/app/[locale]/product/[slug]/page.tsx` (add the section), `ProductInfo.tsx` (rating links to `#reviews`), `src/components/admin/nav.ts` (+ Reviews `star`, Content, `reviews.moderate`), `messages/en.json`, `messages/hi.json` (namespace `reviews`)

## Tasks
- [ ] T1. `review.ts`: `reviewSubmitSchema` (productId, name 2–60, city ≤ 60, rating 1–5, title ≤ 80, body 20–1500, `orderNumber` + `contact` optional, photos ≤ 4 × `{ mediaId, claimKey }`, locale, turnstileToken).
- [ ] T2. `reviews/service.ts`: `submitReview(input, ctx)` — verified when the signed-in customer, or `orderNumber` + matching phone/email, has a non-cancelled order containing the product; insert `pending`; `claimMedia(photos, { type: "review", id })`. `recomputeProductRating(productId)` — from **approved** reviews only: `rating_avg` (1 decimal), `rating_count`.
- [ ] T3. `reviews/actions.ts`: `submitReviewAction` (Turnstile, `rateLimit("review:ip", ip, 5, 3600)`, max 1 review per product per email/phone per day), `moreReviewsAction({ productId, offset })` (10 per page, approved only).
- [ ] T4. `getProductReviews(productId)` = `cached("product-reviews", …, (id) => [TAG.productReviews(id)])` → `{ avg, count, dist: [5★…1★ counts], items: first 10 (name, city, rating, title, body, verified, photos as MediaRef[], date ms) }`.
- [ ] T5. PDP: `ReviewsSection` (`id="reviews"`): `ReviewSummary` (average, stars, count, distribution bars, "Write a review"), `ReviewList` (photos open full-screen, verified tick, star filter on the client, "Load more" via `moreReviewsAction`), `ReviewForm` (sheet: stars, title, text, name, city, optional order number + phone/email for the verified tick, photo upload via `useUpload("review")`, Turnstile; success → "Thank you — your review will appear after a quick check"). Hidden summary when `count = 0` (form still available).
- [ ] T6. `reviews/admin.ts` (`reviews.moderate`; audit): `listReviews({ status, page })`, `approveReview(id)`, `rejectReview(id)`, `setShowOnHome(id, on)`, `deleteReview(id)` (deletes its media) — approve/reject/delete call `recomputeProductRating`. `admin-actions.ts` → `invalidate(TAG.catalog, TAG.product(pid), TAG.productReviews(pid), TAG.reviews)`.
- [ ] T7. `/admin/reviews`: tabs pending/approved/rejected, `ReviewCard` (product thumb + name, stars, text, photos, verified, actions).
- [ ] T8. Messages `reviews` (EN + HI); nav item.
- [ ] T9. Finish per AGENTS.md §1 step 8.

## Must not
- Never show pending/rejected reviews publicly. Never let the client set `verified`.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. On a product page write a review with 2 photos (with your order number + phone → "verified").
2. Admin → Reviews → approve → the product page shows it, the rating summary updates, the card rating updates.
3. "Show on home" → it appears in the home photo-reviews strip.
4. Reject/delete removes it everywhere.
5. `pnpm build` passes.
