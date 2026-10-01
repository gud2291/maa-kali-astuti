# RULES — mandatory for every line of phase-B code

The final audit (B45–B46) checks every rule below. Breaking one = the work gets redone.

---

## 1. TypeScript
- `strict` stays on. No `any` (use `unknown` + zod or narrowing). No `@ts-ignore`, `@ts-expect-error`, or new `as unknown as` casts (the phase-F JSON casts may stay).
- No `!` non-null assertion on a value that can really be null — handle the null.
- Exported functions have explicit return types. Type-only imports use `import type`.
- Named exports only, except files Next.js requires to default-export (page, layout, route segment files, `sitemap.ts` …).
- File names: components `PascalCase.tsx`, everything else `kebab-case.ts`. One component per file. Imports use `@/`.
- Functions do one job and stay under ~60 lines; files under ~300 lines (split by responsibility, the step names the files).

## 2. Server code
- First line of every `src/server/**` file: `import "server-only";` — except `actions.ts` / `admin-actions.ts`, whose first line is `"use server";` and which export **only async functions**, and `src/server/db/schema/**`, which is also loaded by drizzle-kit and scripts (DATA-MODEL "Loader rule").
- Scripts in `scripts/**` never import a module that imports `server-only` (it throws outside Next); they build their own DB client.
- zod is **v4**: use `z.email()`, `z.url()`, `z.int()`, `z.iso.date()`, `z.enum([...])`, `z.preprocess()`; custom messages via `{ error: "code" }`.
- Every Server Action body runs inside `runAction(async () => { … })` (`src/server/result.ts`).
- Every action / route input is parsed with zod (`schema.parse`) — ids, enums, numbers, strings. Strings are trimmed and length-capped (names ≤ 80, emails ≤ 120, phones = 10 digits, free text ≤ 2000 unless the step says otherwise).
- **AuthZ everywhere:** `admin.ts` exports call `requireAdmin(perm)` first; admin pages call `requireAdminPage(perm)` first; customer reads/writes filter by the session user id — never by an id from the client alone.
- Public access to an order / booking / kundali order needs its access key (compare `sha256Hex(key)` with `access_hash` using `safeEqualHex`) or the owner's session.
- Never trust the client for prices, totals, discounts, stock, fees, roles, user ids or payment status. Recompute on the server.
- Rate-limit every public mutation (`rateLimit(bucket, id, limit, windowSec)`); the step names buckets and limits.
- Turnstile (`verifyTurnstile`) on: OTP request, COD order, inquiry, contact, newsletter, review submit.
- Env only through `env` from `@/server/env`. `process.env` is allowed only in `src/server/env.ts`, `src/lib/core/runtime.ts` (created in B44: `IS_DEV`, `NEXT_PUBLIC_*` values for client code), `src/components/auth/TurnstileWidget.tsx` (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`), `next.config.ts`, `drizzle.config.ts` and `scripts/**`. Public vars: `NEXT_PUBLIC_MEDIA_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — nothing else. Client code that needs the media base URL receives it as a prop from the server.
- Logging only through `log.info|warn|error(event, data)` (`src/server/log.ts`). Never log tokens, OTP codes (except the dev-console fallback in `email/send.ts`), secrets, signatures or full addresses; mask with `maskEmail` / `maskPhone`.
- Expected failures throw `AppError(code)`; never send raw error messages or stack traces to the client.
- Every external `fetch` (Razorpay, Resend, R2, Cloudflare, YouTube, India Post, Turnstile) passes `signal: AbortSignal.timeout(8000)` (PDF render: 45000).
- Webhooks verify the signature on the **raw body** before `JSON.parse`, and are idempotent.
- Customer emails and other follow-ups run in `after()`; a failed email never fails the request.

## 3. Database
- Follow ARCHITECTURE §5 (query builder, `sql` template only with bound values, `db.batch`, atomic patterns, pagination, no N+1).
- Every `where`/`orderBy` on a big table uses an index listed in DATA-MODEL. A query that needs an unlisted index → write a Blocker; do not invent schema.
- Schema changes only in the step that owns them, then `pnpm db:generate`; commit `drizzle/`. Never edit generated SQL. Never rename or drop a column or table.
- List queries select only the columns they show.

## 4. Caching
- Storefront reads go through `cached()` with the tags from ARCHITECTURE §4 and return JSON-safe data (no `Date`).
- After every admin write call `invalidate(...)` with every affected tag (Server Actions). Route handlers / `after()` use `invalidateLater(...)`.
- Never call `updateTag`, `revalidateTag` or `revalidatePath` directly.

## 5. Performance & scale
- Static storefront pages stay static: no `cookies()`, `headers()` or `searchParams` in their server components.
- `"use client"` only on interactive leaves. Heavy admin widgets (Tiptap editor, dnd-kit lists, charts, calendar) load with `next/dynamic`.
- Data a server component can pass as props is never fetched client-side. Client fetches are allowed only for `/api/catalog`, `/api/slots`, `/api/places`, `/api/pincode/[pin]`, `/api/rashifal`.
- No `await` inside loops for independent work: `Promise.all` (max ~10 at a time).
- Admin lists paginate (20 per page). No unbounded `select`.
- Uploaded images render with `MediaImg` + correct `sizes`; never `next/image` for R2 media.
- Add a dependency only if the step's **Install** list names it.

## 6. UI — new storefront pages and admin
- **Theme only:** colour tokens from `src/app/globals.css` (`em9 em7 em5 em1 n9 n8 g5 g3 g7 iv s1 s2 ink ink6 cu sin rose ok cream g1 g4 sg3 sg5`), font utilities `font-display font-sans font-deva font-hi font-title`, radii `rounded-field` (2px) / `rounded-btn` (4px) / `rounded-pill`, shadows from `@theme`. No new colours, fonts or shadows.
- **Reuse first:** `components/ui/*` (Button, ButtonLink, Field, Chip, Badge, Price, Rating, QtyStepper, FaqList, SectionHeader, Eyebrow, Logo, ornaments), `components/icons/Icon`, `components/commerce/*` (ProductCard, ProductImage, QuickAdd pieces), `components/sections/booking/*` patterns for steppers and payment choice.
- Mobile-first: build at 390px, then check 768 / 1024 / 1440. Tap targets ≥ 44px, no horizontal page scroll, sticky bottom bars respect `env(safe-area-inset-bottom)`.
- Accessibility: visible labels; errors with icon + text, `role="alert"`, linked by `aria-describedby`; one `h1`; dialogs/sheets via `radix-ui` (Esc, focus return); icon-only buttons have `aria-label`.
- Motion: only `transform` / `opacity`; every animation has a reduced-motion fallback and pauses offscreen (`data-amb` + AmbientRoot, as in phase F).
- Storefront UI that a step changes also follows `docs/frontend/CODING-RULES.md` (read it when the step lists it).

## 7. Admin UX standard
- Shell: sidebar ≥ 1024px; top bar with search; mobile (< 1024px) bottom nav with Dashboard · Orders · Products · Bookings · More.
- Lists: search + filters live in URL search params; table ≥ 768px, cards below; empty state; pagination.
- Forms: `react-hook-form` + `zodResolver(sharedSchema)`; inline errors; Save disabled while pending; toast on result; sticky Save bar on mobile; confirm dialog before delete/cancel/refund; warn on leave when dirty.
- Every admin mutation writes an audit row with `audit()` (`src/server/audit.ts`).
- Money inputs are whole rupees; display with `fmt()` (`src/lib/core/format.ts`). Times display in IST with `formatIst()` (`src/lib/core/ist.ts`).
- Admin copy is plain English, short, no jargon.

## 8. i18n
- Storefront strings in `messages/en.json` + `messages/hi.json` (both, same keys). DB text through `loc()`.
- Devanagari: no letter-spacing, no italics (use the existing `hi:` variant utilities).
- Prices use Western digits in both languages: `₹1,250`.

## 9. Forbidden (the audit greps for these)
`any` · `@ts-ignore` · `@ts-expect-error` · new `eslint-disable` (only `@next/next/no-img-element` above an `<img>` is allowed) · `console.log` · `TODO` `FIXME` `XXX` `HACK` · placeholder / mock / stub / "lorem" code (phase-F demo features already listed in PLAN are the only exception) · `dangerouslySetInnerHTML` (allowed only for trusted SVG from `src/lib/art` and the JSON-LD script in B42) · `sql.raw(` · `eval` / `new Function` · `innerHTML` · secrets in `localStorage` · `NEXT_PUBLIC_` secrets · `process.env` outside the allowed files · `Math.random()` for ids, codes or tokens · external `fetch` without timeout · single-argument `revalidateTag(` · `middleware.ts` · `"use cache"` · `runtime = "edge"`.

## 10. Git
- One commit per step: `git add -A && git commit -m "B<nn>: <title> [<agent>]"`. Never push, rebase, amend or force.
