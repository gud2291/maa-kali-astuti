# B05 — Data layer 1: catalog from the DB
**Risk:** H · **Needs:** B04 · **Agent:** Claude recommended · **User setup before QA:** DB migrated + seeded (USER-SETUP §2)

## Goal
Every server-side catalog read (shop, categories, product pages, home, rashifal pages) comes from Turso through cached, tagged queries. The site must look exactly the same.

## Read first (only these)
- `docs/backend/RULES.md` §2–§5
- `docs/backend/ARCHITECTURE.md` §3, §4, §5
- `docs/backend/NEXT16.md` → "Static pages", "Data cache"
- `docs/backend/DATA-MODEL.md` §D, §I
- `src/server/cache.ts`, `src/server/db/client.ts`, `src/lib/domain/media.ts`, `src/lib/domain/types.ts`, `src/lib/validation/settings.ts`
- `src/lib/api/catalog.ts`, `src/lib/api/products-index.ts`, `src/types/product.ts`, `src/types/catalog.ts`
- `src/lib/core/query.ts`, `src/lib/core/search.ts` (exported signatures only)
- `src/app/[locale]/product/[slug]/page.tsx`, `src/app/[locale]/rashifal/page.tsx`, `src/app/[locale]/rashifal/[rashi]/page.tsx`, `src/components/sections/home/RashifalSection.tsx`

## Install
None.

## Files
Create: `src/server/settings/queries.ts`, `src/server/media/refs.ts`, `src/server/catalog/mappers.ts`, `src/server/catalog/queries.ts`
Modify: `src/types/product.ts`, `src/lib/api/catalog.ts`, `src/app/[locale]/product/[slug]/page.tsx`, `src/app/[locale]/rashifal/page.tsx`, `src/app/[locale]/rashifal/[rashi]/page.tsx`, `src/components/sections/home/RashifalSection.tsx`, plus any client file found in T1

## Tasks
- [x] T1. `grep -rln '@/lib/api/catalog' src` and check each hit: a file with `"use client"` that imports a **value** from it must import that value from its source instead (`queryProducts` → `@/lib/core/query`). Type-only imports may stay. List what you changed in Done-notes. — antigravity
- [x] T2. `src/server/settings/queries.ts`: `getSetting<K extends SettingsKey>(key: K): Promise<SettingsMap[K]>` = `cached("setting", fn, () => [TAG.settings])`; reads the row, `SETTINGS_SCHEMAS[key].safeParse(value)`; invalid/missing → `log.warn` once and the default; object values are shallow-merged over `SETTINGS_DEFAULTS[key]`; nullable keys (`announcement`, `home.hero`) keep `null`. — antigravity
- [x] T3. `src/server/media/refs.ts`: `toMediaRef(row: { id: number; variants: MediaVariant[]; width: number | null; height: number | null; blur: string | null; altEn: string | null; altHi: string | null }): MediaRef` — base = `env.NEXT_PUBLIC_MEDIA_URL ?? ""`; variants sorted by `w`; `src` = the 960 variant, else the largest ≤ 960, else the largest; `srcSet` = `"<base>/<key> <w>w"` joined by `", "`; `w`/`h` = the largest variant's; `alt` = `{ en: altEn, hi: altHi ?? "" }` or null. — antigravity
- [x] T4. `src/types/product.ts`: add optional `images?: MediaRef[]` and `catShort?: string` to `Product` (with one-line comments). Nothing else changes. — antigravity
- [x] T5. `src/server/catalog/mappers.ts`: `toCategory(row): Category` (`name = name_en, hi = name_hi, short = short_en, desc = desc_en, deshi = desc_hi`) and `toProduct(row, cat, images): Product` — exact inverse of the B04 mapping: `cat = category_key, catName = cat.name_en, catShort = cat.short_en, name = name_en, hi = name_hi, long = long_en ?? undefined, intent = intent_en, ik = intent_key, price = price_inr, mrp = mrp_inr, rating = rating_avg, reviews = rating_count, pop = popularity, stoneName = stone_name ?? undefined, photo = legacy_photo ?? undefined, photo2 = legacy_photo2 ?? undefined, sizes = sizes ?? undefined, art = art ?? undefined, date = days since published_at (9999 when null), images`. Optional fields that are null become `undefined` (omit them). — antigravity
- [x] T6. `src/server/catalog/queries.ts`: `getCatalog(): Promise<{ products: Product[]; categories: Category[] }>` = `cached("catalog", fn, () => [TAG.catalog])`. Two queries + one media query run with `Promise.all`: visible categories by `sort`; products with `status = "active"` by `sort` (index `products_sort_idx`); product images: `product_media` ⋈ `media` (`status = "ready"`) ordered by `product_id, sort`, grouped in JS and mapped with `toMediaRef`. Products whose category is hidden are left out. Result is JSON-safe. — antigravity
- [x] T7. Rewrite `src/lib/api/catalog.ts`: first line `import "server-only";`; keep every exported name and signature; products/categories come from `getCatalog()` and are filtered/sorted in memory (`queryProducts`, existing search core). `getCategoryByKey` throws `AppError("NOT_FOUND")` instead of using `!`. `getIntents`, `getStones`, `getBadges`, `getRudrakshaInfo`, `getTrending` keep reading their static JSON. `search()` keeps services/articles JSON for now (B06 switches them). Remove the `products-index` import. — antigravity
- [x] T8. `product/[slug]/page.tsx`: delete `export const dynamicParams = false` (default `true`, so admin-created products render). Keep everything else. — antigravity
- [x] T9. `rashifal/page.tsx`, `rashifal/[rashi]/page.tsx`, `home/RashifalSection.tsx`: replace `productById` (products-index) with `await getProductsByIds([...])` / `getProduct()` from `@/lib/api/catalog` (make the component `async` if needed); same rendering. — antigravity
- [x] T10. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- Must not change any JSX/markup or styling. Must not touch client components except the T1 import fix. Must not delete `products-index.ts` (B08 does). Must not touch `home/Journal.tsx` or `home/Testimonials.tsx` (B07 does).

## Done-notes
- Created: `src/server/settings/queries.ts`, `src/server/media/refs.ts`, `src/server/catalog/mappers.ts`, `src/server/catalog/queries.ts`.
- Modified: `src/types/product.ts`, `src/lib/api/catalog.ts`, `src/app/[locale]/product/[slug]/page.tsx`, `src/app/[locale]/rashifal/page.tsx`, `src/app/[locale]/rashifal/[rashi]/page.tsx`, `src/components/sections/home/RashifalSection.tsx`.
- T1: Checked 9 references to `@/lib/api/catalog`, 0 client components imported values from it (`ShopView.tsx` already used `@/lib/core/query`).
- `getCatalog()` caches products & categories tagged with `TAG.catalog`, joining ready media and omitting products of hidden categories.
- `getSetting()` reads Turso `settings` table, parses with `SETTINGS_SCHEMAS`, shallow-merges over defaults, preserves nulls.
- `toMediaRef()` generates responsive srcSet and selects 960/largest variant.
- Migration added: no.


## Manual QA (user)
1. `pnpm dev`: home, `/shop`, every category, filters/sort, `/rashifal`, a rashi page, `/product/copper-12-nag` — identical to before.
2. `pnpm db:studio` → change a product's `name_en` → refresh `/shop` → the new name shows (dev reads live data). Change it back.
3. Set a product `status` to `draft` → it disappears from `/shop` and `/product/<slug>` returns 404. Set it back to `active`.
4. `pnpm build` passes (needs `.env.local` with the DB).
