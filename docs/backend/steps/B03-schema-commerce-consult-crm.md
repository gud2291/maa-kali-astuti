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
- [ ] T1. `src/lib/domain/kundali.ts` exactly as DM §B (types only).
- [ ] T2. `src/server/db/schema/commerce.ts` — DM §F (addresses, coupons, orders, order_items, order_events, payments, refunds, coupon_redemptions, checkout_drafts, reviews) with every listed index / unique index.
- [ ] T3. `src/server/db/schema/consult.ts` — DM §G (bookings, kundali_orders).
- [ ] T4. `src/server/db/schema/crm.ts` — DM §H (inquiries, inquiry_events, payment_links, messages, subscribers).
- [ ] T5. `index.ts`: add `export * from "./commerce"; export * from "./consult"; export * from "./crm";`
- [ ] T6. Run `pnpm db:generate`; commit `drizzle/`. Question or failure → BLOCKER.
- [ ] T7. Finish per AGENTS.md §1 step 8 (Done-notes: "migration added").

## Must not
- Must not change B02 tables. Must not add columns or indexes that DM does not list.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `pnpm db:migrate` → success.
2. `pnpm db:studio` shows the new tables: addresses, coupons, orders, order_items, order_events, payments, refunds, coupon_redemptions, checkout_drafts, reviews, bookings, kundali_orders, inquiries, inquiry_events, payment_links, messages, subscribers.
3. `pnpm build` passes.
