# PROGRESS — Maa Kali Astuti

**Phase:** F — Frontend (client demo) · **Next step:** F15
Resume in a fresh session with: `/next`

| Step | Title | Status |
|---|---|---|
| F0 | Workflow + docs + design import | DONE |
| F1 | Design inventory (line-range map) | DONE |
| F2 | Scaffold + design system + extraction pipeline | DONE |
| F3 | Data layer + stores + ProductCard | DONE |
| F4 | Global chrome (header, menus, cart drawer, footer) | DONE |
| F5 | Home A — hero → 12 Nag spotlight | DONE |
| F6 | Home B — rashifal wheel → floating stones | DONE |
| F7 | Home C — courses → newsletter | DONE |
| F8 | Shop + category template | DONE |
| F9 | Consultations + consultation detail + InquiryForm | DONE |
| F10 | Booking stepper | DONE |
| F11 | Kundali ₹99 + Love Calculator | DONE |
| F12 | Rashifal + Rashi detail | DONE |
| F13 | Sadhana Courses + Course detail + Rituals | DONE |
| F14 | About + Videos + 404 | DONE |
| F15 | Polish, audits, demo handover | TODO |
| B0 | Backend plan (new plan session) | TODO |

---

## Fix-list (from the user's manual QA; fix these first in the next session)
_(empty)_

---

## Step details

### F0 — Workflow + docs + design import · DONE
Done-notes:
- The design ZIP was extracted to `design/`. It keeps the `.dc.html` pages and components, `mka-core.js`, `mka-astro.js`, `mka-home.js`, `support.js` (the prototype runtime, reference only), `HANDOFF-NOTES.md`, `assets/` (product PNGs + logo emblem) and `shots/` (reference screenshots).
- Skipped: the 10 MB standalone bundles, `*-standalone.dc.html` (near-duplicates), `export/` (older copies of SiteChrome/SiteFooter/FaqList) and `uploads/` (copies of our own brief).
- Docs written: CLAUDE.md, docs/*, `.claude/commands/next.md`, `.claude/settings.json`. Git initialised.
Manual QA: none (no code yet).

### F1 — Design inventory · DONE
Read: `design/HANDOFF-NOTES.md`, `docs/DESIGN-TO-CODE.md`. Everything else goes through agents.
Tasks:
- [x] Launch **3 Explore agents in parallel** (thoroughness "very thorough"). Each returns a compact outline, **not file dumps**:
  1. `Home.dc.html` + `mka-home.js`
  2. `SiteChrome`, `SiteFooter`, `ProductCard`, `Shop`, `FaqList`, `InquiryForm` + `mka-core.js`
  3. `Consultations`, `Consultation-Detail`, `Booking`, `Kundali-99`, `Love-Calculator`, `Rashifal`, `Rashi-Detail`, `Sadhana-Courses`, `Course-Detail`, `Rituals`, `About`, `Videos` + `mka-astro.js`

  Each agent reports, for each file:
  - sections/blocks in order, with **start–end line numbers** of the template, and the line range of the logic `<script>` (render / methods);
  - `dc-import` children and their props;
  - the `M.` / `A.` / `H.` functions and data used;
  - motion hooks used (`data-reveal`, `data-mask`, `data-fade`, `data-ln`, `data-draw`, `data-count`, `data-amb`, WAAPI `.animate`), plus which S1–S13 each implements;
  - behaviour that depends on the viewport (`vw < 768`, `>= 1024`, …) and what changes;
  - hash params / state machine (e.g. Kundali demoState);
  - the Hindi strings location (inline `hi ? … : …` objects).

  For `mka-*.js`, each agent reports: every top-level `M.* / A.* / H.*` member with its line range and one line of purpose, tagged **DATA** (dump to JSON), **ART** (SVG builder: static → dump to .svg, animated → inline), or **LOGIC** (pure function → port to TS). For `mka-core.js` also cover the `auto()` motion system (how data-reveal, data-mask, data-amb etc. are driven), `M.fx`, `M.store`, `M.ui` and the toast system.
- [x] Write `docs/DESIGN-INVENTORY.md` with these parts:
  - **A.** File → section → lines table, per file.
  - **B.** `mka-*.js` member table (name, lines, tag, target TS path).
  - **C.** Route map: design file + hash params → Next route, e.g. `Consultation-Detail#s=palm` → `/consultations/palmistry`. Use SEO slugs.
  - **D.** Breakpoint map (768 / 900 / 1024 / 1100 / 1180 / 1280), with where each is used.
  - **E.** Motion map: S1–S13 plus the page-level motions → design location → target component or hook.
  - **F.** Asset list: PNGs → `public/images/*.webp`; which ART builders become static `.svg` versus inline animated.
  - **G.** Deferred pages (in `M.BUILT`, not designed): Cart, Checkout, Product ×2, Wishlist, Search, Order Success, plus Account, Blog, Contact, FAQ, Policies.
  - **H.** A "Read-list per step" for F2–F14, with exact line ranges, so each later session reads the minimum.
- [x] Update the *Read* lines of F2–F14 below with those ranges.

Done-notes:
- `docs/DESIGN-INVENTORY.md` written: §0 prototype wiring, §A per-file section/line tables (all 19 `.dc.html`), §B every `M`/`A`/`H` member with tag + target path, §C route map with SEO slugs, §D breakpoints, §E motion map (S1–S13, all `data-amb` kinds, page-level motions), §F assets, §G deferred pages, §H read-list per step, and a gotcha list.
- All ranges were cross-checked with grep after the 3 Explore passes.
- Facts the next steps must know:
  - The prototype has **no `render()`**. Bindings come from `renderVals()`; props are JSON in the script tag's `data-props`.
  - Load order is `mka-core` → `mka-astro` (polls `M.ready`) → `mka-home` (polls `M.astroReady`). The F2 extractor must wait for `M.homeReady`.
  - Core only drives `data-amb` + `data-reveal`. `data-reveal` is **700 ms**, threshold .12. `docs/DESIGN-TO-CODE.md` §3 was corrected from 600 ms.
  - Masks, parallax, count-up and magnetic are driven locally in the Home script.
  - Hindi copy exists only in Home, SiteChrome and ProductCard. Every other page is English with Devanagari subtitles, so a full HI pass is needed (added to Client-confirm as `[HI review]`).
  - Breakpoint flags mean different things per file:
    - SiteChrome `desk` = ≥768.
    - Consultation-Detail `desk` = ≥980.
    - Shop's template splits at 1024.
  - Rare widths (420 / 480 / 560 / 600 / 640 / 700 / 980 / 1400) → Tailwind arbitrary variants (`min-[600px]:`); only the planned named breakpoints become tokens.
  - Slugs chosen (§C):
    - services: `kundali-reading`, `palmistry`, `tarot-reading`, `numerology`;
    - courses: `<key>-sadhana`;
    - categories: `rudraksha-malas`, `crystal-bracelets`, `bhojpatra-amulets`, `havan-samagri`, `energized-copper`;
    - rashis: design keys (`mesha` …).
  - Extra coming-soon routes from footer/menu links: `/account`, `/track-order`, `/blog`, `/contact`, `/faq`, `/policies/[slug]` (§G). F4 should create them alongside the six commerce ones.
  - `logo-emblem.png` is not used by the design (the logo is the `M.logo` SVG) — don't ship it.
Manual QA: optional — open `docs/DESIGN-INVENTORY.md` and skim §C (routes/slugs) and §G (coming-soon pages). Tell me if you want different URL slugs; no code to test in this step.

### F2 — Scaffold + design system + extraction pipeline · DONE
Read: `docs/TECH-STACK.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN-TO-CODE.md`; INV (= `docs/DESIGN-INVENTORY.md`) §0, §B, §D, §E.2, §F. Design: `Home.dc.html` 10–27 · `Shop.dc.html` 14–24 · `mka-core.js` 1–27, 28–136, 137–173, 381–395, 455–519, 543–558 · `mka-astro.js` 1–9 · `mka-home.js` 1–11 (details: INV §H F2).
Tasks:
- [x] `pnpm create next-app@latest` into a temp folder with TS, Tailwind, ESLint, App Router, `src/`, alias `@/*`, no Turbopack prompts. Then move the contents to the project root, because the root already has files. Keep `design/`, `docs/`, `client-requirements/` and `design-brief/` untouched.
- [x] Install: `next-intl motion lenis zustand react-hook-form zod @hookform/resolvers radix-ui clsx tailwind-merge`. Dev: `jsdom sharp prettier prettier-plugin-tailwindcss`.
- [x] `next.config.ts`: security headers (see TECH-STACK §Security), `images.formats` avif/webp, `poweredByHeader:false`, next-intl plugin.
- [x] next-intl: `src/i18n/{routing,request,navigation}.ts`, locale middleware/proxy per the installed Next version, `messages/en.json` + `hi.json` skeleton, `app/[locale]/layout.tsx` with `setRequestLocale` and `generateStaticParams`.
- [x] Fonts via `next/font/google` as CSS variables (see TECH-STACK).
- [x] `src/app/globals.css`: Tailwind v4 `@theme`
  - colour tokens from `M.C` + the HANDOFF tints;
  - fonts; breakpoints `md 768`, `w900`, `lg 1024`, `w1100`, `nav 1180`, `xl 1280`;
  - radii, shadows and easing variables;
  - keyframes for all `data-amb` ambient types found in the inventory (twinkle, flicker, glow, float, spin, …);
  - a reduced-motion block;
  - focus ring (2px gold, offset 2px);
  - paper grain.
- [x] `scripts/extract-design.mjs` (jsdom + vm: load `mka-core` → `mka-astro` → `mka-home` in a jsdom window with a stub React). It dumps:
  - DATA members → `src/lib/data/*.json`;
  - static ART → `public/svg/<group>/<name>.svg`;
  - animated ART strings → `src/lib/art/*.ts` (exported string constants).

  Run it once with `node scripts/extract-design.mjs`. That is allowed; it is a generator, not a build.
- [x] `scripts/optimize-images.mjs` (sharp): `design/assets/*.png` → `public/images/*.webp` (max 1600px, q≈80). Run it once.
- [x] `src/lib/core/*`: port the LOGIC from mka-core to typed TS (fmt, off, rng/hash, dates, muhurat, stockNote, pin, search). Add `src/lib/utils/cn.ts`.
- [x] `src/components/icons/`: the icon set from `mka-core` `I`, as one `<Icon name>` component with typed names.
- [x] `src/components/ui/`: ornaments (LotusRule, Corner, Mandala), Logo, Button variants, Eyebrow, SectionHeader, Badge, Price, Rating, Chip, QtyStepper, Input/Field. Match the design exactly.
- [x] `src/components/motion/`: AmbientRoot (pauses `data-amb` offscreen or when the tab is hidden), Reveal, MaskText, Counter, Magnetic, ScrollLine, Marquee. Timings follow HANDOFF.
- [x] Invoke skill **ui-ux-pro-max** (Next.js + Tailwind; a11y, motion, perf). Distil its rules into `docs/CODING-RULES.md` §From ui-ux-pro-max.
- [x] Add `.vercelignore` entries if needed. Leave `app/[locale]/page.tsx` as a minimal placeholder.
Done-notes:
- **Versions:** Next 16.3.7 · React 19.2.8 · Tailwind 4.3 · next-intl 4.14.8 · motion 13 · zod 4 · zustand 5 · radix-ui 1.6. The scaffold's `CLAUDE.md` was dropped (ours stays). `AGENTS.md` was kept because `next dev` re-adds it. It says to read `node_modules/next/dist/docs/` before using an unfamiliar Next 16 API.
- **Config:**
  - `next.config.ts` has the CSP and security headers. Dev only adds `'unsafe-eval'` and `ws:`, which Next's docs require.
  - `src/proxy.ts` is the next-intl middleware; Next 16 renamed `middleware.ts` to `proxy.ts`.
  - `src/i18n/routing.ts` uses `localePrefix: as-needed` and `localeDetection: false`. `/` is always English; Hindi is only at `/hi`.
  - Import `Link` / `useRouter` from `@/i18n/navigation`, never from `next/link`.
- **Root layout** is `src/app/[locale]/layout.tsx`; there is no `app/layout.tsx`. It has:
  - `<html lang>`, the four font variables (`src/app/fonts.ts`), a skip link to `#main`, `NextIntlClientProvider` (v4 inherits messages from the server) and `<AmbientRoot/>`;
  - a comment showing where F4 mounts the chrome.
  - `src/app/icon.svg` = the emblem; the Next favicon is removed.
- **globals.css:**
  - Tokens use the M.C names: `em9 em7 em5 em1 n9 n8 g5 g3 g7 iv s1 s2 ink ink6 cu sin rose ok`. The tints are `cream` #FFFDF8, `g1` #F6E7BC, `g4` #E6CB86, `sg3` #C9D6CF and `sg5` #9FB3AA.
  - Fonts: `font-display` (Fraunces), `font-sans` (Manrope → Mukta), `font-deva` (Tiro), `font-hi` (Mukta).
  - Breakpoints (in rem): `sm` 640 · `md` 768 · `w900` · `lg` 1024 · `w1100` · `nav` 1180 · `xl` 1280 · `2xl` 1400 (Shop 4 cols).
  - Radii: `rounded-field` 2 · `rounded-3` · `rounded-btn` 4 · `rounded-pill`.
  - Shadows are the design's rings: `shadow-ring-gold`, `-gold-45/-60`, `-g3`, `-g5`, `-g5-55`, `-sand`, `-em`, `-em-15`, `-focus`, `-error`; plus `shadow-hair-y/-top/-bottom`, `shadow-card` and `shadow-fly`.
  - Easings: `ease-mka`, `ease-mka-inout`, `ease-mka-exit`, `ease-fly`.
  - Utilities: `container-mka` (1320 + clamp gutter), `section-y`, `font-soft` (SOFT 40), `tabular`, `no-scrollbar`, `sheen` (gold sweep CTA), `sr-only-focusable`.
  - Custom variant `hi:` for Devanagari overrides (no tracking, no italics, 1.35 leading).
  - Also: every `data-amb` keyframe, `animate-marquee`, the reduced-motion kill block, the focus ring, `::selection` and the paper grain.
- **Ambient motion is CSS-driven.**
  - `AmbientRoot` (a port of core `auto()` + `fx.scan` + `fx.reveal`) parses `data-amb="kind:n…"` into `--amb-dur/--amb-delay/--amb-y/--amb-r/--amb-dir` and sets `data-amb-on`, which starts the animation.
  - It sets `data-amb-paused` when an element is offscreen (rootMargin 120px) and `html[data-tab-hidden]` when the tab is hidden.
  - Random values use seeded `rng("mka-amb")`.
  - It also runs **all `data-reveal`** (700 ms / i×80 / threshold .12). So server components can simply write `data-reveal="n"` (or use `<Reveal i>`).
  - Marquee pauses the same way (`data-loop`).
- **Extractor** (`scripts/extract-design.mjs` + `scripts/lib-design-env.mjs`; re-run with `pnpm design:extract`):
  - **28 JSON** files in `src/lib/data/`: tokens, categories (+slug), intents, stones, rudraksha, badges, products (+slug; `photo` now points to `/images/*.webp`; `href` dropped), services (SERVICES ⊕ SVC + slug; SERVICES' `modes` string is renamed `modesLine`), consult, articles, trending, months, rashi (+slug), graha, nakshatra, cities, demo-kundali, testimonials, kundali99, predict, love, courses (+slug `<key>-sadhana`), rituals, faq, videos, books, reviews, about.
  - **99 static SVGs** in `public/svg/`: chakra ×3, wheel nak/pointer, arch-frame, mandala ×3 colours, gems ×9, categories ×2, places ×3, portrait/fg, product main+detail for the 37 products without a photo, and logo.svg.
  - **17 inline art modules** in `src/lib/art/`: icons, glyphs, logo, pandit, mala (N, L and a 721-point LUT), diya, kalash, thali, wheel (rashi/graha/center), yantras, service-art, portrait, chapters, thumbs, books, seal, arch.
  - **Rule:** art with `<text>` is inlined, because `<img>` SVG can't use web fonts.
  - Strings carry `__U__`; render them with `<InlineArt svg uid>` (`src/lib/art/uid.ts`).
  - Where `u` seeds randomness, the design's call-site `u` is kept:
    - `thali` → THALI_RITUALS / THALI_HOME;
    - `portrait` → BG_CONSULT / BG_ABOUT / PORTRAIT_HOME;
    - `thumbs` use the Videos-page seed (`vg<id>` / `vs<id>`) on every page.
- **Not extracted yet** (the owning step does it):
  - report-page SVGs (`A.page`): F9 / F11 must read their call sites;
  - product `cert` / `video` slots (they contain text): PDP phase;
  - `places/office.svg` has a small "NE" label (a warning in the extractor output). It is PDP-only.
  - Unexposed locals (`OPEN AREA FR LORD RS HC SN HCOLS BHU YAN MP LUT HIN SH`) are not on `M` / `A` / `H`. Port them by hand in the LOGIC steps (F6 / F12). `PIN` / `ST` / `DAY` / `MON` are already in `src/lib/core`.
- **Images:** `scripts/optimize-images.mjs` wrote 7 WebPs to `public/images/` (10–116 KB each, max 1600px, q80). `logo-emblem.png` is skipped.
- **Core ports** (`src/lib/core/`):
  - `format.ts` (fmt, off, num, secs), `rng.ts` (rng, hash, mix — same seeds), `dates.ts` (addDays, dfmt, dlong, muhurat — pass `now` on the server), `stock.ts`, `pin.ts`, `search.ts` (pure; the caller passes the collections).
  - `commerce.ts` holds the store constants plus `waLink()`. **F3:** verify the COUPONS shape against mka-core store 398–443.
- **Hooks** (`src/lib/hooks/`): useReducedMotion (+ `isReduced()`), useMedia (+ useIsMobile / useIsDesktop / useFinePointer), useHydrated, usePageVisible, useInView. `useScrollDir` comes in F4.
- **UI** (`src/components/ui/`, import each file directly — no barrel):
  - Button (`Button` / `ButtonLink` / `ButtonA` / `buttonClass`): variants primary · sheen · outline · gold · night; sizes lg 54 · md 52 · sm 50 · xs 44.
  - Eyebrow (light g7 / night g3).
  - SectionHeader: sizes sm/md/lg/xl match the four design heading clamps; `lede` gives the 2-col auto-fit grid; `<em>` renders gold italic.
  - Badge / BadgePill, Price (card / row), Rating + Stars, Chip (filter / form; pass `role="radio"` for single-choice), QtyStepper (client, number roll), Field (CSS-only states, RHF-ready, `prefix="+91"`).
  - Logo (inline, `uid` prop), InlineArt, and `ornaments/` LotusRule, Corner, Mandala + MandalaG (a `<g>` for embedding).
- **Icon:** `<Icon name sw label>` in `src/components/icons/Icon.tsx`. Its names are typed from `ICON_PATHS`: 97 names plus heartF / starF.
- **Motion** (`src/components/motion/`):
  - AmbientRoot, Reveal;
  - MaskText + MaskLine + `maskIn()` (900 ms, 60 ms stagger, at 25%, only below 90% vh);
  - CountGroup + Counter (1600 ms ease-out cubic at 40%; the server renders the final value);
  - Magnetic + `magneticHandlers` (6×4 px, ≥1024);
  - ScrollLine (p = (0.62·vh − top)/height; has `onProgress`);
  - Marquee (56 s, hover / offscreen / hidden pause);
  - `fx.ts` (roll, shimmer, drawIn, enter, stagger) and `easing.ts`.
- `docs/CODING-RULES.md` §From ui-ux-pro-max is filled. It adds a z-index scale, 44px hit areas, no barrels, and the form / toast rules. `docs/DESIGN-TO-CODE.md` §4 now records the text→inline rule.
- **Tooling:** `.prettierrc.json` (tailwind plugin, `cn` / `buttonClass` sorted), `.prettierignore`, package scripts `design:extract`, `design:images`, `format`. `pnpm-workspace.yaml` silences the ignored build scripts.
- **Placeholder** `app/[locale]/page.tsx` shows the logo inside a spinning chakra, eyebrow, H1, the Devanagari line, LotusRule and an EN↔HI button.
- **Nothing was run except the two generators** (no dev / build / tsc / lint). Type errors, if any, surface in your `pnpm dev`; put them in the Fix-list.

Manual QA (F2):
1. OneDrive sync pause karo → `pnpm install` (deps already added; this just verifies) → `pnpm dev`.
2. `http://localhost:3000/`:
   - ivory background with a faint paper grain;
   - the emblem inside a slowly spinning gold chakra (120 s per turn);
   - the H1 "Maa Kali Astuti" in Fraunces (soft serif) and body text in Manrope;
   - "॥ साधक पवन पाण्डेय ॥" in Tiro Devanagari;
   - a gold lotus rule;
   - the "हिंदी" outline button.
3. Click "हिंदी" → `/hi`: Hindi copy, `<html lang="hi">`, and the button now says "English" and goes back to `/`.
4. Tab key: the first Tab shows "Skip to content" (emerald pill, top-left); the button focus ring is 2px gold with a 2px offset.
5. Switch to another tab and come back; also turn on OS reduced motion. The chakra should stop with reduced motion.
6. Mobile 390px (DevTools): no horizontal scroll, and the text is centred.
7. DevTools → Network → response headers on `/`: `content-security-policy`, `x-frame-options: DENY`, and no `x-powered-by`.
8. Open `/svg/gems/amethyst.svg` and `/images/p-12-nag.webp` directly — both should load.
9. Any terminal error or type error → paste it into the Fix-list.

### F3 — Data layer + stores + ProductCard · DONE
Read: ARCHITECTURE §Data seam + §Client state; INV §A.4, §B.1. Design: `ProductCard.dc.html` 14–139 · `mka-core.js` 176–194, 277–305, 308–381, 396–450, 490–512 · `SiteChrome.dc.html` 350–387, 421–436, 543–559 (details: INV §H F3).
Tasks:
- [x] `src/types/*`: Product, Category, Intent, Variant, LocalizedString `{en,hi}`, etc.
- [x] `src/lib/api/catalog.ts`: async getters over the generated JSON (getProducts with filters, getProduct, getCategories, getIntents, search).
- [x] `src/stores/`:
  - `cart` (persist): add / remove / qty / variant / energization, subtotal, free-shipping threshold;
  - `wishlist` (persist);
  - `ui`: cart drawer, quick-add pid, search open, toasts with undo.

  Make them hydration-safe.
- [x] `src/components/commerce/fx.ts`: fly-to-cart (arc to `[data-cart-target]`, badge bump) and wishlist burst. Port from `M.fx`.
- [x] `Toaster` (a port of the M.ui toast: tone, action, undo).
- [x] `ProductCard` with all modes (card / compact / row / wish): hover image crossfade, lift, gold ring, quick-add bar, mobile plus, add-to-cart morph (idle → loading → added), OOS notify, stock note, badges, wishlist.
- [x] `QuickAdd` size picker (wrist sizes), opened through the ui store.
Done-notes:
- **Types** (`src/types/`):
  - `localized.ts`: `LocalizedString`, `tr()`.
  - `product.ts`: Product, CategoryKey, IntentKey, BadgeKey, StoneKey, WristSize, ProductArt, ProductImageSlot.
  - `catalog.ts`: Category, Intent, Stone, ProductQuery, ProductSort, SearchResults.
  - `cart.ts`: CartLine, ResolvedLine, Energization, AppliedCoupon, CouponResult, CartTotals, RemovedLine.
- **Data seam** `src/lib/api/catalog.ts`:
  - `getProducts(query)` takes the Shop filters and the sorts `popular|newest|low|high|rating` (Shop.dc.html 287–295) plus `offset/limit`, and returns `{items,total}`.
  - `queryProducts()` is the same filter as a pure function, for client islands.
  - Also: `getAllProducts`, `getProduct(slug|id)`, `getProductsByIds`, `getCategories`, `getCategory(slug|key)`, `getCategoryByKey`, `getIntents`, `getStones`, `getBadges`, `getRudrakshaInfo`, `getTrending`, `search(q)`.
  - `src/lib/api/products-index.ts` is the one client-side exception: sync `productById`, `productBySlug`, `categoryShort` for the cart, wishlist and quick-add sheet. It is documented in ARCHITECTURE §Data seam.
- **Cart maths** `src/lib/core/cart.ts` is pure, so the server can reuse it later: `lineKey`, `clampQty` (1–10), `resolveLines`, `checkCoupon`, and `computeTotals`. `computeTotals` is an exact port of `store.totals`: energization ₹251, coupon, gift, shipping, express, COD, `toFree`, `pct`. The COUPONS shape is verified (note in `commerce.ts`).
- **Stores** (`src/stores/`, zustand 5):
  - `cart.ts` is persisted as `mka.store.v2.cart`.
    - Actions: `add`, `setQty`, `remove` (returns a snapshot), `restore`, `setEnerg`, `applyCoupon` (returns `{ok, msg key}`), `removeCoupon`, `setGift`, `clear`, `seed`.
    - Hooks: `useCartCount`, `useCartLines`, `useCartTotals({express,cod})`, plus `getCartCount()`.
  - `wishlist.ts` is persisted as `mka.store.v2.wish`: `toggle` (returns "now saved"), `remove`, `seed`, plus `useIsWished` and `useWishCount`.
  - `ui.ts` holds the overlays and toasts.
    - State: `cartOpen`, `searchOpen` + `searchQ`, `menuOpen`, `quick {pid, fromWish}`, `toasts`, and `chrome {tabbar, checkout}` (sets the toast offset).
    - Actions: `openCart`, `setCartOpen`, `openSearch`, `setSearchOpen`, `setMenuOpen`, `openQuick`, `closeQuick`, `toast`, `dismiss`, `setChrome`, `closeAll`.
    - Toast actions: `{kind:"cart"}` opens the drawer, `{kind:"href"}` navigates, `{kind:"undo", run}` stays 6 s instead of 4 s. Max 3 on screen.
  - Hydration: both persisted stores use `skipHydration`. `components/commerce/StoreHydrator.tsx` rehydrates them after mount and syncs tabs through `storage`. On a first visit, when `DEMO_SEED` (`lib/core/commerce.ts`) is true, it seeds the prototype's demo data:
    - cart: 5 Mukhi with the sankalp "Ravi Sharma/Kashyap", and Bitter Havan;
    - wishlist: b-rose, a-bagla, m7.
  - **Not built:** the recent-views and recent-searches history (prototype `store.recent/searches/view`). F4 adds it when it ports the search overlay.
- **Commerce components** (`src/components/commerce/`):
  - `fx.ts`: `flyToCart(src)` clones the image and arcs it to the first visible `[data-cart-target]` (620 ms), then bumps `[data-cart-badge]`. Also `bump`, `bumpCart`, `burst`, `cartTarget`.
    - **F4 must put `data-cart-target` on the header and compact-bar cart buttons, and `data-cart-badge` on the count badges.** Without a target the flight is skipped and only the badge bumps.
  - `ProductImage.tsx`: slot logic from `M.img`. Photos use next/image `fill`; art is an `<img>` of `/svg/products/<id>-main|detail.svg`; the amulet hover image is the copper tabiz photo. The parent must be positioned.
  - `useProductActions.ts` holds every card action. Reuse it for the 12 Nag spotlight and the PDP.
    - Add-to-cart morph: idle → loading (380 ms) → added (1.5 s). The first add opens the drawer.
    - Sold out → WhatsApp toast. Sized products → quick sheet.
    - Wishlist: toggle + burst + toast, move to cart, and remove with Undo.
  - `ProductCard.tsx` takes `product`, `size` (std|compact|row), `mode` (shop|wish), `sizes` and `priority`.
    - Hover effects are CSS (`md:group-hover`, hover-capable devices only) instead of JS state.
    - The add bar also shows on keyboard focus, and stays up while adding (`data-busy`).
    - Mobile gets the round "+".
  - `QuickAdd.tsx` is a Radix Dialog: a bottom sheet below 768 px, a centred 460 px dialog from 768 px. It has the S/M/L radios and the size guide with the wrist sketch (JSX, so "+1 cm" uses Manrope).
  - `src/components/ui/Toaster.tsx` is the toast host: 92/96 px from the bottom on mobile, 28 px on desktop, WAAPI enter/exit, reduced-motion aware.
- **Layout:** `StoreHydrator`, `QuickAdd` and `Toaster` are already mounted in `app/[locale]/layout.tsx`. Z-index follows CODING-RULES (sheets 60, toasts 70); the design used 100/101/120 in the same order.
- **Messages:** new namespaces `product`, `toast`, `quick` and `cart.coupon` in `messages/en.json` and `hi.json`. The HI product labels come from the design; the rest of the HI text is ours → `[HI review]`. The card eyebrow (category short name) and the intent pill stay English, as in the design.
- New CSS utility `font-title` (Fraunces → Tiro Devanagari fallback) for product titles.
- **Temporary:** `app/[locale]/page.tsx` has a `CardPreview` block with 6 cards covering every state, so F3 can be checked now. F5 replaces the page.
- Nothing was run (no dev / build / tsc / lint). Only Prettier formatted the new files.

Manual QA (F3). Run `pnpm dev`, open `/` and scroll below the logo block to "F3 preview":
1. Desktop 1440px:
   - Pyrite card, hover:
     - the image lifts 4px with a soft shadow and a thin gold ring;
     - the image crossfades to the close-up art;
     - a bar slides up with "Wrist size S M L" and "Add to cart".
   - Pyrite, click **M**: the button shows "Adding…" → "Added" ✓ → back to normal. A toast "Pyrite Bracelet · size M added to cart" appears with "View cart".
   - Pyrite, click "Add to cart" (not a size): the quick-add dialog opens centred (460px).
     - S/M/L radios, with M pre-selected (gold ring).
     - "Size guide" toggles the wrist sketch.
     - "Add size M · ₹899" adds and closes.
     - Esc or the backdrop closes it.
   - 12 Mukhi card (sold out):
     - a grey "SOLD OUT" badge on top and a greyed image;
     - a red "Out of stock" note;
     - the button says "Notify me" with a bell, and gives the toast "We'll message you on WhatsApp when it's back".
   - Mahavidya card: red "● Only 5 left".
   - 12 Nag card: real photo; hover shows the second photo.
   - Heart:
     - click → it turns red with a small gold burst, plus the toast "Saved to wishlist · View";
     - "View" goes to `/wishlist`, which is a 404 until F4 adds the coming-soon page;
     - click again → back to the green outline, no toast.
   - Row card (Bitter Havan): the round "+" gives a toast; the icon turns to ✓ briefly.
   - Wish card (7 Mukhi Mala):
     - "Move to cart" → toast "moved to cart", and the heart state updates;
     - trash → toast "Removed from wishlist" with **Undo** (6 s); Undo restores it.
   - Toasts: at most 3, stacked bottom-centre. They fade up in, slide down out after 4 s, and ✕ dismisses one.
2. Mobile 390px:
   - no hover bar;
   - every card has a round green "+" bottom-right, except the sold-out one;
   - "+" on Pyrite opens a bottom sheet that slides up;
   - toasts sit about 92px from the bottom.
3. Keyboard: Tab into a card → the add bar becomes visible while focus is inside it. The quick-add dialog traps focus.
4. Persistence:
   - refresh → the wishlist hearts and the cart stay;
   - first visit (clear site data) → the Mala card's heart is red (demo seed);
   - change the wishlist in a second tab → the first tab updates.
5. `/hi`: the labels read "कार्ट में जोड़ें", "कलाई का साइज़" and "% छूट"; titles and badges are in Hindi.
6. Reduced motion ON: no fly, burst or slide animations, and everything still works.
7. Any error or type error → put it in the Fix-list.

### F4 — Global chrome · DONE
Read: INV §A.2, §A.3, §C, §G, §E.3 (chrome row). Design: `SiteChrome.dc.html` 14–388 + 390–564, block by block with its bindings (INV §A.2 table) · `SiteFooter.dc.html` 14–116 · `mka-core.js` 139–173, 267–268, 452–454, 490–518, 528–552 (details: INV §H F4).
Tasks:
- [x] AnnouncementBar (3 rotating messages, WhatsApp, EN|हिं toggle).
- [x] Header (76 → 64px on scroll, blur + gold hairline when stuck), nav with active states, and the Shop mega menu (5 columns, intention chips, featured 12 Nag, staggered open).
- [x] Mobile compact bar, full-screen night menu (rotating mandala, staggered links), BottomTabBar (hides on scroll-down, raised Consult chakra, cart badge).
- [x] CartDrawer (Radix Dialog; 440px / full-screen on mobile): free-shipping progress, line items, qty, remove + undo, upsell rail, coupon, subtotal, CTAs, empty state (kalash + diya).
- [x] Search overlay, if SiteChrome has it.
- [x] WhatsApp FAB (pulse every 8s, lifts above the tab bar, honours the `fab-lift` prop), back-to-top progress ring.
- [x] SiteFooter (night cosmos: twinkle, constellation draw, 180s mandala, shooting star every ~12s; columns, newsletter prop, payment icons, shloka line).
- [x] Page transition (fade + 12px lift) and a gold top progress line on route change. Lenis provider (desktop, fine pointer, no reduced motion).
- [x] Wire everything into `app/[locale]/layout.tsx`; header props `active`, `tabbar`, `fabLift` per page.
- [x] Coming-soon pages for the deferred routes: `/cart`, `/checkout`, `/product/[slug]`, `/wishlist`, `/search`, `/order/success`, plus `/account`, `/track-order`, `/blog`, `/contact`, `/faq`, `/policies/[slug]` (INV §G). Branded, with a chakra, "being prepared" copy and links back.
Done-notes:
- **Where things live:** everything is in `src/components/layout/`. `layout.tsx` mounts `<SiteChrome/>` → `<main id="main">` → `<SiteFooter/>`, plus `<PageTransition/>` and `<SmoothScroll/>`.
- **Per-page chrome props come from the route, not from page props.** `chrome-config.ts` → `chromeFor(pathname)` returns `{active, mode, tabbar, fabLift, backHref, backLabel, secureLabel, newsletter}`. It copies the design's `<dc-import>` props:
  - `/` → active home, footer newsletter **off**;
  - `/book/*` → `mode: "checkout"` (64px secure bar, no announcement, no tab bar), back → `/consultations`, "Secure booking", FAB lift 104px;
  - `/consultations/[service]` and `/sadhana-courses/[slug]` → tab bar off, FAB lift 92px (their sticky CTA bars come in F9/F13);
  - shop/cart/consult/kundali/rashifal/courses/rituals/videos/about → `active`; everything else (love calculator, coming-soon, 404) → `active: ""`.
  - **New pages need no chrome wiring.** Only add a line to `chromeFor` if a page needs different flags.
- **SiteChrome.tsx** (client): spacer (88px, 108px ≥1180, 64px checkout) + fixed wrapper (z-40) that slides up 32px once `y > 28` (380 ms). Holds AnnouncementBar, HeaderFull (≥1180, `nav:`), HeaderCompact (<1180), HeaderCheckout, the two mega menus (hover open, 160 ms leave delay, Esc, closes on blur/route change), BottomTabBar (<768), WhatsAppFab, BackToTop, MobileMenu, SearchOverlay, CartDrawer. It also syncs `useUi.chrome` (toast offset) and calls `closeAll()` on every route change.
- **Scroll:** `src/lib/hooks/useScrollDir.ts` → `{stuck (y>28), hidden (tab bar: y>160 & dy>4, back on dy<−4), far (y>700)}`, one rAF per frame, re-render only on flag flips. BackToTop writes the ring offset directly to the SVG.
- **Overlays are Radix Dialogs** (focus trap, Esc, scroll lock):
  - menu: fade 260 ms + `[data-mi]` stagger;
  - search: y−10 300 ms, input focused after 60 ms;
  - drawer: CSS keyframes `mka-drawer-in/out` + `mka-fade-in/out` in globals.css, so Radix waits for the exit.
  - The drawer ignores clicks on toasts (`onInteractOutside`), so "Removed · Undo" works while it is open.
- **Z-index** follows CODING-RULES: header 40 · tab bar / FAB / back-to-top 50 · dialogs 60 · toasts 70.
- **Language toggle** = `useSwitchLocale()`: `router.replace(samePath + location.search + hash, {locale})`, no scroll jump. It is used in the announcement bar (≥768), the night menu chips and the footer.
- **Links** are centralised in `src/lib/routes.ts`: `routes.*`, `categoryHref`, `intentHref`, `productHref`, `serviceHref`, `searchHref`, `policyHref`, `POLICIES`. **Use these in every later step.** Contact/social/payment constants are in `src/lib/site.ts` (social URLs are `null` = toast "link is coming soon").
- **New persisted store** `src/stores/history.ts` (`mka.store.v2.history`): `searches` (overlay "Recent searches", max 5, shows 4) and `recent` (recently viewed, max 10; `view(id)` is for the PDP later). Demo seed: searches "5 mukhi", "pyrite bracelet"; recent b-pyrite, m5, a-bagla. Hydrated by StoreHydrator.
- **Search overlay** runs `lib/core/search` client-side over `PRODUCTS` + services/articles JSON. Enter or "See all" → `/search?q=` (coming soon; it echoes the query).
- **Cart drawer:**
  - Lines use the Hindi product name in `/hi`; the intent meta stays English, as on the cards.
  - Upsell "+" flies to the cart; sized items open the quick sheet.
  - Coupon Apply → toast; Enter applies without a toast, as in the design.
  - `data-cart-target` / `data-cart-badge` are on the full-header cart, the compact-header cart and the tab-bar cart. The fly goes to the first visible one.
- **Footer** (`SiteFooter.tsx`) is a server component. Its client islands (`FooterClient.tsx`): `FooterRoot` (72px mobile padding when there is a tab bar), `FooterNewsletter` (mock subscribe; hidden on Home), `FooterSocial`, `FooterLang`. The sky is 70 seeded stars (`rng("foot")`); stars 34+ are hidden below 768, which is exactly the design's mobile set.
- **PageTransition:**
  - On every route change `#main` fades up 12px (520 ms) and the gold top line sweeps (900 ms).
  - **On first load only the line runs.** Fading server-rendered content out after hydration would flash it.
- **SmoothScroll** (Lenis) runs only at ≥1024 with a fine pointer and without reduced motion. It stops while any overlay is open and never handles wheel events inside `role="dialog"`. Use `scrollToTop()` from `layout/scroll.ts` (Lenis-aware) for programmatic scroll-to-top.
- **Coming-soon pages** use `ComingSoon.tsx`: turning chakra rings around the emblem, "Being prepared", the title, lotus rule, Home / Shop / WhatsApp buttons, `robots: noindex`.
  - `/product/[slug]` is statically generated for all products (`dynamicParams = false`). It shows the name, price and category.
  - `/policies/[slug]` covers shipping, refund-returns, privacy, terms and astrology-disclaimer.
- **Messages:** new namespaces `chrome`, `search`, `drawer`, `footer`, `soon` in en/hi. The design only had Hindi for nav, the announcement and the tab bar; the rest of the HI text is ours → `[HI review]`.
  - Kept English in `/hi`, as in the design: mega-menu category names (they already carry Devanagari subtitles) and mega-menu product links.
  - The service cards in the consult mega use the service's English name.
- **Temporary:** the F3 card preview is still on `/` (F5 replaces the page). Nav links to not-yet-built pages (`/shop`, `/consultations`, `/rashifal` …) 404 until their steps; the 404 page itself comes in F14.
- Nothing was run except Prettier on the new files (no dev / build / tsc / lint).

Manual QA (F4). `pnpm dev`, then:
1. **Desktop 1440px, `/`**
   - The top shows a 32px emerald strip. Its message changes every ~4 s with a slide, and after the 3rd it loops back to the 1st without a jump. On the right: "+91 90000 12345" and EN | हिं, with EN underlined.
   - Header 76px: emblem, "Maa Kali Astuti" / "SADHAK PAWAN PANDEY" (one line), nav, and the icons search, heart (badge 3 from the demo seed), user and bag (badge 2).
   - Scroll down a little: the strip slides away, the header shrinks to 64px with a frosted background and a gold hairline, and the logo shrinks. Scroll back to the top → it resets.
   - Hover **Shop**: the mega menu drops in, columns stagger, the chevron flips and the underline stays. Check it against `design/shots/01-chrome.png`–`03-chrome.png`:
     - 13 mukhi tiles; bracelet and amulet lists;
     - the 12 Nag card with its photo and ₹1,250 / ₹1,599;
     - "Shop by intention" chips.
   - Moving the mouse out closes it after a short delay. Hover **Consultations** → 4 service cards + the dark guarantee card.
   - Tab through the nav: focusing Shop opens its menu, Esc closes it.
   - The Kundali ₹99 pill has a gold outline and darkens on hover.
2. **Search** (magnifier)
   - A full-screen ivory overlay; the cursor is in the big input.
   - "Trending" chips and "Recent searches" (5 mukhi, pyrite bracelet) show.
   - Type "pyrite": Products / Consultations / Articles tabs with counts, rows with images and prices.
   - Try "kundali" → the Consultations tab has a result. Try "xyz" → the "Nothing matches…" text.
   - Enter → `/search?q=…` coming-soon page echoing the query, and the query now shows under Recent. Esc closes the overlay.
3. **Cart drawer** (bag icon)
   - It slides in from the right (440px) over a dark backdrop.
   - Free-shipping text and gold bar; 2 demo lines (the 5 Mukhi line has the "Energized for Ravi Sharma · Kashyap gotra (+₹251)" note).
   - Qty + / −: the number rolls. At 10 → toast "Maximum 10 per order line".
   - **Remove** → toast with Undo; Undo restores the line and the drawer stays open.
   - "Complete your ritual" rail: "+" flies the item to the cart and bumps the badge. Rose Quartz opens the size sheet.
   - "Have a coupon code?": `SADHANA10` → green chip "SADHANA10 · −₹…" plus a toast. `ABC` → red error. `FIRST100` on a small cart → the "needs ₹999" error.
   - Subtotal, the "You save …" line, and "Checkout securely" (gold sheen on hover) → `/checkout` coming-soon; the drawer closes on navigation.
   - Remove everything → empty state with the kalash and "Explore bestsellers".
4. **Footer**
   - Dark sky with twinkling gold stars and faint constellation lines that draw and fade.
   - A big mandala turning slowly top-right; a shooting star every ~12 s.
   - On `/` there is **no newsletter**. Open `/cart` → the newsletter shows there: a bad email gives a red error, a good one gives "Subscribed…".
   - Link underlines grow on hover. Social icons → "…link is coming soon" toast. English | हिंदी toggle.
5. **Language:** click हिं (header) → `/hi`, nav in Hindi (शॉप, परामर्श, कुंडली ₹99 …), strip messages in Hindi. Open `/hi/cart` and toggle back → `/cart` (same page).
6. **Back-to-top:** scroll far down on a long page (`/` with the card preview + footer, or use a short browser height) → a round button with a gold progress ring bottom-right; click → smooth scroll up.
7. **Lenis:** mouse-wheel scrolling on desktop feels smooth. With the drawer or search open, the page behind doesn't scroll, but the drawer list does.
8. **Mobile 390px**
   - Compact 56px bar: menu · centred logo + name · search · bag.
   - Bottom tab bar: Home (active green), Shop, raised green Consult circle with a turning gold chakra, Cart with badge, Account. Scroll down → the bar hides, the WhatsApp button drops to ~20px from the bottom; scroll up → both return.
   - Menu: dark full-screen menu, big serif links with Devanagari on the right (EN only) sliding in one by one, a faint turning mandala bottom-right, English/हिंदी chips, Wishlist/Account/Track order, WhatsApp + Call buttons.
   - Drawer is full-width. Adding from a card flies to the **header** bag.
   - Toasts sit above the tab bar. No horizontal scroll anywhere; the footer has space for the tab bar at the bottom.
9. **Route transitions:** click from `/` to `/wishlist`: the content fades up and a thin gold line runs across the top. A hard reload shows only the line.
10. **Coming-soon pages** (all branded, noindex): `/cart /checkout /wishlist /search?q=test /order/success /account /track-order /blog /contact /faq /policies/privacy /product/copper-12-nag /product/5-mukhi-rudraksha`. `/product/abc` → 404.
11. **Reduced motion ON:** no strip slide (instant swap), no mandala/chakra spin, no star twinkle, no drawer slide (it just appears), no page fade, and Lenis is off. Everything still works.
12. Any error → Fix-list.

### F5 — Home A · DONE
Read: INV §A.1 (§1–5), §E.1 S1–S4 S7 S9, §E.3. Design: `Home.dc.html` 29–344 + script 941–1079 and 1366–1479 · `mka-home.js` 12–184 · `mka-astro.js` 158–170, 422 (details: INV §H F5).
Tasks:
- [x] Hero:
  - arch frame;
  - PanditJi inline SVG with S1 blink, S2 japa (`malaAt`), S3 breath + aura, S4 gaze (desktop), S5 diya, S6 smoke;
  - Chakra halo S7;
  - floating gems with scroll/mouse parallax;
  - 3-slide text slider (mask lines, 6s progress, `01 / 03`, pause on hover or offscreen);
  - trust row, magnetic CTAs.
- [x] Mobile Quick Actions tiles.
- [x] Trust marquee (56s, pauses on hover).
- [x] Category arches (crescent rhythm, hover fill, snap rail on mobile).
- [x] Bestsellers tabs + grid (crossfade stagger).
- [x] 12 Nag spotlight ("12" parallax −0.2, thumbnails, benefits, qty, add to cart / buy now, ideal-for chips).
Done-notes:
- **Page:** `src/app/[locale]/page.tsx` now renders `Hero → TrustMarquee → CategoryArches → Bestsellers → NagSpotlight`.
  - The F2 placeholder, the F3 card preview and the `placeholder` message namespace are gone.
  - **F6 appends §6–9 and F7 appends §10–17 after `NagSpotlight`.**
  - `BUILD_NOW` (module scope) is the build date for date-dependent text on this static page.
- **Files** (`src/components/sections/home/`):
  - `Hero.tsx` (server) holds the whole hero:
    - background mandala (`MandalaG`, R 296) and `ArchClip`;
    - the night arch panel: radial glow, 34 seeded twinkle stars (`rng("hm-sky")`; stars 18+ hidden below 768), 3 chakra `<img>` rings spinning 120 / −90 / 60 s, and `PanditJi`;
    - `ArchFrame`, and the gems (2 mobile / 4 desktop sets from vHero G, `data-px` + `float` amb);
    - the 72px ivory fade (<1024) and the trust row.
    - Layout is CSS only. Below 1024 it stacks: art box `min(58svh, W×1.05+30px, W×1.14)` with W = min(100vw−32px, 520px); art 84% wide on mobile, 440px at 768–1023. From 1024 it has two columns, with art `clamp(400px, (100vh−170px)×.8, 560px)`.
  - `HeroArt.tsx` (client shell around the server art) runs `usePanditMotion` and the `[data-px]` parallax: −scrollY×px while scrollY < 1.4vh, plus ±px×32 toward the mouse on ≥1024.
  - `HeroSlides.tsx` (client) is the text column: slides, counter, progress, prev/pause/next. It wraps the trust row and QuickActions as children, so hovering anywhere in the column holds the slider, as in the design.
    - The entrance is **CSS** (the `[data-slide] [data-ln|data-fade]` keyframes at the end of `globals.css`; the stagger index is `--i`). The first slide therefore animates straight from the server HTML, with no flash.
    - The exit is WAAPI: 380 ms with EXIT easing; the next slide swaps in at 420 ms.
    - The progress is a 6 s WAAPI animation. It pauses on hover, via the toggle, when the hero is <5% visible, and while the tab is hidden. ←/→ on the controls step the slides.
    - Slide copy lives in `messages → home.hero.slides.s1–s3`. `<em>` is gold italic on EN and gold upright on HI. The EN page shows the Devanagari sub-line and the HI page the English italic one, as in the design.
  - `QuickActions.tsx` (client, `md:hidden`) has 4 tiles:
    - the kundali icon draws itself (`draw:7:0`), the heart beats (2.4 s), the phone wiggles (4.2 s), and the dotted rings spin;
    - the loops pause offscreen or on a hidden tab;
    - today's rashi glyph is resolved on the client (`useSyncExternalStore`; the server renders it empty).
  - `TrustMarquee.tsx` (server) uses `motion/Marquee`.
  - `CategoryArches.tsx` (server):
    - hover/focus states are pure CSS (`group-hover` / `group-focus`);
    - per-arch aspect and radius come through CSS vars (`--ar-d`, `--rad-d`, `--rad-m`);
    - the arch art uses `ProductImage` with `object-contain`, because the product SVGs are `meet`.
  - `Bestsellers.tsx` (server) resolves all 5 tab lists: best = hand-picked ids; new = `date` ascending; rud/br/am = the category sorted by `pop`, 8 max.
  - `BestsellerTabs.tsx` (client) does the swap:
    - out 170 ms → swap at 180 ms → in 520 ms with a 55 ms stagger. It runs in `useLayoutEffect`, so there is no flash.
    - Roving-focus tabs (←/→/Home/End).
    - The WhatsApp tile (static Baglamukhi yantra, per gotcha 10) shows when a list has fewer than 8 items (Amulets).
  - `NagSpotlight.tsx` (client):
    - gallery crossfade and the "12" parallax;
    - qty 1–10 with the roll and the max toast;
    - the Add morph flies the photo and toasts "Copper 12 Nag × n added to cart"; the drawer opens when the cart was empty;
    - Buy Now adds, then goes to `/checkout`;
    - wishlist burst + toast;
    - the next-energization date is the build date in the HTML and the viewer's date after hydration.
  - `home-data.ts`: category arch data (`{en,hi}`), tab keys and bestseller ids.
- **Shared additions:**
  - `components/signature/ArchFrame.tsx` (`ArchClip` + `ArchFrame`, inline JSX). `public/svg/ornaments/arch-frame.svg` is **not** usable as an `<img>`: the frame draws outside its viewBox.
  - `signature/PanditJi.tsx`, and `signature/usePanditMotion.ts` (exports `malaAt` and `malaSet`).
  - `lib/astro/rashi.ts` (`RASHI`, `sunRashi`, `todayRashi`). **F6: extend this module** rather than starting a new one.
  - `routes.bookHref(key, tier?)` → `/book/<service-slug>?tier=`.
- **i18n:** new namespace `home` (`hero`, `marquee`, `cats`, `best`, `spot`).
  - As in the design, the Bestsellers heading, the WhatsApp tile and the whole 12 Nag spotlight stay **English on `/hi`**. Their `hi.json` values are copies of the English (added to Client-confirm).
  - The HI aria labels (slider controls, quick actions, tablist) are ours → `[HI review]`.
- **Links:**
  - hero CTAs → `/shop`, `/consultations`, `/about`, `/kundali-99`, `/love-calculator`;
  - quick actions → `/kundali-99`, `/love-calculator`, `/rashifal`, `/book/kundali-reading`;
  - arches → `/shop/<category-slug>`; "View all" → `/shop` or the category;
  - spotlight link → `/product/copper-12-nag` (coming soon).
  - All of these 404 until their steps, except `/product/*`.
- Nothing was run except Prettier on the changed files (no dev / build / tsc / lint).

Manual QA (F5). `pnpm dev` → `/`, compare with `design/shots/h1.jpg`–`h4.jpg`:
1. **Desktop 1440px — hero**
   - Text on the left, art on the right, with a faint mandala behind the art.
   - The art: a dark arch with twinkling stars, three gold chakra rings turning at different speeds (the middle one reversed) and Pandit Ji seated in front. A gold arch frame has a finial on top and curls on the sides. 4 gems float around it.
   - Pandit Ji:
     - the eyes blink every few seconds, sometimes twice;
     - the mala beads step forward every ~1.2 s with a small thumb nudge;
     - a slow breathing scale and a pulsing aura;
     - the diya flickers and smoke rises;
     - move the mouse around: the pupils follow it slightly.
   - Move the mouse: the gems and stars shift a little. Scroll down: they drift up at different speeds.
   - Page load: the heading lines rise out of masks, then the eyebrow, sub-line, paragraph and buttons fade up.
   - Slider:
     - the gold bar fills over 6 s, then the lines exit upward and slide 02 comes in (`02 / 03`);
     - hover over the text column: the bar pauses; leave and it resumes;
     - the pause button changes to a play icon and stops the slider;
     - prev/next work; Tab to a control and press ← / →.
   - CTAs: on hover the primary gets a gold light sweep; both buttons lean slightly toward the cursor (magnetic).
   - Trust row under the controls: ★ 4.9 · 2,000+ reviews • Original Nepali Rudraksha • Energized in Mahapuja.
2. **Marquee:** a sand band with gold hairlines; uppercase items with lotus marks scroll left; hover pauses it.
3. **Categories:**
   - The heading lines mask up on scroll.
   - Five arches whose tops sit at different heights (the centre one is tallest).
   - Hover an arch: emerald fills up from the bottom, the art lifts, a gem floats in at the top right, and "SHOP NOW →" appears. The Tab key gives the same effect.
4. **Bestsellers:**
   - 8 cards in 4 columns.
   - Click New / Rudraksha / Bracelets / Amulets: the cards fade out and the new ones rise in one by one.
   - Amulets shows 7 cards plus the dark "Not sure which one?" WhatsApp tile.
   - The "View all" button text and link change per tab. Arrow keys move between tabs.
5. **12 Nag spotlight:**
   - A sand band with copper hairlines. A huge outlined "12" drifts as you scroll.
   - Thumbnails swap the main photo with a crossfade. A tilted "Small objects, big blessings." note sits on the photo.
   - Qty +/−: the number rolls; − is disabled at 1; at 10, + gives the "Maximum 10" toast.
   - Add to Cart → "Adding…" → green "Added ✓" → back to normal. The photo flies to the header bag and the toast says "Copper 12 Nag × n added to cart". With an empty cart, the drawer opens.
   - Buy Now → `/checkout` (coming soon), with the item in the cart.
   - Heart → red, with a gold burst and a "Saved to wishlist" toast.
   - Stock line: "In stock · next energization on <Thu, date>…".
6. **Tablet 820px:** art on top (440px wide, cropped at the bottom with a fade), text below, CTAs in a row. Bestsellers has 3 columns.
7. **Mobile 390px:**
   - Art on top (2 gems, 18 stars), then the text with **stacked** full-width CTAs, the controls and the trust row.
   - Then the 4 quick-action tiles: Kundali ₹99 draws itself, the heart beats, today's rashi glyph shows, the phone wiggles. Each has a turning dotted ring.
   - Categories become a swipeable snap rail with 62%-wide arches.
   - Bestsellers has 2 columns.
   - Spotlight: the thumbnails sit in a row under the photo; the note sits bottom-left.
   - No horizontal scroll on the page.
8. **`/hi`:**
   - Hindi slides: Tiro heading, English italic sub-line, Mukta buttons.
   - Hindi trust row, marquee, category header and names, and tab labels.
   - The Bestsellers heading and the 12 Nag block stay English, as in the design.
9. **Reduced motion ON:**
   - No slide auto-advance: the bar is full and the buttons still switch instantly.
   - No blink, mala, breath, gaze, parallax or magnetic pull.
   - No marquee movement, no heading masks, no chakra/gem/star motion, no quick-action loops.
   - Everything is still usable.
10. Switch to another tab for a while, then come back: the slider and animations resume without jumping several slides.
11. Any error or type error → put it in the Fix-list.

### F6 — Home B · DONE
Read: INV §A.1 (§6–9), §E.1 S8 S9 S12 S13. Design: `Home.dc.html` 346–645 + script 1081–1247 · `mka-astro.js` 9–151, 154–200, 260–280, 298–318, 342–386 · `mka-home.js` 262–265 · `mka-core.js` 528–533 (details: INV §H F6).
Tasks:
- [x] `src/lib/astro/*`: port RASHI, predict, sunRashi, kundali (approx), chart, love, nameNum.
- [x] RashiWheel (S8: 4s spring step, click-to-spin, pause 12s, pause button, keyboard) + detail panel (tabs, meters, lucky trio, gemstone cross-sell).
- [x] Mobile half-dial synced to the swipe rail.
- [x] Astro tools pair: Kundali mini form + self-drawing chart (S12), and Love Calculator with converging medallions and the ring fill (S13).
- [x] Consultations bento + how-it-works strip.
- [x] Intentions: 10 floating stones (S9, mouse depth), intention pills revealing 4 products.
Done-notes:
- **Page:** `src/app/[locale]/page.tsx` now renders `… NagSpotlight → RashifalSection → AstroTools → ConsultBento → Intentions`. **F7 appends §10–17 after `<Intentions />`.** `BUILD_NOW` goes to the date-dependent sections.
- **Astro logic** (`src/lib/astro/`, pure, works on server and client):
  - `rashi.ts`: `RASHI`, `rashiByKey`, `sunRashi`, `todayRashi(now)`, `compatible` (for F12).
  - `predict.ts`: `PERIODS`, `AREAS`, `periodDate(p, now)`, `predict(r, p, now)`. The OPEN/AREA templates are closure constants in the prototype, so they live in this file (the extractor cannot read them). **Always pass `now`.**
  - `kundali.ts`: `GRAHA`, `NAK`, `CITIES`, `DEMO_K` (precomputed JSON), `placeSearch`, `kundali({dob, tob, unknown, city})` — a 1:1 port of the approximate maths (IST for every city).
  - `chart.ts`: `CHART_LINES` + `chartLayout(K, hi)` (sign numbers and planet label positions).
  - `love.ts`: `nameNum`, `love(a, b)`, `initial`, `NUMP`, `KOOTA`, `hasTwoLetters`.
  - `src/lib/validation/astro.ts`: zod checks that return error codes (`checkKundali(draft, todayIso)`, `checkLove(a, b)`); the components map codes to `home.tools.k.err.*`.
- **Signature pieces** (`src/components/signature/`), reusable for F9–F12:
  - `KundaliChart.tsx`: JSX North-Indian chart (`K, col, ink, sub, fs, sw, hi, label`); lines carry `data-cl`, labels `data-pl`.
  - `RashiGlyph.tsx`: one of the 12 glyphs (`k, col, sw`).
  - `RashiWheel.tsx`: `WheelLayers` (nak img spin 240 s · graha ring spin −320 s · rashi ring `[data-rot]` · ॐ centre · pointer img) + `wheelActive(root, i)`.
  - `useRashiCycle(start, mobile)`: the S8 engine → `{idx, playing, toggle, hold, prev, next, onWheelClick, onRail, refs: {wheelEl, wheelRing, dialEl, dialRing, railEl}}`.
    - The 4 s tick runs only when playing, not held (12 s), ≥25% in view, the tab is visible and motion is allowed.
    - Desktop turns the ring the shortest way (forward when auto-stepping), 900 ms with a ±1.8° overshoot; mobile smooth-scrolls the rail and the dial follows the scroll.
    - **F12 Rashifal should reuse it** (same S8).
  - `components/motion/draw.ts`: `prime(root)`, `drawChart(root, {dur, delay})`, `onView(el, fn, threshold)` (S12; also for palm / Lo Shu / yantra strokes later).
- **Sections** (`src/components/sections/home/`):
  - `RashifalSection.tsx` (server: 30/16 seeded stars `hm-rsky`, mandala, gemstone map per rashi) → `RashifalWheel.tsx` (client).
    - Both layouts are rendered; CSS shows the wheel + panel ≥768 and the half-dial + rail <768 (`w900`: 2 columns and a 560px wheel).
    - The start rashi is today's sun sign: the build date in the HTML, the viewer's date after hydration.
    - Panel: Today/Week/Month tabs (roving ←/→), meters, lucky number / colour / gemstone (→ bracelet PDP), remedy, "Read full Rashifal" → `/rashifal/<key>?p=` (`routes.rashiHref`, 404 until F12).
    - ←/→ on the wheel controls step; focus, hover and touch hold the cycle.
  - `AstroTools.tsx` (server header + grid 7fr/5fr ≥1100) → `KundaliMini.tsx` and `LoveMini.tsx` (clients).
    - Kundali: the demo chart is primed and drawn at 35% in view. Generate → validation, dim to .18 (400 ms), "Calculating…" for 1.3 s, then the new chart draws and the facts stagger in. The place combobox also takes ↑/↓/Enter/Esc (the prototype was mouse-only). The date `max` is the viewer's today.
    - Love: medallion offset = `var(--lw) × g`, where `--lw` is the prototype's stage-width estimate written in CSS (`max(260px, …)`, plus the lg formula), so the server HTML already matches. Converge 700 ms → +650 ms ring 1400 ms EASE + count-up → +1450 ms result stagger. "Book a Kundali Milan consultation" → `/book/kundali-reading?tier=premium`.
  - `ConsultBento.tsx` (server): Kundali tile (static demo chart at 20%, seal `spin:80`), Palmistry (brass palm, no labels), Tarot (`glow:5`), Numerology (Lo Shu), then "How a consultation works" (१–४). The art is static, as in the prototype (gotcha 10).
  - `Intentions.tsx` (server; picks the 4 products per intention with `INTENT_RX`) → `IntentPicker.tsx` (client).
    - Stones: 10 desktop / 5 mobile (`STONES_DESK/MOB` in `home-data.ts`), mouse depth pull ≥768.
    - Pills use roving ←/→; the cards rise in (520 ms, 70 ms stagger).
    - **Mobile product row:** the prototype's `width:100%` + `margin:0 -16px` inside a centred flex column cancels out, so the rail does *not* bleed to the screen edge. We match that rendered result.
- **Extractor:** `scripts/extract-design.mjs` now tokenises the rashi-segment ids (`rashi-<key>-__U__`), because the wheel and the dial are both in the DOM. Re-ran it; only `src/lib/art/wheel.ts` changed.
- **Routes / utils:** new `rashiHref(key, p?)` in `src/lib/routes.ts`; `src/lib/utils/roving.ts` (`rovingTarget`) for tablists.
- **i18n:** new `home.rashi`, `home.tools` (`k`, `l`), `home.bento`, `home.intent`.
  - As in the design, §6–9 stay **English on `/hi`**: each section has `lang="en"`, and the Devanagari subtitles keep `lang="hi"`. The `hi.json` values are English copies (added to Client-confirm).
  - Rashi, prediction, service and step copy stays in the data files (English content, as designed).
- Nothing was run except Prettier and `node scripts/extract-design.mjs` (no dev / build / tsc / lint).

Manual QA (F6). `pnpm dev` → `/`, scroll past the 12 Nag spotlight. No reference shot covers §6–9 (`h1–h4` are §1–5), so compare with `design/Home.dc.html` opened in the browser.
1. **Rashifal, desktop 1440px**
   - Night band with twinkling gold stars and a faint mandala bottom-right.
   - Header: "04 — आज का राशिफल · DAILY RASHIFAL" and "Your rashi, / *read for today.*" (the lines mask up). On the right: today's date (e.g. "Wednesday, 30 Sep 2026") and the intro line.
   - Wheel on the left (560px): outer ring with 12 glyphs and Devanagari names; the nakshatra ring turns slowly one way and the graha ring (सू चं मं …) the other way; ॐ centre; gold pointer at the top. Today's rashi sits under the pointer, highlighted (pale-gold glyph + name, soft fill).
   - Every ~4 s the ring springs to the next rashi (small overshoot) and the panel fades in the new reading.
   - Hover the wheel → the cycle waits ~12 s. Click any rashi → it turns the short way to the pointer.
   - Prev / next step. Pause → play icon, and the cycle stops; resume starts it again. Tab to a control and press ← / →.
   - Panel:
     - Today / Week / Month tabs (gold when active; ← / → move);
     - glyph circle, name + Devanagari, "Aries · 14 Apr – 14 May · Lord Mangal (Mars)";
     - reading text and 4 meters with 5 dots;
     - lucky number, colour swatch, gemstone link (→ bracelet page, coming soon);
     - remedy with a diya icon;
     - "Read full Rashifal" (→ `/rashifal/<rashi>?p=…`, 404 until F12) and "Get personal Kundali ₹99".
   - The same day always gives the same text; the Week and Month texts differ from Today.
2. **Rashifal, tablet 820px:** one column (a 460px wheel above the panel).
3. **Rashifal, mobile 390px**
   - The top half of a big dial peeks out and fades into the night at the bottom.
   - Card rail below; the active card has a gold ring. Swipe → the dial turns with your finger and the dots follow.
   - Every ~4 s (hands off for 12 s after a touch) the rail glides to the next card; after Meena it glides back to Mesha.
   - "Read in full →" on each card; the outlined "Get personal Kundali ₹99" below.
4. **Astro tools, desktop:** sand band; the emerald Kundali card (gold corners, faint mandala) on the left, the ivory Love card (rose top bar) on the right.
   - Kundali, on scroll: the chart lines draw one by one, then the planet labels pop in.
   - Submit empty → "Enter the name for the report", "Enter your date of birth", "Enter your place of birth" in rose, with pink rings. Tick "I don’t know my exact time" → the time field greys out.
   - Type "var" → the list shows Varanasi; ↓ + Enter or a click picks "Varanasi, Uttar Pradesh". Type "xyz" and submit → "Choose a town from the list".
   - Valid submit → "Calculating…", the chart dims, "Calculating planetary positions…", then the new chart draws and the Lagna / Moon sign / Nakshatra boxes rise in, plus "Get the 28-page report · ₹99". With the unknown-time tick the noon note shows. The button now reads "Update my chart".
   - Love: two medallions (rose + emerald) showing "·". Typing names shows the initials and pulls them slightly closer.
   - Calculate with one empty name → red rings + "Please enter both names…".
   - Valid → "Reading the numbers…", the medallions overlap, the gold ring fills while the % counts up, then e.g. "84% · Harmonious Bond / मधुर बंधन" + a line. The same pair always gives the same %.
   - Editing a name resets. "Try another pair" clears both. "Book a Kundali Milan consultation" → `/book/kundali-reading?tier=premium` (404 until F10).
5. **Astro tools, other widths:** 1024px → the two cards stack at full width. 700px → chart and form side by side inside the Kundali card. 390px → chart on top, form below; the love name fields stack below 480px.
6. **Consultations bento, desktop**
   - Big dark Kundali tile (2×2) with a faint chart and a slowly turning "SATISFACTION GUARANTEE" seal.
   - Palmistry (wide, palm drawing on the right), Tarot (sand, glowing cards), Numerology (dark, Lo Shu grid). Mode icons show a tooltip on hover.
   - "Book now" → `/book/<service>`; names → `/consultations/<service>`; "Compare all four" → `/consultations` (404 until F9/F10).
   - Below: a dashed rule, "HOW A CONSULTATION WORKS" and steps १ २ ३ ४ in 4 columns (2 on tablet, 1 on mobile).
7. **Shop by intention, desktop**
   - 10 gemstones float around the heading; move the mouse → they drift toward it by depth, smoothly.
   - 7 pills, Wealth active (dark). Click Love → the line changes and 4 new cards rise in one by one. ← / → move between pills.
   - "Shop everything for love →" → `/shop?intent=love` (404 until F8).
8. **Shop by intention, mobile 390px:** 5 small stones along the top, big top padding, wrapping pills; the cards are a swipe row (64% wide) inside the content width.
9. **`/hi`:** §6–9 stay English with their Devanagari subtitles (as in the design); no layout breaks.
10. **Reduced motion ON:** the wheel never auto-steps (buttons and clicks jump instantly); no star, ring or stone motion; charts show complete; the love ring and number jump straight to the result; no card or panel fades.
11. Switch to another tab for a while and come back: the wheel resumes without skipping several rashis.
12. Any error or type error → Fix-list.

### F7 — Home C · DONE
Read: INV §A.1 (§10–17), §A.6, §E.1 S11, §E.3. Design: `Home.dc.html` 647–933 + script 1248–1365 · `FaqList.dc.html` 15–59 · `mka-home.js` 185–300 · `mka-astro.js` 203–258, 327–333, 389–407, 410–420 · `mka-core.js` 534–541 (details: INV §H F7).
Tasks:
- [x] Sadhana course track (night; yantra draw S11; drag/scroll/swipe).
- [x] Rituals process line (fills on scroll).
- [x] About teaser (arch portrait, quote card, timeline, count-up stats, book).
- [x] YouTube: facade player (youtube-nocookie iframe only on click) + playlist; mobile Shorts stories row + viewer (keyboard, Esc).
- [x] Testimonials masonry (text, video, photo reviews; mobile carousel).
- [x] Blog cards, FAQ (`FaqList` component, set `home`, openFirst).
- [x] Newsletter band. Footer with `newsletter="off"` on Home.
Done-notes:
- **Page:** `src/app/[locale]/page.tsx` now renders all 17 sections: `… Intentions → CourseTrack → RitualsTeaser → AboutTeaser → VideoSection → Testimonials → Journal → FaqSection → NewsletterBand`. Home is complete. The footer newsletter was already off on `/` (`chrome-config`).
- **Sections** (`src/components/sections/home/`, all `lang="en"` like F6):
  - `CourseTrack.tsx` (server): night band, `Starfield` (seed `hm-csky`, 26 / 14 mobile), copy + ₹50,000 box + "Enquire about enrollment" → `/sadhana-courses#enquire`; cards → `/sadhana-courses/<key>-sadhana`.
    - `CourseRail.tsx` (client): mouse drag (5px threshold, snap off, snap back after 60 ms, click suppressed after a drag), prev/next ±306px.
    - Yantras are primed and drawn at 35% in view (1600 ms), and redraw on card hover/focus (1800 ms throttle).
    - The track bleeds to the right edge (−16 / −32 / `calc(-1*max(32px,(100vw-1320px)/2+32px))`).
  - `RitualsTeaser.tsx` (server): thali (`THALI_HOME_SVG`) under a `glow:5` halo, sticky at top 120 on ≥1024; ethics quote; sheen CTA → `/rituals#inquire`.
    - `RitualSteps.tsx` (client): 1px sand rail + `ScrollLine` gold fill, measured on the whole list. Lit steps: `n = min(5, floor(p·5+.35))`, with 500 ms transitions.
  - `AboutTeaser.tsx` (server):
    - mini timeline, `CountGroup` stats (18+, 12,000+, 3,500+), book card (`BOOK_SVG.satya`), CTAs → `/about` and `/consultations`;
    - arch portrait (`PORTRAIT_HOME_SVG`) with its outline and the overlapping quote card (`about.json` quote);
    - art comes first below 1024.
  - `VideoSection.tsx` (server) → `VideoPlayer.tsx` (client; exports `VideoPlayer`, `ShortsRow`, `YtSubscribe`).
    - Only the 6 videos + 6 Shorts used send their thumbnail strings (from `lib/art/thumbs.ts`) as props. Each renders with its own uid (`hf` / `hp` / `hsr` / `hsv` + id).
    - **Facade:** nothing loads from YouTube until play.
      - If `YT_IDS[id]` has an id (new in `src/lib/site.ts`, empty for now), play swaps in the `youtube-nocookie` iframe (`ytEmbed`). The CSP already allows it.
      - Without ids (the demo) it runs the design's preview playback: the thumb dims to .55, a WAAPI bar runs over the full length, a 1 s clock ticks, and pause/resume work.
      - The preview auto-pauses offscreen and on a hidden tab. Reduced motion steps the bar once per second.
    - "Subscribe on YouTube" → the channel if `SOCIAL.youtube.url` is set, else the design's toast. "All discourses and Shorts" → `/videos` (`videoHref`).
  - `src/components/sections/videos/ShortsViewer.tsx` (client, **reuse in F14**):
    - Radix Dialog (focus trap, scroll lock, focus return); Close is focused on open.
    - One segment per short: it fills over the short's duration and auto-advances; the viewer closes after the last one.
    - Tap zones, ←/→, Esc. The fill pauses on a hidden tab. Reduced motion: full segment, no auto-advance.
    - Labels are in the new top-level `shorts` namespace.
  - `Testimonials.tsx` (server):
    - 10 cards in the design order (`TESTI_ORDER`): masonry with 2 columns ≥768 and 3 columns ≥1100; mobile snap rail at 84% width.
    - Photo reviews use `ProductImage` + "Verified buyer".
    - Video cards render **light** (gotcha 9) with `PORTRAIT_TESTI_SVG` (new extractor output, u = vt0 / vt1) and link to `/videos` (INV §C M.soon map).
  - `Journal.tsx` (server): a featured card + 2 compact cards (articles 0–2). Every link → `/blog` (coming soon, INV §C). Generated product art is `object-contain`; photos cover.
  - `FaqSection.tsx` (server): heading + sticky WhatsApp card + `FaqList` set `home`, first answer open.
  - `NewsletterBand.tsx` (client):
    - emerald band, 2 columns ≥900;
    - mock subscribe (same regex as the footer): rose ring + alert on error, then the "Subscribed…" status;
    - "Join WhatsApp updates" → `wa.me/…?text=Join%20updates`.
- **Shared additions:**
  - `components/ui/FaqList.tsx` (client) is the design's FaqList, for F9/F11/F13: pass `items` (a `faq.json` set) and `openFirst`.
    - The icon turns via `transform`, because Tailwind v4 `rotate-*` sets the `rotate` property, which this transition would not animate.
  - `components/signature/Starfield.tsx`: generic `M.stars` port (`seed, n, nMob, w, h`).
  - `motion/draw.ts` → `drawYantra(root, dur)` (S11; F13 reuses it).
  - `ScrollLine` has a new `measure` ref prop.
  - `CountGroup` now drops the numbers to 0 after hydration (design `v0 = '0'`).
  - `lib/routes.ts`:
    - `courseHref(key)` builds `<key>-sadhana` without importing the JSON, to keep client bundles small;
    - `anchors.coursesEnquire / ritualsInquire`;
    - `videoHref(id?, c?)`.
  - `home-data.ts`: `ROMAN`, `DEVA_NUM`, `ABOUT_MINI`, `ABOUT_STATS`, `VIDEO_TESTI`, `TESTI_ORDER`.
- **Extractor:** added `PORTRAIT_TESTI_SVG` to the portrait module and re-ran `node scripts/extract-design.mjs`. Only `src/lib/art/portrait.ts` changed.
- **i18n:** new `home.courses`, `home.rituals`, `home.about`, `home.video`, `home.testi`, `home.journal`, `home.faq`, `home.news`, plus the top-level `shorts`.
  - As in the design, §10–17 are English on `/hi` (with their Devanagari subtitles). The `hi.json` values are English copies (added to Client-confirm).
- Nothing was run except Prettier and `node scripts/extract-design.mjs` (no dev / build / tsc / lint).

Manual QA (F7). `pnpm dev` → `/`, scroll past "Shop by intention". No reference shot covers §10–17, so compare with `design/Home.dc.html` opened in the browser.
1. **Sadhana courses, desktop 1440px**
   - A night band with twinkling stars.
   - On the left:
     - "08 — SADHANA COURSES" and "Sadhana is / *a science.*" (the lines mask up), then the Devanagari line and the paragraph;
     - the ₹50,000 box;
     - the outlined "Enquire about enrollment" (→ `/sadhana-courses#enquire`, 404 until F13).
   - On the right: six 290px cards that run off the right edge.
     - On scroll, each yantra draws itself line by line, then a soft gold glow blooms.
     - The badges read "I · 36 days" … "VI · 41 days".
   - Hover a card: it lifts 4px, the gold ring brightens and the yantra redraws (at most once every ~2 s).
   - Drag the track with the mouse: it scrolls, and on release it snaps to a card. A drag does **not** open the link.
   - A plain click opens `/sadhana-courses/<deity>-sadhana` (404 until F13). The ‹ › buttons scroll by one card.
2. **Rituals, desktop**
   - The thali (flickering diya, smoke, glow) stays sticky while the right column scrolls.
   - As you scroll, the gold line fills down the 5 steps. Each step in turn becomes an emerald circle with a gold icon, at full opacity.
   - Then the ethics quote box and "Request a ritual consultation": a gold sheen on hover, → `/rituals#inquire`.
3. **About teaser, desktop**
   - Text on the left. On the right, the arch portrait with a thin gold outline and the quote card overlapping it bottom-left.
   - The stats count up once from 0 to 18+ / 12,000+ / 3,500+ when they come into view.
   - The book card shows the green "साधना के सत्य" cover.
   - "Read his story" → `/about`; "Book a consultation" → `/consultations`.
4. **YouTube, desktop**
   - A night band with a faint mandala top-right. "1.2 lakh subscribers" + the gold "Subscribe on YouTube" (toast: "The YouTube channel link will be added here.").
   - The featured 16:9 thumbnail has a gold play circle and "18:42".
     - Click play: the thumb dims, the bar fills slowly, the clock counts 0:01, 0:02…, and the "Preview playback · …" note shows.
     - Pause/Play works. Scroll away or switch tab → it pauses.
   - DevTools → Network: **no request to youtube.com or youtube-nocookie.com** at any point (there are no ids yet).
   - "Up next" (6 videos, 500px tall, scrollable):
     - clicking one swaps the featured video and resets it to idle;
     - the active row has a dark fill and a gold ring.
5. **Testimonials**
   - "4.9 / 5" with stars and "from 2,000+ seekers".
   - 3 masonry columns (2 at 820px), with three kinds of card:
     - text cards;
     - photo cards with "Verified buyer";
     - two light video cards with a portrait and a play circle (→ `/videos`, 404 until F14).
6. **Journal:** a sand band with the big featured card on the left (rudraksha art) and two compact cards on the right. The compact cards get a gold ring on hover. All links → `/blog` (coming soon).
7. **FAQ**
   - The left column (with the emerald WhatsApp card) is sticky. "Chat on WhatsApp" opens wa.me in a new tab.
   - The first answer is open. Click another question: the previous one closes, the new one fades down and its + turns into ×.
   - Keyboard: Tab to a question, then Enter/Space toggles it.
8. **Newsletter**
   - An emerald band with a mandala on the left.
   - Subscribe with an empty or invalid email → rose ring + "Enter a valid email address".
   - A valid email → "Subscribed. The next Rashifal reaches you on the 1st."
   - "Join WhatsApp updates" → wa.me with "Join updates".
   - The footer below has **no** newsletter row on Home.
9. **Mobile 390px**
   - Courses: one column; the cards are 76% wide in a swipe rail that reaches the screen edge; the yantras draw on view.
   - Rituals: the thali on top (not sticky), the steps below.
   - About: the 300px portrait first, the quote card full width under it, then the text.
   - YouTube:
     - a row of round Shorts stories (gold/copper ring) sits above the player;
     - tap one → a full-screen 9:16 viewer. The segments at the top fill and advance to the next short;
     - tap the right / left side = next / previous; ✕ closes; after the last short it closes by itself; the page behind doesn't scroll;
     - "Up next" sits under the player, with no height limit.
   - Testimonials: a swipe rail of 84%-wide cards.
   - Journal: the compact cards have a 96px image.
   - Newsletter: stacked.
   - No horizontal page scroll anywhere.
10. **Keyboard in the Shorts viewer** (desktop, window narrower than 768px): open a short → the focus is on ✕. ← / → switch shorts. Esc closes, and the focus returns to the story button.
11. **`/hi`:** §10–17 stay English with their Devanagari lines, as in the design. No layout breaks.
12. **Reduced motion ON:**
    - yantras show complete, with the glow;
    - the ritual line is full and all steps are lit;
    - the stats show the final numbers;
    - FAQ answers appear without the fade;
    - no star twinkle, thali glow or smoke;
    - the Shorts segment shows full and does not auto-advance;
    - the video preview bar moves in 1-second steps.
13. Any error or type error → Fix-list.

### F8 — Shop + category · DONE
Read: INV §A.5, §C (shop rows), §D. Design: `Shop.dc.html` 26–384 · `mka-core.js` 176–194, 308–380 (details: INV §H F8).
Tasks: the `/shop` and `/shop/[category]` template, exactly as designed:
- [x] header band, sub-chips, sticky filter sidebar, sort, active chips;
- [x] mobile Filter · Sort bar + bottom sheet;
- [x] editorial banner (design: shown once, at index cols×2 — INV gotcha 4), load more (+12) with progress;
- [x] skeleton and empty states, SEO text block.

Filters are URL-synced (search params).
Done-notes:
- **Routes:** `src/app/[locale]/shop/page.tsx` (all) and `shop/[category]/page.tsx` (5 slugs via `generateStaticParams`, `dynamicParams = false`, unknown → 404). Both are static and render the same client view with `initialCat`. Basic `generateMetadata` (title + description).
- **View** (`src/components/sections/shop/`):
  - `ShopView.tsx` (client) is the design's state machine.
    - SSR = the route's category, no filters, **loading** (skeletons). On mount the URL is parsed; the grid appears after **650 ms** (design didMount).
    - Every change applies at once, shows skeletons for **380 ms**, resets to 12 shown and closes the sort menu.
    - **URL sync:** category = path (`/shop/<slug>`), filters = `?sub=&intent=&mukhi=&stone=&min=&max=&stock=1&rating=&sort=` (lists comma-separated; defaults omitted). Written with `history.replaceState(null, …)` (Next syncs its router), so switching category never remounts the page.
    - `UrlWatch` (in its own `<Suspense>`, `useSearchParams` + `usePathname`) re-parses on outside navigations (mega menu, `/shop?intent=` links). Our own writes are skipped via `lastUrl`.
    - QA-only `?demo=loading|empty` (design prop `demo`); never written back.
    - Stagger: cards fade up 10px / 380 ms / 40 ms step whenever the result key (incl. `shown`) changes, as in the design (so "Load more" re-staggers every card).
    - Tabs use roving focus (←/→/Home/End move focus, Enter/Space selects), so arrow keys don't fire a reload per key.
  - `ShopHeader.tsx`:
    - mandala (`/svg/ornaments/mandala-7a5c1c.svg`), breadcrumb (the Shop crumb switches to "all" in place);
    - eyebrow + display h1, **English on /hi** like other display headings; Devanagari line; description (`deshi` on /hi); count;
    - arch + floating art (`HEADER_ART`: 1 piece, or 3 on "all"; `data-amb=float`).
  - `FilterPanel.tsx`: Category (radio) · Intention (checkbox, counts within the category) · Price · Mukhi chips (all/rudraksha) · Crystal type (all/bracelets, first 6 + "Show all 15") · Availability switch · Rating (radio).
    - Variant `side`: "Refine" + Clear all. Variant `sheet`: title/close + sticky Clear / "Show N results".
  - `PriceRange.tsx`: two thumbs, √ scale snapped to ₹50, ₹100 minimum gap. A drag previews and commits on release; arrow keys move ±3% and commit at once.
  - `SortControls.tsx`:
    - `SortMenu`: the ≥1024 dropdown; closes on pick, outside click or Esc;
    - `BottomSheet`: Radix Dialog shell, slide-up 380 / 360 ms, z 55 (above the tab bar and FAB);
    - `SortSheet`.
  - `ShopGrid.tsx`:
    - cards / skeletons (fx `shimmer`) / editorial banner (once at `cols×2`; stars + mandala; floating art ≥1024);
    - `EmptyState`;
    - `LoadMore`: a 520 ms row of skeletons, +12, gold progress bar.
  - `BuyersNote.tsx`: 96px clamp with a fade; "Read more / Read less" (600px); copy per category (rudraksha / bracelets / all).
  - `shop-data.ts`: `Filters`, defaults, `parseShopUrl` (drops unknown values), `shopUrl`, `urlKey`, `toPos/toVal`, header/banner maps.
- **Shared changes:**
  - `queryProducts` + `SORTS` moved to `src/lib/core/query.ts` (no JSON imports, safe for client bundles); `lib/api/catalog.ts` re-exports it.
  - `PageTransition`: no fade and no gold line when the path changes between `/shop` routes (an in-place category switch = the design's `#c=` hash change).
- **i18n:** new `shop` namespace in `messages/en.json` + `hi.json`. The Hindi is ours (`[HI review]`). The title, eyebrow and bilingual intent labels ("Wealth · धन") stay as in the design.
- **Breakpoints (INV §D):**
  - grid: 2 cols <768, 3 cols ≥768, 4 cols ≥1400 (`2xl`);
  - sidebar + dropdown ≥1024; Filter·Sort bar + sheets <1024;
  - header art 118×154 <768, 200×260 ≥768.
- **For later steps:**
  - `BottomSheet` (SortControls) is a generic mobile sheet; `Chip` already matches the filter chips.
  - The SSR HTML shows skeletons instead of cards (the design's loading state). Phase B SEO may want server-rendered cards for the no-query case.
- Nothing was run except Prettier (no dev / build / tsc / lint).

Manual QA (F8). `pnpm dev`. No reference shot covers the shop, so compare with `design/Shop.dc.html` in the browser (`Shop.dc.html#c=rudraksha` etc. for the categories).
1. **`/shop`, desktop 1440px**
   - Sand header: a faint mandala on the right; breadcrumb "Home / Shop"; "— THE SHOP · सभी उत्पाद"; "All sacred *offerings*"; the Devanagari line; the paragraph; "43 offerings · 🔥 Energized in Mahapuja before dispatch".
   - On the right: a gold arch with 3 floating pieces (rudraksha, pyrite bracelet, Baglamukhi amulet), gently bobbing.
   - Tabs "All 43 · Rudraksha & Malas 15 · …" with a gold underline on the active tab; intent chips below.
   - For ~0.65 s: shimmering skeletons and "Finding offerings…". Then the cards fade up one after another.
2. **Sidebar (≥1024)**
   - It is sticky and scrolls on its own: the mouse wheel over it scrolls the list, not the page.
   - Each group header collapses/opens, and its chevron turns.
   - Category radios switch the category: the header, the tabs and the URL path all change, with no page fade.
   - Check each control:
     - intention checkboxes;
     - the price slider: drag both thumbs; values snap to ₹50 and the thumbs can't cross;
     - mukhi chips (5 per row);
     - "Show all 15" crystal types;
     - the "In stock only" switch;
     - rating radios.
   - After each change: skeletons for ~0.4 s, then the count updates and chips appear above the grid. "Clear all" (red) shows in the Refine header.
3. **URL**
   - Every filter shows in the address bar, e.g. `/shop/crystal-bracelets?intent=love,peace&max=1500&sort=low`.
   - Reload → the same filters come back. Paste the URL into a new tab → the same view.
   - `/shop/unknown` → 404.
4. **Sort:** "Sort Popular ▾" opens a 230px menu with a tick. Pick "Price: low to high" → the order changes. A click outside or Esc closes the menu.
5. **Active chips:** each chip's × removes just that filter. The price chip reads like "₹0–₹1,500".
6. **Editorial banner**
   - After the first 2 rows (8 cards at 1440, 6 at 1024–1399): a night banner "Not sure where *to begin?*" with stars, a faint mandala and floating art.
   - The Rudraksha / Bracelets / Amulets tabs change its title and art.
   - "Ask on WhatsApp" → wa.me. "Book a consultation" → `/consultations` (404 until F9).
7. **Load more**
   - "Showing 12 of 43" with the gold bar at ~28%.
   - Click → a row of skeletons for ~0.5 s, then 24 shown and the bar grows.
   - At the end the button disappears.
8. **Empty state**
   - Set the price max to ₹300 and pick "4.8 ★ & above", or open `/shop?demo=empty`: the lotus box "No offerings match these filters" with "Clear filters" + "Ask on WhatsApp".
   - `/shop?demo=loading` → skeletons forever.
9. **Categories**
   - `/shop/rudraksha-malas`: eyebrow "02 — Rudraksha & Malas", title "Rudraksha & *Malas*", one centred bead in the arch, sub-chips "All · 2 Mukhi … 14 Mukhi · Malas".
   - Havan / Copper: no sub-chips, a photo in the arch.
   - Mega-menu category links and the Home "Shop by intention" links land on the right view.
10. **Buyer's note:** the heading changes by category. The text is clipped with a fade; "Read more" opens it smoothly and "Read less" closes it.
11. **Mobile 390px**
    - The header art (118×154) sits right of the text. Tabs and chips scroll sideways without a scrollbar.
    - A sticky "Filter | Popular" bar sits under the header.
    - Filter → a bottom sheet slides up: up to 88% height, its own scroll, sticky "Clear" + "Show N results".
      - The badge on "Filter" shows the active count.
      - The page behind doesn't scroll. Esc, the backdrop and × all close it.
    - Sort → the "Sort by" sheet with radio rows; picking one applies and closes.
    - Grid: 2 columns (compact cards with the round + button); the banner after 4 cards, without art.
    - No horizontal page scroll.
12. **Tablet 820px:** 3 columns, still the Filter·Sort bar + sheets (no sidebar).
13. **Keyboard**
    - Tab to the tabs; ←/→ move the focus, Enter selects.
    - Price thumbs: the arrow keys move them.
    - The sheets trap focus and return it on close.
14. **`/hi/shop`:** the UI (breadcrumb, tabs, filters, sort, buttons, note, banner) is in Hindi; the title and eyebrow stay English like the design. URL writes keep the `/hi` prefix.
15. **Reduced motion ON:** no shimmer, no card stagger, no sheet slide; the arch art stays still. Everything else works.
16. Any error or type error → Fix-list.

### F9 — Consultations · DONE
Read: INV §A.7–§A.9, §C (consult rows). Design: `Consultations.dc.html` 27–288 · `Consultation-Detail.dc.html` 27–229 · `InquiryForm.dc.html` 15–163 · `mka-astro.js` 134–170, 249–295, 298–318, 327–333, 389–398, 410–422 (details: INV §H F9).
Tasks:
- [x] `/consultations` landing.
- [x] `/consultations/[service]` (4 services, tiers, sticky Book CTA).
- [x] `InquiryForm` component (kinds: course, ritual; presets; RHF + Zod; mock submit states).

Done-notes:
- **Routes:**
  - `src/app/[locale]/consultations/page.tsx`: hero → four services (`#services`) → how it works → credentials → testimonials → FAQ. Static.
  - `src/app/[locale]/consultations/[service]/page.tsx`: the 4 slugs via `generateStaticParams`, `dynamicParams = false` (unknown → 404). Hero → what's covered → sample pages → packages (`#tiers`) → service FAQ → other services, plus the sticky Book bar. `generateMetadata` = service name + long description.
  - `src/app/[locale]/preview/inquiry-form/page.tsx`: **QA-only** InquiryForm preview (`?kind=course|ritual&preset=<course key>`). It calls `notFound()` in production builds and is `noindex`. Remove it in F15, once F13 puts the form on real pages.
- **Data seam:**
  - `src/lib/api/consult.ts`:
    - getters `getServices`, `getService(slug|key)`, `getModes`, `getConsultSteps`, `getTestimonials`, `getFaq(set)`;
    - types `Service`, `Tier`, `ServiceKey`, `TierKey`, `ModeKey`;
    - helpers `isReport` (palmistry = a report, not minutes) and `recTier` (the "Most chosen" tier).

    F10 should reuse these.
  - `src/lib/api/content.ts`: `getCourseOptions()` (key/en/hi) for the form's course select. F13 extends this module (courses, rituals).
  - `src/lib/api/inquiry.ts`: mock `submitInquiry(kind, values)`.
    - Waits 1100 ms and makes a ref `MKA-S-` / `MKA-R-` + the last 6 digits of the timestamp.
    - Keeps the newest 20 in localStorage `mka.store.v2.inquiries`.
    - Phase B: POST.
- **Components** (`src/components/sections/consult/`):
  - `ui.tsx`: the `EYEBROW` / `LABEL` / `UNDERLINE` classes, `rich()` tags for messages (`<em>`, `<hi>` Devanagari span, `<b>`), and `Crumbs`.
  - Landing:
    - `ConsultHero`: arch portrait + the S7 chakra (120 / −90 / 60 s), name card.
    - `ServiceRows`: 4-column rows from 1100px.
    - `HowItWorks` + `StepsReveal` (client): at 25% visible, the gold rail grows (scaleX ≥900, scaleY below; 1400 ms) and the steps stagger in (y 16 / 600 ms / 180 ms apart).
    - `Credentials`: quote, credentials, `CountGroup` stats.
    - `ConsultTestimonials`: a mobile snap rail (84% cards), then CSS columns (2, or 3 from 1100). The video card links to `/videos`.
    - `ConsultFaq`: the WA card (sticky from 980px) + FaqList `consult`.
  - Detail:
    - `ServiceHero` (exports `CTA_ID = "svc-cta"`), `Covered`, `SamplePages`, `Tiers`, `ServiceFaq`, `OtherServices`.
    - `StickyBook` (client): an IntersectionObserver on `#svc-cta`. Bottom bar <768, under the 64px header ≥768. While hidden it is aria-hidden and untabbable.
  - `src/components/signature/ServiceArt.tsx` (client): primes the art before paint and draws it (S12, 1200 ms) at 30% visible.
    - Kundali = `KundaliChart` (DEMO_K, fs 15);
    - palm = `PALM_SVG`;
    - tarot = `TAROT_SVG`;
    - numerology = `LOSHU_SVG`.
  - `src/components/ui/AnchorLink.tsx` + `scrollToId(id, offset = 60)` in `layout/scroll.ts` (Lenis-aware, smooth unless reduced motion), used by "Compare the four" / "Compare packages".
- **InquiryForm** (`src/components/forms/InquiryForm.tsx`, client). Props:
  - `kind` (course | ritual);
  - `preset` (course key; a new prop value re-selects it);
  - `courses` (options from `getCourseOptions()`).

  Behaviour:
  - **Validation:** react-hook-form + `zodResolver(inquirySchema(kind))` (`src/lib/validation/inquiry.ts`).
    - Errors appear only after the first submit, then re-validate on change.
    - A failed submit focuses name → phone → email → city → message, like the design (chips and the consent box are not focused).
  - **Input rules:** the phone keeps digits only (max 10); the message has maxLength 600 and a live trimmed count.
  - **Controls:** chip groups are `role=radiogroup` buttons; consent is a `role=checkbox` button.
    - Stored values are keys: `exp: new|some|guru`, `area: legal|health|family|career|negative|other`, `lang: hindi|english`.
    - Labels come from the messages.
  - **Sending:** a spinning chakra (`data-amb="spin:1.4"`), "Sending…", button disabled.
  - **Done:**
    - The block fades up (y 10, 420 ms) while the seal draws (900 ms); focus moves to the status block.
    - "Send another inquiry" resets the form and keeps the course.
  - **Not in the design (small a11y additions):** a focus ring on the course select and on the message box (the same em5 ring the text fields use).
- **Art:** the extractor now writes `src/lib/art/report-pages.ts`: `REPORT_PAGE_CONSULT_SVG`, keys `kundali0…numerology2`, with the design's call-site `u`. It is inline because the pages carry `<text>`. F11 (Kundali-99 pages and samples) can add its own set the same way.
- **i18n:** new namespaces `consult` and `inquiry` in `messages/en.json` + `hi.json`. The Hindi is ours (`[HI review]`).
  - Rule used on /hi (see the Decisions log):
    - Fraunces display text stays English: h1/h2, the per-service titles, service and tier names, quotes, step titles, the WA card title.
    - Manrope text is translated: eyebrows, body, labels, buttons, mode names, durations.
  - Service content from the data stays English, marked `lang="en"`: line, delivery, "You get", covered areas, tier inclusions, sample captions, testimonials, FAQ answers.
  - The form title and the "Pranam, …" line use `font-title` (Fraunces with the Tiro fallback), so Hindi text and Devanagari names render in a serif.
- **Deviations (deliberate, small):**
  - The sample-pages rail uses `justify-content: safe center`. The design's plain `center` clips the first page on mobile when the rail overflows.
  - Booking links point at F10 routes and **404 until F10**:
    - hero "Book a consultation" → `/book/kundali-reading`;
    - row "Book" → `/book/<slug>`;
    - detail "Book …" and sticky "Book now" → `?tier=detailed` (the recommended tier);
    - tier cards → their own tier.
- **For F10:** `getService`, `recTier`, `isReport`, and the `consult.modes.*` / `consult.dur.*` messages are ready to reuse. The chrome for `/book/*` was configured in F4.
- Nothing was run except the extractor and Prettier (no dev / build / tsc / lint).

Manual QA (F9). `pnpm dev`. No reference shot covers these pages, so compare with `design/Consultations.dc.html` and `design/Consultation-Detail.dc.html#s=kundali|palm|tarot|numerology` in the browser.
1. **`/consultations`, desktop 1440px — hero**
   - Faint mandala top-left; breadcrumb "Home / Consultations".
   - Eyebrow "॥ PERSONAL GUIDANCE ॥ · परामर्श", then "Clear answers, *read* from your own chart.", the Devanagari line and the paragraph.
   - Buttons: "Book a consultation" (a gold sheen sweeps across on hover) and "Compare the four" (outline).
   - Trust row: ★ 4.9 · seal · globe.
   - On the right, the arch:
     - night sky;
     - the chakra's 3 rings turning slowly at different speeds;
     - the silhouette;
     - the name card overlapping bottom-left.
   - "Compare the four" scrolls smoothly to the services and stops with the heading ~60px below the top.
2. **Four services (sand)**
   - 4 ruled rows. Each row has:
     - 01–04 and an icon circle;
     - the name + Devanagari and the line (Kundali also has the "SATISFACTION GUARANTEE" pill);
     - Duration, Mode icons (hover shows a tooltip), Delivery, You get;
     - "FROM ₹2,100" with Details + Book.
   - A row turns ivory on hover. Palmistry shows "Report in 48 hrs".
   - Below 1100px everything stacks, and the price sits in a row with the buttons.
3. **How it works (night)**
   - Stars twinkle.
   - When the steps come into view, the gold line grows left → right (top-down on mobile), and the four steps fade up one after another.
   - The circles read १ २ ३ ४. The facts row has 3 items.
4. **Credentials**
   - Big quote with the lotus rule; the heading "An MBA who chose *sadhana.*"; 4 credentials in a ruled grid.
   - The stats count up to 18+ / 12,000+ / 3,500+ when scrolled into view.
   - "Read his story" → `/about` (404 until F14).
5. **Testimonials**
   - 4.9 with stars.
   - A masonry of 5 cards + the dark video card: 2 columns at 768–1099, 3 from 1100. The 1st and 4th quotes are larger.
   - The video card → `/videos`.
6. **FAQ:** the emerald "Still unsure?" card stays sticky while the questions scroll (≥980). The first answer is open; the + turns into ×.
7. **`/consultations/kundali-reading`, desktop**
   - **Hero**
     - Breadcrumb with a "Consultations" link; "CONSULTATION · कुंडली विश्लेषण"; "Kundali *Reading*".
     - The Duration / Delivery / Modes list, with mode chips.
     - "FROM ₹2,100" + "Book a Kundali reading" + "Compare packages"; the guarantee box.
     - Night arch with stars and rings. The Lagna chart draws its lines, then the planets pop in. Caption "कुंडली विश्लेषण / YOUR LAGNA CHART".
   - **What's covered:** the left block sticks while the list scrolls; 7 items in 2 columns.
   - **Sample pages:** 3 pages fanned (−3° / 0 / +3°) that lift on hover; captions "01 Lagna chart & positions"…
   - **Packages**
     - "Detailed" is dark with the gold "MOST CHOSEN" pill; the other two sit 24px lower.
     - "Choose …" → `/book/kundali-reading?tier=…` (404 until F10).
   - Service FAQ (4 questions).
   - "Other ways to consult": 3 cards that lift and get a brass ring on hover.
8. **Sticky Book bar**
   - Scroll past the hero's Book button → a bar slides down under the header: icon, name, "from ₹2,100 · 60–90 min", "Book now".
   - Scroll back up → it slides away. While hidden, Tab can't reach it.
9. **The other 3 services**
   - `/consultations/palmistry`: the palm lines draw; "Report in 48 hrs"; the Essential and Detailed packages read "Report"; no guarantee box.
   - `/consultations/tarot-reading`: three cards (the glow pulses).
   - `/consultations/numerology`: the Lo Shu grid.
   - `/consultations/xyz` → 404.
10. **Mobile 390px**
    - **Landing**
      - The arch is 300px wide under the text, with the name card at its left edge.
      - Service rows are stacked; the steps are vertical with the line on the left.
      - Testimonials are a sideways snap rail (84% cards). The WA card is not sticky. The tab bar is visible.
    - **Detail**
      - No tab bar. The sticky bar sits at the **bottom** (72px, above the safe area) with "Book now". The WhatsApp FAB sits above it (92px).
      - Sample pages: a sideways snap rail with no tilt; the first page is fully reachable.
      - Packages are stacked (the dark one without an offset).
    - No horizontal page scroll anywhere.
11. **InquiryForm:** open `/preview/inquiry-form` (course) and `/preview/inquiry-form?kind=ritual`. `?preset=kali` should select "Kali Sadhana".
    - **Empty submit:** press "Send inquiry".
      - Red errors appear under name, WhatsApp, city, the experience chips and the message, plus "Please confirm…".
      - The cursor jumps to "Full name".
    - **Fixing:** fix the fields one by one; each error disappears as you type or pick.
      - The phone field accepts digits only (max 10); `5123456789` stays invalid (it must start with 6–9).
      - A bad email shows "Check this email address"; an empty email is fine.
      - The message counter reads "n / 600" and stops at 600 characters.
    - **Valid submit**
      - The chakra spins with "Sending…" for ~1 s.
      - Then "Pranam, <first name>." with the seal drawing in, the message, and "Reference MKA-S-######".
      - "Continue on WhatsApp" + "Send another inquiry". The latter goes back to an empty form with the same course.
    - **Ritual:** area chips (6) + language chips (हिंदी / English). The done text names the chosen language; the reference starts with MKA-R-.
    - **Keyboard:** Tab through the fields, the chips (Enter/Space picks) and the checkbox.
12. **`/hi/consultations` and `/hi/consultations/palmistry`**
    - In Hindi: eyebrows, paragraphs, labels, buttons, durations ("48 घंटे में रिपोर्ट", "60–90 मिनट") and the sticky bar.
    - Still English: display headings, service and tier names, and the data lists.
    - `/hi/preview/inquiry-form`: the whole form is in Hindi.
13. **Reduced motion ON**
    - The chakra is still.
    - The steps line is already full, with no stagger.
    - The chart and palm show complete.
    - No count-up.
    - Anchor jumps are instant; the sticky bar appears without sliding.
14. Any error or type error → Fix-list.

### F10 — Booking · DONE
Read: INV §A.10, §C (booking row). Design: `Booking.dc.html` 28–603 · `mka-astro.js` 10–12, 73–74, 158–170, 260–269, 298–325 · `mka-core.js` 20–24, 509–510 (details: INV §H F10).
Tasks:
- [x] `/book/[service]?tier=`: the 4-step stepper with a progress line.
  1. Service & mode.
  2. Details, which vary per service (palm photo upload preview + guide).
  3. Date & slot (IST, Sunday closed, 30-day window).
  4. Pay (mock overlay with chakra).
- [x] Confirmation page with .ics download and Google Calendar.

Done-notes:
- **Route:** `src/app/[locale]/book/[service]/page.tsx`.
  - The 4 service slugs via `generateStaticParams`, `dynamicParams = false` (unknown → 404). Static.
  - `generateMetadata`: "Book {service}" + description (`booking.meta`).
  - It renders `<BookingFlow key={service}>` with the services, modes and the process-step icons.
- **Client state** (`src/components/sections/booking/BookingFlow.tsx`): step 1–4 + confirmation, service, mode, tier, details, palm photos, calendar month, date, time, payment.
  - `?tier=` is read once on mount (an unknown tier keeps the recommended one, like the design's `fromHash`).
  - Changing the service or tier on step 1 rewrites the URL in place (`replaceState`, locale prefix kept): `/book/<slug>?tier=<t>`. A service change resets the mode (first mode), tier (recommended), date, time and errors.
  - Steps are **not** in the URL (INV §C). The browser Back button leaves the page; the in-page Back / the ✓ step circles go back.
  - Continue validates the step (`checkBookingStep`, below). On failure it marks the step as tried (errors then update live), focuses the first `[aria-invalid="true"]` inside `#main` and scrolls it 140px under the top (`scrollToY`, Lenis-aware).
  - Step change: smooth scroll to top (`scrollToTop`) and focus moves to the h1 (a11y addition, no visual change).
  - Pay: overlay (chakra spin 8 / −6 / 4 s, "Confirming your payment") → `submitBooking` → confirmation, instant jump to top (`jumpToTop`).
- **Step components** (same folder):
  - `StepService`: service radio cards (2 cols), mode pills + note, tier rows ("Most chosen"). Palmistry as a report shows "Written report" for tiers without the video walkthrough.
  - `StepDetails`: name, WhatsApp (+91, digits only), email; per service:
    - kundali: date, time + "I don't know" (disables the time), place combobox (`placeSearch`, 32 towns; picks "Town, State");
    - numerology: date, mobile to analyse, business name;
    - palmistry: 3 guide tiles (`PALM_LIGHT_SVG`) + left/right uploads (object-URL preview, Remove, toast for non-images and files over 15 MB; URLs are revoked on replace/remove/unmount);
    - tarot: the question becomes required.
    Then the question textarea and the हिंदी / English segmented control.
  - `StepSlot`: Mon-first calendar (tomorrow → +30 days, Sundays closed, gold dot under today, ‹ › limited to the window) + times grouped Morning / Afternoon / Evening (`slotsFor`, seeded; booked = struck through, disabled). Non-IST visitors get the green "That is … where you are (tz)" note. Written reports get the 3-step delivery timeline instead.
  - `StepPay`: the sand summary card (<768 only), UPI (4 app tiles; "UPI ID" reveals the field) / card / netbanking (6 bank chips), Razorpay line.
  - `BookingSummary`: the night aside (≥1024, sticky 88px): stars `bk-sum` + mandala, rows, gold total, 3 trust lines (the 3rd is the guarantee on Kundali, else follow-ups).
  - `BookingDone`: night confirmation (check ring 1000 ms +150, tick 520 ms +950 via `drawIn`; stars `bk-done` 28 / 16 on mobile + mandala), Google Calendar link + `.ics` download (live sessions only), "Message the office", the details card; then "What happens next" (reveal-staggered, texts reused from `consult.how.steps`) + "Back to consultations" / "Browse energized products".
  - `ui.tsx`: booking field classes (52px cream fields, 13px labels), `ErrorRow`, `RadioDot`, `GROUP_TITLE`.
  - Mobile (<768): the fixed bottom bar (price + short summary + Back square + Continue / "Pay ₹…"), hidden while processing; the section reserves 132px for it. The desktop nav row shows from 768.
- **Lib:**
  - `src/lib/astro/slots.ts`: `slotsFor`, `t12`, `istDate`, `isoDay` (slot lists stay in `consult.json`).
  - `src/lib/astro/calendar.ts`: `ics(o, now)`, `gcal(o)`, `downloadIcs(o, filename)`.
  - `src/lib/validation/booking.ts`: zod `superRefine` per step, 1:1 with the design's `errs()`. It returns one error code per field; the messages live in `booking.err`. Also the pay/bank/UPI-app constants and `bookingDefaults()`.
  - `src/lib/api/booking.ts`: mock `submitBooking` (2000 ms, id `MKA-B` + 5 base-36 chars, newest 20 kept in localStorage `mka.store.v2.bookings`; photos are not stored, only the count). Phase B: Razorpay order + signature check + POST.
  - `src/lib/core/services.ts`: `isReport` / `recTier` moved here (no JSON imports) so client islands can use them. `@/lib/api/consult` re-exports them, so existing imports still work.
  - `src/lib/core/dates.ts`: `dlong(d, hi?)` gained a Hindi form; new `monthTitle(d, hi?)`, `MON_LONG`, `DAYH_LONG`, `MONH_LONG`.
  - `src/components/layout/scroll.ts`: new `scrollToY(top)` and `jumpToTop()`.
- **Footer only on the confirmation (Booking 446):**
  - `chrome-config` sets `flowFooter: true` for `/book/*`.
  - `FooterRoot` renders nothing on such routes until `useUi.flowDone` is true.
  - `BookingFlow` sets `flowDone` when it reaches step 5 and resets it on unmount.
  - Reusable for any future multi-step page.
- **i18n:** new namespace `booking` in `messages/en.json` + `hi.json` (Hindi is ours, `[HI review]`).
  - Following the F9 rule, the display h1s ("Choose your consultation.", "Your session is booked.", "Sadhak Ji reads before he speaks."), service / tier names and step titles of "What happens next" stay English on /hi.
  - **New (Decisions log):** the 22px Fraunces form-group titles ("Which consultation?", "Package", "Birth details", "Pay with", the calendar month …) *are* translated on /hi. They are form labels, so they use `font-title` (Fraunces + Tiro fallback), like the InquiryForm title.
  - Dates on /hi use the Hindi day/month names.
- **Small a11y additions (no visual change):**
  - The calendar grid is a labelled `group` (the design's `role=grid` had no rows/cells); blank lead cells are plain spans.
  - The place combobox supports ↑ / ↓ / Enter / Esc with `aria-activedescendant`.
  - `aria-describedby` links the inputs to their errors; focus rings on the numerology mobile field and on the (invisible) palm file inputs.
- **Deviation:** none visual. The 768–1023 summary gap is built 1:1 (already on the Client-confirm list).
- Nothing was run (no dev / build / tsc / lint).

Manual QA (F10). `pnpm dev`. No reference shot covers Booking, so compare with `design/Booking.dc.html#s=kundali&tier=detailed` (and `#s=palm`, `#s=tarot`, `#s=numerology`) opened in the browser.
1. **Entry points:**
   - `/consultations` → "Book a consultation" opens `/book/kundali-reading`.
   - A row "Book" → `/book/<slug>`.
   - `/consultations/palmistry` → a package card or the sticky "Book now" → `/book/palmistry?tier=…` with that package selected.
   - `/book/xyz` → 404.
2. **Chrome:** 64px secure bar with "← Consultations" and "Secure booking"; no announcement, no tab bar, **no footer** during the steps.
3. **Step 1, desktop 1440px (`/book/kundali-reading?tier=premium`)**
   - Eyebrow, "Choose your *consultation.*"; 4 step circles with a hairline (1 is dark with a gold halo).
   - 4 service cards (2 × 2): the chosen card is ivory with an emerald ring and a dot, its icon circle dark/gold.
   - Mode pills (Phone / Video / WhatsApp / Written report) + the note under them.
   - Packages: **Premium** selected (from the URL), "MOST CHOSEN" on Detailed.
   - Right: the night summary (stars, mandala, "कुंडली विश्लेषण / Kundali Reading", Package / Mode / When "Not chosen yet" in grey / Language Hindi, total ₹5,100, 3 lines incl. the satisfaction guarantee).
   - Click Tarot → the URL becomes `/book/tarot-reading?tier=detailed`, modes change (no report), the summary updates, and the last trust line becomes "Follow-up questions…".
   - Click a package → the URL's `?tier=` changes. Nothing reloads.
   - Bottom row: "Not sure? Ask on WhatsApp" + "Continue to your details →" (a gold sheen on hover).
4. **Step 2**
   - The line fills to the 2nd circle; circle 1 turns into a ✓ (clickable, goes back).
   - Empty Continue → red rings and messages under the name, WhatsApp, date, time and place. The cursor jumps to "Full name" and the page scrolls to it.
   - Fix the fields: each error clears as you type. Phone accepts digits only (10). "I don't know my exact time" greys out the time field.
   - Place: type "va" → a list (Varanasi…); click one → "Varanasi, Uttar Pradesh". Keyboard: ↓ / Enter also pick it.
   - Session language toggle हिंदी / English → the summary's Language row changes.
5. **Step 3 (Kundali, Phone call)**
   - The calendar starts at this month: today has a gold dot, past days and Sundays are pale/disabled, and dates after +30 days are disabled. ‹ is disabled on the first month; › moves to next month only if the window reaches it.
   - Before a date: "Open times" + the sand "Pick a date…" box.
   - Pick a date → the title becomes the long date; Morning / Afternoon / Evening times appear (some struck through and disabled). The same date always shows the same booked times.
   - Pick a time → the summary "When" turns white: "Thu, 8 Oct · 2:30 pm IST".
   - Change the computer's timezone (or test from outside India) → the green "That is … where you are" note appears.
   - Continue with no date → "Choose a date and a time." With a date but no time → "Choose a time for your session."
6. **Step 4**
   - "Review and *pay.*"; UPI is selected with "FASTEST"; Google Pay tile selected.
   - "UPI ID" tile → the field appears; `abc` + Pay → "Enter a UPI ID such as name@okhdfc."
   - Netbanking → 6 bank chips; Pay without a bank → "Choose your bank."
   - The button reads "🔒 Pay ₹3,100 securely".
   - Pay → the dark overlay with 3 counter-rotating chakra rings, "Confirming your payment" for ~2 s.
7. **Confirmation**
   - Night band: the gold ring draws, then the tick. "BOOKING MKA-B·····", "Your session is *booked.*", the Devanagari line, "Confirmation sent to WhatsApp on +91 98765 43210 …" (+ email if given) "Please be free five minutes…".
   - "Add to Google Calendar" opens Google Calendar with the title, the right IST time and duration. ".ics" downloads `maa-kali-astuti-MKA-B….ics`, which opens in Apple/Outlook calendar at the right time.
   - The details card shows Consultation, Package, Mode, When (long date · time IST), Paid (₹ · UPI · Google Pay).
   - "What happens next" fades in (4 steps, the first "DONE" with a gold top rule). The two buttons go to `/consultations` and `/shop`.
   - The **footer now appears** below. Navigating away and coming back to `/book/...` starts at step 1 again, without the footer.
8. **Other services**
   - Palmistry (`/book/palmistry`):
     - Written report mode by default. Step 3 is called "Delivery" and shows the 3-step timeline (Today → tomorrow → +2 days).
     - Step 2 has the photo guide (the 3rd tile is shaded with a red ✕) and the two dashed upload tiles.
     - Upload a photo → it fills the tile, then "✓ Left palm added · Remove". A PDF/other file → an error toast.
     - Continue without photos → red dashed tiles + messages.
     - The confirmation has no calendar buttons and says "Your report arrives by …".
   - Tarot: the question is required (under 8 characters → "Write the question you want the cards to answer.").
   - Numerology: "Name & numbers" with the mobile to analyse (optional; 5123456789 → error) and business name.
9. **Mobile 390px**
   - One column, no summary aside, no desktop nav row.
   - The fixed bottom bar shows the price, "Detailed · 90 min · Phone call", a Back square (from step 2) and "Continue →" / "Pay ₹3,100". The WhatsApp FAB sits above it; the last content isn't hidden behind the bar.
   - Step 4 starts with the sand summary card.
   - Slots / UPI tiles wrap (UPI 2 × 2). The calendar fits without horizontal scroll.
   - The bar disappears during processing and on the confirmation.
   - No horizontal page scroll anywhere.
10. **Tablet 768–1023:** nav row visible, no summary at all (known design gap). The calendar and slots sit side by side from 700px and stack again at 1024–1179.
11. **`/hi/book/kundali-reading`**
    - Step labels, form labels and titles, errors, buttons, calendar day/month names and summary rows are in Hindi.
    - The h1 headings and the service/tier names stay English.
    - Switching the language mid-flow reloads at step 1 (expected: the steps are client state).
12. **Keyboard**
    - Tab through service cards, modes, tiers (Enter / Space picks), fields, calendar days, times, pay methods.
    - The focus ring is visible on the palm upload tiles.
    - After Continue, the focus goes to the heading.
13. **Reduced motion ON:** no sheen sweep, and the step line jumps. The chakra overlay is still, the check appears drawn at once, and the "What happens next" items show without fading. Scrolls are instant.
14. Any error or type error → Fix-list.

### F11 — Kundali ₹99 + Love Calculator · DONE
Read: INV §A.11, §A.12, §E.1 S7 S12 S13. Design: `Kundali-99.dc.html` 28–500 · `Love-Calculator.dc.html` 27–254 · `mka-astro.js` 9–151, 158–170, 283–295, 334–339, 372–386, 413 (details: INV §H F11).
Tasks:
- [x] `/kundali-99` state machine:
  - form (place autocomplete, unknown-time checkbox);
  - generating (chakra ramp 0.12 → 2.6);
  - preview (chart draw, planet table, lagna / rashi / nakshatra, blurred locked pages);
  - mock pay (success / fail);
  - success + download (SVG chart for now).

  Plus what's-inside, samples, FAQ and reviews.
- [x] `/love-calculator`: large tool, how it works, disclaimer, Kundali Milan CTA, related products.

Done-notes:
- **Routes** (both static):
  - `src/app/[locale]/kundali-99/page.tsx`: KundaliTool (hero + preview + pay sheet + mobile bar), then What's inside, Sample pages, Reviews, FAQ (`getFaq("kundali99")`). `generateMetadata` from `k99.meta`.
  - `src/app/[locale]/love-calculator/page.tsx`: `LoveNamesProvider` wraps the hero tool and "How it works" (the breakdown follows the typed names); then the Milan note + card and 4 related products (design filter: `b-rose` first, then `ik === "love"` or intent love/relation/marri → b-rose, r2, r13, b-garnet).
- **Kundali ₹99** (`src/components/sections/kundali/`):
  - `KundaliTool.tsx` (client): phases `form → gen → preview → done`; pay `idle | processing | failed`.
    - Submit validates (`checkKundali99`); on error the fields turn red, errors update live, focus jumps to the first invalid field.
    - gen: 7 messages every 820 ms, gold bar 800 ms linear, result after 5.3 s, then a smooth scroll to `#preview` (60px offset). The city is the picked town, else the first match, else Varanasi (design rule).
    - "Edit details" drops the chart and returns to the form (values kept).
    - Pay: 1.8 s → done (scroll to preview) or failed ("Try again" goes back to idle; the chart stays).
    - Mobile (<768) fixed "Pay ₹99" bar only in preview and while the sheet is closed. The FAQ section has 88px+ bottom room for it on mobile.
    - **QA-only URL params** (INV §C, read once on mount): `?demo=generating` (loops forever, like the design), `?demo=preview`, `?demo=success` (Ravi Sharma demo data), and `?pay=fail` (every payment fails). They can be combined: `/kundali-99?demo=preview&pay=fail`.
  - `KundaliForm.tsx`: the form. Place combobox with ↑ ↓ Enter Esc + `aria-activedescendant`, phone digits only (10), report language segmented control.
  - `KundaliPreview.tsx`: chart (S12 draw at 25% visible, redraws on a new chart / language), trio cards, planet table (Nakshatra column ≥1024, sub-line below), 6 report pages (pages 2–6 blurred + lock until paid, 800 ms filter), unlock band / paid band (ring 900 ms +100, tick 480 ms +820).
  - `PaySheet.tsx`: bottom sheet <768 / centred dialog ≥768, 380 ms rise, Esc/scrim/✕ close (not while processing), Tab trapped, focus returns to the opener.
  - `K99Sections.tsx` (server): hero intro + facts (passed into KundaliTool as slots), contents, samples, reviews, FAQ. `k99-data.ts`: page captions, contents, samples, price constants (₹99 / MRP 499 / 80%).
- **New signature** `src/components/signature/Chakra.tsx` (S7): `mode="spin"` (data-amb rings) and `mode="ramp"` (WAAPI 9/7/5 s, middle reversed, playbackRate .12 → 2.6 by +.1 every 100 ms; paused offscreen / tab hidden; still under reduced motion). Used by the generating panel and the pay sheet. Booking/InquiryForm still use their own inline copies (can switch in F15).
- **Report pages**: `scripts/extract-design.mjs` now also emits `REPORT_PAGE_K99_SVG` (lk0…lk5 preview, sm0…sm3 samples) in `src/lib/art/report-pages.ts`. The preview cover (lk0) is generated **without** the name line; the page renders the visitor's name as a JSX `<text>` over the same 300×400 viewBox, so no user text ever goes into `dangerouslySetInnerHTML`. Re-running the extractor left every other file unchanged.
- **Download**: `src/lib/astro/kundali-download.ts` builds the prototype's one-page 800×1060 SVG (chart in emerald, Lagna / Rashi / Nakshatra, planet table), XML-escapes the name, saves `Janam-Kundali-<Name>.svg`, then a success toast. The file text is English on both locales. Full PDF = phase B.
- **Love Calculator** (`src/components/sections/love/`):
  - `LoveTool.tsx` (client, S13): 1:1 with the Home mini but with the page sizes (stage 236/280, ring 220/264, medallions 78/96, number 64/80). Converge factor via CSS vars (`--gc` .118 / .112 from 768, `--lw` = min(520, 100vw − 72 / 104px)). Share on WhatsApp (`wa.me/?text=`), Try another pair (clears + focuses the first name), Book a Kundali Milan consultation → `/book/kundali-reading?tier=premium`.
  - `LoveHow.tsx` (client): letter tiles, digit-sum chain, the two grahas + relation line; falls back to Priya / Arjun.
  - `LoveSections.tsx` (server): hero (mandala, intro, note), Milan (8 koota bars, premium price from `services.json`), products.
- **Validation**: `checkKundali99` in `src/lib/validation/astro.ts` (zod, one code per field, 1:1 with the design's `errs()`).
- **API**: `getKundaliReviews()` in `src/lib/api/content.ts`.
- **i18n**: new namespaces `k99` and `love` in both message files. On /hi (F9/F10 rules): h1/h2 display headings, report contents, page captions, reviews, love result labels/lines and koota names stay English; UI text, the form/dialog titles (`font-title`) and the generating messages are Hindi (ours, `[HI review]`).
- **Design notes kept 1:1**: "Shop all bracelets" links to `/shop` (design: `Shop.dc.html`, no category); the Kundali mobile pay bar sits over the tab bar (z 58 vs 50), as in the design.
- Nothing was run (no dev / build / tsc / lint). Only `node scripts/extract-design.mjs`.

Manual QA (F11). `pnpm dev`. No reference shots for these two pages: compare with `design/Kundali-99.dc.html` and `design/Love-Calculator.dc.html` opened in the browser.
1. **`/kundali-99` desktop 1440px, form**
   - Night hero with stars and a faint mandala top-right. Left: breadcrumb, "JANAM KUNDALI · जन्म कुंडली", the big h1, Devanagari line, ₹99 / ~~₹499~~ / red "80% OFF" / "incl. all taxes". Below: the lead, 3 icon rows, gold stars "4.8 from 3,400+ reports".
   - Right: the ivory card with 4 brass corners, "Enter your birth details".
   - Empty submit → red rings + messages under name, date, time, place, WhatsApp; the cursor jumps to the name. Errors clear live as you fix them.
   - Future date → "This date is in the future." Phone `5123456789` → error. Email `a@b` → "looks incomplete". Email empty is fine.
   - Tick "I don't know my exact time" → time field greys out + the noon note.
   - Place: type `va` → list (Varanasi…); click or ↓ + Enter → "Varanasi, Uttar Pradesh".
   - English / हिंदी toggle works. "Generate my Kundali" shows the gold sheen on hover.
2. **Generating**: the chakra starts slow and speeds up over ~2.6 s; "Preparing Ravi's chart" + Devanagari line; 7 steps tick one by one (current bold with a gold ring, done ones emerald with ✓); the thin gold bar fills. After ~5.3 s the page scrolls to the preview.
3. **Ready card + preview**
   - Card: "Your chart is ready", Name / Born / Place / Report rows, "View my chart ↓" (scrolls) and "Edit details" (back to the form, values kept, preview gone).
   - Preview: "FREE PREVIEW · निःशुल्क झलक", "Ravi, here is your chart.", the birth line. The night chart draws its lines, then planets pop.
   - 3 cards (Lagna with rising degree, Rashi with "Lord: …", Nakshatra with "Pada n") with gold glyphs.
   - Planet table (9 rows, zebra), "R" chips on retrograde grahas; Nakshatra column on desktop.
   - Report language हिंदी → the chart shows Devanagari labels (लग्न, सू…), Report row "हिंदी · PDF", unlock line "…in Hindi".
   - Unknown time → the sand noon note above the chart.
   - "Inside the full report": 6 pages in one row; page 1 (cover with your name in capitals) sharp, pages 2–6 blurred with a lock.
   - Emerald unlock band: 4 ✓ lines, ₹99 / ~~₹499~~ / SAVE 80%, gold "Pay ₹99 & download".
4. **Pay — success**: the dialog rises in (centred). Google Pay selected; click other tiles. "Pay ₹99" → the spinning chakra "Waiting for your bank" (~1.8 s) → the dialog closes, the page scrolls to the preview: the pages unblur, the sand band draws its ring + tick, "Your Kundali is ready.", the masked phone (+91 98•••••210). Card title becomes "Report unlocked".
   - "Download your report" → `Janam-Kundali-Ravi-Sharma.svg` downloads (chart + table) + a green toast.
   - "Have Sadhak Ji read this chart with you" → `/consultations/kundali-reading`.
5. **Pay — fail**: open `/kundali-99?demo=preview&pay=fail` → Pay → "The payment did not go through" + "Try again" (back to the tiles, chart kept) and "Get help" (WhatsApp). Esc / scrim / ✕ close the dialog (not while processing). Tab stays inside the dialog.
6. **Demo states**: `?demo=generating` (loops), `?demo=preview`, `?demo=success`.
7. **Lower sections**: What's inside (sand, 10 rows with dotted leaders and page numbers, fading in); Sample pages (night, 4 fanned pages, lift on hover); Reviews (big italic quote + 3 more + link to the Kundali consultation); FAQ (sand, "Ask on WhatsApp", accordion).
8. **Mobile 390px**: intro → card → facts order; date/time stack below 420px; in preview a fixed bottom bar "₹99 ~~₹499~~ · Full report · 28 pages" + "Pay ₹99" (hidden while the sheet is open and after paying); the sheet comes up from the bottom; pages 2 per row; trio stacks below 560; the sample pages scroll sideways (snap). No horizontal page scroll.
9. **`/love-calculator` desktop 1440px**
   - Ivory hero: breadcrumb, "FREE TOOL · प्रेम मिलान", "Love Calculator, *by name.*", Devanagari line, lead, italic note with a heart. Card on the right with a rose top strip.
   - Type names → initials appear in the medallions, which drift closer as you type. The "How it works" section below updates live (tiles, digit chain, grahas, relation line).
   - Calculate with one name → red rings + "Please enter both names…".
   - Calculate: medallions converge (700 ms), the ring fills to the score while the big number counts up, then the label + Devanagari label, the line and two chips (number · graha) stagger in.
   - Share on WhatsApp opens wa.me with the text; "Try another pair" clears both names and focuses "Your name"; editing a name after a result resets to idle (names kept). "Book a Kundali Milan consultation" → `/book/kundali-reading?tier=premium`.
   - Milan section: 8 koota bars, "₹5,100 · 90 min · both charts read" (premium price) and "Book Kundali Milan".
   - 4 product cards (Rose Quartz bracelet first); add to cart / wishlist work; "Shop all bracelets" → `/shop`.
10. **Love mobile 390px**: stage 236px, medallions 78px, number 64px; inputs stack below 480; products 2 per row; How it works stacks.
11. **`/hi/kundali-99`, `/hi/love-calculator`**: UI text, labels, errors, generating messages, sheet and buttons in Hindi; the big headings stay English.
12. **Reduced motion ON**: no chakra spin/ramp, the chart shows complete, the ring/tick appear drawn, the love ring and number jump to the result, reveals just show.
13. Any error or type error → Fix-list.

### F12 — Rashifal · DONE
Read: INV §A.13, §A.14, §E.1 S8. Design: `Rashifal.dc.html` 28–299 · `Rashi-Detail.dc.html` 27–221 · `mka-astro.js` 9–74, 90–151, 173–200, 342–369 · `mka-core.js` 267 (details: INV §H F12).
Tasks:
- [x] `/rashifal?p=`: hero wheel, period tabs, 12-rashi grid, DOB → rashi helper.
- [x] `/rashifal/[rashi]?p=`: area meters, lucky trio, gemstone product, remedy, compatible rashis, recommended products, Kundali CTA.

Mobile uses the half-dial.

Done-notes:
- **Routes**:
  - `src/app/[locale]/rashifal/page.tsx` (static): `RashifalProvider` wraps `RashifalHero` → `RashifalGrid` (#rashis) → `RashiFinder`. The panel's gemstone link map (stone product, "Bracelet…" trimmed) is built on the server.
  - `src/app/[locale]/rashifal/[rashi]/page.tsx`: 12 static params (slug = design key), `dynamicParams = false`, unknown slug → 404. Products = `[stone, ...rud, amulet]` (unique, existing, max 4), gem = the stone product. The provider is keyed by rashi, so the state resets when prev/next/compatible links change the rashi (the page transition covers the swap; the design's hashchange text fade is not needed).
- **Period + day + "my rashi"** (`src/components/sections/rashifal/period.tsx`, client context):
  - `?p=today|tomorrow|week|month|year` is read once on mount; tab picks rewrite the query with `history.replaceState` (no navigation). Server HTML = "today".
  - `day`: build date in the HTML, the viewer's today after hydration (`useSyncExternalStore`, same as Home). All predictions use it (INV gotcha 14).
  - `mine` = `localStorage 'mka-my-rashi'` (design key). Grid "Yours" chip + ring; finder "Remember my rashi".
  - Also exports `Dots` (5 dots with colour/ring props) and `isPeriod`.
- **Rashifal page** (`src/components/sections/rashifal/`):
  - `RashifalHero.tsx`: reuses `useRashiCycle` + `WheelLayers` from F6 (S8: 4 s tick, 12 s hold, 900 ms turn with overshoot, IO .25, pauses when tab hidden / reduced motion). Differences from Home, 1:1 with the design: no radial glow, no period tabs in the panel (the panel follows the grid's period), eyebrow "<Period> · <date>", meters say "Money" for finance, stone name without "bracelet", CTA "Read full <Rashi> rashifal", panel fade 0 → 1 only on a rashi change, rail short text 14.5px, rail links keep the period, no mobile Kundali button under the dots. Controls take ←/→.
  - `RashifalGrid.tsx`: 5 tabs (roving ←/→/Home/End, `aria-controls="rf-grid"`), grid 2 / 3 (≥768, short line shown) / 4 (≥1180), cards link to `/rashifal/<key>?p=<period>`, `data-reveal` i % 4.
  - `RashiFinder.tsx`: DOB (max = viewer's today, future/empty → red ring + alert), "Add birth time and place" toggle (aria-expanded), time + place combobox (↑ ↓ Enter Esc, 32 towns). Time + place → approximate Kundali → Chandra rashi + nakshatra; else sun rashi. Result card enters y14 / 450 ms. Save → localStorage + green toast.
- **Rashi page**:
  - `RashiDetail.tsx` (client): `RashiHero` (arch with mandala `spin:180`, glyph sw .6; pill tabs; reading fades up 6px / 320 ms on a period change; facts incl. "Overall n of 5"; prev/next rashi links keep the period), `RashiAreas`, `RashiLucky` (gem card = `ProductCard size="row"`), `RashiCompat` (why-line English, as in the design), `RashiChart` (DEMO_K chart, S12 draw at 30% in view).
  - `RashiSections.tsx` (server): `RashiRemedy` (diya = `DIYA_SVG` via InlineArt, glow + flicker ambient), `RashiRecommend` (compat + 4 products, "Shop all" → `/shop`), `RashiCta` (Kundali ₹99 + "Book a reading" → `/consultations/kundali-reading`).
  - `ui.tsx`: `NightCrumbs`, `H2`, `brass`.
- **i18n**: new namespace `rashifal` in both message files. On /hi: h1/h2 display headings, rashi names, predictions, remedy, colour/day values and the compatibility lines stay English (F9 rule); UI text (period tabs, labels, form, errors, toasts, CTAs, aria) is Hindi (ours, `[HI review]`). The period tab sub-labels stay Devanagari as in the design.
- Nothing was run (no dev / build / tsc / lint).

Manual QA (F12). `pnpm dev`. No reference shots: compare with `design/Rashifal.dc.html` and `design/Rashi-Detail.dc.html` opened in the browser.
1. **`/rashifal` desktop 1440px, hero**
   - Night band with twinkling stars. Breadcrumb Home / Rashifal, "आज का राशिफल · DAILY RASHIFAL", h1 "Twelve rashis, *read each day.*"; right: today's long date + the Chandra rashi line.
   - Wheel starts on today's sun rashi (end of Sep → Kanya), outer rings slowly spinning. Every 4 s it turns to the next rashi (900 ms with a small overshoot); the panel fades in the new rashi.
   - Hover the wheel or click a segment → it jumps there and stops auto-turning for 12 s. Prev / pause / next buttons work; with focus on them, ← / → also turn.
   - Panel: "TODAY · <date>", glyph circle, name + Devanagari, "Virgo · dates · Lord Budh (Mercury)", the reading, 4 meters (Love, Career, Health, Money), Lucky number / Colour swatch / Gemstone link (→ product page), gold "Read full Kanya rashifal" (→ `/rashifal/kanya?p=today`) and "Personal Kundali ₹99".
   - Scroll the wheel out of view or switch tabs → it stops turning.
2. **Grid (#rashis)**: 4 columns at 1440, short line on each card, dots, brass arrow; hover lifts 3px with a brass ring.
   - Click Tomorrow / Weekly / Monthly / Yearly: eyebrow "01 — ALL TWELVE · WEEKLY", the date on the right changes (week range, "October 2026", "Samvat 2083 · 2026"), the texts and dots change, the URL becomes `?p=week` without reload. The hero panel follows the period too.
   - Reload `/rashifal?p=month` → Monthly is selected. ← / → move between tabs.
3. **Finder**: empty submit → red ring + "Please enter a valid date of birth."; a future date is blocked (picker max = today).
   - DOB only (e.g. 1990-06-01) → "YOUR SURYA RASHI (SUN SIGN)" card (Vrishabha) with the note; it fades up.
   - "Add birth time and place" → time + place fields (2 columns ≥480); type `va` → list; pick Varanasi; submit → "YOUR CHANDRA RASHI (MOON SIGN)" + "Moon in … nakshatra".
   - "Remember my rashi" → green toast, button becomes "Marked on this device"; the grid card gets the "YOURS" chip + brass ring. Reload → still marked.
   - "Read <Rashi> rashifal" → the detail page with the current period.
4. **`/rashifal` mobile 390px**: half-dial peeks above a swipe rail (card ~76% wide, centred); swiping turns the dial and moves the gold dot; auto-advance scrolls the rail every 4 s (stops for 12 s after a touch). Grid 2 columns, no short line; tabs scroll sideways. Finder stacks, the glyph grid below the form. No horizontal page scroll.
5. **`/rashifal/simha?p=week` desktop**: breadcrumb Home / Rashifal / Simha; arch with the big glyph, faint spinning mandala, "सिंह" + "LEO · dates"; eyebrow "SIMHA RASHIFAL · सिंह राशिफल"; h1 "Simha, *this week.*"; Weekly pill selected; "Weekly · <week range>"; reading; facts Lord / Element / Day / Overall; prev "Karka" / next "Kanya" links.
   - Click other pills → h1 word, date line, text (fades up), overall, meters, lucky number change; URL `?p=` changes in place.
   - Prev / next → the neighbour rashi, same period.
6. **Areas**: 2 columns ≥900, each row: icon, "Love / प्रेम", big number "/ 5", 5 bars, text.
7. **Lucky**: 3 sand cards (number 64px, colour swatch, day + Devanagari) + the emerald "LUCKY GEMSTONE" card with the row product card (add to cart works) on one row at 1440; below 1024 the gem card takes a full row.
8. **Remedy**: night band, glowing flickering diya, italic remedy, "Best begun on a Sunday (रविवार)…".
9. **Compatible + recommended**: 4 compatible cards (glyph, names, why-line) → keep the period; "Recommended for Simha" 4 product cards; "Shop all" → `/shop`.
10. **Kundali CTA**: copy + "Get your Kundali · ₹99" (→ `/kundali-99`) and "Book a reading" (→ `/consultations/kundali-reading`); the night chart draws its lines, then planets pop, when it scrolls in.
11. **Rashi page mobile 390px**: arch 260px wide on top, tabs scroll sideways, areas 1 column (number column stacks below 560), lucky 2 columns + gem full row, compatible 2 columns, products 2 columns, CTA stacks. Try `/rashifal/xyz` → 404.
12. **`/hi/rashifal`, `/hi/rashifal/mesha`**: tabs, labels, form, errors, toast, buttons in Hindi; big headings, rashi names and readings stay English.
13. **Reduced motion ON**: wheel does not auto-turn (buttons still jump without animation), rings still, no panel/text fades, chart shows complete, diya still.
14. Any error or type error → Fix-list.

### F13 — Courses + Rituals · DONE
Read: INV §A.15–§A.17, §E.1 S5 S11, §E.3. Design: `Sadhana-Courses.dc.html` 27–195 · `Course-Detail.dc.html` 27–240 · `Rituals.dc.html` 27–182 · `mka-astro.js` 134–151, 203–248, 389–407, 414, 419 · `mka-core.js` 267 (details: INV §H F13).
Tasks:
- [x] `/sadhana-courses`.
- [x] `/sadhana-courses/[slug]` (sticky Enquire, InquiryForm preset).
- [x] `/rituals` (diya thali, scroll-filled process line, InquiryForm kind `ritual`).

Built in one session by the main agent (no sub-agent).

Done-notes:
- **Data seam** (`src/lib/api/content.ts`): `getCourses`, `getCourse(slugOrKey)`, `getCourseKit` (includes, enroll, modules, niyam) and `getRituals` (rituals, process, receive). Types `Course` and `IconRow`. FAQ sets come from `getFaq("courses" | "rituals")` in `lib/api/consult.ts`.
- **Routes**:
  - `src/app/[locale]/sadhana-courses/page.tsx` (static).
  - `src/app/[locale]/sadhana-courses/[slug]/page.tsx`: 6 static params (`<key>-sadhana`), `dynamicParams = false`. A key-only URL (`/sadhana-courses/kali`) or an unknown slug → 404.
  - `src/app/[locale]/rituals/page.tsx` (static).
  - chrome-config already had these routes. Course detail: tab bar off, FAB at 92px.
- **Courses page** (`src/components/sections/courses/CoursesSections.tsx`, server):
  - `CoursesHero`: stars, the faint kali yantra (`YANTRA_KALI_BG`, opacity .07), fee row, and the "includes" card.
  - `CourseCards` (#six): 1 / 2 (≥640) / 3 (≥1024) columns, middle column 48px lower at 3 columns, panel 4/3 below 768.
  - `Enrollment`: `EnrollLine.tsx` (client) grows the gold line on view (IO .4, scaleX 1600 ms, ≥1024 only).
  - `SeriousSeekers`, `CoursesFaq`, `CoursesEnquire` (#enquire, preset kali).
  - Shared exports: `COURSE_FEE`, `GOLD_CTA`, `GHOST_CTA`, `H2`, `H2N`, `WaLink`.
  - The card `data-reveal` uses `i % 3` at every width (the design uses `i % cols`). Only the stagger delay differs on 1–2 columns.
- **Yantra draw (S11)**: `src/components/signature/YantraDraw.tsx` (client). It primes every `[data-yantra]` and draws it on view. Hovering the closest `[data-yantra-hover]` redraws it, with a throttle.
  - Courses cards: .35 / 1600 ms / 1800 ms throttle, hover + focus.
  - Detail arch: .3 / 1800 ms, hover only, 1600 ms redraw, 2000 ms throttle.
  - Reduced motion: yantras render complete.
  - The Home CourseRail keeps its own copy.
- **Course detail** (`src/components/sections/courses/CourseDetail.tsx`, server):
  - Sections: `CourseHero` (the arch, CTA row `#course-cta`), `CourseOverview`, `CourseAttain`, `CourseStructure` (sticky at 96px from 1024; module "when" labels computed from `days`), `CourseNiyam`, `CourseSupport`, `CourseFee`, `CourseEnquire`.
  - `CourseEnquire`: the InquiryForm preset is the course. Below it, "The other sadhanas" with static brass yantras.
  - The sticky Enquire bar reuses `consult/StickyBook.tsx`. It now takes an optional `lead` (the yantra disc, ≥768), an `anchor` (scrolls to #enquire instead of navigating) and a `ctaIcon`. Consultation-Detail keeps working unchanged.
- **Rituals** (`src/components/sections/rituals/`):
  - `RitualsSections.tsx`: `RitualsHero` shows the thali (`THALI_RITUALS_SVG`: glow, smoke and diya flicker live inside the art via data-amb) under a `MandalaG` with `spin:200` at opacity .13. Also `RitualsEthics`, `RitualTypes`, `RitualProcess` (#process, sticky side at 110px), `RitualReceive` (first card full width) and `RitualInquire` (#inquire: FaqList closed + InquiryForm kind ritual).
  - `ProcessSteps.tsx` (client) uses `ScrollLine` with the list as the measured box. Steps light at n = floor(p·5 + .35), and each change eases over 500 ms.
- **i18n**: new namespaces `sadhana` and `rituals` in both message files. On /hi, display text, course/ritual data and FAQ stay English (F9 rule); Manrope UI text is Hindi (`[HI review]`). Lists use `t.raw`: `seekers.asks`, `detail.support.items`, `detail.fee.inc/pay`, `ethics.items`.
- **Removed** the QA-only `/preview/inquiry-form` route (planned for F15), because the form now lives on its real pages.
- Nothing was run (no dev / build / tsc / lint).

Manual QA (F13). `pnpm dev`. No reference shots: compare with `design/Sadhana-Courses.dc.html`, `design/Course-Detail.dc.html` and `design/Rituals.dc.html` opened in the browser.
1. **`/sadhana-courses` at 1440px, hero**
   - Night band with twinkling stars and a faint yantra at the top right. Breadcrumb Home / Sadhana Courses.
   - Eyebrow "॥ SADHANA COURSES ॥ · साधना", then the h1 "Six sadhanas, *guided*…", the Devanagari line and the intro.
   - Fee row: "COURSE FEE ₹50,000" with the gold "Enquire about a sadhana" and outline "See the six" buttons. Both scroll smoothly (60px offset).
   - Right: the "What every course includes" card with 5 rows that fade up.
2. **Six cards (#six)**
   - 3 columns; the middle column sits 48px lower. Each card has a night panel with a "36 days" pill.
   - The yantra draws itself (strokes, then a glow) when about a third of it is in view.
   - Hover: the card lifts 4px, gets a brass ring, and the yantra redraws (at most every 1.8 s). Tab onto a card and it redraws too.
   - Click → `/sadhana-courses/<deity>-sadhana`.
3. **Enrollment**: night band with 5 steps in a row. The gold line on top grows left → right (1.6 s) when it scrolls in. Devanagari numbers १–५.
4. **Serious seekers**: sand frame with 4 brass corners, the italic quote, "Maa Kali Astuti · enrollment policy", the lotus rule and 3 asks in 3 columns.
5. **FAQ**: heading on the left, the accordion on the right with the first answer open.
6. **Enquire (#enquire)**
   - Copy + "Or message on WhatsApp" (opens wa.me). The form's "Which sadhana?" = **Kali Sadhana**.
   - Submit empty → errors. Fill it in and submit → Sending… → "Pranam…" with an MKA-S- reference.
7. **`/sadhana-courses` at 390px**: hero stacks (includes card below). Cards are 1 column with 4:3 panels (2 columns at ≥640). Enrollment steps stack with vertical rules and no top line. Asks are 1 column. No horizontal scroll.
8. **`/sadhana-courses/kali-sadhana` at 1440px, hero**
   - Breadcrumb Home / Sadhana Courses / Kali Sadhana, the deity eyebrow, then "Kali *Sadhana*", "काली साधना" and the essence.
   - Facts: Duration 41 days / Mode / Fee ₹50,000, all-inclusive.
   - Gold "Enquire about Kali Sadhana" + "Syllabus shared upon inquiry".
   - Right: the arch with stars, a faint circle and the yantra drawing itself (1.8 s). Hover the yantra → it redraws (at most every 2 s). "KALI SADHANA YANTRA" at the bottom.
9. **Sticky bar**
   - Scroll past the hero CTA row → a bar slides down under the header: yantra disc, "Kali Sadhana", "₹50,000 · 41 days", "Enquire".
   - It scrolls to #enquire and hides again when you scroll back up.
   - At 390px it sits at the bottom (no tab bar on this page, WhatsApp FAB lifted above it) with no yantra disc.
10. **Detail sections**
    - Overview: large serif line + note.
    - Attain: 4 lines with १–४, 2 columns.
    - Structure: the left side sticks while the 5 modules scroll. Labels: "Days 1–7 / Day 8 / Days 8–39 / Every week / Days 40–41" (for 41 days), plus the "to be confirmed" pill.
    - Niyam: night band with the "Specific to Kali Sadhana" card and 6 lotus rows.
    - Support: 3 columns.
    - Fee: emerald card with 5 checks, beside the Payment rows (instalments "[confirm]").
    - Enquire: the form preset = Kali Sadhana. "The other sadhanas" shows 5 cards with brass yantras (hover lifts 2px), 3 columns at ≥600 and 2 below.
11. **Other courses**: open all six slugs (baglamukhi 36 days, durga 27, shiva 40…). `/sadhana-courses/kali` and `/sadhana-courses/xyz` → 404.
12. **`/rituals` at 1440px**
    - Hero: breadcrumb, eyebrow, h1 "Rituals performed *only* when they will help.", the thali with a glowing halo, rising smoke and a flickering diya, a faint mandala turning slowly behind, and the caption.
    - "Share your concern" → #inquire; "How it works" → #process.
13. **Ethics / types**
    - The big ethics line and 3 numbered principles.
    - Sand ritual list in 2 columns with the "Placeholder examples" pill.
14. **Process (#process)**
    - The left side sticks.
    - As you scroll, the gold line fills down the rail and the steps light up one by one: gold disc, dark icon, soft halo, full opacity. Scrolling back up un-lights them.
15. **Receive**: 5 cards; the first spans both columns with a larger title. "Updates and inclusions to confirm" pill.
16. **Inquiry (#inquire)**
    - Copy + FAQ with all answers closed, beside the ritual form (area of concern + call language).
    - Submit → MKA-R- reference.
17. **`/rituals` at 390px**: thali max 380px, everything stacks, the process line still fills, no horizontal scroll.
18. **`/hi/sadhana-courses`, `/hi/sadhana-courses/durga-sadhana`, `/hi/rituals`**
    - Eyebrows, paragraphs, buttons, labels, facts, payment rows, the sticky bar and the forms are in Hindi.
    - h1/h2, card titles, course/ritual data and FAQ stay English.
19. **Reduced motion ON**
    - Yantras complete (no draw), enrollment line shown, process line full with all steps lit.
    - Mandala and thali are still; reveals just show; the sticky bar still appears.
20. The nav "Sadhana Courses" / "Rituals" links and the Home course cards / "Enquire" links now reach real pages (`/sadhana-courses#enquire` lands on the form).
21. Any error or type error → Fix-list.

### F14 — About + Videos + 404 · DONE
Read: INV §A.18, §A.19, §E.3. Design: `About.dc.html` 28–255 · `Videos.dc.html` 28–238 · `mka-home.js` 185–259, 273–300 · `mka-astro.js` 158–170, 218–225, 249–258 (details: INV §H F14).
Tasks:
- [x] `/about`: hero portrait, sticky 6-chapter story, pillars, books, discourses, contact band.
- [x] `/videos?c=&v=`: featured facade player, category tabs, grid, Shorts row + viewer, subscribe band.
- [x] `not-found.tsx`: branded 404 with the rotating chakra ("यह मार्ग यहाँ समाप्त होता है — This path ends here").

Built in one session by the main agent (no sub-agent).

Done-notes:
- **Data seam** (`src/lib/api/content.ts`): `getAbout()` (timeline, pillars, books) and `getVideos()` (cats, videos, shorts, subs). Types `Chapter`, `Book`, `Video`, `Short`. All art was already extracted in F2 (`lib/art/chapters.ts`, `books.ts`, `thumbs.ts`, `portrait.ts`, `public/svg/portrait/fg.svg`, chakra rings).
- **Routes**:
  - `src/app/[locale]/about/page.tsx` (static). Discourses = videos[0], [2], [4] (design 251) → `/videos?v=<id>`.
  - `src/app/[locale]/videos/page.tsx` (static). `?c=` / `?v=` are read on the client once on mount (no `useSearchParams`, so no Suspense needed). Tabs write `?c=`; a pick writes `?c=&v=` (`history.replaceState`).
  - `src/app/[locale]/not-found.tsx` + `src/app/[locale]/[...rest]/page.tsx` (catch-all → `notFound()`), so every unknown URL shows the branded 404 inside the site chrome. `notFound()` from product/course/rashi pages lands here too.
  - chrome-config already had `/about` and `/videos`.
- **About** (`src/components/sections/about/`):
  - `AboutSections.tsx` (server): `AboutHero` (ink mandala, credential pills, sheen "Book a consultation" → `/consultations`, "Watch his discourses" → `/videos`, arch portrait with chakra 120/−90/60 s, caption), `AboutStory`, `AboutPillars` (heading sticky ≥1024), `AboutBooks` (WhatsApp "Ask about a copy" with the book title), `AboutMedia`, `AboutCta` (Book → `/book/kundali`, because the bare `Booking.dc.html` link has no service; WhatsApp).
  - `StoryChapters.tsx` (client): active chapter = last one whose top < .55·vh.
    - ≥1024: sticky dots + rail fill (ch/5, 500 ms) + the arch window with the 6 arts cross-fading (700 ms) + year pill; chapters are 72vh, inactive ones .38.
    - <1024: per-chapter dot + 180px arch art, and the gold line fill (.6·vh).
    - On change the window redraws `[data-cd]` (1400 ms, +90 ms) + the yantra (drawYantra 1600). The "today" chakra spins 90 s/turn once started, paused offscreen/hidden.
    - Desktop and mobile arts are both in the DOM (CSS switch at lg) with separate uids (`abw*` / `abm*`).
  - Breakpoints: hero 2 cols at ≥980 (`min-[980px]`), books/media 2 cols ≥600 (`min-[600px]`) and 3 cols ≥900, CTA row ≥900.
- **Videos** (`src/components/sections/videos/`):
  - `VideosLibrary.tsx` (client): hero header + player + library + Shorts in one island (grid picks drive the player). The player logic mirrors Home `VideoPlayer` (facade, YT_IDS → nocookie iframe, preview bar/clock, pauses offscreen/hidden). A pick scrolls to #player (−60) and auto-starts; the info fades 350 ms; a category change staggers the cards (y14, 480 ms, +50 ms). "Now playing" badge on the current card while playing.
  - Shorts: stories row (<768, sand ring gap) + 9:16 rail (46% / 30% / six across ≥1024); both open the existing `ShortsViewer` (uid `vsv`).
  - `SubscribeBand.tsx` (server) uses the exported `SubButton` (YouTube URL from `SOCIAL` once confirmed, else the info toast).
  - All 12 video + 6 short thumbnail strings go to the client (the grid shows all of them). This is the heaviest page payload on the site; revisit in F15 if it feels slow (e.g. server-rendered thumbs passed as children).
- **i18n**: new namespaces `about`, `videos`, `notFound` in both files. /hi: Fraunces display text and chapter/pillar/book/video data stay English (F9 rule); Manrope UI text is Hindi (`[HI review]`).
- Nothing was run (no dev / build / tsc / lint).

Manual QA (F14). `pnpm dev`. No reference shots: compare with `design/About.dc.html` and `design/Videos.dc.html` opened in the browser.
1. **`/about` at 1440px, hero**
   - Faint ink mandala top-left. Breadcrumb Home / About Sadhak Ji. Eyebrow "॥ THE FOUNDER ॥ · साधक पवन पाण्डेय", h1 "Welcome to a space… *modern clarity.*", Devanagari line, intro.
   - 4 credential pills with gold icons.
   - "Book a consultation" (emerald; gold sheen sweeps on hover) → /consultations. "Watch his discourses" → /videos.
   - Right: arch portrait (430px) with twinkling stars, three chakra rings turning, the silhouette on top, brass outline, soft shadow below, and the name caption card at the bottom-left.
2. **Story (night band)**
   - Eyebrow "01 — HIS STORY · जीवन यात्रा", h2 "Six chapters, *one practice.*".
   - The left column sticks (top 110): dots १–६ on a rail, the arch window and the year pill.
   - Scroll: the active chapter is opaque (others faded), dots fill gold, the rail fill steps down, the art cross-fades and draws itself (lines ~1.4 s; chapter ३ yantra draws with a glow; chapter ६ chakra ring slowly turns).
   - Year pill: 2001–2008 → 2008 → 2008–2016 → 2012 onwards → 2019 → Today.
3. **Pillars**: the left heading sticks; 3 rows "i. ii. iii." with round icons and text.
4. **Books (sand)**: 3 covers; hover lifts 6px and tilts −1°. "Ask about a copy" opens WhatsApp with "I would like a copy of <title>".
5. **Discourses**: 3 cards (v1, v3, v5) with play disc + duration; hover lifts 3px; click → `/videos?v=v3` etc. "All discourses and Shorts" → /videos.
6. **Contact band (emerald)**: gold mandala right; gold "Book a consultation" → /book/kundali; "WhatsApp his office".
7. **`/about` at 390px**
   - Hero stacks, arch 300px.
   - Story: no sticky column; each chapter has its dot and a small arch art, and the gold line fills down as you scroll.
   - Pillars 1 column; books/media 1 column (2 at ≥600). No horizontal scroll.
8. **`/videos` at 1440px, player**
   - Night band, stars, mandala top-right. Breadcrumb Home / Videos, eyebrow, h1 "Discourses from the *sadhana* path.", Devanagari line.
   - Right of the header: "1.2 lakh subscribers · a new discourse every Sunday" + gold "Subscribe on YouTube" (info toast).
   - Player (8/12) with the thumbnail, 92px play disc and duration. Info column: category pill, title, Devanagari, description, Published / Length, Share (WhatsApp text) and "Ask Sadhak Ji directly" → /consultations.
   - Play → thumb dims, the gold bar fills slowly, the clock ticks; pause / resume works. Scroll away or switch tab → it pauses.
9. **Library**
   - Tabs: All 12 / Pravachan 3 / Sadhana 3 / Remedies 3 / Q&A 3 with Devanagari names; the active one has the brass underline. Switching re-staggers the cards and the URL becomes `?c=…`.
   - Click a card → smooth scroll to the player (60px offset), the info fades in, it starts playing, the card shows "NOW PLAYING", URL `?c=…&v=…`.
10. **Deep links**: `/videos?v=v7` opens with v7 featured (idle); `/videos?c=qa` opens on Q&A; bad values fall back to All / v1.
11. **Shorts (sand)**
    - 6 tall cards across at 1440 (30% at tablet, 46% on mobile, with snap).
    - Click → full-screen viewer: segments fill per short and auto-advance; left/right tap zones; ←/→ keys; Esc closes; focus starts on Close; the page doesn't scroll behind.
12. **Subscribe band (emerald)**: YouTube disc, "New discourses every Sunday…", "@SadhakPawanPandey · 1.2 lakh subscribers", Subscribe + "Get new videos on WhatsApp".
13. **`/videos` at 390px**: header stacks; player full width with the info below; tabs scroll sideways; grid 1 column (2 at ≥640); round gold story rings above the rail. No horizontal page scroll.
14. **404**
    - Open `/xyz`, `/hi/abc`, `/shop/xyz`, `/sadhana-courses/kali`. Header/footer stay.
    - Turning chakra around an italic "404", "॥ PAGE NOT FOUND ॥", "यह मार्ग यहाँ समाप्त होता है", h1 "This path ends *here.*", lotus rule, 4 buttons (Home, Shop, Book, WhatsApp). Tab title "Page not found".
15. **`/hi/about`, `/hi/videos`, `/hi/xyz`**: eyebrows, paragraphs, pills, buttons and labels are Hindi; h1/h2 and chapter/book/video data stay English.
16. **Reduced motion ON**: no chakra spin, no chapter draw/spin, the mobile story line is full, the player bar steps each second, the Shorts segment shows full with no auto-advance, reveals just show.
17. Any error or type error → Fix-list.

### F15 — Polish & handover · TODO
Read: PROGRESS Fix-list, `docs/CODING-RULES.md`.
Tasks:
- [ ] Cross-link audit (every CTA / nav / footer link goes to a real route or WhatsApp).
- [ ] Hindi pass (`[HI review]` flags).
- [ ] Reduced-motion + focus audit.
- [ ] Performance pass: dynamic imports below the fold, external SVG, DOM size, `use client` minimised, image sizes.
- [ ] Basic per-page `generateMetadata`. Full SEO comes in phase B.
- [ ] Run skills: **ui-ux-pro-max** (review), **/code-review**, **simplify**. Apply the fixes.
- [ ] `docs/CLIENT-DEMO.md`: how to run locally, how to deploy a Vercel preview, and the client-confirm list.
Manual QA: full site pass; `pnpm build`; deploy the Vercel preview; Lighthouse mobile ≥ 90.

### B0 — Backend plan · TODO
Start a new plan in plan mode from `docs/BACKEND-ROADMAP.md`.

---

## Decisions log
- 2026-09-29: Design source = Claude Design ZIP (cheaper than the MCP). Stack per docs/TECH-STACK.md. Next.js lives in the `KALA-JADU` root (inside OneDrive; pause OneDrive sync during `pnpm install`). pnpm. URL-based i18n (`/` = EN, `/hi` = HI).
- 2026-09-30 (F2): `localeDetection: false` — `/` never auto-redirects to `/hi` by browser language; Hindi only via the toggle or `/hi` URLs. SVG art with `<text>` is inlined (web fonts), everything else is an external `/svg` file.
- Commerce pages not in the export (Cart, Checkout, PDP, Wishlist, Search, Order Success) → branded coming-soon routes until they are designed. The cart drawer works fully.
- 2026-09-30 (F9): copy rule on /hi for pages whose design is English-only.
  - Fraunces display text (headings, service and tier names, quotes) stays English, because the display face has no Devanagari.
  - Manrope UI text is translated.
  - Data content (service details, tier inclusions, testimonials, FAQ) stays English until the phase-B CMS has Hindi fields.
- 2026-09-30 (F10): on /hi, form-group titles set in the 22px display serif (Booking "Which consultation?", "Package", "Birth details", "Pay with", calendar month…) are translated and use `font-title` (Fraunces + Tiro fallback), because they label form controls. Page h1/h2 display headings still stay English (F9 rule).
- 2026-09-30 (F10): pages can hide the site footer until a flow finishes (`flowFooter` in chrome-config + `useUi.flowDone`). Booking uses it: footer only on the confirmation, as in the design.
- 2026-09-30 (F8): the shop category and filters are view state. Switching rewrites the URL in place (`replaceState`: the path for the category, the query for filters) instead of navigating. The view, the open groups and the mobile sheet keep their state, and no page transition runs (same as the design's hash). Deep links and reloads restore everything.
- 2026-09-30 (F11): QA-only query params on `/kundali-99` (`?demo=generating|preview|success`, `?pay=fail`) replace the design's Tweaks props; they are read once on mount and never written.
- 2026-09-30 (F12): the Rashifal period is view state: `?p=` is read on mount and rewritten in place (replaceState), like the Shop filters. Predictions are seeded by the viewer's date (the HTML carries the build date).
- 2026-09-30 (F13): the QA-only /preview/inquiry-form route was removed early (F15 task), since the form now lives on /sadhana-courses, the course pages and /rituals.
- 2026-09-30 (F11): generated SVG strings never carry visitor text. When a design string embeds user input (the Kundali cover name), the extractor cuts that `<text>` out and the component renders it as JSX over the same viewBox.

## Client-confirm list (placeholders from the design)
- Prices beyond 12 Nag ₹1,250, Kundali ₹99 and courses ₹50,000. Kundali MRP ₹499.
- Consultation prices, durations, tiers; slot times; reschedule rule.
- Stats (18+ yrs, 12,000+ seekers, 3,500+ rituals), "4.9 · 2,000+ reviews", testimonials.
- WhatsApp +91 90000 12345, phone, email, hours.
- YouTube handle @SadhakPawanPandey, subscriber count, real video IDs.
- Book titles (साधना के सत्य, अदृश्य के अनुभव, मंत्र और मन), timeline years.
- Course durations, modules, instalments (3 × ₹16,667), refund wording.
- Ritual examples and inclusions; return policy (7 days).
- Sadhak Ji portrait and real product photos; an original logo file without the Gemini watermark.
- [HI review] Hindi copy: the design only has Hindi for Home, SiteChrome and ProductCard. Every other page (Shop, footer, consultations, booking, kundali, love, rashifal, courses, rituals, about, videos, forms, FAQ answers) is English with Devanagari subtitles, so its HI text will be written by us and needs review.
- Social profile URLs (YouTube, Instagram, Facebook, WhatsApp channel).
- Content for Account, Track order, Blog, Contact, FAQ page and policies (Shipping, Refund & Returns, Privacy, Terms, Astrology Disclaimer). These are coming-soon pages in the demo.
- Commerce numbers from the prototype:
  - free shipping above ₹999; shipping ₹79; express ₹99; COD ₹49; gift wrap ₹49; energization ₹251;
  - coupons SADHANA10 (10%) and FIRST100 (₹100 off orders of ₹999 or more).
- URL slugs (INV §C):
  - services: kundali-reading, palmistry, tarot-reading, numerology;
  - courses: `<deity>-sadhana`;
  - categories: rudraksha-malas, crystal-bracelets, bhojpatra-amulets, havan-samagri, energized-copper.
- Favicon / app icon: currently the full emblem SVG (`src/app/icon.svg`); its wordmark is unreadable at 16px. Need a simplified mark (e.g. the ॐ + lotus core) with the original logo file.
- Video/Shorts thumbnails are generated placeholder art (same art on every page); real YouTube thumbnails + IDs replace them.
- Home on `/hi` (F5): the design keeps the Bestsellers heading, the "Not sure which one?" WhatsApp tile and the whole Copper 12 Nag spotlight in English. Should we translate them? `[HI review]` also covers our Hindi aria labels (slider controls, quick actions, tabs).
- Next Mahapuja energization date (spotlight stock line) = the next Thursday at least 2 days out. Confirm the real calendar.
- Demo seed: the first visit starts with 2 cart items and 3 wishlist items (prototype behaviour, `DEMO_SEED` in `src/lib/core/commerce.ts`). Turn off before launch.
- Social profile links: footer icons currently show a "link is coming soon" toast (`SOCIAL` in `src/lib/site.ts`, url `null`). Need YouTube / Instagram / Facebook / WhatsApp channel URLs.
- Newsletter (footer) is a mock subscribe; needs the mailing-list provider in phase B.
- Demo seed also pre-fills "Recent searches" (5 mukhi, pyrite bracelet) — part of `DEMO_SEED`.
- [HI review] F4 chrome Hindi written by us: drawer, search, mega menu labels, footer columns/newsletter, coming-soon copy.
- Home §6–9 on `/hi` (F6): the design keeps the Rashifal wheel section, the Kundali / Love tools, the consultations bento and "Shop by intention" in English (with Devanagari subtitles). Our `hi.json` values are English copies — translate?
- Kundali mini (F6) uses the prototype's approximate maths (IST for every city, low-precision planets): fine for the demo, Swiss Ephemeris in phase B. Confirm the ₹99 / MRP ₹499 / "80% OFF" / "28-page report" copy.
- Rashifal texts (F6) are generated from template sentences (8 openers + 6 per area), seeded per rashi and day. Who writes the real daily predictions, and how often, is a phase-B content question.
- Rashi → gemstone mapping, lucky colours/numbers and remedies (F6, from the design data) need Sadhak Ji's review.
- Design gap: the Booking page shows no order summary between 768 and 1023px. It is built 1:1 for now; confirm whether one should be added.
- Home §10–17 on `/hi` (F7): the design keeps courses, rituals, about, YouTube, testimonials, journal, FAQ and newsletter in English (with Devanagari subtitles). Our `hi.json` values are English copies. Translate?
- YouTube (F7):
  - the real video and Shorts ids go in `YT_IDS` (`src/lib/site.ts`); until then the player runs the design's preview playback;
  - the channel URL (`SOCIAL.youtube`) for "Subscribe on YouTube";
  - the subscriber count ("1.2 lakh").
- Video testimonials (F7): two placeholder cards (Sunita Pathak, Deepak Srivastava) with portrait art. We need the real videos, or the cards are removed. Photo reviews use product art/photos as the "customer photo".
- About teaser (F7): the book "साधना के सत्य · The Truths of Sadhana", the founder quote and the mini-timeline years (2001–2008, 2008–2016, 2019).
- Shop (F8):
  - [HI review] all the shop UI Hindi is ours (`messages/hi.json` → `shop`), including the Buyer's notes and banner titles. The display title and eyebrow stay English on /hi.
  - Buyer's-note claims to confirm: Nepal sourcing, the X-ray test, the lab certificate number and energization date on the packet, 8 mm beads, bracelet sizes S/M/L (cm), dispatch 2–4 days after energization, personal energization with name + gotra.
  - "Most offerings sit between ₹300 and ₹2,500" (price note) and "Sadhak Ji's team replies within a day" (banner).
  - Stock numbers (12 Mukhi sold out; 13/14 Mukhi, lapis and Mahavidya low) and the "Newest" order come from the prototype data.
- Consultations (F9):
  - [HI review] all the `consult` and `inquiry` Hindi in `messages/hi.json` is ours.
  - From the prototype:
    - service copy, tiers and prices (₹1,100–₹5,100), durations and inclusions;
    - delivery lines ("Session within 3 days", "Report in 48 hrs");
    - the sample report pages.
  - The Sunita Pathak video testimonial ("Why I trust Sadhak Ji", 1:42) is a placeholder card that links to /videos.
  - Credentials copy: "Paranormal researcher", "Published author", "Shakta tradition".
  - Office promises: hours "Mon–Sat · 10:00–19:00 IST", "replies within a few hours", "Reschedule once, up to 12 hours before".
  - InquiryForm:
    - the promise "a WhatsApp call … within two working days";
    - the reference formats MKA-S- / MKA-R-;
    - inquiries are only stored in the browser (demo) until phase B.
- Booking (F10):
  - [HI review] all the `booking` Hindi in `messages/hi.json` is ours.
  - Payment is a mock: a 2 s "Confirming your payment" overlay, no Razorpay. Phase B needs the Razorpay keys, order creation and signature verification.
  - Slot availability is demo data (seeded per date). Confirm the real session times per length (30 / 45 / 60 / 90 min lists from the prototype), Sundays closed, the 30-day booking window and IST-only times.
  - Booking reference format `MKA-B` + 5 characters. Bookings are only stored in the browser (demo).
  - Palm photos: "seen only by Sadhak Ji and deleted 30 days after your report", 15 MB limit, photos are not uploaded in the demo.
  - Payment options shown: UPI (Google Pay, PhonePe, Paytm, UPI ID), cards (Visa, Mastercard, RuPay), netbanking chips (SBI, HDFC, ICICI, Axis, Kotak, Bank of Baroda).
  - Copy promises: "video link on WhatsApp an hour before", "report within 48 hours", "confirmation on WhatsApp (and email)".
- Kundali ₹99 (F11):
  - [HI review] all the `k99` Hindi in `messages/hi.json` is ours.
  - Copy/claims from the prototype: "4.8 from 3,400+ reports", "Instant PDF on WhatsApp and email", "Sidereal (Lahiri) positions", "28 pages" and the table of contents, "Dasha periods to 2046", "stays in your account", the refund line "5–7 working days", the 4 reader reviews (Kavita Soni, Rohit Verma, Sushma Devi, Aditya Kulkarni).
  - Payment is a mock (1.8 s "Waiting for your bank"); the report is not sent anywhere. Phase B: Razorpay + real PDF generation + WhatsApp/email delivery.
  - The download is a one-page SVG chart for the demo, not the 28-page PDF.
  - An unknown town silently falls back to the best match or Varanasi for the maths (design rule); IST is assumed for every place (phase B: real geocoding + time zones).
- Love Calculator (F11):
  - [HI review] all the `love` Hindi is ours; result labels and lines stay English.
  - The 4 related products come from the prototype's filter (Rose Quartz bracelet, 2 Mukhi, 13 Mukhi, Garnet bracelet). "Shop all bracelets" goes to `/shop` as in the design — should it open the bracelets category?
  - The WhatsApp share text mentions `sadhakpawanpandey.com/love-calculator`.
- Rashifal (F12):
  - [HI review] all the `rashifal` Hindi in `messages/hi.json` is ours; readings, remedies and compatibility lines stay English.
  - Readings are the prototype's template sentences (seeded per rashi, period and date); meters, lucky numbers and the "Overall" score are generated too. Real daily/weekly/monthly/yearly content is a phase-B CMS question.
  - Sun-sign dates (sidereal, fixed: e.g. Kanya 17 Sep – 16 Oct), rashi lords, days, colours, remedies, gemstone/rudraksha/amulet mapping and the compatibility rule (same element + one complementary sign) need Sadhak Ji's review.
  - The finder's Moon sign uses the approximate Kundali maths (IST for every town, 32 towns only).
  - "My rashi" is stored only in the browser (`mka-my-rashi`), no account yet.
  - The Kundali CTA chart is the demo chart (1986-11-12 06:40 Varanasi), not the visitor's.
- Courses & Rituals (F13):
  - [HI review] all the `sadhana` and `rituals` Hindi in `messages/hi.json` is ours; course/ritual data, FAQ and display headings stay English.
  - Course copy from the prototype: durations (27–41 days + 7 of preparation), the five module stages and their day ranges, "60–90 minutes a day", "over 21", diksha in person or on video, the per-course niyam, and "replies within two working days".
  - Fee terms: ₹50,000 all-inclusive, pay only after the eligibility conversation, UPI/netbanking/bank transfer, instalments 3 × ₹16,667 (marked [confirm] in the design), refund in full until diksha.
  - Rituals: the six ritual examples (design pill "Placeholder examples · to confirm with client"), the "What you receive" inclusions (photo/video updates, prasad and raksha sutra by post, 40 days of guidance), and the FAQ answers (durations 1 to 21 days, attending in person).
  - Enrollment policy line "A sadhana is not bought…" is attributed to "Maa Kali Astuti · enrollment policy".
- About & Videos (F14):
  - [HI review] all the `about`, `videos` and `notFound` Hindi in `messages/hi.json` is ours; story, pillars, books and video data stay English.
  - Biography from the prototype: MBA + MNC years (2001–2008), turning point 2008, sadhana 2008–2016, paranormal research from 2012, founding 2019, "18 years of sadhana". Needs Sadhak Ji's confirmation.
  - Portrait is a drawn placeholder; a real photo is needed (hero arch + chapter arts are illustrations).
  - The 3 books (titles, years, page counts, lines) are placeholders; "Ask about a copy" goes to the placeholder WhatsApp.
  - Videos: the 12 titles, dates, durations and 6 Shorts, "1.2 lakh subscribers", "@SadhakPawanPandey" and "a new discourse every Sunday" come from the prototype. Real YouTube ids (`YT_IDS` in `src/lib/site.ts`) and the channel URL (`SOCIAL`) are needed; until then the player runs the preview and Subscribe shows a toast.
  - 404 has no design file: built from the chakra + brand tokens; copy "This path ends here" is ours.
