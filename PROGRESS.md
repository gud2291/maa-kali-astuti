# PROGRESS — Maa Kali Astuti

**Phase:** F — Frontend (client demo) · **Next step:** F4
Resume in a fresh session with: `/next`

| Step | Title | Status |
|---|---|---|
| F0 | Workflow + docs + design import | DONE |
| F1 | Design inventory (line-range map) | DONE |
| F2 | Scaffold + design system + extraction pipeline | DONE |
| F3 | Data layer + stores + ProductCard | DONE |
| F4 | Global chrome (header, menus, cart drawer, footer) | TODO |
| F5 | Home A — hero → 12 Nag spotlight | TODO |
| F6 | Home B — rashifal wheel → floating stones | TODO |
| F7 | Home C — courses → newsletter | TODO |
| F8 | Shop + category template | TODO |
| F9 | Consultations + consultation detail + InquiryForm | TODO |
| F10 | Booking stepper | TODO |
| F11 | Kundali ₹99 + Love Calculator | TODO |
| F12 | Rashifal + Rashi detail | TODO |
| F13 | Sadhana Courses + Course detail + Rituals | TODO |
| F14 | About + Videos + 404 | TODO |
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

### F4 — Global chrome · TODO
Read: INV §A.2, §A.3, §C, §G, §E.3 (chrome row). Design: `SiteChrome.dc.html` 14–388 + 390–564, block by block with its bindings (INV §A.2 table) · `SiteFooter.dc.html` 14–116 · `mka-core.js` 139–173, 267–268, 452–454, 490–518, 528–552 (details: INV §H F4).
Tasks:
- [ ] AnnouncementBar (3 rotating messages, WhatsApp, EN|हिं toggle).
- [ ] Header (76 → 64px on scroll, blur + gold hairline when stuck), nav with active states, and the Shop mega menu (5 columns, intention chips, featured 12 Nag, staggered open).
- [ ] Mobile compact bar, full-screen night menu (rotating mandala, staggered links), BottomTabBar (hides on scroll-down, raised Consult chakra, cart badge).
- [ ] CartDrawer (Radix Dialog; 440px / full-screen on mobile): free-shipping progress, line items, qty, remove + undo, upsell rail, coupon, subtotal, CTAs, empty state (kalash + diya).
- [ ] Search overlay, if SiteChrome has it.
- [ ] WhatsApp FAB (pulse every 8s, lifts above the tab bar, honours the `fab-lift` prop), back-to-top progress ring.
- [ ] SiteFooter (night cosmos: twinkle, constellation draw, 180s mandala, shooting star every ~12s; columns, newsletter prop, payment icons, shloka line).
- [ ] Page transition (fade + 12px lift) and a gold top progress line on route change. Lenis provider (desktop, fine pointer, no reduced motion).
- [ ] Wire everything into `app/[locale]/layout.tsx`; header props `active`, `tabbar`, `fabLift` per page.
- [ ] Coming-soon pages for the deferred routes: `/cart`, `/checkout`, `/product/[slug]`, `/wishlist`, `/search`, `/order/success`, plus `/account`, `/track-order`, `/blog`, `/contact`, `/faq`, `/policies/[slug]` (INV §G). Branded, with a chakra, "being prepared" copy and links back.
Manual QA: header, menus, tab bar, cart drawer (add from anywhere once cards exist), footer animation, language toggle, mobile at 390px.

### F5 — Home A · TODO
Read: INV §A.1 (§1–5), §E.1 S1–S4 S7 S9, §E.3. Design: `Home.dc.html` 29–344 + script 941–1079 and 1366–1479 · `mka-home.js` 12–184 · `mka-astro.js` 158–170, 422 (details: INV §H F5).
Tasks:
- [ ] Hero:
  - arch frame;
  - PanditJi inline SVG with S1 blink, S2 japa (`malaAt`), S3 breath + aura, S4 gaze (desktop), S5 diya, S6 smoke;
  - Chakra halo S7;
  - floating gems with scroll/mouse parallax;
  - 3-slide text slider (mask lines, 6s progress, `01 / 03`, pause on hover or offscreen);
  - trust row, magnetic CTAs.
- [ ] Mobile Quick Actions tiles.
- [ ] Trust marquee (56s, pauses on hover).
- [ ] Category arches (crescent rhythm, hover fill, snap rail on mobile).
- [ ] Bestsellers tabs + grid (crossfade stagger).
- [ ] 12 Nag spotlight ("12" parallax −0.2, thumbnails, benefits, qty, add to cart / buy now, ideal-for chips).
Manual QA: compare `/` against `design/shots/h1-h4.jpg` and the Claude Design preview, desktop 1440 + mobile 390; reduced motion on.

### F6 — Home B · TODO
Read: INV §A.1 (§6–9), §E.1 S8 S9 S12 S13. Design: `Home.dc.html` 346–645 + script 1081–1247 · `mka-astro.js` 9–151, 154–200, 260–280, 298–318, 342–386 · `mka-home.js` 262–265 · `mka-core.js` 528–533 (details: INV §H F6).
Tasks:
- [ ] `src/lib/astro/*`: port RASHI, predict, sunRashi, kundali (approx), chart, love, nameNum.
- [ ] RashiWheel (S8: 4s spring step, click-to-spin, pause 12s, pause button, keyboard) + detail panel (tabs, meters, lucky trio, gemstone cross-sell).
- [ ] Mobile half-dial synced to the swipe rail.
- [ ] Astro tools pair: Kundali mini form + self-drawing chart (S12), and Love Calculator with converging medallions and the ring fill (S13).
- [ ] Consultations bento + how-it-works strip.
- [ ] Intentions: 10 floating stones (S9, mouse depth), intention pills revealing 4 products.
Manual QA: wheel auto-cycle and click, mobile dial swipe, love result, chart draw.

### F7 — Home C · TODO
Read: INV §A.1 (§10–17), §A.6, §E.1 S11, §E.3. Design: `Home.dc.html` 647–933 + script 1248–1365 · `FaqList.dc.html` 15–59 · `mka-home.js` 185–300 · `mka-astro.js` 203–258, 327–333, 389–407, 410–420 · `mka-core.js` 534–541 (details: INV §H F7).
Tasks:
- [ ] Sadhana course track (night; yantra draw S11; drag/scroll/swipe).
- [ ] Rituals process line (fills on scroll).
- [ ] About teaser (arch portrait, quote card, timeline, count-up stats, book).
- [ ] YouTube: facade player (youtube-nocookie iframe only on click) + playlist; mobile Shorts stories row + viewer (keyboard, Esc).
- [ ] Testimonials masonry (text, video, photo reviews; mobile carousel).
- [ ] Blog cards, FAQ (`FaqList` component, set `home`, openFirst).
- [ ] Newsletter band. Footer with `newsletter="off"` on Home.
Manual QA: full Home scroll on both sizes; YouTube loads only on click.

### F8 — Shop + category · TODO
Read: INV §A.5, §C (shop rows), §D. Design: `Shop.dc.html` 26–384 · `mka-core.js` 176–194, 308–380 (details: INV §H F8).
Tasks: the `/shop` and `/shop/[category]` template, exactly as designed:
- [ ] header band, sub-chips, sticky filter sidebar, sort, active chips;
- [ ] mobile Filter · Sort bar + bottom sheet;
- [ ] editorial banner (design: shown once, at index cols×2 — INV gotcha 4), load more (+12) with progress;
- [ ] skeleton and empty states, SEO text block.

Filters are URL-synced (search params).
Manual QA: filter, sort, load more, mobile sheet, empty state.

### F9 — Consultations · TODO
Read: INV §A.7–§A.9, §C (consult rows). Design: `Consultations.dc.html` 27–288 · `Consultation-Detail.dc.html` 27–229 · `InquiryForm.dc.html` 15–163 · `mka-astro.js` 134–170, 249–295, 298–318, 327–333, 389–398, 410–422 (details: INV §H F9).
Tasks:
- [ ] `/consultations` landing.
- [ ] `/consultations/[service]` (4 services, tiers, sticky Book CTA).
- [ ] `InquiryForm` component (kinds: course, ritual; presets; RHF + Zod; mock submit states).
Manual QA: all 4 service pages; form validation errors.

### F10 — Booking · TODO
Read: INV §A.10, §C (booking row). Design: `Booking.dc.html` 28–603 · `mka-astro.js` 10–12, 73–74, 158–170, 260–269, 298–325 · `mka-core.js` 20–24, 509–510 (details: INV §H F10).
Tasks:
- [ ] `/book/[service]?tier=`: the 4-step stepper with a progress line.
  1. Service & mode.
  2. Details, which vary per service (palm photo upload preview + guide).
  3. Date & slot (IST, Sunday closed, 30-day window).
  4. Pay (mock overlay with chakra).
- [ ] Confirmation page with .ics download and Google Calendar.
Manual QA: full flow on mobile + desktop, back/forward between steps.

### F11 — Kundali ₹99 + Love Calculator · TODO
Read: INV §A.11, §A.12, §E.1 S7 S12 S13. Design: `Kundali-99.dc.html` 28–500 · `Love-Calculator.dc.html` 27–254 · `mka-astro.js` 9–151, 158–170, 283–295, 334–339, 372–386, 413 (details: INV §H F11).
Tasks:
- [ ] `/kundali-99` state machine:
  - form (place autocomplete, unknown-time checkbox);
  - generating (chakra ramp 0.12 → 2.6);
  - preview (chart draw, planet table, lagna / rashi / nakshatra, blurred locked pages);
  - mock pay (success / fail);
  - success + download (SVG chart for now).

  Plus what's-inside, samples, FAQ and reviews.
- [ ] `/love-calculator`: large tool, how it works, disclaimer, Kundali Milan CTA, related products.
Manual QA: every Kundali state, including the pay-fail recovery; the love result animation.

### F12 — Rashifal · TODO
Read: INV §A.13, §A.14, §E.1 S8. Design: `Rashifal.dc.html` 28–299 · `Rashi-Detail.dc.html` 27–221 · `mka-astro.js` 9–74, 90–151, 173–200, 342–369 · `mka-core.js` 267 (details: INV §H F12).
Tasks:
- [ ] `/rashifal?p=`: hero wheel, period tabs, 12-rashi grid, DOB → rashi helper.
- [ ] `/rashifal/[rashi]?p=`: area meters, lucky trio, gemstone product, remedy, compatible rashis, recommended products, Kundali CTA.

Mobile uses the half-dial.
Manual QA: all periods, 2–3 rashis, mobile dial.

### F13 — Courses + Rituals · TODO
Read: INV §A.15–§A.17, §E.1 S5 S11, §E.3. Design: `Sadhana-Courses.dc.html` 27–195 · `Course-Detail.dc.html` 27–240 · `Rituals.dc.html` 27–182 · `mka-astro.js` 134–151, 203–248, 389–407, 414, 419 · `mka-core.js` 267 (details: INV §H F13).
Tasks:
- [ ] `/sadhana-courses`.
- [ ] `/sadhana-courses/[slug]` (sticky Enquire, InquiryForm preset).
- [ ] `/rituals` (diya thali, scroll-filled process line, InquiryForm kind `ritual`).

Option: one general-purpose agent builds Rituals while the main agent builds Courses.
Manual QA: yantra draw, sticky CTA, process line, forms.

### F14 — About + Videos + 404 · TODO
Read: INV §A.18, §A.19, §E.3. Design: `About.dc.html` 28–255 · `Videos.dc.html` 28–238 · `mka-home.js` 185–259, 273–300 · `mka-astro.js` 158–170, 218–225, 249–258 (details: INV §H F14).
Tasks:
- [ ] `/about`: hero portrait, sticky 6-chapter story, pillars, books, discourses, contact band.
- [ ] `/videos?c=&v=`: featured facade player, category tabs, grid, Shorts row + viewer, subscribe band.
- [ ] `not-found.tsx`: branded 404 with the rotating chakra ("यह मार्ग यहाँ समाप्त होता है — This path ends here").
Manual QA: sticky story scroll, video switching, Shorts viewer keyboard, 404.

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
- Demo seed: the first visit starts with 2 cart items and 3 wishlist items (prototype behaviour, `DEMO_SEED` in `src/lib/core/commerce.ts`). Turn off before launch.
- Design gap: the Booking page shows no order summary between 768 and 1023px. It is built 1:1 for now; confirm whether one should be added.
