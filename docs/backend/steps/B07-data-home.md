# B07 — Data layer 3: home sections from the DB
**Risk:** M · **Needs:** B06 · **Agent:** any · **User setup before QA:** DB seeded

## Goal
The home page fetches its content once (in parallel) and passes it to its sections as props. No section imports admin-managed JSON any more. The page must look identical.

## Read first (only these)
- `docs/backend/RULES.md` §5, §6
- `docs/backend/ARCHITECTURE.md` §4
- `src/app/[locale]/page.tsx`
- `src/components/sections/home/ConsultBento.tsx`, `CourseTrack.tsx`, `FaqSection.tsx`, `Journal.tsx`, `RitualsTeaser.tsx`, `Testimonials.tsx`, `VideoSection.tsx`
- `src/lib/api/consult.ts`, `src/lib/api/content.ts`, `src/lib/api/catalog.ts` (exported names only), `src/lib/domain/labels.ts`
- `src/server/articles/queries.ts`, `src/server/reviews/queries.ts`

## Install
None.

## Files
Modify: `src/lib/api/content.ts` (add 2 getters), `src/app/[locale]/page.tsx`, the 7 section files above

## Tasks
- [x] T1. `src/lib/api/content.ts`: add `getJournal(locale = "en", limit = 6): Promise<{ slug: string; t: string; c: string; m: number; product: Product | null }[]>` (title via `loc`, `c` = label from `ARTICLE_CATEGORY_LABELS` via `loc`, product = `legacy_art` resolved with `getProduct`) and `getHomeReviews(locale = "en"): Promise<{ n: string; c: string; q: string; r: number; d: string; product: Product | null }[]>` (`d` = `legacy_date` ?? formatted `approved_at`). — antigravity
- [x] T2. `src/app/[locale]/page.tsx`: one `Promise.all` for service cards, courses, `getFaq("home", locale)`, journal, rituals, testimonials, home reviews, videos; pass each to its section. Keep the section order and the existing `nag12` / `BUILD_NOW` logic. — antigravity
- [x] T3. `ConsultBento.tsx`: prop `services` (service cards) replaces the `services.json` import (the static `consult.json` import for modes may stay). Same markup. — antigravity
- [x] T4. `CourseTrack.tsx`: prop `courses`. Same markup. — antigravity
- [x] T5. `FaqSection.tsx`: prop `items: [string, string][]`. Same markup. — antigravity
- [x] T6. `Journal.tsx`: prop `articles` (T1 shape); drop `articles.json` and `products-index`. Same markup; the card art uses `product`. — antigravity
- [x] T7. `RitualsTeaser.tsx`: prop `rituals`. Same markup. — antigravity
- [x] T8. `Testimonials.tsx`: props `testimonials` and `reviews` (T1 shape); drop both JSON imports and `products-index`. Same markup. — antigravity
- [x] T9. `VideoSection.tsx`: prop with the `getVideos()` result. Same markup. — antigravity
- [x] T10. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- Must not change class names, structure, motion or copy. Must not touch other home sections.

## Done-notes
- Added `getJournal` and `getHomeReviews` in `src/lib/api/content.ts` with product resolution via `getProduct`.
- Updated `src/app/[locale]/page.tsx` with a single parallel `Promise.all` to fetch and pass all home section data.
- Refactored `ConsultBento.tsx` to accept `services` prop (dropped `services.json` import).
- Refactored `CourseTrack.tsx` to accept `courses` prop (dropped `courses.json` import).
- Refactored `FaqSection.tsx` to accept `items` prop (dropped `faq.json` import).
- Refactored `Journal.tsx` to accept `articles` prop with resolved products (dropped `articles.json` & `products-index`).
- Refactored `RitualsTeaser.tsx` to accept `rituals` prop (dropped `rituals.json` import).
- Refactored `Testimonials.tsx` to accept `testimonials` and `reviews` props (dropped `testimonials.json`, `reviews.json` & `products-index`).
- Refactored `VideoSection.tsx` to accept `videos` prop (dropped `videos.json` import).
- Migration added: no. All section markups, motion, class names, and styling kept strictly intact.

## Manual QA (user)
1. `pnpm dev`: home page EN and `/hi` — every section identical to before (compare with the live demo or a screenshot taken before this step).
2. Studio: edit a testimonial `quote_en` → home shows it (dev). Change it back.
3. `pnpm build` passes.
