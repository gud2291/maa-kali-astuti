# CLAUDE.md — Maa Kali Astuti (sadhakpawanpandey.com)

Premium astrology + spiritual e-commerce site. Next.js on Vercel (free plan), EN + HI.
Current phase: **F — Frontend for client demo** (backend/admin/SEO come later).

## Session protocol (every session)
1. The user types `/next` (or "next" / "aage"): open `PROGRESS.md`, find the first step that is not DONE, and do **only that step**.
2. Read **only** the files in that step's *Read* list. Read design files **only by the line ranges** in `docs/DESIGN-INVENTORY.md` (Home.dc.html alone is ~55k tokens).
3. If `PROGRESS.md` → *Fix-list* has open items from the user's manual QA, fix those first.
4. When the step ends:
   - tick its tasks, set it to DONE, and write *Done-notes* (what was built, file paths, anything the next step must know);
   - add a *Manual QA* checklist for the user;
   - make a local commit: `git add -A && git commit -m "F<n>: <title>"` (never push);
   - reply in short Hinglish: what was done, what to check, and "next session me `/next` likho".
   - **Stop. Never start the next step in the same session.**

## Hard rules
- **NEVER run** `pnpm dev|build|start`, `npm run …`, `next dev|build`, `tsc`, `eslint`, tests, or any browser/preview/screenshot tool. The user does all QA manually. Just write correct code.
- Don't ask permission for routine commands (pnpm add/install, git add/commit, file ops, `node scripts/*`).
- Reply to the user in **Hinglish**. Code, comments and docs are in **English**.
- **Design fidelity is 1:1** with `design/*.dc.html` + `design/mka-*.js`: same px, colours, copy, states, motion timings. No "improvements", no new colours or fonts. See `docs/DESIGN-TO-CODE.md`.
- Mobile-first. The mobile-only patterns (tab bar, quick actions, rashi dial, shorts row, bottom sheets) are real components, not a shrunk desktop.
- Every animation needs its `prefers-reduced-motion` fallback and must pause when offscreen or when the tab is hidden.
- `dangerouslySetInnerHTML` is allowed only for trusted, build-generated SVG strings from `src/lib/art/`. Never use it for user or remote content.

## Docs (read only when the step needs them)
- `docs/ARCHITECTURE.md`: folders, rendering, data seam, routes
- `docs/TECH-STACK.md`: libraries and why
- `docs/CODING-RULES.md`: conventions, a11y, performance, i18n
- `docs/DESIGN-TO-CODE.md`: how to port `.dc.html` → TSX, plus the motion map
- `docs/DESIGN-INVENTORY.md`: line ranges for every section, function and asset in `design/`
- `docs/WORKFLOW.md`: phases, agents and skills
- `docs/BACKEND-ROADMAP.md`: captured requirements for the later phases
