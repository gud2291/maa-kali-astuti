# DESIGN → CODE (porting rules)

The Claude Design output is the **spec**. The goal is 1:1 visual and motion fidelity. When in doubt, copy the design's value.

## 1. How the prototype is built
- Each `design/*.dc.html` has:
  - a `<helmet>` (fonts + `mka-*.js` scripts);
  - a **template** inside `<x-dc>`;
  - a trailing `<script>` with a class whose `render()` returns the bindings used by `{{ … }}`.
- `support.js` is the runtime (React 18 under the hood). It is reference only and is never shipped.
- Shared code is `window.MKA` (`M`), `M.A` / `A` (astro) and `M.H` / `H` (home), from `mka-core.js`, `mka-astro.js` and `mka-home.js`. Their SVG art builders return strings; `M.h(React, html)` injects them.
- Breakpoints come from JS state `vw`: `mob = vw < 768`, `desk = vw >= 1024`, `wide = vw >= 1100 | 1280`, `full = vw >= 1180` (nav), `vw >= 900` (rashifal columns).

## 2. Template syntax → React/TSX
| Prototype | Next.js port |
|---|---|
| `<x-dc>` root, `<helmet>` | Page or component root; fonts come from next/font, scripts from imports |
| `{{ expr }}` | `{expr}` using values computed in the component body or a hook |
| `<sc-if value="{{ c }}">` | `{c && (…)}` |
| `<sc-for list="{{ xs }}" as="x">` | `{xs.map(x => …)}` with a stable `key` |
| `<dc-import name="ProductCard" pid=… size=…>` | `<ProductCard pid=… size=… />`. Props are camelCased; `open-first` becomes `openFirst`. |
| `style="…"` | Tailwind classes; exact values via arbitrary values (`text-[19px]`, `tracking-[.14em]`, `bg-[#FFFDF8]` → use a token when one exists) |
| `style-hover="…"` / `style-focus="…"` | `hover:` / `focus-visible:` variants |
| Values that depend on `mob` / `desk` / `wide` | Responsive variants: base = mobile, `md:` = 768, `lg:` = 1024, `xl:` = 1280; custom `w900:`, `w1100:`, `nav:` (1180) |
| `hint-*` attributes | Ignore; they are canvas hints |
| `data-screen-label` | Ignore, or use as `aria-label` / section id if meaningful |
| `onClick="{{ fn }}"`, `ref="{{ r }}"` | React handlers and refs in a client component |
| `this.state` / `setState` | `useState` / `useReducer`, or a zustand store when shared |
| `M.store.*` | `stores/cart.ts`, `stores/wishlist.ts` |
| `M.ui.emit('quick' …)`, `M.ui.toast(…)` | `stores/ui.ts` actions (`openQuickAdd`, `toast`) |
| `M.fx.fly(el)`, `M.fx.burst(el)` | `components/commerce/fx.ts` |
| `M.soon(label)` / `M.BUILT[...]` | Real routes from DESIGN-INVENTORY §C; deferred ones go to the coming-soon routes |
| `M.lang() === 'hi'` + inline `hi ? {…} : {…}` string objects | `useTranslations()` / `getTranslations()`; move each pair into `messages/en.json` + `hi.json` |
| `location.hash` params | Path segment or `useSearchParams` (see ARCHITECTURE §Routes) |

## 3. Motion attributes → components
| Prototype attribute | Port |
|---|---|
| `data-reveal` | `<Reveal>` (fade-up 24px, 700ms, delay = value × 80ms, EASE, once; IO threshold .12 — mka-core 482–489). Heading masks use .25 |
| `data-mask` | `<MaskText>` (lines mask up; 60ms stagger) |
| `data-fade` | `<Reveal variant="fade">` |
| `data-ln`, `data-line`, `data-draw` | stroke-dashoffset draw (ornament rules draw from the centre; ScrollLine for scroll-filled lines) |
| `data-count` | `<Counter>` (count-up on view) |
| `data-amb="twinkle" \| "flicker" \| "glow:3" …` | Keep the attribute; the CSS keyframe of the same name is driven by `AmbientRoot` |
| `data-rot`, `data-depth`, `data-px` | Parallax / rotation hooks (desktop only, reduced-motion off) |
| `data-cart-target`, `data-cart-badge` | Keep them as fly-to-cart targets |

**Before porting any motion, read the exact implementation** in the `mka-core.js` `auto()` system or the page script (line ranges in the inventory). Copy durations, easings and delays literally.

## 4. Art & data
- **DATA** members (catalog, rashis, services, courses, videos, FAQ …) are generated into `src/lib/data/*.json` by `scripts/extract-design.mjs`. Never hand-copy them.
- **Static ART** (product art, gems, thumbnails, books, yantra idle states, glyphs, portraits, report pages) is generated to `public/svg/**` and rendered with `<img>` (lazy when below the fold). Always set width and height or an aspect-ratio box.
- **Animated ART** (Pandit Ji, chakra, rashi wheel, kundali chart, yantras when drawing, diya, starfield) is generated to `src/lib/art/*.ts` as string constants and inlined by its signature component. The component animates named groups through refs. SVG `id`s get a per-instance suffix (the design uses a `u` param) to avoid collisions.
- **Rule set by the F2 extractor:** any art that contains `<text>` is inlined too (thumbnails, books, seal, logo, palm labels, Lo Shu, wheel rashi/graha/center), because an SVG inside `<img>` cannot use the page's web fonts. Inline strings carry the token `__U__`; render them with `<InlineArt svg uid>` (`src/components/ui/InlineArt.tsx`), which swaps in the instance suffix. Chakra layers are static files (`public/svg/chakra/*`) spun by a `data-amb="spin:N"` wrapper.
- Mandala, LotusRule, Corner, Stars (stars5) are JSX ports in `src/components/ui/`; Icon renders `ICON_PATHS` from `src/lib/art/icons.ts`.
- **LOGIC** (pure functions) is copied into `src/lib/core` and `src/lib/astro` with TS types, keeping the same algorithm and seeds so outputs match the prototype.

## 5. Fidelity checklist (per section)
- [ ] Same structure and order, same copy EN + HI.
- [ ] Same spacing, type sizes and weights at 390 / 768 / 1024 / 1440.
- [ ] Same colours (tokens) and hairlines, ornaments and grain.
- [ ] Same hover, focus, active and disabled states.
- [ ] Same motion (duration, easing, trigger, stagger), plus reduced-motion and offscreen pause.
- [ ] Mobile-specific variant present where the design has one.
- [ ] Links go to real routes (DESIGN-INVENTORY §C).

## 6. Hindi
- Use the design's own HI strings. Where one is missing, write it and add `[HI review]` to PROGRESS → Client-confirm.
- Devanagari: no letter-spacing, no italics, heading line-height 1.35, body 1.7. Tiro Devanagari Hindi for display, Mukta for body.
- Layouts must absorb strings that are 25% longer.
