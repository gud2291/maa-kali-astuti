# CLAUDE.md — Maa Kali Astuti (sadhakpawanpandey.com)

Follow **`AGENTS.md`** exactly — it is the protocol for every AI on this repo. Your agent name is `claude`.

- `/next` (or "next" / "aage") = run AGENTS.md §1 for exactly one step, then stop.
- Reply to the user in short **Hinglish**. Code, comments and docs stay in English.
- Routine commands allowed in AGENTS.md §2 need no permission; everything forbidden there stays forbidden (no dev/build/tsc/lint/tests/browser, no migrate/seed, no push).
- Token saving: never open `docs/frontend/**` or `design/**` unless the current step names them; read docs only by the sections the step lists.
- B45–B46 are **Claude only**: audit other agents' work against the step specs and `docs/backend/RULES.md`, fix it, write `docs/backend/AUDIT-REPORT.md`.
- When the user starts another AI, give them `docs/backend/AGENT-PROMPT.md`.
