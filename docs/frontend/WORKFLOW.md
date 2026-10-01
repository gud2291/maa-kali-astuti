# WORKFLOW

## Phases
| Phase | What | Output |
|---|---|---|
| **D** Design | Claude Design (claude.ai/design) from `design-brief/` | `design/` export ✅ |
| **F** Frontend | Next.js pages 1:1 with the design, with mocked data and actions | Client demo on a Vercel preview |
| **B0** Backend plan | A new planning session from `docs/BACKEND-ROADMAP.md` | Backend plan + steps B1…Bn |
| **B** Backend | DB, auth, payments, admin, content managers, Kundali PDF | Working store |
| **F2** Frontend part 2 | Cart page, Checkout, PDP ×2, Wishlist, Search, Order success, Account, Blog, Contact, FAQ, Policies (after they are designed) | Complete storefront |
| **S** SEO / GEO / AEO | Metadata, JSON-LD, sitemap, hreflang, FAQ schema, llms.txt, performance hardening | Launch-ready |
| **L** Launch | Domain, analytics, monitoring, final QA | Live site |

The exact order after F is decided in B0.

## Session model (token-efficient)
- **One step = one fresh Claude Code session.** The user types `/next`.
- `CLAUDE.md` is auto-loaded, so keep it short. Everything else is read on demand from the step's *Read* list.
- `docs/DESIGN-INVENTORY.md` gives line ranges, so a session reads only the part of a design file it needs.
- At the end of each step: update PROGRESS.md (Done-notes + Manual QA), make a local git commit, and stop.
- The user does manual QA (runs `pnpm dev` / `pnpm build` themselves) and writes issues into the PROGRESS *Fix-list*, or tells the next session. The next `/next` fixes those first.

## Agents
| When | Agent | Why |
|---|---|---|
| F1 | 3 × **Explore** in parallel | Outline the huge design files into line-range maps. This keeps raw design text out of the main context. |
| F9, F11, F13, F14 (optional) | 1 × **general-purpose** | Builds the second independent page from a tight brief (inventory ranges + DESIGN-TO-CODE); the main session integrates it. |
| B0 | **Plan** | Designs the backend architecture. |
| Any | **Explore** | Only when a search spans many files and only the conclusion is needed. |

Agents start cold. Always give them: the exact files and line ranges, the target file paths, and the rules docs to follow.

## Skills
| Step | Skill | Use |
|---|---|---|
| F2 | `ui-ux-pro-max` | Next.js + Tailwind guidance (a11y, motion, perf). Distil it into CODING-RULES once. |
| F15 | `ui-ux-pro-max` | Review pass over the finished frontend. |
| F15 | `code-review`, `simplify` | Correctness and cleanup before the client demo. |
| B | `security-review` | Before any deploy with real payments or users. |
| B / L | Vercel MCP | Project, env vars, deploys, logs. |
| S | Semrush MCP | Keyword research for EN/HI astrology and spiritual products. |

## Permissions & safety
- `.claude/settings.json` allows routine commands without prompts and **denies** dev/build/start/tsc/lint, which enforces the user's manual-QA rule.
- Never push to a remote, deploy, or touch the client's accounts without the user asking in that session.

## Resume command
`/next` → `.claude/commands/next.md`. Typing "next" or "aage" works the same way (see CLAUDE.md).
