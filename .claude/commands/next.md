---
description: Resume the Maa Kali Astuti build — run the next pending step from PROGRESS.md, then stop
---

You are continuing the Maa Kali Astuti website build. Follow `CLAUDE.md` strictly.

1. Read `PROGRESS.md`. If the **Fix-list** has open items, fix them first (read only the files they touch), then tick them.
2. Take the **first step whose status is not DONE**. Set it to IN-PROGRESS.
3. Read **only** that step's *Read* list. Read design files only by the line ranges in `docs/DESIGN-INVENTORY.md`. Don't open other docs unless the step needs them.
4. Do every task in the step. Write complete, production-quality code, 1:1 with the design.
   - Do NOT run dev, build, start, tsc, lint or tests, and do NOT open a browser. The user checks manually.
   - Routine commands (pnpm add/install, `node scripts/*`, git add/commit, file ops) need no permission.
   - Use the agents or skills listed for the step in `docs/WORKFLOW.md` only where the step says so.
5. Finish:
   - Tick the tasks, set the status to DONE, and update "Next step" at the top of PROGRESS.md.
   - Write **Done-notes** (key files created, decisions, anything the next step must know).
   - Write a **Manual QA** checklist (routes, what to compare with `design/shots/*`, mobile 390px + desktop 1440px checks).
   - Add any new placeholders to the Client-confirm list.
   - `git add -A` and `git commit -m "F<n>: <title>"`. Never push.
6. Reply in short **Hinglish**: what was done, what to check manually, and "Next session me `/next` likho". Then **stop**. Don't start the next step.

$ARGUMENTS
