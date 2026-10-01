# B11 — Admin shell + login
**Risk:** M · **Needs:** B10 · **Agent:** any · **User setup before QA:** owner seeded (B04); Turnstile test keys or none (dev); Resend optional (dev prints the code)

## Goal
`/admin` exists: its own root layout in the brand theme, email-OTP login, a responsive shell (sidebar on desktop, bottom nav on phones), a welcome home, toasts and logout.

## Read first (only these)
- `docs/backend/RULES.md` §6, §7
- `docs/backend/ARCHITECTURE.md` §2 (admin routes), §3, §6
- `docs/backend/NEXT16.md` → "Root layouts"
- `design-brief/DESIGN-BRIEF.md` lines 635–656 (§7.19 Admin)
- `src/app/[locale]/layout.tsx`, `src/app/fonts.ts`, `src/app/globals.css` lines 1–120
- `src/components/ui/Button.tsx`, `src/components/ui/Logo.tsx`, `src/components/icons/Icon.tsx`
- `src/server/auth/guards.ts`, `src/server/auth/actions.ts`, `src/components/auth/OtpForm.tsx`, `src/components/auth/TurnstileWidget.tsx`, `src/lib/domain/permissions.ts`

## Install
None.

## Files
Create:
- `src/app/admin/layout.tsx`, `src/app/admin/not-found.tsx`, `src/app/admin/login/page.tsx`
- `src/app/admin/(panel)/layout.tsx`, `src/app/admin/(panel)/page.tsx`
- `src/components/admin/nav.ts`, `AdminShell.tsx`, `AdminSidebar.tsx`, `AdminTopbar.tsx`, `AdminMobileNav.tsx`, `AdminIcon.tsx`, `AdminLogin.tsx`, `errors.ts`
- `src/components/admin/ui/Toaster.tsx`, `src/components/admin/ui/toast.ts`

## Tasks
- [ ] T1. `src/app/admin/layout.tsx` (root layout): `<html lang="en" className={fontVariables}>`, imports `../globals.css`; `<body className="bg-iv text-ink font-sans">`; `metadata` = `{ title: { default: "Admin · Maa Kali Astuti", template: "%s · Admin" }, robots: { index: false, follow: false } }`; `viewport.themeColor` `#0E3B30`; renders `children` + `<Toaster />`.
- [ ] T2. `src/components/admin/ui/toast.ts` (zustand): `toast.ok(msg)`, `toast.err(msg)`, `toast.info(msg)`; max 3 visible, auto-dismiss 4 s. `Toaster.tsx`: bottom-centre on mobile (above the bottom nav), bottom-right on desktop, `aria-live="polite"`, tones `ok` / `sin` / `em5` with cream surface.
- [ ] T3. `src/components/admin/errors.ts`: `ADMIN_ERRORS: Record<ErrorCode, string>` (plain English, one line each) and `errorText(code)`.
- [ ] T4. `src/components/admin/AdminIcon.tsx`: wraps `Icon`; adds three paths in the same 24 px / 1.5 px stroke style: `gear`, `logout`, `drag` (6-dot grip). Type `AdminIconName = IconName | "gear" | "logout" | "drag"`.
- [ ] T5. `src/components/admin/nav.ts`: `type NavItem = { href: string; label: string; icon: AdminIconName; perm: Permission; group: "Overview" | "Sales" | "Catalog" | "Consultations" | "Kundali" | "Leads" | "Content" | "System" }`; `NAV: NavItem[]` = only `{ href: "/admin", label: "Dashboard", icon: "grid", perm: "dashboard.view", group: "Overview" }`. Later steps append their items here. `navFor(role)` filters by `can()`.
- [ ] T6. `AdminShell.tsx` (server): grid layout — sidebar (≥ 1024 px, 248 px wide, collapsible to 72 px), main column with `AdminTopbar` and `<main className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 lg:px-8 lg:pb-12">`; `AdminMobileNav` below 1024 px.
- [ ] T7. `AdminSidebar.tsx` (client): `bg-n9`, logo (small `Logo` + "Admin" eyebrow in `g3`), groups with `text-sg5` labels, items `text-sg3` hover `text-g1`, active item `bg-n8 text-g1` with a 2 px `g5` left hairline; collapse toggle stored in `localStorage` (`mka.admin.collapsed`, read after mount only).
- [ ] T8. `AdminTopbar.tsx` (client): sticky, `bg-cream` with bottom hairline `s2`, page area title slot, right side user menu (name, role, "View site" → `/`, "Sign out" → `logoutAction("admin")` then `/admin/login`). 56 px high.
- [ ] T9. `AdminMobileNav.tsx` (client): fixed bottom bar (`bg-cream`, top hairline, `pb-[env(safe-area-inset-bottom)]`), first 4 permitted items + "More" opening a radix Dialog sheet with all items grouped; 44 px+ targets; active item `text-em7`.
- [ ] T10. `src/app/admin/(panel)/layout.tsx`: `const admin = await getAdmin(); if (!admin) redirect("/admin/login");` → `<AdminShell admin={…} nav={navFor(admin.role)}>`.
- [ ] T11. `src/app/admin/(panel)/page.tsx`: `await requireAdminPage("dashboard.view")`; greeting card ("Namaste, <name>", today's date in IST via `formatIst`), a grid of quick-link cards for every permitted nav item, and a notice when `?denied=1` ("You don't have access to that page."). (B39 replaces this with KPIs.)
- [ ] T12. `src/app/admin/login/page.tsx` + `AdminLogin.tsx`: if `getAdmin()` → `redirect("/admin")`. Full-height `bg-n9` page with a centred cream card (max-w 420 px): `Logo`, "Admin sign in", `OtpForm` with `purpose="admin_login"` and English labels built from `ADMIN_ERRORS`; on success `router.replace(next)`.
- [ ] T13. `src/app/admin/not-found.tsx`: simple branded 404 with a link to `/admin`.
- [ ] T14. Finish per AGENTS.md §1 step 8.

## Must not
- No tables/forms kit (B12). No feature pages. No Hindi in admin.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `pnpm dev` → `/admin` redirects to `/admin/login`.
2. Enter the owner email (from `SEED_OWNER_EMAIL`) → code arrives by email (or is printed in the terminal without Resend) → enter it → dashboard greeting.
3. Wrong code 6 times → "expired" message; a non-admin email → "code sent" message but no email and no login.
4. Phone width (390 px): bottom nav + More sheet; desktop: sidebar collapses/expands and remembers it.
5. Sign out → back to login; `/admin` again redirects to login.
6. `pnpm build` passes.
