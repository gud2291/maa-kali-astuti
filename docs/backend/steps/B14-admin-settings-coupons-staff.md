# B14 — Admin: settings, coupons, staff
**Risk:** M · **Needs:** B13 · **Agent:** any · **User setup before QA:** none (Resend for the staff email)

## Goal
The owner edits store settings (fees, COD, contact, social, SEO, notifications, Kundali price, course fee, invoice details), manages coupons, and adds staff with roles.

## Read first (only these)
- `docs/backend/RULES.md` §2, §6, §7
- `docs/backend/ARCHITECTURE.md` §4 (tags), §6 (roles)
- `docs/backend/DATA-MODEL.md` §F (`coupons`), §I
- `src/lib/validation/settings.ts`, `src/server/settings/queries.ts`, `src/server/coupons/service.ts`, `src/server/auth/session.ts`, `src/server/email/components.tsx`, `src/server/audit.ts`
- `src/components/admin/nav.ts`, `src/components/admin/products/ImageManager.tsx` (props only), `src/components/admin/form/useActionForm.ts`

## Install
None.

## Files
Create:
- `src/server/settings/admin.ts`, `src/server/settings/admin-actions.ts`
- `src/app/admin/(panel)/settings/page.tsx`
- `src/components/admin/settings/StoreForm.tsx`, `ContactForm.tsx`, `SeoForm.tsx`, `NotifyForm.tsx`, `OffersForm.tsx`, `InvoiceForm.tsx`
- `src/lib/validation/coupon.ts`, `src/server/coupons/admin.ts`, `src/server/coupons/admin-actions.ts`
- `src/app/admin/(panel)/coupons/page.tsx`, `coupons/new/page.tsx`, `coupons/[id]/page.tsx`, `src/components/admin/coupons/CouponForm.tsx`
- `src/lib/validation/staff.ts`, `src/server/staff/admin.ts`, `src/server/staff/admin-actions.ts`
- `src/app/admin/(panel)/staff/page.tsx`, `src/components/admin/staff/StaffTable.tsx`, `src/components/admin/staff/AddStaffSheet.tsx`
- `src/server/email/templates/StaffInviteEmail.tsx`
Modify: `src/components/admin/nav.ts` (+ Coupons `gift` Sales `coupons.edit` · Settings `gear` System `settings.edit` · Staff `user` System `staff.manage`)

## Tasks
- [ ] T1. `settings/admin.ts`: `getSettingsForAdmin(): Promise<SettingsMap>` and `updateSetting<K>(key: K, value: unknown, actor): Promise<void>` (`requireAdmin("settings.edit")`; parse with `SETTINGS_SCHEMAS[key]`; upsert row with `updated_by`; `audit("settings.update", diff of top-level fields)`). Allowed keys here: `store, contact, social, seo, notify, kundali, courses, invoice`.
- [ ] T2. `settings/admin-actions.ts`: `updateSettingAction({ key, value })` → `invalidate(TAG.settings)`.
- [ ] T3. `settings/page.tsx`: `requireAdminPage("settings.edit")`; `LinkTabs` `?tab=` store · contact · seo · notify · offers · invoice; each tab renders its form with current values.
- [ ] T4. Forms (`useActionForm` + the key's schema): **StoreForm** (free-shipping threshold, shipping, express, COD on/off + fee + max order value, gift wrap, energization fee, max qty per line, standard/express day ranges, online payments on/off, next Mahapuja date — empty = automatic); **ContactForm** (contact + social keys, two saves); **SeoForm** (title/description EN/HI with counters, OG image via single `ImageManager`, purpose `setting`); **NotifyForm** (admin emails list 1–5, alert toggles); **OffersForm** (Kundali enabled/price/MRP; course fee + instalments on/off/count/amount); **InvoiceForm** (legal name, GSTIN `^[0-9A-Z]{15}$` or empty, address, state code, prefix).
- [ ] T5. `coupon.ts` schema: code `^[A-Z0-9_-]{3,30}$` (input upper-cased), kind, value (percent 1–90 / flat 1–100000), min cart ≥ 0, max discount (percent only) or null, start/end (end after start), usage limit, per-customer limit, first-order-only, active, note ≤ 200.
- [ ] T6. `coupons/admin.ts` (`coupons.edit`): `listCoupons({ status?: "active" | "inactive" | "expired", search?, page })`, `getCoupon(id)`, `createCoupon` (code unique → `CONFLICT` on `code`), `updateCoupon`, `setCouponActive`, `deleteCoupon` (only when `used_count = 0`, else `CONFLICT` — deactivate instead). Audit every write. `admin-actions.ts` wraps them (no cache tags — coupons are read live).
- [ ] T7. Coupon pages: list (code, rule summary like "10% off · min ₹999", used / limit, dates, status badge) + new/edit with `CouponForm`.
- [ ] T8. `staff.ts` schema + `staff/admin.ts` (`staff.manage`): `listStaff()` (admin-role users), `addStaff({ email, name, role })` (upsert user with that role; existing customer → upgraded; sends `StaffInviteEmail` in `after()` with the `/admin/login` link), `changeRole(userId, role)`, `setStaffStatus(userId, "active" | "blocked")` (blocked → `revokeUserSessions`), `removeStaff(userId)` (role → customer, revoke sessions). Rules: you can't change your own role/status; at least one active owner must remain (`CONFLICT`). Audit every write. `admin-actions.ts` wraps them.
- [ ] T9. `staff/page.tsx` + `StaffTable` (name, email, role select, status, last login, actions) + `AddStaffSheet`.
- [ ] T10. `StaffInviteEmail.tsx` (EN only, `EmailShell`).
- [ ] T11. `nav.ts`: add the three items.
- [ ] T12. Finish per AGENTS.md §1 step 8.

## Must not
- Must not edit `consult`, `home`, `announcement`, `videos` settings here (B24, B33, B34). Must not wire contact/social into the storefront (B34).

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. Settings → Store: shipping ₹79 → ₹89, save → cart drawer shows ₹89 shipping after reload. Restore.
2. Coupons: create `DIWALI15` (15%, max ₹300, ends next week) → apply in the cart drawer → discount capped at ₹300. Deactivate → "invalid".
3. Staff: add a second email of yours as **staff** → sign in with it in a private window → sees only staff items; owner blocks it → that window is signed out on the next click.
4. Try to demote yourself → refused.
5. `pnpm build` passes.
