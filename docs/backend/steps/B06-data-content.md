# B06 — Data layer 2: content queries + content pages
**Risk:** H · **Needs:** B05 · **Agent:** Claude recommended · **User setup before QA:** DB seeded

## Goal
Services/tiers, courses, rituals, videos, testimonials, FAQs, journal articles and home photo reviews are read from the DB (cached + tagged). All pages except Home switch to these getters and pass `locale`, so Hindi content shows on `/hi` once the admin fills it. No visible change today.

## Read first (only these)
- `docs/backend/RULES.md` §2–§5
- `docs/backend/ARCHITECTURE.md` §3, §4, §11
- `docs/backend/DATA-MODEL.md` §B (`ServiceContent`, `CourseContent`), §E, §F (`reviews`), §I (`videos`, `social`)
- `src/server/cache.ts`, `src/server/settings/queries.ts`, `src/server/catalog/queries.ts` (follow its pattern), `src/lib/domain/loc.ts`
- `src/lib/api/consult.ts`, `src/lib/api/content.ts`, `src/lib/api/catalog.ts` (the `search` function)
- `src/lib/core/dates.ts` (the `MON` array only)
- Call sites: `grep -rn "getServices\|getService(\|getTestimonials\|getFaq(\|getCourses\|getCourse(\|getCourseOptions\|getRituals\|getVideos" src/app src/components` — read only those lines and their page's `params` handling.

## Install
None.

## Files
Create: `src/lib/domain/labels.ts`, `src/server/consult/queries.ts`, `src/server/consult/mappers.ts`, `src/server/courses/queries.ts`, `src/server/rituals/queries.ts`, `src/server/videos/queries.ts`, `src/server/testimonials/queries.ts`, `src/server/faqs/queries.ts`, `src/server/articles/queries.ts`, `src/server/reviews/queries.ts`
Modify: `src/lib/api/consult.ts`, `src/lib/api/content.ts`, `src/lib/api/catalog.ts`, every **page** file found by the grep (not `src/app/[locale]/page.tsx` and not `src/components/sections/home/*` — B07 does those), plus client files fixed in T1

## Tasks
- [ ] T1. `grep -rln '@/lib/api/consult\|@/lib/api/content' src`. Any `"use client"` file importing a **value** (not `import type`) from them must import it from its source (e.g. `isReport`, `recTier` → `@/lib/core/services`). List the changes in Done-notes.
- [ ] T2. `src/lib/domain/labels.ts`: `ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, Loc>` = rudraksha "Rudraksha guide" / "रुद्राक्ष गाइड", crystals "Crystals" / "क्रिस्टल", rashifal "Rashifal" / "राशिफल", sadhana "Sadhana" / "साधना", remedies "Remedies" / "उपाय", festivals "Festivals" / "त्योहार", astrology "Astrology" / "ज्योतिष".
- [ ] T3. Query files — each export is `cached(name, fn, () => [TAG.x])`, selects only the needed columns, returns JSON-safe rows (times as epoch ms), uses the listed index:
  - `consult/queries.ts`: `getConsultRows(): Promise<{ services: …[]; tiers: …[] }>` — visible services by `sort`, their tiers. Tag `consult`.
  - `courses/queries.ts`: `getCourseRows()` — visible, by `sort`. Tag `courses`.
  - `rituals/queries.ts`: `getRitualRows()` — visible, by `sort`. Tag `rituals`.
  - `videos/queries.ts`: `getVideoRows()` — visible, by `kind, sort` (`videos_list_idx`). Tag `videos`.
  - `testimonials/queries.ts`: `getTestimonialRows()` — visible, by `sort`. Tag `testimonials`.
  - `faqs/queries.ts`: `getFaqRows(set: FaqSet)` — visible, by `sort` (`faqs_set_idx`). Tag `faqs`.
  - `articles/queries.ts`: `getJournalRows(limit: number)` — `status = "published"`, newest `published_at` first (`articles_list_idx`). Tag `articles`.
  - `reviews/queries.ts`: `getHomeReviewRows()` — `status = "approved" AND show_on_home`, newest first, limit 6. Tag `reviews`.
- [ ] T4. `consult/mappers.ts`: `toService(row, tiers, locale): Service` (existing `Service` shape: `name = name_en`, `hi = name_hi`, text via `loc()`, `covered → [icon, t, d]`, `samples → [kind, cap]`, tiers ordered essential → detailed → premium as `Tier { k, t, price, mins, rec?: 1, inc }`); `toServiceCard(row, tiers, locale)` → `{ key, slug, name, hi, icon, line, price, dur, modesLine }` where `price` = essential tier price and `dur` = `"<essential mins> min"`.
- [ ] T5. Rewrite `src/lib/api/consult.ts` (`import "server-only"` first): same exports and types; `locale = "en"` added as the **last** parameter of `getServices`, `getService`, `getTestimonials`, `getFaq`; new `getServiceCards(locale = "en")`. `getModes`, `getConsultSteps` keep their JSON. Keep the `isReport`/`recTier` re-export.
- [ ] T6. Rewrite `src/lib/api/content.ts` (`import "server-only"` first): `getCourseOptions(locale)`, `getCourses(locale)`, `getCourse(slugOrKey, locale)`, `getRituals(locale)` (DB list + static process/receive), `getVideos(locale)` from the DB; `getCourseKit`, `getKundaliReviews`, `getAbout` unchanged.
  Video mapping: `id = legacy_key ?? youtube_id ?? String(id)`, new optional field `yt?: string` (= youtube_id) on `Video` and `Short`, `cat = category`, `en = title_en`, `hi = title_hi.split("\n")`, `dur = duration`, `date` = `published_on` as `"14 Sep 2026"` (day + `MON[month]` + year), `desc = loc(desc)`, `motif`. `cats` from `getSetting("videos").categories` → `[key, en, hi]`; `subs = loc(getSetting("social").youtubeSubs, locale)`.
- [ ] T7. `src/lib/api/catalog.ts` → `search()`: services from `getServiceCards("en")`, articles from `getJournalRows(50)` mapped to `{ t, c, m, pid }` (`c` = English label from `ARTICLE_CATEGORY_LABELS`). Remove the `services.json` / `articles.json` imports from this file.
- [ ] T8. Every page from the grep passes its `locale` to the changed getters. No other edits in those files.
- [ ] T9. Finish per AGENTS.md §1 step 8.

## Must not
- Must not edit the home page or any home section (B07). Must not change markup or styles.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `pnpm dev`: `/consultations`, each service page (tiers, prices, FAQ, testimonials), `/book/kundali-reading` (prices in step 1), `/sadhana-courses` + a course page, `/rituals`, `/videos` (filters, shorts), `/kundali-99` FAQ — identical to before, on EN and `/hi`.
2. Studio: change a tier `price_inr` → the service page and booking step 1 show it (dev). Change it back.
3. `pnpm build` passes.
