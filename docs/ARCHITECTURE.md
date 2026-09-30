# ARCHITECTURE

## Repository layout
```
KALA-JADU/                       (Next.js app lives at the root)
├─ CLAUDE.md · PROGRESS.md       session rules + step tracker
├─ .claude/                      commands/next.md (the /next resume command), settings.json (permissions)
├─ docs/                         architecture, stack, rules, design-to-code, inventory, workflow, backend roadmap
├─ design/                       Claude Design export (READ-ONLY reference; excluded from deploy)
│   ├─ *.dc.html                 pages + shared components (prototype templates)
│   ├─ mka-core.js / mka-astro.js / mka-home.js   shared data, SVG art builders, logic, motion
│   ├─ support.js                prototype runtime (reference only)
│   ├─ assets/                   product PNGs + logo emblem
│   └─ shots/                    reference screenshots
├─ client-requirements/ · design-brief/   original inputs
├─ scripts/                      extract-design.mjs, optimize-images.mjs (dev-time generators)
├─ messages/                     en.json, hi.json (UI strings)
├─ public/
│   ├─ images/                   optimized WebP (from design/assets)
│   └─ svg/                      static illustration generated from design JS (products, gems, thumbs, books, yantras, glyphs, …)
└─ src/
    ├─ app/
    │   ├─ globals.css           Tailwind v4 @theme tokens, breakpoints, keyframes, reduced-motion, focus ring, paper grain
    │   └─ [locale]/
    │       ├─ layout.tsx        fonts, NextIntlClientProvider, AmbientRoot, Lenis, SiteChrome, SiteFooter, Toaster
    │       ├─ page.tsx          Home
    │       ├─ shop/  shop/[category]/
    │       ├─ consultations/  consultations/[service]/  book/[service]/
    │       ├─ kundali-99/  love-calculator/  rashifal/  rashifal/[rashi]/
    │       ├─ sadhana-courses/  sadhana-courses/[slug]/  rituals/  about/  videos/
    │       ├─ cart/ checkout/ product/[slug]/ wishlist/ search/ order/success/   ← "coming soon" until designed
    │       └─ not-found.tsx
    ├─ components/
    │   ├─ layout/     AnnouncementBar, Header, MegaMenu, MobileMenu, BottomTabBar, CartDrawer, SearchOverlay, WhatsAppFab, BackToTop, SiteFooter, PageTransition
    │   ├─ ui/         Button, Eyebrow, SectionHeader, Badge, Price, Rating, Chip, QtyStepper, Field, Tabs, Accordion, Sheet, Logo, ornaments
    │   ├─ commerce/   ProductCard, QuickAdd, AddToCartButton, WishlistButton, CategoryArch, FilterSidebar, FilterSheet, SortMenu, fx.ts
    │   ├─ signature/  PanditJi, Chakra, RashiWheel, RashiDial, KundaliChart, Yantra, Diya, Starfield, FloatingGems, LoveMeter
    │   ├─ motion/     AmbientRoot, Reveal, MaskText, Counter, Magnetic, ScrollLine, Marquee
    │   ├─ forms/      InquiryForm, FaqList (shared across pages)
    │   ├─ icons/      Icon (typed names from the design icon map)
    │   └─ sections/<page>/   page sections (home/, shop/, consult/, booking/, kundali/, rashifal/, courses/, rituals/, about/, videos/)
    ├─ lib/
    │   ├─ data/       generated JSON (from design JS) + typed re-exports
    │   ├─ api/        async getters = THE BACKEND SEAM (catalog, astro, content, video)
    │   ├─ art/        trusted SVG strings for JS-animated art (generated)
    │   ├─ core/       fmt, off, rng/hash, dates, muhurat, stockNote, pin, search
    │   ├─ astro/      rashi, predict, sunRashi, kundali (approx), chart, love, nameNum, slots, ics/gcal
    │   ├─ validation/ zod schemas (shared with the backend later)
    │   ├─ hooks/      useInView, useReducedMotion, usePageVisible, useScrollDir, useMedia, useHydrated
    │   └─ utils/      cn
    ├─ i18n/           routing.ts, request.ts, navigation.ts
    ├─ stores/         cart.ts, wishlist.ts, ui.ts (zustand)
    └─ types/          product, catalog, astro, content, localized
```

## Rendering
- **All pages are SSG.** `generateStaticParams` covers locales × categories / services / rashis / courses. Query params (`?p=`, `?tier=`, `?c=&v=`, filters) are read client-side in small islands, so pages stay static.
- **Server components by default.** `"use client"` goes only on interactive leaves: sliders, wheel, forms, cart UI, ProductCard actions.
- **Below the fold:** heavy interactive widgets load through `next/dynamic` with a skeleton that matches the final size (no CLS).
- **Responsive:** CSS breakpoints only for layout. JS media checks only for behaviour (gaze, magnetic, Lenis, dial vs wheel), and only after hydration.

## Data seam (why `lib/api`)
Components never import JSON directly. They call `lib/api/*`, for example:
```ts
getProducts({ cat, intent, sort, page }) · getProduct(slug) · getCategories() · search(q)
getRashifal(rashi, period) · getService(slug) · getCourse(slug) · getVideos(cat) · getFaq(set)
```
Today these read `lib/data/*.json`. In phase B they switch to DB queries and cached fetches, and components don't change.
Client exception (F3): `lib/api/products-index.ts` is a synchronous id/slug lookup used by the cart, wishlist and quick-add sheet to resolve product ids in the browser. In phase B the cart hydrates its lines from a cart API instead.

## Client state
- `stores/cart.ts`: items `{ pid, variant?, qty, energization?: { name, gotra } }`, derived subtotal, free-shipping progress (threshold ₹999). Persisted.
- `stores/wishlist.ts`: `pid[]`. Persisted.
- `stores/ui.ts`: cartOpen, searchOpen, menuOpen, quickAdd pid, toasts[] (tone, action, undo payload).
- Hydration: persisted stores use `skipHydration`, so SSR and the first client render see neutral values (0 items). `components/commerce/StoreHydrator` (in the layout) rehydrates after mount, seeds the demo cart/wishlist on a first visit (`DEMO_SEED`) and syncs tabs via the `storage` event.

## Routes (design → Next)
Final table in `docs/DESIGN-INVENTORY.md` §C. Principle: hash params become path segments when they identify a resource (service, rashi, course), and query params when they are view state (period, tier, video, category tab, filters).

## Motion system
- `AmbientRoot` (in the layout) observes every `[data-amb]` element. It sets `data-amb-paused` when the element is offscreen or the tab is hidden; CSS then sets `animation-play-state: paused`.
- Reduced motion: a global CSS block stops ambient loops, and hooks check `useReducedMotion()` and render the final state. Charts, yantras and lines show complete; the slider doesn't auto-advance.
- Signature animations are hooks in the component that owns the SVG. The SVG's named groups are selected through refs.
