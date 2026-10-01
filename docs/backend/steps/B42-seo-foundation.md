# B42 — SEO / GEO / AEO foundation
**Risk:** M · **Needs:** B41 · **Agent:** any · **User setup before QA:** none

## Goal
Shared SEO building blocks plus the site-wide files: a metadata helper (canonical + hreflang EN/HI + Open Graph), JSON-LD builders and a safe `<JsonLd>` component, Organization + WebSite data in the layout, a dynamic sitemap, robots rules, `llms.txt`, and Open Graph images (site default + products).

## Read first (only these)
- `docs/backend/RULES.md` §2, §9 (the JSON-LD exception)
- `docs/backend/NEXT16.md` → "Metadata & SEO files"
- `src/app/[locale]/layout.tsx` (`generateMetadata`), `src/lib/site.ts` (`SITE_URL`), `src/lib/routes.ts`, `src/i18n/routing.ts`
- `src/server/catalog/queries.ts`, `src/server/consult/queries.ts`, `src/server/courses/queries.ts`, `src/server/articles/queries.ts`, `src/server/pages/queries.ts`, `src/server/settings/queries.ts`, `src/lib/data/rashi.json` (keys)

## Install
None.

## Files
Create:
- `src/lib/seo/meta.ts`, `src/lib/seo/jsonld.ts`, `src/components/seo/JsonLd.tsx`
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts`
- `src/app/[locale]/opengraph-image.tsx`, `src/app/[locale]/product/[slug]/opengraph-image.tsx`
Modify: `src/app/[locale]/layout.tsx` (metadata via `pageMeta` defaults from `settings.seo`; `<JsonLd>` Organization + WebSite)

## Tasks
- [ ] T1. `meta.ts`: `pageMeta({ locale, path, title, description, image?, noindex?, type? }): Metadata` → `alternates.canonical` (`SITE_URL + path` for EN, `SITE_URL + "/hi" + path` for HI), `alternates.languages` (`en`, `hi`, `x-default` → EN), `openGraph` (url, title, description, locale `en_IN`/`hi_IN`, images 1200×630), `twitter: { card: "summary_large_image" }`, `robots` noindex/nofollow when asked. Descriptions trimmed to 160 chars.
- [ ] T2. `jsonld.ts` (pure builders returning plain objects): `organization(settings)` (name, url, logo, sameAs from social, contactPoint), `website()` (with `SearchAction` → `/search?q={query}`), `person()` (Sadhak Pawan Pandey, jobTitle, url `/about`), `breadcrumbs(items)`, `product(p, { url, images, reviews })` (Offer: price, INR, availability by stock, seller; AggregateRating only when `reviews > 0`), `faqPage(items)`, `article(a, url)`, `video(v)`, `service(s, url)` (offers per tier), `course(c, url, feeInr)`.
- [ ] T3. `JsonLd.tsx`: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />` — the only allowed non-SVG use (RULES §9); data always comes from our server.
- [ ] T4. Layout: default metadata from `getSetting("seo")` (localised) through `pageMeta`; `<JsonLd>` with `organization` + `website` once per page.
- [ ] T5. `sitemap.ts`: every indexable URL in both locales with `alternates.languages`: home, shop, categories, active products, consultations + services, kundali-99, love-calculator, rashifal + 12 rashis, sadhana-courses + 6 courses, rituals, about, videos, blog + published articles, contact, faq, 5 policies; `lastModified` from `updated_at` where available.
- [ ] T6. `robots.ts`: allow `/`; disallow `/admin`, `/api`, `/account`, `/checkout`, `/cart`, `/order`, `/invoice`, `/booking`, `/kundali/report`, `/newsletter`, and the same under `/hi`; `sitemap: SITE_URL + "/sitemap.xml"`.
- [ ] T7. `llms.txt/route.ts` (`text/plain`, `s-maxage=86400`): who Sadhak Pawan Pandey / Maa Kali Astuti are, offerings (products by category, consultations with from-prices, Kundali ₹99, courses, rituals), key URLs, contact, a note on honesty (no guaranteed outcomes) — built from the DB/settings.
- [ ] T8. OG images with `ImageResponse` (`next/og`, 1200×630, async `params`): site default (emerald band, wordmark, tagline) and product (photo or art via absolute URL, name, price, MRP strike, small brand line). English text only (default font has no Devanagari).
- [ ] T9. Finish per AGENTS.md §1 step 8.

## Must not
- No per-page changes yet (B43). No keyword stuffing; no fake reviews/ratings in structured data.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `/sitemap.xml`, `/robots.txt`, `/llms.txt` open and look right.
2. View source of home: canonical, hreflang (en/hi/x-default), Open Graph tags, Organization + WebSite JSON-LD.
3. `/opengraph-image` and `/product/copper-12-nag/opengraph-image` render images.
4. Test home in Google's Rich Results Test (after deploy). `pnpm build` passes.
