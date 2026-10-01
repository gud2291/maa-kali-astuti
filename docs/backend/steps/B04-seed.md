# B04 — Seed script
**Risk:** M · **Needs:** B03 · **Agent:** any · **User setup before QA:** USER-SETUP §2; `SEED_OWNER_EMAIL` + `SEED_OWNER_NAME` in `.env.local`

## Goal
`pnpm db:seed` copies all phase-F content into the DB so the site can switch to the DB without any visible change. It only **fills what is missing** — re-running never duplicates rows and never overwrites admin edits (except the owner's role).

## Read first (only these)
- `docs/backend/RULES.md` §1–§3
- `docs/backend/DATA-MODEL.md` §B, §C–§I (column names)
- `src/server/db/schema/*.ts`, `src/lib/validation/settings.ts`, `src/lib/domain/types.ts`
- `src/types/product.ts`, `src/lib/routes.ts` (`POLICIES` only)
- The first 2 entries of each: `src/lib/data/products.json`, `categories.json`, `services.json`, `courses.json`, `rituals.json`, `videos.json`, `testimonials.json`, `faq.json`, `articles.json`, `reviews.json`, `rudraksha.json` (use `node -e` to print shapes; don't read whole files)
- `client-requirements/client-requirements.md` section "## 5." up to "## 6." (use grep -n to find the line range)

## Install
None (`tsx` is already a devDependency).

## Files
Create: `scripts/db/client.ts`, `scripts/db/seed-content.ts`, `scripts/db/seed.ts`

## Tasks
- [ ] T1. `scripts/db/client.ts`: if `process.env.TURSO_DATABASE_URL` is unset, `process.loadEnvFile(".env.local")` (in try/catch). Throw a clear error when the URL/token are still missing. `createClient` from `@libsql/client/http` + `drizzle({ client, schema })` from `drizzle-orm/libsql/http`; schema imported **relatively** from `../../src/server/db/schema/index`. Export `db`. Never import anything that imports `server-only`.
- [ ] T2. `scripts/db/seed-content.ts`: `export function productContentFor(p, rudraksha): ProductContent` (all `hi` = `""`):
  - `nag12`: description = the "Product Description" paragraph of client-requirements §5 Category 5 (verbatim); benefits = its 4 "Key Traditional Benefits" (title + sentence); specs = Material / Quantity / Energization / Ideal For (verbatim values); placement = `["Home temple", "Tijori (locker)", "Office"]`.
  - `havan`: description = "Bitter Havan Packet – 100 grams. " + the Purpose sentence (verbatim).
  - `a-*` (amulets): description = the italic Category 3 line + " Encased in a consecrated copper tabiz (amulet capsule)."; benefits = [the amulet's meaning from the Category 3 list].
  - `b-*` (bracelets): description = `"<name> — <meaning>."` with the meaning from the Category 2 list (match by stone); benefits = [meaning].
  - `r2`…`r14`: description `"Original Nepali <n> Mukhi Rudraksha, associated with <deity> and the planet <planet>. Each bead is X-ray tested and energized in Mahapuja before dispatch."`; howToWear `"Wear it on a Monday morning after bathing, after chanting “<mantra>” 108 times."`; benefits = [product intent]. `m5` / `m7` (malas): same with "mala" wording and rudraksha 5 / 7.
  - everything else in `ProductContent` empty (`EMPTY_PRODUCT_CONTENT` values).
- [ ] T3. `scripts/db/seed.ts` — `main()` runs the sections below in order; every insert uses `.onConflictDoNothing()`; rows without a natural key (rituals, videos, testimonials, faqs, reviews) are inserted only when their table is empty. Writes go through `db.batch` (≤ 50 statements per batch). Each section prints `seed: <table> +<inserted>` with `console.info`. On error: `console.error`, `process.exitCode = 1`. `L(s) = { en: s, hi: "" }`.
  1. `settings`: every key of `SETTINGS_DEFAULTS`; `notify.adminEmails = [SEED_OWNER_EMAIL]` when set.
  2. owner: when `SEED_OWNER_EMAIL` is set → insert `{ email: lower-case, name: SEED_OWNER_NAME ?? "Owner", role: "owner", status: "active", emailVerifiedAt: now }`, on conflict (email) **update** `role = "owner", status = "active"`.
  3. `categories`: key, slug, `name_en = name`, `name_hi = hi`, `short_en = short`, `desc_en = desc`, `desc_hi = deshi`, `sort` = index.
  4. `products`: `id, slug, category_key = cat, sub, mukhi, stone, stone_name = stoneName, name_en = name, name_hi = hi, long_en = long, intent_en = intent, intent_key = ik, price_inr = price, mrp_inr = mrp, stock, sizes, badges, rating_avg = rating, rating_count = reviews, popularity = pop, art, legacy_photo = photo, legacy_photo2 = photo2, content = productContentFor(…), energizable = cat !== "havan", status = "active", featured = badges includes "featured", sort = index, published_at = now − date × 86 400 000`.
  5. `services` + `service_tiers`: content built per DM `ServiceContent` (`covered [icon, t, d]` → `{ icon, t: L, d: L }`, `samples [kind, cap]` → `{ kind, cap: L }`); tiers: `title_en = t, price_inr = price, mins, recommended = rec === 1, inclusions = inc.map(L)`.
  6. `courses`: `name_en = en, name_hi = hi, deity, icon, days, content = { essence, overview, niyam, attain }` (as Loc), `fee_inr = null`, sort.
  7. `rituals`: `[icon, en, hi, line]` → `icon, name_en, name_hi, line_en`, sort.
  8. `videos`: videos → `kind "video", legacy_key = id, category = cat, title_en = en, title_hi = hi.join("\n"), desc_en = desc, duration = dur, published_on = date parsed from "14 Sep 2026" to "2026-09-14" (own month table), motif, featured = index 0`; shorts → `kind "short", category "all"`, same fields that exist.
  9. `testimonials`: `quote_en = q, name = n, city = c, tag = s, rating 5, kind "text"`, sort.
  10. `faqs`: every set of `faq.json` → rows `(set_key, q_en, a_en, sort)`.
  11. `articles`: `slug = slugify(t)`, category map (`"Rudraksha guide" → rudraksha`, `"Crystals" → crystals`, `"Remedies" → remedies`, `"Astrology" → astrology`), `title_en = t, excerpt_en = "", body_en = { type: "doc", content: [] }, read_mins = m, legacy_art = pid, product_ids = [pid], status "published", published_at = now − index days`. (B37 writes the real bodies.)
  12. `reviews`: `product_id = pid, name = n, city = c, body = q, rating = r, legacy_date = d, verified true, status "approved", show_on_home true, approved_at = now`.
  13. `coupons`: `SADHANA10` (percent 10) and `FIRST100` (flat 100, `min_cart_inr` 999) — the phase-F demo rules.
  14. `pages`: the 5 `POLICIES` slugs, `title_en` from that map, empty `body_en` doc.
- [ ] T4. Finish per AGENTS.md §1 step 8.

## Must not
- Must not delete or update existing rows (only the owner upsert). Must not run the seed.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. Add `SEED_OWNER_EMAIL` (your email) and `SEED_OWNER_NAME` to `.env.local`.
2. `pnpm db:seed` → prints counts: settings 12, owner 1, categories 5, products 39, services 4 (+12 tiers), courses 6, rituals 6, videos 18, testimonials 5, faqs ≈ 48, articles 6, reviews 3, coupons 2, pages 5.
3. Run `pnpm db:seed` again → every line shows `+0`.
4. `pnpm db:studio`: spot-check `products` (nag12 has content), `settings` (`store` value), `users` (you are owner).
