# B40 — Customers, exports, audit log, system health
**Risk:** M · **Needs:** B39 · **Agent:** any · **User setup before QA:** none

## Goal
A customer view (registered and guest buyers, with their history and lifetime value), CSV exports, an audit-log viewer, and a health page that tells the owner which services are configured and lets them run safe maintenance actions.

## Read first (only these)
- `docs/backend/RULES.md` §2, §3, §7
- `docs/backend/DATA-MODEL.md` §C (`users`, `audit_logs`), §F (`orders`), §G, §H (indexes only)
- `src/server/env.ts` (`isConfigured`), `src/server/reviews/service.ts` (`recomputeProductRating`), `src/server/email/send.ts`, `src/server/auth/session.ts` (`revokeUserSessions`), `src/server/orders/admin.ts` (`exportOrdersCsv` — copy its CSV-safety helper into a shared file)
- `src/components/admin/nav.ts`, admin kit file list

## Install
None.

## Files
Create:
- `src/server/csv.ts` (shared `toCsv(rows, columns)` with RFC-4180 quoting + formula-injection guard)
- `src/server/customers/admin.ts`, `src/server/customers/admin-actions.ts`
- `src/app/admin/(panel)/customers/page.tsx`, `customers/[key]/page.tsx`, `src/components/admin/customers/CustomerSummary.tsx`, `CustomerHistory.tsx`
- `src/server/audit-admin.ts`, `src/app/admin/(panel)/audit/page.tsx`, `src/components/admin/audit/AuditRow.tsx`
- `src/server/health.ts`, `src/app/admin/(panel)/health/page.tsx`, `src/components/admin/health/HealthActions.tsx`
Modify: `src/server/orders/admin.ts` (use `toCsv`), `src/server/messages/admin.ts` (use `toCsv`), `src/components/admin/nav.ts` (+ Customers `user` Sales `customers.view` · Audit log `report` System `audit.view` · Health `health` System `health.view`)

## Tasks
- [ ] T1. `src/server/csv.ts`: `toCsv<T>(rows: T[], columns: { header: string; value: (r: T) => string | number | null }[]): string` (UTF-8 BOM for Excel, `\r\n`, quotes doubled, cells starting with `= + - @` prefixed by `'`). Switch the two existing exports to it.
- [ ] T2. `customers/admin.ts` (`customers.view` / `customers.edit` / `exports.run`; audit writes): `listRegistered({ search, page })` (role `customer`), `listGuests({ search, page })` (distinct order emails with `user_id IS NULL`, last order date, count, total), `getCustomer(key)` (`u-<id>` or `e-<base64url email>`) → profile + orders + bookings + Kundali orders + inquiries (matched by user id / email / phone) + lifetime value (paid + COD collected), `setCustomerBlocked(userId, blocked)` (blocked → `revokeUserSessions`), `exportCustomersCsv()`. `admin-actions.ts` wraps them.
- [ ] T3. Pages: `/admin/customers` (tabs Registered | Guests, search, `DataTable`, export) and `/admin/customers/[key]` (`CustomerSummary`: contact buttons, LTV, first/last order, blocked state; `CustomerHistory`: tabs Orders / Bookings / Kundali / Inquiries with links).
- [ ] T4. `audit-admin.ts`: `listAudit({ entity?, actorId?, from?, to?, page })` (`audit.view`) using `audit_entity_idx` / `audit_created_idx`; `/admin/audit` with filters and `AuditRow` (time IST, actor, action, entity link, summary, expandable diff table).
- [ ] T5. `health.ts` (`health.view`): `getHealth()` → configured flags for r2 / turnstile / email / razorpay (test or live from the key prefix `rzp_test_` / `rzp_live_`) / pdf / cron, DB round-trip latency (`select 1`), row counts (products, orders, bookings, kundali_orders, inquiries, subscribers, media), pending media older than 24 h, failed Kundali reports; owner actions (`settings.edit`): `sendTestEmail()` (to the owner), `recalculateAllRatings()` (every product from approved reviews — products without reviews become 0/0, cards then hide the rating), both audited.
- [ ] T6. `/admin/health`: status list with green/amber/red badges + short "how to fix" hints pointing to USER-SETUP sections; `HealthActions` (confirm dialogs).
- [ ] T7. `nav.ts` items.
- [ ] T8. Finish per AGENTS.md §1 step 8.

## Must not
- No deleting customers (privacy deletion requests are handled manually for now — note it in Done-notes). No raw SQL strings with input.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. Customers → Registered and Guests tabs; open one → orders/bookings/kundali/inquiries + lifetime value; block → their account session ends.
2. Export customers / orders / subscribers → open in Excel (Hindi names show correctly).
3. Audit log shows your recent admin changes with diffs; filters work.
4. Health shows which services are configured; "Send test email" works.
5. `pnpm build` passes.
