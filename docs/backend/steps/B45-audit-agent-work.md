# B45 — Final audit 1: review every step done by other agents
**Risk:** — · **Needs:** B44 · **Agent:** **Claude only** · **User setup before QA:** none
This step may take several sessions: tick per audited step, pause with `Paused at`, resume next session.

## Goal
Make sure work done by other AIs (Agent column ≠ `claude`, or mixed) follows the step specs and RULES exactly: correct logic, security, performance and scale, no improvised features or half-done code. Fix what is wrong; write everything down.

## Read first (only these)
- `AGENTS.md`, `docs/backend/RULES.md`, `docs/backend/ARCHITECTURE.md`, `docs/backend/DATA-MODEL.md` (as needed per step)
- `PROGRESS.md` (Agent column) and, per audited step, its step file (Tasks, Must not, Done-notes)
- `git log --format="%h %s"` to map commits to steps (`B<nn>: … [agent]`, `B<nn> (partial): …`)

## Install
None.

## Files
Create: `docs/backend/AUDIT-REPORT.md`
Modify: any source file that needs a fix (list every one in AUDIT-REPORT), `PROGRESS.md` (Fix-list entries for anything the user must re-test)

## Tasks
- [ ] T1. List the steps to audit (non-Claude or mixed agents) in AUDIT-REPORT with their commits. Steps done by Claude get a lighter pass in B46.
- [ ] T2. For each listed step, in order: `git show --stat` + read the changed files; check against the step spec and RULES — scope (no unlisted files/features), exact names/signatures, logic and edge cases, auth/permission guards, zod parsing, rate limits/Turnstile, idempotency and atomic patterns (stock, slots, coupons, payments, webhooks), cache tags + invalidation + JSON-safe cached data, indexes/N+1/pagination, server/client boundaries (`server-only`, `"use server"`), secrets, i18n (EN + HI), theme tokens/mobile/a11y, forbidden patterns. Fix in place (keep the specified behaviour). Tick the step's line in AUDIT-REPORT with findings + fixes.
- [ ] T3. A step too broken to repair here → mark it `REDO` in AUDIT-REPORT and add a Fix-list item in PROGRESS describing exactly what to redo.
- [ ] T4. Commit after every 2–3 audited steps: `B45 (partial): audit B<a>–B<b> [claude]`; final commit `B45: Final audit 1 [claude]`.
- [ ] T5. Finish per AGENTS.md §1 step 8 with a summary (counts of findings by severity, files changed, what the user must re-test).

## Must not
- No new features or redesigns. No rewrites "for style" when the code meets the spec.

## Done-notes
_(Claude: ≤ 12 lines)_

## Manual QA (user)
Re-test every item the audit added to the Fix-list; then run `pnpm build` and report errors.
