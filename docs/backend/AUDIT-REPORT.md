# AUDIT-REPORT — B45 Final audit 1 (other agents' work)

Auditor: claude · started 2026-10-05.
Method per step: `git show --stat <commit>` → read the changed files as they are **now** (later steps may have edited them) → check against the step spec, `docs/backend/RULES.md`, ARCHITECTURE and DATA-MODEL → fix in place (specified behaviour kept) → note below.
Severity: **H** = security / money / data-loss / broken flow · **M** = wrong behaviour or rule break with user impact · **L** = robustness, spec drift, cosmetics.
`REDO` = too broken to repair here → Fix-list item in `PROGRESS.md`.

## T1. Steps to audit
Every step B01–B44 was done by `antigravity` (no Claude or mixed steps). Commits:

| Step | Commit | Step | Commit | Step | Commit | Step | Commit |
|---|---|---|---|---|---|---|---|
| B01 | 99dd23e | B12 | 180e2a5 | B23 | 928929c | B34 | c69b625 |
| B02 | dcd7432 | B13 | f6a0746 | B24 | edc55c5 | B35 | 9ecac44 |
| B03 | 1a9af59 | B14 | ae8a08b | B25 | ad181f3 | B36 | 4c16d12 |
| B04 | 728e587 | B15 | a652cc2 | B26 | 3ab1363 | B37 | 955327e |
| B05 | 597c451 | B16 | 1ffd4e6 | B27 | c2389f0 | B38 | 2634646 |
| B06 | 5f8b7bb | B17 | 2d05661 | B28 | 985fcb2 | B39 | 1997c9a |
| B07 | a69ca5a | B18 | 7590bcc¹ | B29 | dc1836a | B40 | 719c751 |
| B08 | 8ed5dcf | B19 | 7590bcc¹ | B30 | f2727cc | B41 | f0c7c01 |
| B09 | dc3be91 | B20 | 7590bcc | B31 | 2560a26 | B42 | be04375 |
| B10 | ca4e23a | B21 | a6495b4 | B32 | b3e6f69 | B43 | 8a3d92c |
| B11 | 74ea924 | B22 | c3faa1f | B33 | 236ea34 | B44 | f9b42e3 |

¹ B18 and B19 have no commit of their own: their files landed inside the B20 commit `7590bcc`.

## Global scan (RULES §9 greps, whole `src/` + `scripts/`)
- Clean: `any`, `@ts-ignore`/`@ts-expect-error`, `console.log`, TODO/FIXME/XXX/HACK, `sql.raw(`, `eval`/`new Function` in `src/`, `innerHTML`, `middleware.ts`, `"use cache"`, `runtime = "edge"`, direct `updateTag`/`revalidateTag` (only in `cache.ts`), `process.env` (only allowed files), `Math.random` (only phase-F client motion jitter).
- `dangerouslySetInnerHTML`: only trusted `src/lib/art` SVG + `JsonLd` (escapes `<`). OK.
- External `fetch`: all have `AbortSignal.timeout` (8 s; PDF 45 s; the cron→generate kick 2 s / 45 s). OK.
- `eslint-disable`: all `@next/next/no-img-element` except `BookingFlow.tsx:137` `react-hooks/exhaustive-deps` → checked under B22.
- No FK `.references()` anywhere in the schema (DM §A marks them "documentation"). Not added: it would need table-rebuild migrations on live tables and could switch on FK enforcement in libSQL. Accepted deviation (L).

## T2. Per-step results

- [x] **B01 Foundation** — spec met (env, log, result, ids, cache, request, loc, ist, drizzle config, CSP, proxy matcher). Findings:
  - M `formatIst`: `{ date: false }` still printed the date (inverted ternary) → admin booking calendar row showed date + time. Fixed: date shows unless `date === false`. (`src/lib/core/ist.ts`)
  - L `addDaysKey` / `weekdayOfKey` used local-time `Date` → depended on the server time zone. Now pure UTC arithmetic. (`src/lib/core/ist.ts`)
  - L `safeEqualHex` threw `RangeError` on equal-length non-hex input (e.g. a forged Razorpay signature) → became `INTERNAL` instead of a clean mismatch. Now decodes first and returns false. (`src/server/ids.ts`)
- [x] **B02 Schema 1** — enums (with `satisfies` checks), types, flows, permissions (role table = ARCH §6), settings schemas + defaults (= DM §I, seo/videos copied literally), core/catalog/content tables, indexes and defaults all match DM. `audit()` never throws. No findings besides the FK note above.
- [x] **B03 Schema 2** — commerce / consult / crm tables: every column, nullability, default, unique and index matches DM §F–§H; `kundali.ts` = DM §B. Only two migrations exist and no later step touched the schema. No findings.
- [ ] B04 Seed
- [ ] B05 Data layer 1: catalog
- [ ] B06 Data layer 2: content
- [ ] B07 Data layer 3: home
- [ ] B08 Client snapshot, coupons, fees
- [ ] B09 Auth + email core
- [ ] B10 Media uploads (R2)
- [ ] B11 Admin shell + login
- [ ] B12 Admin UI kit
- [ ] B13 Admin: products & categories
- [ ] B14 Admin: settings, coupons, staff
- [ ] B15 Product page
- [ ] B16 Order engine
- [ ] B17 Cart + checkout UI
- [ ] B18 Razorpay
- [ ] B19 Account
- [ ] B20 Track order, wishlist, search
- [ ] B21 Admin: orders
- [ ] B22 Booking backend
- [ ] B23 Booking manage
- [ ] B24 Admin: consultations
- [ ] B25 Kundali engine
- [ ] B26 Report content EN
- [ ] B27 Report content HI 1
- [ ] B28 Report content HI 2
- [ ] B29 Kundali report document
- [ ] B30 Kundali purchase + PDF
- [ ] B31 Inquiries + payment links
- [ ] B32 Contact, newsletter, inbox
- [ ] B33 Content managers
- [ ] B34 Home & site settings
- [ ] B35 Rashifal manager
- [ ] B36 Blog, policies, FAQ
- [ ] B37 Starter content
- [ ] B38 Reviews
- [ ] B39 Dashboard, badges, search
- [ ] B40 Customers, audit log, health
- [ ] B41 Cron
- [ ] B42 SEO foundation
- [ ] B43 SEO pages
- [ ] B44 Hardening & go-live

## Files changed by this audit
- `src/lib/core/ist.ts` (B01)
- `src/server/ids.ts` (B01)

## Fix-list items added for the user
- (none yet)
