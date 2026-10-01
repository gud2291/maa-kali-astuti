# B35 — Rashifal manager + API
**Risk:** M · **Needs:** B34 · **Agent:** any · **User setup before QA:** none

## Goal
Sadhak Ji's team writes daily / weekly / monthly / yearly Rashifal for the 12 rashis (EN + HI, optional scores and lucky number/colour), also in advance. The site shows the written text for the visitor's date and falls back to the current template text where nothing is written yet.

## Read first (only these)
- `docs/backend/RULES.md` §4–§6
- `docs/backend/DATA-MODEL.md` §E (`rashifal_entries`)
- `src/lib/astro/predict.ts`, `src/lib/astro/rashi.ts` (exports only)
- `src/components/sections/rashifal/RashifalGrid.tsx`, `RashiDetail.tsx`, `period.tsx`, `src/components/sections/home/RashifalSection.tsx`, `RashifalWheel.tsx` (where predictions are produced/consumed)
- `src/lib/core/ist.ts`, `src/server/cache.ts`, `src/components/admin/nav.ts`, admin kit file list

## Install
None.

## Files
Create:
- `src/lib/validation/rashifal.ts`, `src/server/rashifal/periods.ts`, `src/server/rashifal/queries.ts`, `src/server/rashifal/admin.ts`, `src/server/rashifal/admin-actions.ts`
- `src/app/api/rashifal/route.ts`, `src/lib/hooks/useRashifal.ts`
- `src/app/admin/(panel)/content/rashifal/page.tsx`, `src/components/admin/rashifal/RashifalEditor.tsx`, `CoverageStrip.tsx`
Modify: the rashifal/home components that render predictions (use `useRashifal` with template fallback), `src/components/admin/nav.ts` (+ Rashifal `sun`, Content, `content.edit`)

## Tasks
- [ ] T1. `periods.ts` (pure): `periodStart(period, dayKey)` (day → itself; week → Monday; month → `yyyy-mm-01`; year → `yyyy-01-01`) and `uiPeriodToQuery(p: "today" | "tomorrow" | "week" | "month" | "year", todayKey) → { period, startsOn }`.
- [ ] T2. `rashifal/queries.ts`: `getRashifal(period, startsOn)` = `cached("rashifal", …, () => [TAG.rashifal])` → published rows for that start (unique index) as `{ rashi, text: Loc, scores, lucky }[]`.
- [ ] T3. `GET /api/rashifal?p=<ui period>&d=<viewer IST yyyy-mm-dd>` (d within ±2 days of the server's IST today, else today) → `{ period, startsOn, entries }`; `Cache-Control: public, s-maxage=600, stale-while-revalidate=3600`.
- [ ] T4. `useRashifal(p)` (client): computes the viewer's IST day after mount, fetches once per (p, day), returns `Map<rashi, entry>` + status. Components show the entry text (`loc`) and its scores/lucky values when present, otherwise the existing template output — same markup and motion; no layout shift (keep the template text visible until the fetch resolves, then swap).
- [ ] T5. `rashifal.ts` schema: period, startsOn (must equal `periodStart`), 1–12 entries (`rashi`, text EN 20–1500, HI ≤ 1500, scores 1–5 each or null, lucky `{ number 1–99, colour Loc }` or null, status).
- [ ] T6. `rashifal/admin.ts` (`content.edit`; audit): `getPeriodEntries(period, startsOn)`, `savePeriodEntries(period, startsOn, entries)` (one batch upsert on `rashifal_uniq`), `coverage(fromKey, toKey)` (which day/week/month/year starts have all 12 published). `admin-actions.ts` → `invalidate(TAG.rashifal)`.
- [ ] T7. `/admin/content/rashifal` → `RashifalEditor` (period select + date picker snapped to the period start; 12 rashi cards with EN/HI textareas, optional scores/lucky, publish switch; "Save all"; unsaved guard) + `CoverageStrip` (next 14 days / 8 weeks: filled vs empty).
- [ ] T8. `nav.ts` item.
- [ ] T9. Finish per AGENTS.md §1 step 8.

## Must not
- Must not remove the template generator (it is the fallback). No server rendering of date-dependent text (keeps pages static).

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. Admin → Rashifal → Day = today → write Mesha (EN + HI) → Save → `/rashifal/mesha` (Today) and `/hi/rashifal/mesha` show it; other rashis still show the template text.
2. Write tomorrow's entries → the "Tomorrow" tab shows them; the coverage strip marks the day.
3. Week/month entries appear on their tabs; the home wheel uses today's text.
4. `pnpm build` passes.
