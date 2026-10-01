# B44 — Hardening & go-live preparation
**Risk:** M · **Needs:** B43 · **Agent:** any · **User setup before QA:** none

## Goal
Close the gaps before launch: error and loading states, demo behaviour off in production, header/CSP review, guard and rate-limit coverage checks, and a written go-live checklist for the user.

## Read first (only these)
- `docs/backend/RULES.md` (all), `docs/backend/ARCHITECTURE.md` §3, §6, §7
- `next.config.ts`, `src/lib/core/commerce.ts` (`DEMO_SEED`), `src/components/commerce/StoreHydrator.tsx`, `src/components/sections/kundali/KundaliTool.tsx` (the `?demo=` / `?pay=` handling)
- `docs/backend/USER-SETUP.md`, `docs/backend/PLAN.md` (Client-confirm)
- Grep outputs listed in T5–T7 (read only the hits)

## Install
None.

## Files
Create:
- `src/lib/core/runtime.ts` (`export const IS_DEV = process.env.NODE_ENV !== "production";`)
- `src/app/global-error.tsx`, `src/app/[locale]/error.tsx`, `src/app/[locale]/account/loading.tsx`, `src/app/admin/error.tsx`, `src/app/admin/(panel)/error.tsx`, `src/app/admin/(panel)/loading.tsx`
- `docs/backend/GO-LIVE.md`
Modify: `next.config.ts` (headers), `src/lib/core/commerce.ts` (`DEMO_SEED = IS_DEV`), `KundaliTool.tsx` (QA params only when `IS_DEV`), any file fixed in T5–T7 (list each in Done-notes), `messages/en.json`, `messages/hi.json` (`errors.page` strings)

## Tasks
- [ ] T1. Error boundaries: `[locale]/error.tsx` (client; themed card with chakra, "Something went wrong", Retry (`reset`) + Home; EN/HI via messages), `global-error.tsx` (own `<html>`, minimal, bilingual static text), admin `error.tsx` files (English, Retry + Dashboard). Errors are not shown in detail to users.
- [ ] T2. Loading: `account/loading.tsx` and `admin/(panel)/loading.tsx` — skeletons in theme colours (sand shimmer), no layout jump.
- [ ] T3. `runtime.ts`; `DEMO_SEED = IS_DEV` (no demo cart/wishlist/recent searches in production); `/kundali-99` reads `?demo=` / `?pay=` only when `IS_DEV`.
- [ ] T4. `next.config.ts`: add `Cross-Origin-Opener-Policy: same-origin-allow-popups`; confirm every third-party host the app uses is in the CSP (Razorpay, Turnstile, R2 endpoint, media origin, YouTube, i.ytimg) and nothing else.
- [ ] T5. Guard check: `grep -rLn "requireAdminPage" src/app/admin/\(panel\)` (every page must call it — `kit` and `kundali/preview` additionally 404 outside development) and every export of `src/server/**/admin.ts` must start with `requireAdmin(`. Fix any miss.
- [ ] T6. Public action check: every export of `src/server/**/actions.ts` parses with zod, and those listed in RULES §2 call `rateLimit` / `verifyTurnstile`. Fix any miss.
- [ ] T7. Hygiene greps (RULES §9 list) across `src/`: fix every hit that is not an allowed exception.
- [ ] T8. `docs/backend/GO-LIVE.md` — an ordered checklist for the user: Vercel plan (Pro for commerce), production Turso DB + `pnpm db:migrate` + `pnpm db:seed` (owner + settings), all Production env vars, domain + DNS on Vercel, `APP_URL`, R2 custom media domain + CORS, Turnstile hostnames, Resend domain verified, Razorpay KYC → live keys + live webhook, `CRON_SECRET` + optional 15-min pinger, real contact/social/fees/GSTIN in Settings, review policies and `[client-review]` texts, decide demo ratings (Health → Recalculate), remove or keep demo coupons, create staff accounts, a ₹1 live test order + refund, Google Search Console + sitemap, backups (USER-SETUP §8), monitoring (Vercel logs).
- [ ] T9. Finish per AGENTS.md §1 step 8.

## Must not
- No new features. No dependency changes.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `pnpm build && pnpm start` (production mode): no demo cart on a fresh browser; `/kundali-99?demo=success` does nothing.
2. Force an error (e.g. stop the DB env var in a preview) → themed error page, not a stack trace.
3. Read `docs/backend/GO-LIVE.md` — everything understandable.
4. `pnpm build` passes.
