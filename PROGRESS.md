# PROGRESS — Maa Kali Astuti

**Phase:** F — Frontend (client demo) · **Next step:** F1
Resume in a fresh session with: `/next`

| Step | Title | Status |
|---|---|---|
| F0 | Workflow + docs + design import | DONE |
| F1 | Design inventory (line-range map) | TODO |
| F2 | Scaffold + design system + extraction pipeline | TODO |
| F3 | Data layer + stores + ProductCard | TODO |
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

### F1 — Design inventory · TODO
Read: `design/HANDOFF-NOTES.md`, `docs/DESIGN-TO-CODE.md`. Everything else goes through agents.
Tasks:
- [ ] Launch **3 Explore agents in parallel** (thoroughness "very thorough"). Each returns a compact outline, **not file dumps**:
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
- [ ] Write `docs/DESIGN-INVENTORY.md` with these parts:
  - **A.** File → section → lines table, per file.
  - **B.** `mka-*.js` member table (name, lines, tag, target TS path).
  - **C.** Route map: design file + hash params → Next route, e.g. `Consultation-Detail#s=palm` → `/consultations/palmistry`. Use SEO slugs.
  - **D.** Breakpoint map (768 / 900 / 1024 / 1100 / 1180 / 1280), with where each is used.
  - **E.** Motion map: S1–S13 plus the page-level motions → design location → target component or hook.
  - **F.** Asset list: PNGs → `public/images/*.webp`; which ART builders become static `.svg` versus inline animated.
  - **G.** Deferred pages (in `M.BUILT`, not designed): Cart, Checkout, Product ×2, Wishlist, Search, Order Success, plus Account, Blog, Contact, FAQ, Policies.
  - **H.** A "Read-list per step" for F2–F14, with exact line ranges, so each later session reads the minimum.
- [ ] Update the *Read* lines of F2–F14 below with those ranges.
Manual QA: open `docs/DESIGN-INVENTORY.md` and skim it (optional).

### F2 — Scaffold + design system + extraction pipeline · TODO
Read: `docs/TECH-STACK.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN-TO-CODE.md`, DESIGN-INVENTORY §B/§D/§F, and the `mka-core.js` token, icon and ornament ranges.
Tasks:
- [ ] `pnpm create next-app@latest` into a temp folder with TS, Tailwind, ESLint, App Router, `src/`, alias `@/*`, no Turbopack prompts. Then move the contents to the project root, because the root already has files. Keep `design/`, `docs/`, `client-requirements/` and `design-brief/` untouched.
- [ ] Install: `next-intl motion lenis zustand react-hook-form zod @hookform/resolvers radix-ui clsx tailwind-merge`. Dev: `jsdom sharp prettier prettier-plugin-tailwindcss`.
- [ ] `next.config.ts`: security headers (see TECH-STACK §Security), `images.formats` avif/webp, `poweredByHeader:false`, next-intl plugin.
- [ ] next-intl: `src/i18n/{routing,request,navigation}.ts`, locale middleware/proxy per the installed Next version, `messages/en.json` + `hi.json` skeleton, `app/[locale]/layout.tsx` with `setRequestLocale` and `generateStaticParams`.
- [ ] Fonts via `next/font/google` as CSS variables (see TECH-STACK).
- [ ] `src/app/globals.css`: Tailwind v4 `@theme`
  - colour tokens from `M.C` + the HANDOFF tints;
  - fonts; breakpoints `md 768`, `w900`, `lg 1024`, `w1100`, `nav 1180`, `xl 1280`;
  - radii, shadows and easing variables;
  - keyframes for all `data-amb` ambient types found in the inventory (twinkle, flicker, glow, float, spin, …);
  - a reduced-motion block;
  - focus ring (2px gold, offset 2px);
  - paper grain.
- [ ] `scripts/extract-design.mjs` (jsdom + vm: load `mka-core` → `mka-astro` → `mka-home` in a jsdom window with a stub React). It dumps:
  - DATA members → `src/lib/data/*.json`;
  - static ART → `public/svg/<group>/<name>.svg`;
  - animated ART strings → `src/lib/art/*.ts` (exported string constants).

  Run it once with `node scripts/extract-design.mjs`. That is allowed; it is a generator, not a build.
- [ ] `scripts/optimize-images.mjs` (sharp): `design/assets/*.png` → `public/images/*.webp` (max 1600px, q≈80). Run it once.
- [ ] `src/lib/core/*`: port the LOGIC from mka-core to typed TS (fmt, off, rng/hash, dates, muhurat, stockNote, pin, search). Add `src/lib/utils/cn.ts`.
- [ ] `src/components/icons/`: the icon set from `mka-core` `I`, as one `<Icon name>` component with typed names.
- [ ] `src/components/ui/`: ornaments (LotusRule, Corner, Mandala), Logo, Button variants, Eyebrow, SectionHeader, Badge, Price, Rating, Chip, QtyStepper, Input/Field. Match the design exactly.
- [ ] `src/components/motion/`: AmbientRoot (pauses `data-amb` offscreen or when the tab is hidden), Reveal, MaskText, Counter, Magnetic, ScrollLine, Marquee. Timings follow HANDOFF.
- [ ] Invoke skill **ui-ux-pro-max** (Next.js + Tailwind; a11y, motion, perf). Distil its rules into `docs/CODING-RULES.md` §From ui-ux-pro-max.
- [ ] Add `.vercelignore` entries if needed. Leave `app/[locale]/page.tsx` as a minimal placeholder.
Manual QA: `pnpm install` then `pnpm dev` → `/` loads with the correct fonts and ivory background; `/hi` works.

### F3 — Data layer + stores + ProductCard · TODO
Read: ARCHITECTURE §Data, DESIGN-INVENTORY ranges for `ProductCard.dc.html` and `mka-core` (store, fx, ui, P, CATS, INTENTS, RUD, BADGE).
Tasks:
- [ ] `src/types/*`: Product, Category, Intent, Variant, LocalizedString `{en,hi}`, etc.
- [ ] `src/lib/api/catalog.ts`: async getters over the generated JSON (getProducts with filters, getProduct, getCategories, getIntents, search).
- [ ] `src/stores/`:
  - `cart` (persist): add / remove / qty / variant / energization, subtotal, free-shipping threshold;
  - `wishlist` (persist);
  - `ui`: cart drawer, quick-add pid, search open, toasts with undo.

  Make them hydration-safe.
- [ ] `src/components/commerce/fx.ts`: fly-to-cart (arc to `[data-cart-target]`, badge bump) and wishlist burst. Port from `M.fx`.
- [ ] `Toaster` (a port of the M.ui toast: tone, action, undo).
- [ ] `ProductCard` with all modes (card / compact / row / wish): hover image crossfade, lift, gold ring, quick-add bar, mobile plus, add-to-cart morph (idle → loading → added), OOS notify, stock note, badges, wishlist.
- [ ] `QuickAdd` size picker (wrist sizes), opened through the ui store.
Manual QA: none this step. The cards become visible and checkable in F4 (cart drawer upsell) and F5 (Home).

### F4 — Global chrome · TODO
Read: DESIGN-INVENTORY ranges for `SiteChrome.dc.html` and `SiteFooter.dc.html`.
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
- [ ] Coming-soon pages for the deferred routes: `/cart`, `/checkout`, `/product/[slug]`, `/wishlist`, `/search`, `/order/success`. Branded, with a chakra, "being prepared" copy and links back.
Manual QA: header, menus, tab bar, cart drawer (add from anywhere once cards exist), footer animation, language toggle, mobile at 390px.

### F5 — Home A · TODO
Read: DESIGN-INVENTORY Home §1–5 ranges + the `mka-home` pandit, arch, gems and catArt ranges.
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
Read: DESIGN-INVENTORY Home §6–9 + the `mka-astro` rashi, glyph, wheel, predict, kundali, chart, love and STONES ranges.
Tasks:
- [ ] `src/lib/astro/*`: port RASHI, predict, sunRashi, kundali (approx), chart, love, nameNum.
- [ ] RashiWheel (S8: 4s spring step, click-to-spin, pause 12s, pause button, keyboard) + detail panel (tabs, meters, lucky trio, gemstone cross-sell).
- [ ] Mobile half-dial synced to the swipe rail.
- [ ] Astro tools pair: Kundali mini form + self-drawing chart (S12), and Love Calculator with converging medallions and the ring fill (S13).
- [ ] Consultations bento + how-it-works strip.
- [ ] Intentions: 10 floating stones (S9, mouse depth), intention pills revealing 4 products.
Manual QA: wheel auto-cycle and click, mobile dial swipe, love result, chart draw.

### F7 — Home C · TODO
Read: DESIGN-INVENTORY Home §10–17 + FaqList + `mka-home` videos, shorts, thumb, books, seal, review and timeline ranges.
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
Read: DESIGN-INVENTORY ranges for `Shop.dc.html`.
Tasks: the `/shop` and `/shop/[category]` template, exactly as designed:
- [ ] header band, sub-chips, sticky filter sidebar, sort, active chips;
- [ ] mobile Filter · Sort bar + bottom sheet;
- [ ] editorial banner every 12 cards, load more with progress;
- [ ] skeleton and empty states, SEO text block.

Filters are URL-synced (search params).
Manual QA: filter, sort, load more, mobile sheet, empty state.

### F9 — Consultations · TODO
Read: DESIGN-INVENTORY ranges for `Consultations`, `Consultation-Detail` and `InquiryForm` + `mka-astro` SVC, MODES, STEPS, TESTI and svcArt.
Tasks:
- [ ] `/consultations` landing.
- [ ] `/consultations/[service]` (4 services, tiers, sticky Book CTA).
- [ ] `InquiryForm` component (kinds: course, ritual; presets; RHF + Zod; mock submit states).
Manual QA: all 4 service pages; form validation errors.

### F10 — Booking · TODO
Read: DESIGN-INVENTORY ranges for `Booking.dc.html` + `mka-astro` SLOTS, slotsFor, istDate, ics and gcal.
Tasks:
- [ ] `/book/[service]?tier=`: the 4-step stepper with a progress line.
  1. Service & mode.
  2. Details, which vary per service (palm photo upload preview + guide).
  3. Date & slot (IST, Sunday closed, 30-day window).
  4. Pay (mock overlay with chakra).
- [ ] Confirmation page with .ics download and Google Calendar.
Manual QA: full flow on mobile + desktop, back/forward between steps.

### F11 — Kundali ₹99 + Love Calculator · TODO
Read: DESIGN-INVENTORY ranges for `Kundali-99` and `Love-Calculator` + `mka-astro` kundali, chart, drawChart, CITIES, placeSearch, page (report pages), love and KOOTA.
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
Read: DESIGN-INVENTORY ranges for `Rashifal` and `Rashi-Detail` + `mka-astro` PERIODS, periodDate, predict, AREAS and compatible.
Tasks:
- [ ] `/rashifal?p=`: hero wheel, period tabs, 12-rashi grid, DOB → rashi helper.
- [ ] `/rashifal/[rashi]?p=`: area meters, lucky trio, gemstone product, remedy, compatible rashis, recommended products, Kundali CTA.

Mobile uses the half-dial.
Manual QA: all periods, 2–3 rashis, mobile dial.

### F13 — Courses + Rituals · TODO
Read: DESIGN-INVENTORY ranges for `Sadhana-Courses`, `Course-Detail` and `Rituals` + `mka-astro` COURSES, course, INCLUDES, ENROLL, MODULES, NIYAM, yantra, RITUALS, RPROCESS, RECEIVE and thali.
Tasks:
- [ ] `/sadhana-courses`.
- [ ] `/sadhana-courses/[slug]` (sticky Enquire, InquiryForm preset).
- [ ] `/rituals` (diya thali, scroll-filled process line, InquiryForm kind `ritual`).

Option: one general-purpose agent builds Rituals while the main agent builds Courses.
Manual QA: yantra draw, sticky CTA, process line, forms.

### F14 — About + Videos + 404 · TODO
Read: DESIGN-INVENTORY ranges for `About` and `Videos` + `mka-home` TIMELINE, PILLARS, chapter, BOOKS, VIDEOS, SHORTS and thumb.
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
