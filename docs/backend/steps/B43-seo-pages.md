# B43 — Per-page metadata & structured data
**Risk:** L · **Needs:** B42 · **Agent:** any · **User setup before QA:** none

## Goal
Every storefront page gets proper localised metadata (titles, descriptions, canonical, hreflang, OG) from its DB SEO fields or defaults, the right JSON-LD (Product, BreadcrumbList, FAQPage, Service, Course, Article, VideoObject, Person), and private pages are `noindex`.

## Read first (only these)
- `src/lib/seo/meta.ts`, `src/lib/seo/jsonld.ts`, `src/components/seo/JsonLd.tsx`
- The `generateMetadata` function (only) of every page under `src/app/[locale]/` (use `grep -rn "generateMetadata" src/app`)
- `messages/en.json` → `meta` keys of each namespace (grep)

## Install
None.

## Files
Modify: every page file under `src/app/[locale]/` that renders a route (metadata + JSON-LD placement only), `messages/en.json`, `messages/hi.json` (missing meta titles/descriptions)

## Tasks
- [ ] T1. Indexable pages use `pageMeta` with localised title/description: home (settings SEO), shop, categories (category SEO fields → name/desc), product (product SEO → name/description), consultations, service pages, kundali-99, love-calculator, rashifal, rashi pages, sadhana-courses, course pages, rituals, about, videos, blog, articles (article SEO), contact, faq, policies, track-order.
- [ ] T2. `noindex` via `pageMeta({ noindex: true })`: cart, checkout, order/success, account/**, invoice, booking/[ref], kundali/report, search, wishlist, newsletter/unsubscribe, book/[service] steps.
- [ ] T3. JSON-LD: product → `product` + `breadcrumbs`; category → `breadcrumbs`; service page → `service` + `faqPage`; consultations → `faqPage`; kundali-99 → `service` (₹ from settings) + `faqPage`; course page → `course` + `faqPage`; faq page → `faqPage`; article → `article` + `breadcrumbs` (+ `faqPage` when it has FAQs); videos → `video` for items with a real YouTube id; about → `person`.
- [ ] T4. Fill missing `meta` strings in messages (EN + HI), ≤ 60-char titles, ≤ 155-char descriptions, natural wording (no keyword stuffing).
- [ ] T5. Finish per AGENTS.md §1 step 8.

## Must not
- Must not change page content or layout. One `h1` rule untouched.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. View source on a product, an article, a service and `/hi/shop`: titles/descriptions in the right language, canonical + hreflang, JSON-LD present.
2. `/account`, `/checkout`, `/search` have `noindex`.
3. After deploy: Google Rich Results Test passes for a product, an article and the FAQ page.
4. `pnpm build` passes.
