# B28 — Kundali report content: Hindi, part 2
**Risk:** L · **Needs:** B27 · **Agent:** any (good step for another AI) · **User setup before QA:** none

## Goal
Hindi for the two long sections — planet-in-house (108 blocks) and life areas (72 blocks) — so the Hindi report is fully Hindi.

## Read first (only these)
- `src/server/kundali/content/types.ts`, `src/server/kundali/content/hi/index.ts`
- `src/server/kundali/content/en/planet-in-house.ts`, `src/server/kundali/content/en/life-area.ts`
- `src/server/kundali/content/hi/lagna.ts` (first 3 entries — match their style)

## Install
None.

## Files
Create: `src/server/kundali/content/hi/planet-in-house.ts`, `src/server/kundali/content/hi/life-area.ts`
Modify: `src/server/kundali/content/hi/index.ts` (add both)

## Writing rules
Same as B27.

## Tasks
- [x] T1. `hi/planet-in-house.ts` — 9 × 12 blocks (30–40 words each). — antigravity
- [x] T2. `hi/life-area.ts` — 6 × 12 blocks (40–50 words each). — antigravity
- [x] T3. `hi/index.ts`: include both; `REPORT_HI` now covers every key of `ReportContent`. — antigravity
- [x] T4. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- Must not change English files, types or other Hindi files.

## Done-notes
- Created: `src/server/kundali/content/hi/planet-in-house.ts`, `src/server/kundali/content/hi/life-area.ts`
- Modified: `src/server/kundali/content/hi/index.ts`
- Decisions: Authored 108 blocks (9 grahas × 12 houses, 30–40 words each) and 72 blocks (6 life areas × 12 signs, 40–50 words each) in dignified, natural Devanagari Hindi.
- `REPORT_HI` in `hi/index.ts` now fully covers every key of `ReportContent` (typed as `ReportContent`).
- Migration added: no.
- Next step note: B29 will render the complete Kundali report document with both English and Hindi support.

## Manual QA (user)
Read samples. `pnpm build` passes.
