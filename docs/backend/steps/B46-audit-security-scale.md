# B46 — Final audit 2: security, scale, build readiness
**Risk:** — · **Needs:** B45 · **Agent:** **Claude only** · **User setup before QA:** the user runs `pnpm build` at the end

## Goal
A whole-system review of phase B: security (OWASP-style), concurrency, privacy, performance and scale under many users, dependency health, and launch readiness — with fixes and a clear report.

## Read first (only these)
- `AGENTS.md`, `docs/backend/RULES.md`, `docs/backend/ARCHITECTURE.md`, `docs/backend/AUDIT-REPORT.md`, `docs/backend/GO-LIVE.md`

## Install
None.

## Files
Modify: `docs/backend/AUDIT-REPORT.md` (part 2), `docs/backend/GO-LIVE.md` (if needed), any source file that needs a fix, `PROGRESS.md`

## Tasks
- [x] T1. Run the `security-review` skill on the phase-B changes (from the B01 commit to HEAD); verify each finding; fix the real ones. — claude
- [x] T2. Run the `code-review` skill (high effort) on the same range; fix verified correctness bugs. — claude
- [x] T3. Concurrency: confirm the atomic patterns for stock, slot claims, coupon limits, OTP attempts, invoice counter, first-time-paid updates, webhook dedupe, payment retry, Kundali generation lock. Write the result per item. — claude
- [x] T4. Scale: list per-page and per-action DB queries and function invocations on hot paths (static pages, `/api/catalog`, `/api/slots`, `/api/places`, `/api/pincode`, `/api/rashifal`, quote, coupon, place order, OTP); verify CDN headers, cache tags, indexes, payload sizes; estimate Turso rows read/written and Vercel invocations for 10k and 100k monthly visitors; note limits and the next upgrade step. — claude
- [x] T5. Privacy: no PII in logs, palm-photo lifecycle, private bucket only via signed URLs, data the privacy policy promises vs what the code does. — claude
- [x] T6. Dependencies: `pnpm audit --prod`; upgrade within the same major only when safe, else note it. — claude
- [x] T7. Write AUDIT-REPORT part 2 (findings, fixes, residual risks, scale numbers) and update GO-LIVE if anything changed. — claude
- [ ] T8. Ask the user to run `pnpm build` and paste errors; fix them in this session if any (Fix-list otherwise).
- [ ] T9. Finish per AGENTS.md §1 step 8: phase B complete.

## Must not
- No new features. Keep fixes minimal and within the specs.

## Done-notes
_(Claude: ≤ 12 lines)_

Paused at T8: waiting for the user's `pnpm build` output (T1–T7 done, report part 2 written).

## Manual QA (user)
Full pass: storefront (EN/HI, 390 + 1440 px), checkout COD + online, booking, Kundali ₹99, inquiries, admin on phone + laptop; `pnpm build`; deploy a Vercel preview; follow GO-LIVE.md.
