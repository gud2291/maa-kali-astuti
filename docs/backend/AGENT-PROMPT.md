# AGENT-PROMPT — starting another AI (Antigravity, Codex, Cursor, Gemini …)

1. Open this project folder in that tool, start a **new chat/session**.
2. Paste the prompt below. Replace `<NAME>` with a short lower-case name for that tool (e.g. `antigravity`).
3. When it finishes, do the step's Manual QA. Problems → write them under **Fix-list** in `PROGRESS.md` (or tell the next session).
4. One step per session. For the next step, open a fresh session and paste the same prompt again.

---

```
You are working on the Maa Kali Astuti project in this folder. Your agent name is: <NAME>.
Read AGENTS.md completely and follow it exactly. Then open PROGRESS.md and do ONLY the one step it
points to (resume it if it is IN-PROGRESS; fix the Fix-list first if it has open items). Read only the
files that step's "Read first" list names. Do not run dev, build, start, lint, tsc, tests, migrations,
seeds or a browser, and do not push. Create or change only the files the step lists, with the exact
names it gives; add nothing extra and leave nothing half-done. Tick each task with your name as soon as
it is finished. If anything is unclear, write a BLOCKER and stop instead of guessing. When all tasks are
done: write the Done-notes, mark the step DONE in PROGRESS.md with your name and today's date, make one
local git commit "B<nn>: <title> [<NAME>]", then STOP and tell me what to test. Do not start the next step.
```

---

**If the tool stops in the middle** (limit/crash): open a new session and paste the same prompt — it resumes from the first unticked task of the `IN-PROGRESS` step.

**Steps marked "Claude only"** (B45, B46): the other AI must refuse them; run them in Claude Code with `/next`.
