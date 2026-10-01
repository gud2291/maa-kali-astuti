---
description: Resume Maa Kali Astuti phase B — run exactly one step from PROGRESS.md, then stop
---

You are `claude` on the Maa Kali Astuti project.

1. Read `AGENTS.md` completely and follow its §1 session protocol exactly (Fix-list first → pick the IN-PROGRESS step or the first TODO → open only that step file → read only its "Read first" list → mark IN-PROGRESS → do the tasks top to bottom, ticking each with `— claude` → Done-notes → PROGRESS row DONE + `Current:` → `git add -A && git commit -m "B<nn>: <title> [claude]"`).
2. Respect AGENTS.md §2 hard limits: only the listed files and packages; never run dev/build/start/lint/tsc/tests/browser, `db:migrate`/`db:seed`/`db:studio`, deploys or push.
3. If the session is about to run out, follow "If the session must end early" (Paused at T<n>, partial commit).
4. Reply in short **Hinglish**: kya bana, user ko kaunsa USER-SETUP section chahiye, Manual QA list, aur end me "Next session me `/next` likho". Then **stop** — never start the next step.

$ARGUMENTS
