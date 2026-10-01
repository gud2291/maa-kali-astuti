# B12 — Admin UI kit (tables, filters, dialogs, forms)
**Risk:** M · **Needs:** B11 · **Agent:** any · **User setup before QA:** none

## Goal
One small, consistent component kit that every admin screen uses: page header, cards, responsive data table (table on desktop, cards on phones), pagination, URL search/filters, badges, dialogs, sheets and form fields with EN/HI tabs and a sticky save bar. A development-only gallery page shows every component for QA.

## Read first (only these)
- `docs/backend/RULES.md` §6, §7
- `src/components/admin/AdminShell.tsx`, `src/components/admin/ui/toast.ts`, `src/components/admin/errors.ts`, `src/components/admin/AdminIcon.tsx`
- `src/components/ui/Button.tsx` (use `buttonClass()`), `src/components/ui/Field.tsx` (match its input look), `src/app/globals.css` lines 1–120
- `src/lib/domain/errors.ts`, `src/server/env.ts`

## Install
None (`radix-ui`, `react-hook-form`, `@hookform/resolvers`, `zod` are installed).

## Files
Create:
- `src/components/admin/ui/PageHeader.tsx`, `Card.tsx`, `StatCard.tsx`, `DataTable.tsx`, `Pagination.tsx`, `SearchBox.tsx`, `FilterSelect.tsx`, `StatusBadge.tsx`, `EmptyState.tsx`, `Tabs.tsx`, `ConfirmDialog.tsx`, `Sheet.tsx`
- `src/components/admin/form/FieldShell.tsx`, `TextField.tsx`, `TextArea.tsx`, `NumberField.tsx`, `MoneyField.tsx`, `SelectField.tsx`, `SwitchField.tsx`, `CheckboxField.tsx`, `DateField.tsx`, `LocaleTabs.tsx`, `FormBar.tsx`, `useActionForm.ts`
- `src/app/admin/(panel)/kit/page.tsx` (development-only gallery)

## Tasks
- [x] T1. `PageHeader` (title in `font-display` 28–32 px, optional description, back link, right-side actions; stacks on mobile). `Card` (+ `CardHeader`, `CardBody`): `bg-cream rounded-btn shadow-ring-sand`. `StatCard` (`label`, `value`, optional `hint`, `icon`, `href`). — antigravity
- [x] T2. `DataTable<T>` (server component): props `{ rows: T[]; columns: { key: string; header: string; cell: (row: T) => ReactNode; className?: string; mobile?: "title" | "meta" | "badge" | "hide" }[]; rowHref?: (row: T) => string; empty: ReactNode }`. ≥ 768 px: real `<table>` (header `text-[12px] uppercase tracking-[0.12em] text-ink6`, rows with `border-b border-s2`, hover `bg-s1`, whole row clickable via a stretched link when `rowHref`). < 768 px: card list using the `mobile` roles. Empty rows → `empty`. — antigravity
- [x] T3. `Pagination` (server): `{ page, pageSize, total, pathname, params: Record<string, string> }` → "Showing x–y of z" + Prev/Next links that keep the other params. — antigravity
- [x] T4. `SearchBox` (client): `{ param?: "q"; placeholder }` → debounced 300 ms `router.replace` of the URL (drops `page`). `FilterSelect` (client): `{ param, label, options: { value: string; label: string }[] }` → URL param (empty = remove). — antigravity
- [x] T5. `StatusBadge`: `{ tone: "ok" | "warn" | "danger" | "info" | "muted"; children }` → pill (`rounded-pill`, 12 px, tones: ok `text-ok bg-em1`, warn `text-g7 bg-g1`, danger `text-sin bg-rose`, info `text-em5 bg-em1`, muted `text-ink6 bg-s1`). `EmptyState`: `{ title; body?; action? }`. — antigravity
- [x] T6. `Tabs` (radix Tabs, underline style `em7`) and `LinkTabs` (`{ tabs: { href; label; active }[] }` for URL tabs, horizontally scrollable on mobile). — antigravity
- [x] T7. `ConfirmDialog` (client, radix AlertDialog): `{ trigger: ReactNode; title; body; confirmLabel; tone?: "danger" | "default"; onConfirm: () => Promise<boolean> }` — pending state, closes on success. `Sheet` (client, radix Dialog): `{ open; onOpenChange; title; side?: "right" | "bottom"; children }` — bottom on < 768 px automatically. — antigravity
- [x] T8. Form fields (client), all wired with `react-hook-form` `Controller`/`register` through `FieldShell` (`label`, `hint`, `error`, `required`, ids + `aria-describedby`, 44 px inputs, `rounded-field`, `bg-cream`, focus `shadow-ring-focus`, error `shadow-ring-error`): `TextField` (`maxLength` counter optional), `TextArea` (rows prop), `NumberField` (int, `inputMode="numeric"`), `MoneyField` (₹ prefix, whole rupees), `SelectField` (native `<select>`), `SwitchField` (radix Switch), `CheckboxField`, `DateField` (native `date`). — antigravity
- [x] T9. `LocaleTabs` (client): `{ en: ReactNode; hi: ReactNode; hiEmpty?: boolean }` → "EN | हिंदी" segmented control; a gold dot on हिंदी when `hiEmpty`. — antigravity
- [x] T10. `FormBar` (client): `{ pending; dirty; cancelHref; saveLabel?: "Save" }` — desktop: right-aligned row; mobile: fixed above the bottom nav (`bottom-[calc(64px+env(safe-area-inset-bottom))]`) with "Unsaved changes" text when dirty. — antigravity
- [x] T11. `useActionForm` (client) exactly: `useActionForm({ schema, defaultValues, action, onSuccess?, successMessage? })` → `{ form, submit, pending }`; `zodResolver(schema)`, `mode: "onBlur"`; submit runs `action(values)` in `startTransition`; ok → `toast.ok(successMessage ?? "Saved")`, `form.reset(values)`, `onSuccess(data)`; not ok → `form.setError` for each `fieldErrors` key + `toast.err(errorText(code))`. Also export `useLeaveGuard(dirty: boolean)` (`beforeunload` while dirty). — antigravity
- [x] T12. `src/app/admin/(panel)/kit/page.tsx`: `if (env.NODE_ENV !== "development") notFound();` `await requireAdminPage("dashboard.view")`; renders every component above with sample rows/values (a demo form that only shows a toast — no server action). — antigravity
- [x] T13. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No feature screens. No new colours. No table library.

## Done-notes
- Created UI primitives in `src/components/admin/ui/`: PageHeader, Card, StatCard, DataTable, Pagination, SearchBox, FilterSelect, StatusBadge, EmptyState, Tabs, ConfirmDialog, Sheet.
- Created Form kit in `src/components/admin/form/`: FieldShell, TextField, TextArea, NumberField, MoneyField, SelectField, SwitchField, CheckboxField, DateField, LocaleTabs, FormBar, useActionForm, useLeaveGuard.
- Created development-only component showcase gallery at `src/app/admin/(panel)/kit/page.tsx`.
- Responsive tables transform to mobile cards (< 768px); Sheet slides from bottom on mobile; FormBar sticks above bottom nav when dirty.
- Migration added: no.

## Manual QA (user)
1. `pnpm dev` → `/admin/kit`: every component renders; at 390 px the table becomes cards, the form bar sits above the bottom nav, sheets open from the bottom.
2. Search box and filter change the URL; pagination keeps other params.
3. Demo form: required errors on blur; Save shows a toast; leaving with changes warns.
4. `pnpm build` passes (the kit page returns 404 in production).
