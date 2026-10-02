# B27 — Kundali report content: Hindi, part 1
**Risk:** L · **Needs:** B26 · **Agent:** any (good step for another AI) · **User setup before QA:** none

## Goal
Natural Hindi versions of the labels and the shorter report sections. Anything not yet in Hindi falls back to English automatically.

## Read first (only these)
- `src/server/kundali/content/types.ts`, `src/server/kundali/content/index.ts`
- `src/server/kundali/content/en/labels.ts`, `lagna.ts`, `moon-sign.ts`, `nakshatra.ts`, `dasha.ts`, `doshas.ts`, `yogas.ts`, `remedies.ts`
- `src/lib/data/rashi.json` (`hi`, `lordHi` fields)

## Install
None.

## Files
Create: `src/server/kundali/content/hi/labels.ts`, `lagna.ts`, `moon-sign.ts`, `nakshatra.ts`, `dasha.ts`, `doshas.ts`, `yogas.ts`, `remedies.ts`, `index.ts`
Modify: `src/server/kundali/content/index.ts`

## Writing rules
- Write natural, simple Hindi in Devanagari (the tone of a respected guide), not word-for-word translation. Same meaning, same honesty rules as B26.
- Sanskrit/astrology terms in their usual Hindi form (लग्न, नक्षत्र, महादशा, साढ़ेसाती, मांगलिक, कालसर्प).
- Western digits for numbers. No English words in Devanagari script when a common Hindi word exists.
- Every file starts with `/* [client-review] Hindi draft for Sadhak Ji's review. */`.

## Tasks
- [x] T1. `hi/labels.ts` — every label from `en/labels.ts` (signs like "मेष", planets, 27 nakshatras, tithis, yogas, karanas, weekdays, section titles, table headers). — antigravity
- [x] T2. `hi/lagna.ts`, `hi/moon-sign.ts`, `hi/nakshatra.ts`. — antigravity
- [x] T3. `hi/dasha.ts`, `hi/doshas.ts`, `hi/yogas.ts`, `hi/remedies.ts` (incl. `gems`). — antigravity
- [x] T4. `hi/index.ts` exports `REPORT_HI: PartialReportContent` (without `planetInHouse` and `lifeArea` — B28 adds them). — antigravity
- [x] T5. `content/index.ts`: `getReportContent("hi")` = deep merge of `REPORT_EN` with `REPORT_HI` (Hindi value wins when present and non-empty). — antigravity
- [x] T6. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- Must not change the English files or the types.

## Done-notes
- Created: `src/server/kundali/content/hi/{labels,lagna,moon-sign,nakshatra,dasha,doshas,yogas,remedies,index}.ts`
- Modified: `src/server/kundali/content/index.ts`
- Decisions: Translated labels, ascendants, moon signs, 27 nakshatras, mahadashas, doshas, yogas, remedies, and gemstones into natural, respectful Hindi in Devanagari.
- Implemented recursive `deepMerge` in `content/index.ts` with memoization; Hindi values take precedence when non-empty, falling back to English for missing sections.
- Migration added: no.
- Next step note: B28 will supply `planetInHouse` and `lifeArea` for Hindi part 2.

## Manual QA (user)
Read samples (or send to Sadhak Ji). Rendering is tested in B29. `pnpm build` passes.
