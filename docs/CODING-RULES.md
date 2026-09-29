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
- Colour contrast is AA. Small gold text on ivory uses `gold-700` (#7A5C1C).
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
_(Filled in F2 after running the skill; distilled rules only.)_
