# B03 — Schema 2: commerce, consult, CRM tables
**Risk:** H · **Needs:** B02 · **Agent:** Claude recommended · **User setup before QA:** USER-SETUP §2

## Goal
The remaining tables (orders, payments, coupons, reviews, bookings, Kundali orders, inquiries, messages, subscribers…) plus the `ChartSnapshot` type, and their migration.

## Read first (only these)
- `docs/backend/RULES.md` §1–§3
- `docs/backend/DATA-MODEL.md` §A, §B (enums, types, `src/lib/domain/kundali.ts`), §F, §G, §H
- `src/server/db/schema/core.ts` (follow its style exactly), `src/server/db/schema/index.ts`
- `src/lib/domain/types.ts`

## Install
None.

## Files
Create: `src/lib/domain/kundali.ts`, `src/server/db/schema/commerce.ts`, `src/server/db/schema/consult.ts`, `src/server/db/schema/crm.ts`, `drizzle/**` (generated)
Modify: `src/server/db/schema/index.ts` (add the three exports)

## Tasks
- [x] T1. `src/lib/domain/kundali.ts` exactly as DM §B (types only). — antigravity
- [x] T2. `src/server/db/schema/commerce.ts` — DM §F (addresses, coupons, orders, order_items, order_events, payments, refunds, coupon_redemptions, checkout_drafts, reviews) with every listed index / unique index. — antigravity
- [x] T3. `src/server/db/schema/consult.ts` — DM §G (bookings, kundali_orders). — antigravity
- [x] T4. `src/server/db/schema/crm.ts` — DM §H (inquiries, inquiry_events, payment_links, messages, subscribers). — antigravity
- [x] T5. `index.ts`: add `export * from "./commerce"; export * from "./consult"; export * from "./crm";` — antigravity
- [x] T6. Run `pnpm db:generate`; commit `drizzle/`. Question or failure → BLOCKER. — antigravity
- [x] T7. Finish per AGENTS.md §1 step 8 (Done-notes: "migration added"). — antigravity

## Must not
- Must not change B02 tables. Must not add columns or indexes that DM does not list.

## Done-notes
- Created `src/lib/domain/kundali.ts` with GrahaKey, ChartPlanet, DashaPeriod, ChartSnapshot types matching DM §B.
- Created `src/server/db/schema/commerce.ts` defining addresses, coupons, orders, order_items, order_events, payments, refunds, coupon_redemptions, checkout_drafts, reviews matching DM §F with all indexes.
- Created `src/server/db/schema/consult.ts` defining bookings and kundali_orders matching DM §G with all indexes.
- Created `src/server/db/schema/crm.ts` defining inquiries, inquiry_events, payment_links, messages, subscribers matching DM §H with all indexes.
- Re-exported commerce, consult, and crm in `src/server/db/schema/index.ts`.
- Generated migration `drizzle/0001_exotic_red_hulk.sql` for all 17 new tables.
- Migration added: yes.

## Manual QA (user)
1. `pnpm db:migrate` → success.
2. `pnpm db:studio` shows the new tables: addresses, coupons, orders, order_items, order_events, payments, refunds, coupon_redemptions, checkout_drafts, reviews, bookings, kundali_orders, inquiries, inquiry_events, payment_links, messages, subscribers.
3. `pnpm build` passes.
