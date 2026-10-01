# AGENTS.md — rules for every AI on this repo (Claude, Antigravity, Codex, Cursor, Gemini, …)

Project: **Maa Kali Astuti** (sadhakpawanpandey.com) — Next.js 16 storefront + admin panel, Turso DB, Razorpay. English + Hindi.
Phase: **B** (backend · admin · real commerce). The frontend (phase F) is finished — never redesign it.
Several AIs share this work, one step at a time. **Follow this file exactly. Do not improvise.**

## 0. Your agent name
The user tells you your name (e.g. `antigravity`, `codex`, `cursor`, `claude`). Write it in lower case wherever this file says `<agent>`.
If you were not given a name, ask for it before editing anything.

## 1. Session protocol — in this order, every session
1. Read this file completely.
2. Open `PROGRESS.md`. Do not open any other doc yet.
3. **Fix-list first.** Unticked items there come from the user's manual testing: fix only those (read only the files they mention), tick each with `— <agent>`, commit `git add -A && git commit -m "Fix: <short summary> [<agent>]"`. Then continue with step 4.
4. **Pick the step.**
   - A row with status `IN-PROGRESS` → resume it, even if another agent started it.
   - Otherwise the first `TODO` row whose previous step is `DONE`.
   - A `BLOCKED` row → stop and tell the user its blocker.
   - The step says **Claude only** and you are not Claude → stop and tell the user.
5. Open that step's file (`docs/backend/steps/…`). Read **only** its "Read first" list, and only the parts named. Never open `docs/frontend/**`, `design/**`, `design-brief/**`, `client-requirements/**` or old git history unless the step names them.
6. In `PROGRESS.md` set the row to `IN-PROGRESS`, Agent = `<agent>` (if someone already worked on it: `theirname+<agent>`), Date = today. Save.
7. Do the tasks **top to bottom**. Skip tasks already ticked. Right after finishing a task, tick it in the step file: `- [x] T3. … — <agent>`.
8. When every task is ticked:
   - write **Done-notes** in the step file (≤ 12 lines: files created/changed, decisions, "migration added: yes/no", anything the next step must know);
   - leave **Manual QA** for the user as it is (add lines only if you built something extra the user must check);
   - in `PROGRESS.md` set the row `DONE` (Agent + Date) and update `Current:` to the next step;
   - commit: `git add -A && git commit -m "B<nn>: <step title> [<agent>]"`.
9. Reply to the user (short): what you built, which USER-SETUP section they need, and the Manual QA list. Then **STOP**. Never start the next step in the same session.

### If the session must end early (limit reached, error, user stops you)
Leave finished tasks ticked and unfinished ones unticked. Under Done-notes write `Paused at T<n>: <one line: what is half-done>`. Keep the row `IN-PROGRESS`. Commit `B<nn> (partial): <title> [<agent>]`. The next agent continues from the first unticked task.

### If something is unclear, missing or contradictory
Do **not** guess and do **not** invent. Write `BLOCKER: <exact question>` under Done-notes and in `PROGRESS.md → Blockers`, set the row `BLOCKED`, commit, ask the user, stop.

## 2. Hard limits
- Do **only** the current step. No "while I'm here" fixes, refactors, renames or reformatting outside it.
- Create / modify / delete **only** the files listed in the step's **Files** section (`messages/en.json` and `messages/hi.json` only when listed). Need another file? → BLOCKER.
- Install **only** what the step's **Install** line says, with those versions.
- Names in the docs are binding: file paths, function names and signatures, types, table and column names, cache tags, env vars, routes. Use them exactly.
- No extra functions, components, abstractions, options or "nice to have" features beyond the tasks. No TODO / FIXME, stubs, mocks, placeholders or half-done code: everything you write is complete. If a function is only used by a later step, the step file says so.
- **Never run:** `pnpm dev | build | start | lint`, `next …`, `tsc`, `eslint`, any tests, a browser or preview, `pnpm db:migrate | db:seed | db:studio`, deploy commands, `git push` / rebase / amend / force.
  **Allowed:** `pnpm add` / `pnpm remove` (Install list only), `pnpm install`, `pnpm db:generate` (only when the step says), `node scripts/<file>` named by the step, `git add | commit | status | diff | log | show`, read-only shell commands (ls, grep, cat, node -e for printing JSON shapes).
- Never edit `.env.local` or any secret. Never print secrets. `.env.example` only when a step lists it.
- Never edit `drizzle/` by hand, `design/**`, or these docs: `AGENTS.md`, `CLAUDE.md`, `docs/backend/*.md` — except your step file's checkboxes / Done-notes, `PROGRESS.md`, and files a step lists explicitly.

## 3. Code rules (full list: `docs/backend/RULES.md` — the step tells you when to read it)
- TypeScript strict; no `any`, no `@ts-ignore`; explicit return types on exports.
- `src/server/**` starts with `import "server-only"`; Server Action files start with `"use server"`, wrap every action in `runAction`, parse input with zod, check auth/permission (`requireAdmin`, `requireCustomer`), rate-limit public mutations.
- Never trust prices, totals, stock, roles or ids from the browser. Use the atomic DB patterns in ARCHITECTURE §5.
- Storefront pages stay static; cached reads use `cached()` + tags; admin writes call `invalidate()`.
- UI uses only the theme tokens/components; mobile-first (390 px), then 768 / 1024 / 1440; accessible; EN + HI strings.
- Next.js 16 APIs: use `docs/backend/NEXT16.md` first; open `node_modules/next/dist/docs/` only for an API not covered there.

## 4. Where things are
| Need | File |
|---|---|
| What to do now | `PROGRESS.md` → the current step file in `docs/backend/steps/` |
| Why / scope / decisions | `docs/backend/PLAN.md` |
| Folders, layers, caching, auth, payments, uploads | `docs/backend/ARCHITECTURE.md` |
| Tables, enums, JSON shapes, settings | `docs/backend/DATA-MODEL.md` |
| Coding rules + forbidden patterns | `docs/backend/RULES.md` |
| Next.js 16 APIs we use | `docs/backend/NEXT16.md` |
| Accounts / env vars / commands (for the user) | `docs/backend/USER-SETUP.md` |
| Finished frontend docs (reference only) | `docs/frontend/` |

## 5. Final audit
Claude reviews every step at the end (B45–B46), first the ones done by other agents (Agent column). Work that breaks a step spec or a rule is fixed or redone — so follow the spec exactly.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
