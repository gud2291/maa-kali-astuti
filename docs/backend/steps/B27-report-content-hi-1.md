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
- [ ] T1. `hi/labels.ts` — every label from `en/labels.ts` (signs like "मेष", planets, 27 nakshatras, tithis, yogas, karanas, weekdays, section titles, table headers).
- [ ] T2. `hi/lagna.ts`, `hi/moon-sign.ts`, `hi/nakshatra.ts`.
- [ ] T3. `hi/dasha.ts`, `hi/doshas.ts`, `hi/yogas.ts`, `hi/remedies.ts` (incl. `gems`).
- [ ] T4. `hi/index.ts` exports `REPORT_HI: PartialReportContent` (without `planetInHouse` and `lifeArea` — B28 adds them).
- [ ] T5. `content/index.ts`: `getReportContent("hi")` = deep merge of `REPORT_EN` with `REPORT_HI` (Hindi value wins when present and non-empty).
- [ ] T6. Finish per AGENTS.md §1 step 8.

## Must not
- Must not change the English files or the types.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
Read samples (or send to Sadhak Ji). Rendering is tested in B29. `pnpm build` passes.
