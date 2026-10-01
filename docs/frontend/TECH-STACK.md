# TECH STACK — frontend phase

Goal: premium, animation-rich, **light** (Lighthouse mobile ≥ 90), secure, and Vercel free-plan friendly.
Rule: add a dependency only if it clearly beats a few lines of our own code.

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js latest stable (App Router)**, React 19, TypeScript `strict` | SSG for every page. Follow the installed version's conventions: in Next 16, `middleware.ts` is `proxy.ts` and `next lint` is removed. |
| Package manager | **pnpm** | Pause OneDrive sync while installing. |
| Styling | **Tailwind CSS v4** | Tokens in `@theme` (globals.css). Arbitrary values keep design px exact. |
| Fonts | **next/font/google** | Fraunces (variable; axes `opsz`, `SOFT`; normal + italic) · Manrope (400–700) · Tiro Devanagari Hindi (400; subsets latin, devanagari) · Mukta (400/500/600; latin, devanagari). Exposed as CSS vars `--font-fraunces`, `--font-manrope`, `--font-tiro`, `--font-mukta`. |
| i18n | **next-intl** | Locales `en` (default, `localePrefix: 'as-needed'`) and `hi`. UI strings in `messages/*.json`. Content uses `{en, hi}` fields. Call `setRequestLocale` in every layout and page for static rendering. |
| Ambient motion | **CSS keyframes** | twinkle, flicker, glow, float, spin, smoke… driven by `data-amb`, paused by `AmbientRoot` (IntersectionObserver + visibilitychange). |
| Signature motion | **Web Animations API hooks** | Ported 1:1 from the design JS (blink, japa, breath, gaze, wheel, chart/yantra draw, count-up, fly-to-cart, burst). |
| UI transitions | **motion** (`motion/react`) | Use `LazyMotion` + `domAnimation` + `m.*`. Only for AnimatePresence (toasts, stepper steps, tab crossfades), layout (filters/grid) and springs. |
| Smooth scroll | **lenis** | Only on `(pointer: fine)` and without reduced motion. Scroll-snap rails keep native scroll (`data-lenis-prevent`). |
| A11y primitives | **radix-ui** | Dialog (drawer, menu, sheets, overlays), Accordion, Tabs, Slider, RadioGroup, Checkbox. Unstyled; styled with our tokens. |
| State | **zustand** (+ `persist`) | cart, wishlist (localStorage) and ui (drawers, toasts, quick-add). Guard hydration. |
| Forms | **react-hook-form + zod + @hookform/resolvers** | Schemas live in `src/lib/validation/` so backend Server Actions can reuse them. |
| Class utils | **clsx + tailwind-merge** | `cn()` |
| Design pipeline (dev) | **jsdom** | `scripts/extract-design.mjs` evaluates `design/mka-*.js` and emits JSON data + SVG files. |
| Images (dev) | **sharp** | `scripts/optimize-images.mjs`: PNG → WebP. Runtime uses `next/image`. |
| Formatting (dev) | prettier + prettier-plugin-tailwindcss | The user's editor runs it; Claude does not run tooling. |

**Deliberately not used:** GSAP, Three.js/WebGL, Lottie, Embla/Swiper, icon packs, UI kits (shadcn styles), CSS-in-JS.

## Security (frontend phase)
`next.config.ts` → `headers()` for all routes:
- `Content-Security-Policy`:
  - `default-src 'self'; script-src 'self' 'unsafe-inline'` (static pages, no nonce);
  - `style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://i.ytimg.com; font-src 'self'`;
  - `frame-src https://www.youtube-nocookie.com; connect-src 'self'`;
  - `frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests`.
  - Relax only what a later phase needs (Razorpay, analytics).
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff` · `X-Frame-Options: DENY` · `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `poweredByHeader: false`
- Validate every form with Zod. No secrets in client code (`NEXT_PUBLIC_*` only for public values). Put `server-only` on server modules later.

## Performance budget
- LCP < 2.5s on 4G mobile. The hero is inline SVG + CSS; no hero image or video is required.
- First-load JS per route stays small: server components by default, and `"use client"` only on interactive leaves.
- Heavy below-the-fold widgets (wheel, chart, love calc, shorts viewer, testimonials) → `next/dynamic` + skeletons.
- Static illustration → external `/svg/*.svg` via `<img loading="lazy">` (the design build note: the prototype has ~10k DOM nodes).
- Max 2 continuously animated signature elements per viewport. Mobile gets half the particle and star counts, no mouse parallax, no magnetic buttons.
- YouTube: a click-to-load facade (thumbnail from `i.ytimg.com`, iframe only after click).
