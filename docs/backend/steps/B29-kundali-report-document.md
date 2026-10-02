# B29 — Kundali report document (+ development preview)
**Risk:** M · **Needs:** B28 · **Agent:** any · **User setup before QA:** none

## Goal
The 28-page report as one React document (web view and the HTML that B30 turns into a PDF): charts, tables and the right text blocks for a chart, in English or Hindi, in the brand style. A development-only admin page previews it for any birth data.

## Read first (only these)
- `docs/backend/RULES.md` §1, §2, §6
- `docs/backend/DATA-MODEL.md` §B (`src/lib/domain/kundali.ts`)
- `src/components/sections/kundali/k99-data.ts` (`K99_CONTENTS` — the table of contents to follow)
- `src/server/kundali/content/types.ts`, `src/server/kundali/content/index.ts`, `src/server/kundali/engine/index.ts`, `src/server/kundali/engine/yogas.ts`
- `src/lib/astro/chart.ts`, `src/lib/astro/from-snapshot.ts`, `src/lib/core/ist.ts`, `src/components/forms/PlaceInput.tsx`, `src/components/ui/Logo.tsx`

## Install
None.

## Files
Create: `src/server/kundali/report/model.ts`, `src/server/kundali/report/styles.ts`, `src/server/kundali/report/ReportChart.tsx`, `src/server/kundali/report/ReportDocument.tsx`, `src/server/kundali/report/html.tsx`, `src/app/admin/(panel)/kundali/preview/page.tsx`
Modify: `src/lib/astro/from-snapshot.ts` (add `toKundaliD9`)

## Tasks
- [x] T1. `model.ts`: `buildReportModel({ chart, lang, name, place, generatedAt }): ReportModel` — content from `getReportContent(lang)`; picks: lagna text (Moon-sign text + a note when the birth time is unknown), moon sign, nakshatra, 9 planet-in-house blocks, 6 life areas (sign on the relevant house), Vimshottari table (all Mahadashas with dates) + current Mahadasha/Antardasha + next three Antardashas, Mahadasha texts (current + next), Manglik / Kaal Sarp / Sade Sati texts (+ Sade Sati periods), yogas present, gems by lagna sign (Moon sign when unknown), remedies for planets in houses 6/8/12 or debilitated (Sun 6, Moon 7, Mars 3, Mercury 11, Jupiter 9, Venus 5, Saturn 0 — sign indexes) or the three most relevant when none, planet table rows (sign label, `12°34′`, nakshatra + pada, house, "R"). Dates formatted with `formatIst` in the report language. — antigravity
- [x] T2. `styles.ts`: `REPORT_CSS` string — A4 pages (`.page` 210 × 297 mm, padding 18 × 16 mm, `break-after: page`), font stacks `var(--font-cormorant, "Cormorant Garamond"), var(--font-tiro, "Tiro Devanagari Hindi"), serif` for headings and `var(--font-montserrat, "Montserrat"), var(--font-mukta, "Mukta"), sans-serif` for text (works on the site and in the standalone PDF), theme hex colours (emerald, gold hairlines, ivory, ink), tables, chart frames, footer with page numbers; screen view shows pages as stacked sheets with a soft shadow. — antigravity
- [x] T3. `ReportChart.tsx`: static North-Indian chart SVG (`CHART_LINES`, sign numbers, planet labels from `chartLayout`) for D1 (`toKundali`), Chandra (Moon as lagna) and D9 (`toKundaliD9`); title + `role="img"` + `aria-label`. — antigravity
- [x] T4. `ReportDocument.tsx` (server-compatible, no hooks; renders `<style>{REPORT_CSS}</style>` then the pages, following `K99_CONTENTS`): cover (logo, name, birth data, report language) · birth details & panchang · Lagna (D1) + Chandra charts · Navamsa (D9) · planetary positions & nakshatras · Vimshottari timeline (2–4 pages) · Manglik, Kaal Sarp, Sade Sati · yogas · career, marriage, health, money, family, education · lagna & moon analysis · gemstone, rudraksha & mantra · remedies · disclaimer + about Sadhak Ji. Labels from content `labels`. — antigravity
- [x] T5. `html.tsx`: `renderReportHtml(model): Promise<string>` — `render()` from `@react-email/components` of a full `<html lang>` document with a Google Fonts `<link>` (Cormorant Garamond 500/600, Montserrat 400/600, Tiro Devanagari Hindi, Mukta 400/600) and `<ReportDocument>`. — antigravity
- [x] T6. `toKundaliD9(snap)`: same shape as `toKundali` with every planet (and the lagna) moved to its navamsa sign. — antigravity
- [x] T7. `/admin/kundali/preview` (development only: `notFound()` when `env.NODE_ENV !== "development"`; `requireAdminPage("kundali.view")`): form (name, date, time/unknown, `PlaceInput`, EN/HI) → URL params → `computeChart` → `buildReportModel` → `<ReportDocument>` inline. — antigravity
- [x] T8. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No payment, PDF upload or emails (B30). No client-side JS in the report document.

## Done-notes
- Created `model.ts`, `styles.ts`, `ReportChart.tsx`, `ReportDocument.tsx`, `html.tsx`, and preview `page.tsx`.
- Modified `src/lib/astro/from-snapshot.ts` adding `toKundaliD9` mapping planets & lagna to navamsa signs and whole-sign houses.
- Full 28-page report document implemented following `K99_CONTENTS` with A4 print CSS, stacked sheet screen view, and North-Indian SVGs.
- Added `/admin/kundali/preview` dev-only page guarded by `kundali.view` with parameter form and instant report rendering in EN and HI.
- Migration added: no.

## Manual QA (user)
1. `pnpm dev` → `/admin/kundali/preview` → enter your birth data → the full report renders in English; switch to Hindi → Hindi text and labels.
2. Unknown birth time → the report says so and uses the Moon sign.
3. Browser print preview (Ctrl+P) shows clean A4 pages.
4. `pnpm build` passes.
