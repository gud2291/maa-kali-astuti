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
- [x] T1. List the steps to audit (non-Claude or mixed agents) in AUDIT-REPORT with their commits. Steps done by Claude get a lighter pass in B46. — claude
- [x] T2. For each listed step, in order: `git show --stat` + read the changed files; check against the step spec and RULES — scope (no unlisted files/features), exact names/signatures, logic and edge cases, auth/permission guards, zod parsing, rate limits/Turnstile, idempotency and atomic patterns (stock, slots, coupons, payments, webhooks), cache tags + invalidation + JSON-safe cached data, indexes/N+1/pagination, server/client boundaries (`server-only`, `"use server"`), secrets, i18n (EN + HI), theme tokens/mobile/a11y, forbidden patterns. Fix in place (keep the specified behaviour). Tick the step's line in AUDIT-REPORT with findings + fixes. — claude
- [x] T3. A step too broken to repair here → mark it `REDO` in AUDIT-REPORT and add a Fix-list item in PROGRESS describing exactly what to redo. — claude
- [x] T4. Commit after every 2–3 audited steps: `B45 (partial): audit B<a>–B<b> [claude]`; final commit `B45: Final audit 1 [claude]`. — claude
- [x] T5. Finish per AGENTS.md §1 step 8 with a summary (counts of findings by severity, files changed, what the user must re-test). — claude

## Must not
- No new features or redesigns. No rewrites "for style" when the code meets the spec.

## Done-notes
- All 44 steps (B01–B44, antigravity) audited; per-step findings, fixes and the file list are in `docs/backend/AUDIT-REPORT.md`. No step needed `REDO`.
- Fixed ≈ 25 High (mostly build breaks: JSX in `.ts` server files, bad `AppError` args/codes, `res.error` / `toast.error` misuse, missing exports, client → server-only import, broken strings; plus unreachable COD refunds, unvalidated booking slots, stored-XSS links, seed/reset NOT NULL), ≈ 21 Medium, ≈ 14 Low.
- Cross-cutting API changes: `runAction` sends `message` only when the thrower gave one; `sendEmail` base64-encodes attachments; `periodStartKey` added to `src/lib/core/ist.ts`; `StoreSettings`/`ContactSettings`/`ConsultSettings`/`CourseSettings`/`InvoiceSettings` exported from `src/lib/validation/settings.ts`; COD collection now sets `cod_collected`.
- Settings schema is stricter: announcement links must be `http(s)://` or `/path`, social links `http(s)://`, notify emails valid emails — existing invalid rows fall back to defaults.
- Checks run (read-only): syntax parse, import resolution, client/server boundary, greps — all 0. Full type-check is left to the user's `pnpm build`.
- Someone else edited files during the audit (seed/settings null fix, two build fixes); those were reverted or left uncommitted, so they were redone/adopted here and committed.
- Left for B46 (Low): listed under "T5. Summary" in AUDIT-REPORT. Migration added: no.

## Manual QA (user)
Re-test every item the audit added to the Fix-list; then run `pnpm build` and report errors.
