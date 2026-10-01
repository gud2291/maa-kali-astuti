# B26 — Kundali report content: English
**Risk:** L · **Needs:** B25 · **Agent:** any (good step for another AI) · **User setup before QA:** none

## Goal
The English text library the ₹99 report is built from. Every block is a draft for Sadhak Ji's review.

## Read first (only these)
- `docs/backend/RULES.md` §1
- `src/server/kundali/content/types.ts`, `src/server/kundali/engine/yogas.ts` (`YOGA_KEYS`)
- `src/lib/data/rashi.json`, `nakshatra.json`, `graha.json` (names only)
- `client-requirements/client-requirements.md` → section "## 4." (the voice: scientific, honest, no superstition)
- `design-brief/DESIGN-BRIEF.md` lines 553–565 (§7.10)

## Install
None.

## Files
Create: `src/server/kundali/content/en/labels.ts`, `lagna.ts`, `moon-sign.ts`, `nakshatra.ts`, `planet-in-house.ts`, `life-area.ts`, `dasha.ts`, `doshas.ts`, `yogas.ts`, `remedies.ts`, `index.ts`, and `src/server/kundali/content/index.ts`

## Writing rules (apply to every block)
- Voice of Sadhak Pawan Pandey's practice: calm, honest, practical, second person ("you"). Science-minded, no fear, no superstition, no doom.
- Never promise outcomes. No medical, legal or financial advice — suggest seeing a professional where relevant. No caste, no gender stereotypes.
- Remedies: mantra, daan (charity), discipline and seva first; gemstones/rudraksha only as optional support.
- Plain English, short sentences, no jargon without a two-word explanation. No mention of AI.
- Every file starts with `/* [client-review] Draft text for Sadhak Ji's review. */`.
- Lengths (words): lagna body 110–140 · moon sign 70–90 · nakshatra 50–70 · planet-in-house 30–40 · life area 40–50 · mahadasha 60–80 · Manglik / Kaal Sarp present/absent 70–90 · Sade Sati phases 60–80 · yoga body 40–60 · remedy per planet 40–60 · gem note 30–40.

## Tasks
- [ ] T1. `labels.ts`: sign names (Mesha … Meena with English gloss, e.g. "Mesha (Aries)"), planet names, 27 nakshatra names, 30 tithi names (Pratipada … Purnima / Amavasya), 27 yoga names (Vishkambha … Vaidhriti), 11 karana names, weekdays, every section title and table header the report needs (cover, birth details, panchang, charts, planetary positions, dasha, doshas, yogas, life areas, gemstones, remedies, disclaimer).
- [ ] T2. `lagna.ts` — 12 × `{ title, body }` (temperament, strengths, watch-outs, life approach).
- [ ] T3. `moon-sign.ts` — 12 (mind and emotions). `nakshatra.ts` — 27 (nature, gifts, care points).
- [ ] T4. `planet-in-house.ts` — 9 planets × 12 houses = 108 blocks.
- [ ] T5. `life-area.ts` — career (10th), marriage (7th), health (6th), money (2nd/11th), family (4th), education (5th) × the 12 signs that can occupy that house = 72 blocks.
- [ ] T6. `dasha.ts` — 9 Mahadasha themes. `doshas.ts` — Manglik and Kaal Sarp (present/absent, each explaining that a single factor never decides a life and how to work with it), Sade Sati (rising/peak/setting/none).
- [ ] T7. `yogas.ts` — one `{ title, body }` per `YOGA_KEYS` entry. `remedies.ts` — per planet remedy text + `gems` per lagna sign (`gem`, `rudraksha`, `mantra`, `note`) following classical lagna-lord logic.
- [ ] T8. `en/index.ts` exports `REPORT_EN: ReportContent` assembled from the files (type-checked: every key present).
- [ ] T9. `content/index.ts`: `getReportContent(lang: "en" | "hi"): ReportContent` — English for now (B27 adds the Hindi merge).
- [ ] T10. Finish per AGENTS.md §1 step 8 (Done-notes: total word count; "all blocks [client-review]").

## Must not
- No code outside these files. No content copied from websites (original writing only).

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
Read a few blocks in each file (or send them to Sadhak Ji). Report rendering is tested in B29. `pnpm build` passes.
