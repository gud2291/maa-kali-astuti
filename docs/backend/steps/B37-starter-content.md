# B37 — Starter articles + policy drafts (content)
**Risk:** L · **Needs:** B36 · **Agent:** any (good step for another AI) · **User setup before QA:** run `pnpm db:seed` after this step

## Goal
Real text for the 6 seeded journal articles and the 5 policy pages, inserted by the seed **only where the body is still empty** (never overwrites admin edits). Everything is a draft for client review.

## Read first (only these)
- `docs/backend/DATA-MODEL.md` §B (`RichDoc`, `RichNode`)
- `src/lib/validation/rich.ts`, `scripts/db/seed.ts`, `scripts/db/client.ts`
- `src/lib/data/articles.json` (titles), `src/lib/routes.ts` (`POLICIES`)
- `client-requirements/client-requirements.md` → sections "## 4." and "## 5." (voice + product facts)
- Settings defaults in `src/lib/validation/settings.ts` (`store` days/fees, `consult` reschedule rule) — quote these numbers, don't invent others

## Install
None.

## Files
Create: `scripts/db/content/rich.ts`, `scripts/db/content/articles.ts`, `scripts/db/content/policies.ts`
Modify: `scripts/db/seed.ts` (two new sections at the end)

## Writing rules
- Voice: calm, honest, practical, no fear or superstition, no guaranteed outcomes; never medical/legal/financial advice.
- Facts only from the files above; anything uncertain is written neutrally (e.g. "within the return window shown at checkout").
- Plain English, short paragraphs, `h2`/`h3` structure for the TOC. Hindi: titles + excerpts + FAQ in natural Hindi; article bodies English only (admins may add Hindi bodies later).
- Policies: Indian context; Privacy follows the DPDP Act 2023 spirit (what is collected, why, retention — palm photos deleted 30 days after the report — rights, contact); Refund & Returns uses 7 days `[client-confirm]` and the refund timing "5–7 working days"; Shipping uses the store dispatch/delivery day ranges and the Mahapuja energization step; Terms covers orders, pricing, COD, consultations (reschedule rule), Kundali reports, intellectual property, governing law India; Astrology Disclaimer: guidance, not a guarantee or a substitute for professional advice.
- Every file starts with `/* [client-review] Draft content. */`.

## Tasks
- [ ] T1. `content/rich.ts`: tiny builders `doc(...)`, `p(text | parts)`, `h2(text)`, `h3(text)`, `ul([...])`, `ol([...])`, `quote(text)`, `b(text)`, `i(text)`, `a(text, href)` producing valid `RichDoc` JSON (passes `richDocSchema`).
- [ ] T2. `content/articles.ts`: for each of the 6 seeded slugs: `excerpt` EN/HI (≤ 300 chars), `titleHi`, `body` EN (500–800 words, 3–5 `h2` sections), `faq` (3 × Q/A EN + HI), `readMins` (from word count). Topics = the 6 titles in `articles.json` (rudraksha authenticity checks; crystal bracelet by rashi; Baglamukhi amulet rules; 5 vs 7 Mukhi; Bitter Havan method; why exact birth time matters).
- [ ] T3. `content/policies.ts`: the 5 policies (EN bodies 400–900 words, `titleHi`).
- [ ] T4. `seed.ts`: section 15 — for each article slug whose `body_en` has no content, update `excerpt_en/hi`, `title_hi`, `body_en`, `faq`, `read_mins`; section 16 — for each policy slug whose `body_en` has no content, update `body_en`, `title_hi`. Both print `seed: … +<updated>`.
- [ ] T5. Finish per AGENTS.md §1 step 8 (Done-notes: word counts; "run `pnpm db:seed`").

## Must not
- No changes to app code. Never overwrite non-empty bodies.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `pnpm db:seed` → articles +6, policies +5 (second run +0).
2. `/blog` shows the 6 articles with excerpts; each article has headings, TOC and FAQ; `/policies/*` show the drafts.
3. Send the drafts to the client for review (they are marked `[client-review]`).
