# CODING RULES

## General
- TypeScript `strict`. No `any` (use `unknown` + narrowing). Explicit return types on exported functions.
- Naming: components `PascalCase.tsx`; hooks `useThing.ts`; everything else `kebab-case.ts`. One component per file; colocate its small helpers.
- Imports go through the `@/` alias. No deep relative chains (`../../..`).
- Keep components small. A section component composes smaller pieces; there are no 600-line files.
- Comments explain *why* (for example "design: 6% overshoot on wheel snap"), not what.
- No dead code, no commented-out blocks, no `console.log`.

## React / Next.js
- Server components by default. `"use client"` only on the smallest interactive leaf.
- Never read `window` or `localStorage` during render. Use effects, or `useHydrated()` for persisted stores.
- Use `next/link` (the i18n-aware `Link` from `@/i18n/navigation`) for internal links, `next/image` for raster images, and `<img>` for generated SVG.
- Every page calls `setRequestLocale(locale)`, exports `generateStaticParams` where it has params, and exports metadata (basic in phase F, full in phase B).
- Heavy below-the-fold client widgets use `next/dynamic` with a same-size skeleton.
- Lists use stable keys (ids, not indexes).

## Styling
- Tailwind v4 utilities with the tokens from `@theme`. Arbitrary values are fine for exact design px.
- **Only design colours.** Use a token when one exists; the design tints (#FFFDF8, #F6E7BC, #E6CB86, #C9D6CF, #9FB3AA) become tokens too.
- Radius: 2px inputs, 4px cards and buttons, 999px chips, badges and avatars only.
- Animate only `transform`, `opacity` and SVG `stroke-dashoffset`. Never animate layout properties.
- Use `cn()` for conditional classes. Avoid inline `style` except for dynamic numeric values (progress %, transforms computed in JS).

## Accessibility
- Every interactive element has a visible focus ring (2px gold, 2px offset) and is keyboard operable. Sliders, wheel and Shorts follow the design's arrows / pause / Esc behaviour.
- Tap targets ≥ 44×44px. Body text ≥ 16px on mobile.
- Labels are always visible. Errors show an icon + text and link to the field through `aria-describedby`.
- Decorative SVG gets `aria-hidden="true"`. Meaningful images get `alt` (EN + HI through messages).
- Colour contrast is AA. Small gold text on ivory uses the `g7` token (#7A5C1C).
- Add a skip link, landmark elements (`header`, `nav`, `main`, `footer`) and a single `h1` per page.

## Motion
- Specs come from `design/HANDOFF-NOTES.md` and the design JS. Copy them literally.
- Every loop pauses when offscreen or when the tab is hidden (AmbientRoot / IntersectionObserver).
- `prefers-reduced-motion`: no auto-advance, parallax, gaze, blink or mala; draws render complete; ambient loops stay off.
- Mobile: half the particles and stars, no mouse parallax, no magnetic buttons.

## i18n
- No hard-coded user-facing strings in components: use messages or `{en, hi}` content fields.
- Devanagari: no letter-spacing, no italics; line-height 1.35 for headings and 1.7 for body.
- Prices are Western digits in both languages, formatted `₹1,250` (en-IN grouping) with tabular numbers.

## Security
- Zod-validate every form input on the client (and on the server in phase B).
- Never inject user or remote HTML. `dangerouslySetInnerHTML` is only for trusted SVG from `src/lib/art`.
- External links use `rel="noopener noreferrer"`. YouTube uses youtube-nocookie through a click-to-load facade.
- Secrets never go in client code or the repo (`.env*` is gitignored).

## Git
- One local commit per step: `F<n>: <title>`. Never push, rebase or force.

## From ui-ux-pro-max
Distilled in F2 (skill v2.5.0: Quick Reference §1–§9 + `ux` / `react` domain searches). The design is fixed, so only rules that apply on top of it are kept.

**Accessibility**
- Icon-only buttons (cart, wishlist, close, arrows, qty ±, play/pause) always carry an `aria-label` (EN/HI via messages). `<Icon label>` exposes a label; otherwise icons are `aria-hidden`.
- Heading levels never skip: one `h1` per page, sections `h2`, cards `h3`. `SectionHeader` renders `h2` by default; pass `as` when a page needs another level.
- Colour is never the only signal: stock, errors, discounts and selected states also have text or an icon (the design already pairs them — keep the pair).
- Modals, drawers, sheets and multi-step flows always have a visible close/back control and close on Esc; focus returns to the trigger (Radix Dialog does this).
- After a client route change, move focus to `#main` (PageTransition, F4).

**Touch & interaction**
- Hit area ≥ 44×44px even when the visual is smaller (qty ± buttons 32×34, 22px icons): extend it with padding or an `::after` inset, never by changing the visual size.
- ≥ 8px between adjacent tap targets on mobile.
- Nothing depends on hover alone: quick-add, card image swap and mega menus all have a tap/click or focus path.
- Async buttons disable themselves and show the design's loading state (add-to-cart morph idle → loading → added; form submit states).
- `touch-action: manipulation` on custom tap controls (wheel, dial, steppers, sliders) to remove the double-tap delay.

**Performance**
- Raster: `next/image` with explicit `sizes`; only the LCP image gets `priority`. Every image/SVG has width + height or an aspect-ratio box (CLS < 0.1).
- Static art via `<img loading="lazy" decoding="async">` below the fold. Inline art (`src/lib/art`) only when it animates or carries web-font text.
- Import from the source file, not a barrel (`@/components/ui/Button`, not `@/components/ui`), so client modules don't leak into unrelated bundles. F2 ships no barrels except `ui/ornaments`.
- Heavy below-the-fold widgets (`lib/art/thumbs.ts` is ~220 KB of strings; wheel, charts, Shorts viewer) load through `next/dynamic` with a same-size skeleton.
- Scroll / resize / pointer handlers are passive and rAF-throttled; read layout first, then write (no read/write interleaving in loops).
- Font preload only for Fraunces + Manrope; the Devanagari faces load on demand (`display: swap`).

**Motion**
- Design timings win over generic advice (700 ms reveals, 900 ms masks). The skill's "150–300 ms" applies only to micro-interactions we add ourselves (hover, press, toggles).
- Transform / opacity only; exits shorter than entrances; nothing blocks input while animating; running animations are interruptible.
- At most 2 continuously animated signature elements per viewport (TECH-STACK budget); everything else is ambient CSS that pauses offscreen.
- Reduced motion = the final state immediately (not a "shorter" animation).

**Forms**
- Validate on blur, then live once a field has an error; on a failed submit focus the first invalid field.
- Semantic `type` / `inputMode` / `autoComplete` on every input (tel + numeric for phone, email, postal-code, bday parts).
- Error text says what is wrong and how to fix it ("Enter a 10-digit mobile number"), under the field, with `role="alert"`.
- Toasts use `aria-live="polite"`, never steal focus, auto-dismiss in 3–5 s and offer Undo for removals.
- iOS zooms inputs under 16px. The design's inputs are 15.5px: keep them 1:1, and only if QA sees the zoom, raise them to 16px below 768px (log it in the Fix-list first).

**Layout**
- Never disable zoom. Use `min-h-dvh` / `svh` instead of `100vh` for full-height mobile panels.
- Fixed bars (tab bar, sticky CTAs, FAB) reserve their height with bottom padding and respect `env(safe-area-inset-bottom)`.
- No horizontal page scroll at 360–390px; snap rails scroll inside their own container.
- z-index scale: content 0–10 · sticky header 40 · tab bar / FAB 50 · drawers & sheets 60 · toasts 70 · fly-to-cart clone 9999 · page progress line 10000 · skip link 10001.

