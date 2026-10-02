# B39 — Admin dashboard, badges, global search
**Risk:** M · **Needs:** B38 · **Agent:** any · **User setup before QA:** some test orders/bookings

## Goal
The admin home becomes a real dashboard (KPIs, 30-day revenue chart, top products, recent orders, upcoming consultations), the navigation shows "new" badges, and one search box finds orders, customers, products, bookings, Kundali orders and inquiries.

## Read first (only these)
- `docs/backend/RULES.md` §3, §5, §7
- `docs/backend/DATA-MODEL.md` §D, §F, §G, §H (indexes only)
- `design-brief/DESIGN-BRIEF.md` lines 641–644 (dashboard)
- `src/app/admin/(panel)/page.tsx`, `src/app/admin/(panel)/layout.tsx`, `src/components/admin/AdminShell.tsx`, `AdminSidebar.tsx`, `AdminMobileNav.tsx`, `AdminTopbar.tsx`, `nav.ts`
- `src/components/admin/ui/StatCard.tsx`, `DataTable.tsx`, `src/lib/core/ist.ts`, `src/lib/core/format.ts`

## Install
None (charts are hand-made SVG).

## Files
Create:
- `src/server/dashboard/queries.ts`, `src/server/search/admin.ts`
- `src/components/admin/dashboard/KpiGrid.tsx`, `RevenueChart.tsx`, `TopProducts.tsx`, `RecentOrders.tsx`, `UpcomingBookings.tsx`
- `src/app/admin/(panel)/search/page.tsx`, `src/components/admin/search/SearchResults.tsx`
Modify: `src/app/admin/(panel)/page.tsx`, `src/app/admin/(panel)/layout.tsx` (badge counts), `AdminShell.tsx`, `AdminSidebar.tsx`, `AdminMobileNav.tsx`, `AdminTopbar.tsx` (search box), `src/components/admin/nav.ts` (optional `badge` key per item)

## Tasks
- [x] T1. `dashboard/queries.ts` (`requireAdmin("dashboard.view")`; IST day/month boundaries via `ist.ts`; indexed ranges only): `getKpis()` → revenue today / this month (orders paid or COD placed, not cancelled), orders today, pending energization (`placed` + `energizing`), bookings today (confirmed, starting today), Kundali sales this month (count + ₹), open inquiries (new/contacted/call scheduled), low-stock products, needs-attention orders; `getRevenueSeries(30)` (one `GROUP BY` on the IST day); `getTopProducts(30, 5)` (order_items ⋈ orders, by quantity); `getRecentOrders(8)`; `getUpcomingBookings(8)`. — antigravity
- [x] T2. `getBadgeCounts()` (in the same file): new orders (`placed`), attention, new inquiries, new messages, pending reviews — one small query each, run in parallel; used by the panel layout. — antigravity
- [x] T3. `RevenueChart` (server SVG bar chart, 30 bars, gold bars on cream, axis labels every 5 days, value labels on hover via `<title>`, plus a visually hidden table for screen readers; responsive via `viewBox`). `KpiGrid` (`StatCard`s linking to the filtered lists), `TopProducts`, `RecentOrders`, `UpcomingBookings` (compact lists). — antigravity
- [x] T4. Dashboard page: roles without `orders.view` (editor) see only the content quick links (current welcome card); others see KPIs → chart → two columns (recent orders | upcoming consultations) → top products + low-stock list. Keep the `?denied=1` notice. — antigravity
- [x] T5. Badges: `nav.ts` items get `badge?: "orders" | "attention" | "inquiries" | "messages" | "reviews"`; sidebar/mobile nav show a small count pill (99+ max). — antigravity
- [x] T6. `search/admin.ts`: `adminSearch(q)` (2–60 chars) — orders (number, phone, email, name), customers (email, phone, name), products (name, slug, id), bookings (ref, phone), Kundali orders (ref, phone), inquiries (ref, phone); 5 per group; only the groups the role may view. — antigravity
- [x] T7. `AdminTopbar` search (≥ 1024 px input; mobile icon → full-width input) → `/admin/search?q=` → `SearchResults` (grouped links). — antigravity
- [x] T8. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No caching of admin numbers. No chart library. No unindexed full-table scans.

## Done-notes
- Created `src/server/dashboard/queries.ts`: `getKpis()`, `getRevenueSeries(30)`, `getTopProducts()`, `getRecentOrders()`, `getUpcomingBookings()`, `getLowStockProducts()`, `getBadgeCounts()`.
- Created `src/server/search/admin.ts`: `adminSearch(q)` covering orders, customers, products, bookings, kundali, inquiries (5/group, role-checked).
- Created dashboard components: `RevenueChart` (server SVG with accessible table), `KpiGrid`, `TopProducts`, `RecentOrders`, `UpcomingBookings`, `LowStockList`.
- Created search UI: `SearchResults` and `/admin/search` page.
- Updated `AdminTopbar`: desktop search input + mobile toggle bar submitting to `/admin/search?q=`.
- Updated `nav.ts`, `layout.tsx`, `AdminShell`, `AdminSidebar`, `AdminMobileNav` with dynamic badge count pills.
- Updated dashboard page: editors see content quick links; roles with `orders.view` see full operational dashboard.
- Migration added: no. All queries use indexed ranges and IST wall-to-UTC boundaries.

## Manual QA (user)
1. `/admin` shows today's/month revenue, counts and the 30-day chart that match your test data; KPI cards open the right filtered lists.
2. New COD order → the Orders badge increases; after moving it on, it decreases.
3. Search a phone number → its orders, bookings and inquiries appear; search a product name.
4. Editor role sees only content links.
5. `pnpm build` passes.
