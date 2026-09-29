# DESIGN BRIEF — Maa Kali Astuti · Sadhak Pawan Pandey
### Premium astrology + spiritual e-commerce website · Design phase brief for Claude Design

> **Version:** 2.0 (redesign after client rejection) · **Date:** 28 Sep 2026
> **Domain:** sadhakpawanpandey.com · **Build target (later):** Next.js on Vercel
> **Companion file:** `client-requirements.md` → use it **only for content data** (product names, descriptions, services, courses). All **visual and UX direction comes from this brief**. Where the two conflict, this brief wins.

---

## 0. How to use this brief

1. Read this whole document before designing anything.
2. Build the **design system first** (Section 5 + 8), then pages in the order the prompts ask.
3. Every page must be a **responsive, interactive HTML prototype**, designed **mobile-first at 390px**, then 768 / 1280 / 1440.
4. Animations are not decoration to add later. They are part of the design deliverable (Section 9). Demonstrate them in the prototype.
5. Before calling any batch "done", run the **Anti-AI Self-Audit** (Section 16).
6. Anything marked **[confirm]** is a placeholder the client has not given yet. Design with realistic values and keep them visibly swappable.

---

## 1. Project snapshot

| | |
|---|---|
| **Brand** | **Maa Kali Astuti** (exact spelling) |
| **Founder / guide** | **Sadhak Pawan Pandey**: MBA, former MNC professional, now a full-time sadhak, spiritual mentor, paranormal researcher and published author |
| **What it is** | A **multi-page e-commerce store** for energized spiritual products + **consultation booking** (Kundali, Palmistry, Tarot, Numerology) + **Sadhana courses** (₹50,000) + **rituals/anushthan inquiries** + **free astrology tools** (Rashifal, Love Calculator, Kundali ₹99) + **YouTube discourses** |
| **Languages** | English + Hindi (toggle on every page) |
| **Audience** | Indian seekers aged 25–55, mostly mobile (≈80% phone traffic expected), Tier 1–3 cities, Hindi and English readers. They are sceptical of fake babas, so they want **authenticity and trust**. |
| **Positioning** | *"Welcome to a space where ancient spiritual wisdom meets modern clarity."* **Science, not superstition.** Calm, credible and premium, like a luxury Ayurvedic house rather than a roadside astrology stall. |
| **Brand feeling in 3 words** | **Reverent · Crafted · Trustworthy** |

**This is NOT:** a neon-purple zodiac carnival, a Western witchy tarot shop, or a generic ThemeForest astrology template.

---

## 2. Why the previous design was rejected, and the bar for this one

### Client's exact feedback (WhatsApp)
- *"Aur one page website nhi banani hai."* → They want a real multi-page site.
- *"E-commerce hai, yeah add to cart wagairah hoga."* → They want real commerce UX: cart, checkout, product pages.
- *"Maine reference bhi bheje the."* → The reference features were missing.
- ***"Yeah to aisa lag raha Gemini se bani hai site."*** → **It looked AI-generated.** This is the most important one.
- Earlier asks still stand: animated Pandit Ji (eyes blink, rudraksha mala), rotating chakra in the slider, smooth feel, YouTube section, Love Calculator by name, Kundali download ₹99, auto-rotating Rashifal wheel, floating stones, footer animation, **"site heavy na ho"**.

### What makes a site "look AI-made" (diagnosis — avoid ALL of these)
1. Every section is the same pattern: centered heading, grey subtitle, 3 identical cards.
2. Symmetric, centered everything; no editorial tension; same padding everywhere.
3. Soft gradient blobs, purple/blue "cosmic" gradients, lens flares, glowing orbs.
4. Emoji or mixed icon packs (♈ rendered as a colourful emoji, ✨, 🔮).
5. Glassmorphism on everything; over-rounded 24px pill cards and buttons.
6. Default fonts: Inter, Poppins, Montserrat, or Cinzel + Playfair for "mystic".
7. Filler copy: "Unlock your destiny", "Embark on a spiritual journey", "Discover the magic within".
8. AI-generated imagery with artifacts (melted hands, wrong Devanagari, fake text) and **visible Gemini sparkle watermarks**.
9. Fake-looking commerce: no MRP, no stock, no variants, no reviews, no delivery info.
10. No details: no hairlines, no texture, no micro-typography, no considered states.

### Acceptance bar
A senior designer should look at it and think: *"a boutique Indian studio with 15 years of experience made this for a luxury heritage brand."* The quality benchmark for craft level (not for copying) is **Forest Essentials, Kama Ayurveda, Good Earth, Nicobar**: cream grounds, deep greens, antique gold, editorial type, restraint. Then layer **living, sacred motion** on top.

---

## 3. Anti-AI craft rules (non-negotiable)

### DO
- **Vary every section's layout.** No two consecutive sections may share the same structure. Mix: asymmetric split (7/5), full-bleed, bento, horizontal scroll, sticky storytelling, editorial columns.
- **Editorial type hierarchy.** Large display serif headlines with one *italic* accent word, often in gold. Small uppercase **numbered eyebrows** (`01 — RUDRAKSHA & MALAS`) with wide tracking. Devanagari accent lines under key English headlines (`साधना से स्पष्टता तक`).
- **One custom icon family**: 1.5px monoline stroke, rounded joins, drawn with Vedic sensibility (lotus, diya, rudraksha, trishul, damaru, kalash, yantra, palm, tarot card, kundali grid, conch). Same stroke, same corner logic, same 24px grid everywhere.
- **Texture and detail instead of gradients:** subtle handmade-paper grain on ivory (2–3% noise), 1px antique-gold hairlines, corner ornaments, low-opacity (4–8%) mandala linework, fine dotted dividers, Devanagari numerals as decorative accents.
- **Signature shape: the temple arch (jharokha / mandir arch).** Use it for hero frame, category cards, portraits and key image frames. Use it deliberately. Product cards stay rectangular so commerce feels clean.
- **Real commerce density:** price, MRP strikethrough, % off, stock status ("Only 4 left"), variants, star rating + count, badges, delivery estimate. It must feel like a store that already takes orders.
- **Specific, grounded copy** using real product names, real benefits and real process ("Energized during Mahapuja on an auspicious muhurat, then sealed in a consecrated copper tabiz").
- **Consistent product photography treatment:** 4:5 crops on a warm ivory/sandstone background with a soft contact shadow. Same light direction everywhere.
- **Respectful sacred imagery:** represent deities via **yantras, symbols and line-art** (trishul, gada, lotus, damaru, sword), never cartoon faces.

### DON'T
- ❌ Inter, Poppins, Montserrat, Roboto, Cinzel, Playfair Display, handwriting/script fonts
- ❌ Purple/indigo/blue cosmic gradients, neon glow, lens flares, bokeh blobs
- ❌ Emoji anywhere (including zodiac glyphs; draw them as SVG)
- ❌ Glassmorphism as a default card style; frosted blur only on the sticky header
- ❌ Border-radius > 8px on cards and buttons (use 2–4px; pills only for chips and tags)
- ❌ Centered-heading + 3-equal-cards repeated as the page's main rhythm
- ❌ Stock Western tarot/witch imagery, crystal-ball clichés, random galaxy photos
- ❌ Clichés: "unlock your destiny", "embark on a journey", "magic", "mystical realm"
- ❌ Any visible AI watermark. **The supplied logo and Bitter Havan images have a small Gemini "✦" sparkle in the bottom-right corner. Crop it out every time.**

---

## 4. Art direction: "Heritage Luxury, Living Sacred"

**Mood:** Early morning in a quiet temple courtyard. Ivory sandstone, deep tulsi-green, lamp-light gold, and the slow turning of time (the chakra). Calm, reverent, abundant, precise.

**Two surface modes:**
1. **Day / Ivory mode** (≈70% of the site): ivory paper, emerald typography, gold hairlines. Used for commerce, reading and forms.
2. **Night / Sacred mode** (≈20%): deep night-emerald (almost black-green) with gold linework and twinkling stars. Used for **cosmic and ritual moments**: Rashifal wheel, Sadhana courses, footer, Kundali tool, inside the hero arch.

The alternation between Day and Night sections creates the page rhythm (instead of every section having the same white background).

**Reference sites (features to include, but restyle them to OUR brand):**
- **Ref 1:** https://demo.kamleshyadav.com/themeforest-html/astrology/version-5/index.html. Take the **auto-rotating Rashifal wheel**, and below it, the **Love Calculator + Kundali tools**.
- **Ref 2:** https://astrology.nicdark.com/astrology-wordpress-theme/home-03/. Take the **floating gemstones/stones** and the **light footer animation**, keeping the site light.
- **Ref 3 (original, from the client doc):** https://pages.jyotishbhawanindia.com/. Take the conversion patterns: trust signals, WhatsApp, clear CTAs.

Take their **features and structure ideas only**. Our execution must be clearly more premium than all three.

---

## 5. Design tokens

### 5.1 Color

| Token | Hex | Use |
|---|---|---|
| `emerald-900` | `#0E3B30` | Deep headings, footer base alt, pressed states |
| `emerald-700` **(brand primary)** | `#164E3F` | Primary buttons, headings, key UI |
| `emerald-500` **(brand secondary)** | `#1C6B54` | Hover, links, secondary fills |
| `emerald-100` | `#E4EEE8` | Tinted backgrounds, selected chips |
| `night-900` | `#0A1F1A` | Night/Sacred sections background |
| `night-800` | `#10302A` | Cards on night sections |
| `gold-500` **(antique gold)** | `#B8923A` | Hairlines, ornaments, icons, large display accents |
| `gold-300` | `#D9B96A` | Gold on dark backgrounds, highlights, stars |
| `gold-700` | `#7A5C1C` | **Gold text at small sizes on ivory** (for AA contrast) |
| `ivory-50` **(page bg)** | `#FBF7EE` | Main background (with paper grain) |
| `sand-100` | `#F4EDDD` | Alternate section bg, product image backdrop |
| `sand-200` | `#EAE0CA` | Borders on ivory, input backgrounds |
| `ink-900` | `#1F2A24` | Body text |
| `ink-600` | `#5B6A61` | Secondary text |
| `copper-500` | `#B8683D` | Copper product accents (12 Nag, tabiz) only |
| `sindoor-600` | `#A8322D` | Sale / "limited" badges, errors. Use sparingly. |
| `rose-200` | `#EBCFC9` | Love Calculator accent only |
| `success-600` | `#2F7A4F` | Success states |

**Ratio:** ~70% ivory/sand · ~20% emerald/night · ~10% gold accents.
**Rules:** Gold is for lines, icons, ornaments and large display words. Never use gold for body text on ivory (use `gold-700` if small gold text is needed). Never introduce purple or blue.

### 5.2 Typography

| Role | Font (Google Fonts) | Notes |
|---|---|---|
| **Display / headings** | **Fraunces** (variable: opsz 72–144, wght 400–600, SOFT 30–50) | Italic for accent words. Tight tracking (-1% to -2%) at large sizes. |
| **UI / body** | **Manrope** (400/500/600/700) | Body 16–17px, UI labels, buttons, prices (tabular numerals) |
| **Hindi display** | **Tiro Devanagari Hindi** | Headlines and accent lines |
| **Hindi body** | **Mukta** (400/500/600) | Body, UI in Hindi |

**Type scale (desktop / mobile):**
- Display XL: 88 / 44px, line-height 1.02
- H1: 64 / 38, lh 1.05
- H2: 48 / 32, lh 1.1
- H3: 32 / 24, lh 1.2
- H4: 22 / 19, lh 1.3
- Body L: 18 / 17, lh 1.65
- Body: 16 / 16, lh 1.6
- Small: 14 / 13
- Eyebrow: 12 / 11, uppercase, tracking 0.16em, Manrope 600

**Devanagari rules:**
- **No letter-spacing.** Tracking breaks the shirorekha.
- **No italics.**
- Line-height 1.35 for headings and 1.7 for body.
- Hindi strings run 10–25% longer, so leave room.

**Numbers:** Western digits in both languages. ₹ prices use tabular figures, e.g. `₹1,250`.

### 5.3 Spacing, grid, shape
- **Spacing:** 8pt scale (4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160). Section vertical padding varies by section (96–160 desktop, 56–96 mobile). Varied rhythm, not uniform.
- **Grid:** 12 columns, 1320px max container, 24px gutters (desktop); 8 columns at tablet; 4 columns, 16px side margins (mobile).
- **Breakpoints:** 390 (design base) · 768 · 1024 · 1280 · 1440.
- **Radius:** 2px (inputs), 4px (buttons, cards), 999px (chips, badges, avatars only). Arch shapes are a separate motif.
- **Borders:** 1px `sand-200` on ivory; 1px `gold-500` at 40–60% for premium frames.
- **Shadows:** very soft and warm (e.g. `0 12px 32px -12px rgba(14,59,48,.18)`). No hard or grey shadows.
- **Buttons:**
  - Primary: solid `emerald-700`, ivory text, 1px inner gold hairline inset, 4px radius, 48px height (52 on mobile). Hover: gold shine sweep + slight lift.
  - Secondary: ivory with emerald 1px border.
  - Tertiary: text + animated underline.
  - On night sections: gold-outline button.

### 5.4 Iconography & ornament
- Custom 24px monoline icon set, 1.5px stroke (see Section 3).
- **Ornament kit:** corner filigree, gold divider with a centre lotus, dotted mandala ring, Om medallion, small lotus separators for marquees/lists, arch frame outline.
- **Zodiac:** 12 custom SVG rashi glyphs in the same stroke style, never font or emoji glyphs.
- **Yantras:** simplified, accurate line-art yantras for the 6 Sadhanas (Baglamukhi, Hanuman, Kali, Durga, Shiva, Bhairav), drawn in gold. Used on course cards and animated with stroke-draw.

### 5.5 Imagery & illustration
- **Supplied assets** (in `client-requirements/images/`):
  - `maa-kali-astuti-logo.png`: a logo mockup photographed on textured paper. **Crop to the circular emblem.** For the header, recreate it faithfully as a clean SVG (the emblem ring + Om + lotus + leaves + wordmark). **Do not redesign the logo.** Also provide a horizontal lockup (emblem + "Maa Kali Astuti" wordmark in Fraunces + "Sadhak Pawan Pandey" small caps).
  - `WhatsApp Image … 8.39.42 AM.jpeg`: Bitter Havan (कड़वा हवन) jar product shot. Good hero-quality product image. **Crop out the ✦ sparkle bottom-right.**
  - `WhatsApp Image … 8.39.49 AM.jpeg`: Copper 12 Nag set on white (4×3 grid). **Crop to the product only.** Remove the Hindi caption and the "Buy Now" button from the screenshot.
  - `handmade-copper-tabiz.png`: copper tabiz capsules in a plastic packet. Low quality: use small, in a consistent sand-background frame. Flag that the client should reshoot it.
- **Missing product photos** (rudraksha, malas, bracelets, amulets): use **refined, consistent SVG product illustrations** (e.g. a detailed rudraksha bead with mukhi lines, bead bracelets in correct crystal colours, a copper amulet capsule) on sand backgrounds in 4:5 frames. Label each "photo placeholder" in the handoff notes. No random stock photos.
- **Portrait of Sadhak Ji:** an arch-framed placeholder with an elegant tonal silhouette, and a note that a real photo is coming from the client **[confirm]**.
- **Illustration style overall:** premium editorial flat illustration with subtle tonal shading and gold linework, in the style of a luxury tea or Ayurveda brand. Not cartoon, not chibi, not 3D Pixar, not photoreal.

---

## 6. Sitemap & navigation (multi-page, NOT one-page)

```
/                         Home
/shop                     All products
/shop/[category]          Rudraksha & Malas · Crystal Bracelets · Sacred Amulets · Havan Samagri · Energized Copper
/product/[slug]           Product detail
/cart                     Cart page (+ global cart drawer)
/checkout                 Checkout (steps)
/order/success            Order confirmation
/wishlist                 Wishlist
/search                   Search results (+ global search overlay)
/consultations            Consultations landing
/consultations/[service]  Kundali · Palmistry · Tarot · Numerology
/book/[service]           Booking stepper
/kundali-99               Download your Kundali in ₹99
/love-calculator          Love Calculator by Name
/rashifal                 Rashifal (Today/Tomorrow/Week/Month/Year)
/rashifal/[rashi]         Single rashi detail
/sadhana-courses          Courses listing (₹50,000)
/sadhana-courses/[slug]   Course detail + inquiry
/rituals                  Special Puja & Anushthan
/about                    About Sadhak Pawan Pandey
/videos                   YouTube discourses & Shorts
/blog, /blog/[slug]       Articles (SEO/AEO)
/contact  /faq
/policies/[slug]          Shipping · Refund & Returns · Privacy · Terms · Astrology Disclaimer
/account/*                Login (OTP) · Dashboard · Orders · Order detail · Bookings · My Kundali · Addresses · Profile
404
(/admin/* — optional, separate prompt)
```

### Global header (desktop)
1. **Announcement bar** (32px, `emerald-900`, ivory text): 3 auto-rotating messages with a vertical slide transition.
   - "Free shipping on orders above ₹999 **[confirm]**"
   - "Every product energized in Mahapuja before dispatch"
   - "Download your Janam Kundali — ₹99"
   - Right side: WhatsApp number + EN | हिं toggle.
2. **Main header** (76px → 64px on scroll, ivory with blur + gold hairline bottom when stuck):
   - Logo lockup at left.
   - Nav: **Shop ▾** (mega menu) · Consultations ▾ · **Kundali ₹99** (highlighted gold chip) · Rashifal · Sadhana Courses · Rituals · Videos · About.
   - Right: search, wishlist, account, **cart with count badge**.
3. **Shop mega menu:** 5 category columns with sub-items (e.g. Rudraksha → 1–14 Mukhi, 5 Mukhi Mala, 7 Mukhi Mala), "Shop by intention" chips (Wealth · Protection · Love · Peace · Health · Courage), and 1 featured product card (Copper 12 Nag). It opens with a soft fade + 8px drop and staggered columns.

### Global header (mobile)
- 56px compact bar: menu icon · centred emblem · search · cart.
- **Full-screen menu:** night-emerald with a slow-rotating mandala, large Fraunces links staggering in, language toggle, WhatsApp/call at the bottom.
- **Bottom tab bar** (always available, hides on scroll-down and shows on scroll-up):
  - Home
  - Shop
  - **Consult** (centre, raised gold-ringed chakra button)
  - Cart (badge)
  - Account

### Global floating elements
- WhatsApp FAB (bottom-right; on mobile it sits above the bottom bar) with a subtle pulse ring every 8s.
- Back-to-top button with a scroll-progress gold ring (desktop).
- Cart drawer (right side, 440px; full-screen on mobile).
- Search overlay (full-screen).

### Global footer (night mode) — see Home §18

---

## 7. Page-by-page specifications

> For every page, design: the default state; loading (skeletons); empty state where relevant; error/validation states for forms; desktop + mobile.

### 7.1 HOME (the showpiece)

**§1 HERO: "Living Altar" slider**
- **Layout desktop:** asymmetric split. Left 6 columns: text. Right 6 columns: a **large temple-arch frame** holding the animated composition. Ivory paper background with a faint centred mandala (5% opacity) and a gold hairline arch outline echoing the frame.
- **Arch interior (night-emerald):**
  - **Animated Pandit Ji.** A sadhak seated in padmasana: cream dhoti, saffron-bordered angavastram, tilak, calm kind face, soft beard, **rudraksha mala in the right hand at chest height, doing japa**.
  - Behind his head, a **3-ring gold Vedic chakra** rotates slowly as a prabhamandal/halo (the rings counter-rotate at different speeds, with 12 rashi glyphs on the outer ring).
  - Twinkling stars inside the arch.
  - In front: a small altar with a brass diya (flickering flame), a rudraksha, a clear quartz crystal, tulsi leaves, and a thin incense-smoke wisp rising.
  - **Floating gemstones** (amethyst, citrine, rose quartz, rudraksha bead) overlap the arch edge for depth.
- **Pandit Ji animations** (detail in §9):
  - Natural eye blink at random 3–6s intervals, with an occasional double-blink.
  - Mala beads advance one bead every ~1.2s with a tiny thumb movement.
  - Subtle breathing.
  - Aura glow pulse.
  - On desktop, the pupils follow the cursor slightly.
- **Left text: 3-slide auto slider** (6s each, progress line + `01 / 03` counter, pausable). The arch composition **stays persistent**; only the text slides with masked line reveals.
  1. Eyebrow `॥ MAA KALI ASTUTI ॥`
     - Headline: "Energized by ritual. *Delivered* with devotion."
     - Hindi line: "अनुष्ठान से ऊर्जित, श्रद्धा से आप तक"
     - CTAs: **Shop Energized Products** / Book a Consultation
  2. Headline: "Ancient science. *Honest* guidance."
     - Hindi: "प्राचीन विज्ञान, सच्चा मार्गदर्शन"
     - CTAs: **Book a Consultation** / Meet Sadhak Ji
  3. Headline: "Your complete Janam Kundali — *₹99*."
     - Hindi: "आपकी संपूर्ण जन्म कुंडली — मात्र ₹99"
     - CTAs: **Get My Kundali** / Try Love Calculator
- **Trust micro-row under the CTAs:** ★ 4.9 · 2,000+ reviews **[confirm]** · Original Nepali Rudraksha · Energized in Mahapuja.
- **Mobile:** the arch composition sits on top (≈55vh, arch cropped at the bottom), then the headline, stacked full-width CTAs, then **Quick Actions tiles** (see §10).

**§2 TRUST MARQUEE:** a thin sand band between gold hairlines. Items scroll infinitely and slowly (pause on hover), separated by small lotus ornaments:
- 100% Original Nepali Rudraksha
- Lab-certified
- Energized in Mahapuja
- Pan-India delivery
- Secure UPI & card payments
- Satisfaction guarantee on Kundali reading
- Guided by Sadhak Pawan Pandey

**§3 SHOP BY CATEGORY: "Five sacred offerings"**
- 5 **arch-shaped category cards**. Product image on sand inside the arch; name EN + small Hindi; item count.
- Desktop: a single row where the centre card is 10% taller, giving a gentle crescent rhythm.
- **Hover:** the arch fills from bottom with emerald, the image lifts 8px, a gemstone floats.
- **Mobile:** horizontal snap scroll with peeking cards.
- Categories:
  - Rudraksha & Malas (रुद्राक्ष एवं माला)
  - Crystal Bracelets (क्रिस्टल ब्रेसलेट)
  - Sacred Amulets on Bhojpatra (भोजपत्र कवच)
  - Havan Samagri (हवन सामग्री)
  - Energized Copper (ऊर्जित ताम्र)

**§4 BESTSELLERS: tabbed product grid**
- Left-aligned header "Most loved offerings" + tabs on the right (Bestsellers · New · Rudraksha · Bracelets · Amulets).
- 4-column grid (2 columns on mobile), 8 products, with a "View all" link.
- **Product card anatomy:**
  - 4:5 image on sand; the second image crossfades in on hover.
  - Badges top-left (Bestseller / Energized / −20%).
  - Wishlist heart top-right.
  - **Quick-add bar** slides up on hover (on mobile, a round "+" button instead).
  - Below the image: category eyebrow, 2-line title, intention tag ("Wealth & Abundance"), ★ rating (count), **price + MRP strike + % off**, low-stock note when relevant.
- Tab switch: cards crossfade with a stagger.

**§5 FEATURED PRODUCT SPOTLIGHT: Hand-Energized Pure Copper 12 Nag**
- A copper-accented section on sand.
- Asymmetric 7/5 split:
  - **Left:** large product image + 4 mini thumbnails, with a huge outlined numeral "12" behind it in copper at 10% opacity and a slow parallax.
  - **Right:** eyebrow `FEATURED · ENERGIZED COPPER`, title, badges (100% Pure Copper · Set of 12 · Hand-energized), 4 benefit rows with custom icons (Wealth & Prosperity · Protection & Victory · Success in Legal Matters · Health & Healing), **₹1,250** (MRP **[confirm]**), qty stepper, **Add to Cart** + Buy Now, "Ideal for" chips (Home temple · Tijori · Office · Vastu remedy).
- A side note in Fraunces italic: *"Small objects, big blessings."*

**§6 ROTATING RASHIFAL WHEEL (night section)** ← client's #1 reference feature
- Full-bleed `night-900`, starfield, header `आज का राशिफल · DAILY RASHIFAL` + today's date.
- **Left: the Rashi Wheel** (≈560px):
  - Outer ring: 12 segments, each with an SVG glyph + Hindi name (मेष … मीन).
  - Middle ring: 27 nakshatra ticks.
  - Inner ring: planet symbols.
  - Centre: a sun/Om medallion.
  - A gold pointer at the top.
- **Behaviour:**
  - The whole wheel slowly rotates.
  - Every 4s it **auto-advances**: it rotates 30° with a gentle spring so the next rashi sits under the pointer and highlights, glowing gold.
  - The user can click or tap any rashi. The wheel spins to it and auto-play pauses for 12s.
- **Right: a detail panel** that crossfades with each change:
  - Rashi name EN/HI + date range.
  - Today / Week / Month tabs.
  - A 3–4 line prediction.
  - 4 mini meters: Love, Career, Health, Finance (5-dot scale).
  - **Lucky number**, **lucky colour** (swatch), **lucky gemstone** (links to the product: a cross-sell).
  - Remedy of the day.
  - CTAs: "Read full Rashifal" + "Get personal Kundali ₹99".
- **Mobile:** replace the full wheel with a **semicircle dial** at the top of the section that rotates as the user swipes the rashi carousel below (see §10).
- **Rashis:** Mesha मेष (Aries), Vrishabha वृषभ, Mithuna मिथुन, Karka कर्क, Simha सिंह, Kanya कन्या, Tula तुला, Vrishchika वृश्चिक, Dhanu धनु, Makara मकर, Kumbha कुंभ, Meena मीन.

**§7 ASTRO TOOLS PAIR: Kundali ₹99 + Love Calculator** ← client: "neeche ek love calculator, ek kundali wala"
- Two side-by-side cards, intentionally **different sizes** (7/5):
  - **Kundali ₹99 (emerald card, gold details):**
    - Title "Download your complete Janam Kundali — ₹99". Show MRP **[confirm]** struck through.
    - Inline form: Name · Date of birth · Time of birth (with an "I don't know exact time" checkbox) · Place of birth (autocomplete).
    - Beside the form, a **North-Indian diamond chart illustration that draws itself** with gold stroke animation when it enters the viewport; planets fade into houses.
    - "25+ page report: Lagna chart, Navamsa, Dasha periods, Manglik check, gemstone & remedies."
    - CTA **Generate My Kundali**.
  - **Love Calculator (ivory card with rose-quartz accent):**
    - "Love Calculator by Name." Your name + Partner's name fields.
    - Two initial-medallions that **drift toward each other** as the user types.
    - The result is a gold ring that fills while the % counts up, a label (e.g. "78% · Harmonious Bond") and a one-line insight.
    - CTA "Book a Kundali Milan consultation".
    - A small, tasteful note: "For fun — for true compatibility, get Kundali Milan by Sadhak Ji." (honest, on-brand).

**§8 CONSULTATIONS: bento**
- Header left: "Personal guidance, one seeker at a time."
- Bento grid:
  - **Kundali Reading** as the large 2×2 tile, with a "Satisfaction guarantee" seal.
  - Palmistry, Tarot and Numerology as smaller tiles.
- Each tile: custom icon (kundali grid / palm lines / tarot card / numerals), 1-line promise, "from ₹X **[confirm]**", duration, mode icons (call / video / WhatsApp / written report), **Book now**.
- A mini "How it works" strip: Share details → Sadhak Ji analyses → Live session / report → Guidance until doubts clear.

**§9 SHOP BY INTENTION: floating stones** ← Ref 2 floating stones
- Sand background.
- Centred heading "What are you seeking today?" / "आप क्या चाहते हैं?". This is the one intentionally centred section.
- **8–10 floating gemstones and rudraksha beads** drift around the heading at different depths (CSS translate3d, 6–11s loops, mouse-parallax on desktop).
- Intention pills: Wealth · Protection · Love · Peace · Health · Courage · Clarity. Selecting one reveals 4 curated products below (crossfade).

**§10 SADHANA COURSES (night / deep emerald)**
- **Left editorial column:**
  - "Sadhana is a science." / "साधना एक विज्ञान है".
  - A short paragraph.
  - Fee block: **₹50,000** per sadhana course · "Enrollment for serious seekers · Syllabus shared on inquiry".
  - CTA **Enquire about enrollment**.
- **Right:** a horizontal-scroll track of **6 course cards**:
  - Baglamukhi · Hanuman · Kali · Durga · Shiva · Bhairav.
  - Each card: gold **yantra line-art that stroke-draws on hover or in view**, name EN/HI, one-line essence from the client doc, "Enquire →".
- Drag or scroll on desktop, swipe on mobile.

**§11 RITUALS & ANUSHTHAN**
- Split layout:
  - **Left:** an illustrated puja thali with a diya (flame flicker, a soft glow on the ivory around it).
  - **Right:** a vertical **5-step process with a gold connecting line that draws on scroll**: Share your concern → Spiritual analysis → Accepted only if confident → Ritual at the right muhurat → Updates & guidance.
- Ethics pull-quote: "Every case is analysed first. We accept only when there is confidence in the path forward."
- CTA **Request a ritual consultation**.

**§12 ABOUT SADHAK PAWAN PANDEY**
- Portrait in an arch (placeholder) with a gold halo line.
- An overlapping quote card: "Welcome to a space where ancient spiritual wisdom meets modern clarity."
- A 3-line mini timeline: MBA & MNC career → Years of sadhana under enlightened mentors → Founded Maa Kali Astuti.
- 3 stats that count up: Years of sadhana · Seekers guided · Rituals performed. All **[confirm]**.
- "Published author" book cover mockup.
- CTA "Read his story".

**§13 YOUTUBE DISCOURSES** ← client: "YouTube video dalne ka option"
- **Desktop:** featured player (8 columns) using a **facade**: a custom thumbnail, a gold play button and the duration. The iframe loads only on click. Beside it (4 columns), a scrollable playlist of 5–6 videos with a thumbnail, title, category tag (Pravachan · Sadhana · Remedies · Q&A) and duration. Clicking one swaps the featured video.
- "Subscribe on YouTube" button + subscriber count **[confirm]**.
- **Mobile:** a stories-style row of vertical **Shorts** (9:16) plus the featured video.
- Note for the build: videos are managed from the admin panel.

**§14 TESTIMONIALS & REVIEWS**
- Masonry mix of:
  - Text testimonials with name, city and service used.
  - **Video testimonial** thumbnails.
  - **Product reviews with customer photos** and a "Verified buyer" tick.
- Aggregate "4.9 / 5 from 2,000+ seekers" **[confirm]**.
- Mobile: swipe carousel.

**§15 KNOWLEDGE / BLOG:** 1 large + 2 stacked article cards (e.g. "How to identify original Nepali Rudraksha", "Which crystal bracelet suits your rashi", "Rules of wearing a Baglamukhi amulet").

**§16 FAQ:** split layout.
- Left: heading + WhatsApp help card.
- Right: accordion of 6–8 questions (authenticity, energization process, shipping time, returns, consultation mode, course eligibility).

**§17 NEWSLETTER / COMMUNITY:** a slim emerald band. "Monthly Rashifal & auspicious muhurat dates in your inbox" with an email field, and a "Join WhatsApp updates" button.

**§18 FOOTER (night mode, animated)** ← Ref 2 footer
- `night-900` with **twinkling stars**, faint constellation lines that draw slowly, a **large mandala partially cropped at one corner, rotating very slowly** (180s), and an occasional shooting star (every ~12s).
- Content:
  - Logo + 2-line brand statement.
  - Columns: Shop / Services / Learn / Help / Policies.
  - Newsletter.
  - Contact: WhatsApp, phone, email, hours in IST **[confirm]**.
  - Social: YouTube, Instagram, Facebook, WhatsApp.
  - Payment icons: UPI, RuPay, Visa, Mastercard, Razorpay.
  - Language toggle.
- Bottom line: `|| सर्वे भवन्तु सुखिनः || May all be happy` · © 2026 Maa Kali Astuti · Sadhak Pawan Pandey.

---

### 7.2 SHOP (all products) & CATEGORY pages (one template)
- **Category header band:** breadcrumb, title EN + Hindi, 2-line description, product count, and a small floating stone relevant to the category.
- **Sub-category chips** (e.g. 2 Mukhi … 14 Mukhi, Malas).
- **Desktop:**
  - Left sticky filter sidebar: Category · Intention · Price range slider · Mukhi (Rudraksha) · Crystal type · Availability · Rating.
  - Top bar: active filter chips, result count, **Sort** (Popular, Newest, Price ↑↓, Rating).
- **Grid:** 3 columns (4 at 1440). At 1 in 12 cards, insert an **editorial banner**: "Not sure which Rudraksha suits you? Get a free recommendation" → WhatsApp or consultation.
- **Pagination:** "Load more" with "Showing 12 of 38" and a progress line.
- **Mobile:** 2-column grid, sticky "Filter · Sort" bar, and filters in a **bottom sheet** with an Apply button.
- **States:** skeleton grid, **empty results** (illustration + "Clear filters"), filter loading.
- A collapsible SEO text block at the bottom.

### 7.3 PRODUCT DETAIL (design 2 versions)
**Version A: 5 Mukhi Rudraksha (Original Nepali)**
- Breadcrumb.
- **Gallery:** vertical thumbnails + main image with hover-zoom (desktop), a swipe gallery with dots (mobile), a "Lab certificate" thumbnail, and a "Video" thumbnail.
- **Info column:**
  - Badges: Original Nepali · Lab/X-ray certified · Energized in Mahapuja.
  - Title + Hindi subtitle.
  - ★ 4.8 (126 reviews).
  - **Price ₹X, MRP ₹Y, Z% off**, "incl. all taxes".
  - Stock note.
  - **Variant chips:** Mukhi (2–14) or bead size, with a disabled state for out-of-stock.
  - **Energization add-on:** a checkbox "Personal energization with your name & gotra (+₹251 **[confirm]**)". It expands to Name + Gotra fields.
  - Qty stepper, **Add to Cart** + **Buy Now**.
  - **Delivery pincode checker:** "Delivery by Thu, 3 Oct · COD available".
  - Trust row: Secure payment · 7-day return **[confirm]** · COD · Pan-India shipping.
  - Share.
- **Accordions:** Description · Benefits · How to wear (vidhi: day, time, mantra) · Specifications · Shipping & returns · Authenticity & certificate.
- **Below the fold:**
  - "How we energize" 3-step ritual band (night mode, diya animation).
  - **Frequently bought together** (with checkboxes and a combined price).
  - **Reviews:** rating distribution bars, photo reviews, a filter, "Write a review".
  - Q&A.
  - Related products.
  - Recently viewed.
- **Sticky buy bar:** slides in after the main CTA scrolls away (top on desktop, **bottom on mobile**, showing price + Add to Cart).

**Version B: Hand-Energized Pure Copper 12 Nag (₹1,250)**
- Same template, with a copper accent treatment.
- Benefit icons: Wealth, Protection & Victory, Legal matters, Health.
- A specs table: 100% pure copper · Set of 12 · Hand-energized · Ideal for.
- A **"Where to place" mini-guide** with 3 small illustrations: home temple, tijori, office.

### 7.4 CART: drawer + page
- **Drawer:**
  - "Your Cart (3)".
  - **Free-shipping progress bar** ("Add ₹210 more for FREE shipping").
  - Line items: image, title, variant, energization details, qty stepper, remove (with undo toast), price.
  - A "Complete your ritual" upsell mini-carousel (e.g. Bitter Havan).
  - Coupon field.
  - Subtotal.
  - **Checkout** (primary) + View cart, with secure payment icons.
- **Cart page:** the same content in 8/4 columns with a sticky summary and an estimated delivery.
- **Empty state:** an illustration of an empty copper kalash with a gently flickering diya, "Your cart is waiting for blessings", and CTAs to Bestsellers.

### 7.5 CHECKOUT (distraction-free)
- Minimal header: logo + "Secure checkout" lock + back to cart.
- **Steps with a progress line that fills:**
  1. **Contact:** mobile (OTP optional) + email.
  2. **Address:** **pincode → auto-fills city/state**; house, area, landmark; save address.
  3. **Delivery:** standard / express.
  4. **Payment, UPI first:** UPI apps (GPay, PhonePe, Paytm, BHIM) + UPI ID; Cards; Netbanking; Wallets; **COD (+₹49 [confirm])**. "Secured by Razorpay".
  5. **Review & place order.**
- **Right sticky summary:** items, coupon, price breakdown (subtotal, shipping, COD fee, discount, **total**), trust badges.
- Mobile: a single column with an order summary collapsible at the top and a sticky "Pay ₹X" button.
- Design validation errors, a payment-processing state and payment-failed recovery.

### 7.6 ORDER SUCCESS
- A gold circle that draws + a check mark, "Order confirmed", and the order number.
- **"Your items will be energized on [muhurat date] before dispatch."**
- Timeline: Placed → Energization → Packed → Shipped → Delivered.
- WhatsApp updates opt-in, Download invoice, and a "While you wait" section recommending a consultation.

### 7.7 WISHLIST · SEARCH
- **Wishlist:** a grid with "Move to cart", plus an empty state.
- **Search overlay:** a full-screen ivory overlay with a large input, trending chips, recent searches, **instant results with thumbnails**, and tabs (Products · Consultations · Articles). A results page as well.

### 7.8 ACCOUNT
- **Login:** phone number → **6-box OTP** with a resend timer. Optional Google sign-in. Illustrated side panel on desktop.
- **Dashboard:** "Namaste, Ravi" greeting, quick tiles (Orders · Bookings · My Kundali · Wishlist) and the latest order with its tracking.
- **Orders:** a list, plus an order detail page with a **tracking timeline** and invoice download.
- **Bookings:** upcoming consultation card (date/time IST, mode, join link, reschedule), plus past bookings.
- **My Kundali:** downloadable PDFs.
- **Addresses.**
- **Profile:** saved birth details for faster bookings.

### 7.9 CONSULTATIONS
- **Landing:**
  - Hero.
  - 4 service cards (duration, mode, price **[confirm]**, what you get, delivery time, e.g. "Written report in 48 hrs").
  - How it works.
  - Sadhak Ji credentials.
  - Testimonials.
  - FAQ.
- **Service detail:** overview, what's covered, sample report pages, optional tiers (Essential / Detailed / Premium **[confirm]**), and a sticky Book CTA.
- **Booking stepper** (4 steps + confirmation):
  1. Service & mode.
  2. Your details. The form varies by service:
     - Kundali: birth details.
     - **Palmistry: upload left & right palm photos**, with a visual guide for correct photos.
     - Numerology: name, mobile no., business name.
     - All services: "Your question / concern".
  3. **Date & slot picker** (calendar + time chips in IST).
  4. Pay.
  - Confirmation with an add-to-calendar option.

### 7.10 KUNDALI ₹99 (dedicated landing + tool)
1. The form (same fields as §7 on the home page, plus report language EN/HI and WhatsApp/email).
2. A **generating state**: the chakra spins up while "Calculating planetary positions…" messages cycle.
3. **Preview:**
   - The North-Indian chart drawing itself.
   - A planet table (Sun … Ketu, sign, house, degree).
   - Lagna · Rashi · Nakshatra.
   - **Blurred preview pages** of the 25+ page report with lock icons.
4. **Pay ₹99 & Download** (Razorpay).
5. Download success.

Also on this page: a "What's inside" list, sample page mockups, FAQ and reviews.

### 7.11 LOVE CALCULATOR page
The tool at large size, "How it works", the tasteful disclaimer, a CTA for Kundali Milan consultation, and **related products** (Rose Quartz bracelet: Love & Relationships).

### 7.12 RASHIFAL page + RASHI detail
- **Rashifal page:**
  - Hero with the large rotating wheel.
  - Period tabs (Today · Tomorrow · Weekly · Monthly · Yearly).
  - A 12-rashi card grid.
  - A "Don't know your rashi?" helper (enter DOB → rashi).
- **Rashi detail:**
  - Predictions by area (Love, Career, Health, Finance) with meters.
  - Lucky number, colour, day and **gemstone (linked product)**.
  - Remedy.
  - Compatible rashis.
  - **Recommended products for this rashi.**
  - Kundali ₹99 CTA.

### 7.13 SADHANA COURSES + COURSE DETAIL
- **Listing:**
  - A night-mode editorial hero with the fee (₹50,000) and "What every course includes".
  - 6 yantra course cards.
  - An enrollment process: Inquiry → Personal conversation → Eligibility → Enrollment → Guided sadhana.
  - "For serious seekers" note.
  - FAQ.
  - Inquiry form.
- **Detail:**
  - Overview.
  - What you attain.
  - Structure: duration, mode and modules, all **[confirm]**.
  - Discipline & niyam.
  - Guidance & support.
  - Fee & payment (EMI **[confirm]**).
  - A sticky "Enquire" CTA.
  - "Syllabus shared upon inquiry".

### 7.14 RITUALS & ANUSHTHAN page
Hero (diya thali), the ethics statement, example ritual types (mark as **[placeholder examples, confirm with client]**), the 5-step process, "What you receive" (sankalp in your name, updates **[confirm]**) and an inquiry form.

### 7.15 ABOUT
- Hero portrait in an arch + quote.
- A **sticky scroll-story timeline**: MBA & MNC career → The turning point → Years of sadhana under enlightened mentors → Paranormal research → Founding Maa Kali Astuti → Today.
- "Science, not superstition", with 3 pillars.
- **Published works** (book covers, **[confirm titles]**).
- Media / YouTube.
- CTA.

### 7.16 VIDEOS
A featured video, category tabs, a grid of facade thumbnails, a Shorts row and a subscribe banner.

### 7.17 BLOG + ARTICLE
- **Listing:** a featured article, category filter (Rudraksha guide · Crystals · Rashifal · Sadhana · Remedies · Festivals) and a card grid.
- **Article:**
  - 680px reading measure.
  - Sticky table of contents.
  - Author box (Sadhak Ji).
  - "Products mentioned" inline cards.
  - **FAQ block at the end** (for AEO).
  - Share.
  - Related articles.

### 7.18 CONTACT · FAQ · POLICIES · 404
- **Contact:**
  - Form: name, phone, email, topic dropdown, message.
  - Contact cards: WhatsApp, call, email, hours.
  - Small map **[optional]**.
- **FAQ:** category tabs + search + accordions.
- **Policies:** one template with a sidebar list of policies, a "last updated" date and comfortable reading typography. Policies: Shipping, Refund & Returns, Privacy, Terms, **Astrology Disclaimer**.
- **404:** the chakra slowly rotating. "यह मार्ग यहाँ समाप्त होता है — This path ends here." Search + popular links.

### 7.19 ADMIN PANEL (only when asked in the optional prompt)
- **Style:** a quieter version of the brand. Ivory/white workspace, emerald accents, the same type. A collapsible sidebar and a top bar with search + notifications. Dense but calm data tables.
- **Screens:**
  - Login.
  - **Dashboard:** KPIs for revenue today/month, orders, *pending energization*, bookings today, Kundali ₹99 sales and course inquiries. A revenue chart, top products, recent orders and upcoming consultations.
  - **Products:** a list with filters, plus a create/edit form with **EN/HI tabs** for bilingual fields, a drag-drop image uploader, a variant matrix (mukhi/size), price/MRP, stock, SEO fields and status.
  - **Orders:** a status pipeline (New → Energization scheduled → Packed → Shipped → Delivered / Cancelled / Refunded), plus a detail view with energization name/gotra, payment status, tracking entry and invoice.
  - **Bookings:** a calendar week view, plus a detail view with birth details, palm photos, notes and status.
  - **Kundali ₹99 orders.**
  - **Course enrollments / inquiries.**
  - **Content:**
    - **YouTube manager:** paste a URL → auto title/thumbnail, drag to reorder, featured toggle.
    - **Rashifal manager:** 12 rashis × daily/weekly/monthly, with scheduling.
    - Testimonials.
    - Blog editor.
    - Banners & announcement bar.
    - Home section toggles.
  - **Coupons.**
  - **Customers.**
  - **Settings:** shipping rates, free-shipping threshold, COD toggle, contact info and social links.

---

## 8. Component inventory (design every state)

Every interactive component needs these states: **default · hover · focus-visible (gold 2px ring) · active/pressed · disabled · loading · error · success · empty**.

- **Navigation:** announcement bar, header (static / stuck), mega menu, mobile menu, bottom tab bar, breadcrumbs, pagination / load-more
- **Buttons:** primary, secondary, tertiary, gold-outline (night), icon button, add-to-cart (idle → loading → "Added ✓" morph)
- **Forms:** input, textarea, select, date picker, time picker, place autocomplete, OTP boxes, checkbox, radio cards, toggle, pincode checker, file upload (palm photos), range slider, search field
- **Commerce:**
  - product card (standard / compact / horizontal), badge set, price block, rating stars, variant chips, qty stepper
  - wishlist heart, quick-view modal, cart line item, free-shipping bar, coupon field, order summary
  - payment method selector, order timeline, review card, rating distribution
- **Content:** section header (eyebrow + title + Hindi line + ornament), testimonial card (text / video / photo review), FAQ accordion, blog card, video facade card, Shorts card, course card (yantra), consultation card, stat counter, timeline, tabs, quote card
- **Signature widgets:** Pandit Ji composition, chakra, Rashi wheel + mobile dial, Love Calculator, Kundali form + chart, floating stones layer, footer starfield
- **Feedback:** toast (success / error / info with undo), modal, bottom sheet, drawer, tooltip, skeletons (warm sand shimmer), empty states (illustrated), inline validation
- **Utility:** language toggle (EN | हिं), WhatsApp FAB, back-to-top progress ring, cookie note (minimal)

---

## 9. Motion & animation system ("lots of animation, but light")

The client wants **a lot of animation** AND **"site heavy na ho"**. Solve both with **SVG + CSS transforms + small JS**. No video backgrounds, no WebGL, no heavy 3D.

### 9.1 Motion tokens
| Token | Value |
|---|---|
| `instant` | 100ms (press feedback) |
| `fast` | 150–200ms (hover, toggles) |
| `base` | 300ms (drawers, tabs, cards) |
| `slow` | 600–800ms (section reveals, headline masks) |
| `ambient` | 4s – 180s loops (floating, rotation, twinkle) |
| `ease-out` (default) | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `ease-in-out` (ambient) | `cubic-bezier(0.45, 0, 0.55, 1)` |
| spring (wheel snap, cart bump) | a gentle overshoot of ~6% |

### 9.2 Signature animations (must be demonstrated in the prototype)
| # | Name | Where | Spec |
|---|---|---|---|
| S1 | **Pandit Ji: blink** | Hero | Eyelid group scaleY 1→0.05→1 over 160ms. Random interval 3–6s, 20% chance of a double blink. |
| S2 | **Pandit Ji: japa mala** | Hero | Beads advance one position every ~1.2s (bead group rotates along the mala path) + a thumb micro-move of 2px. |
| S3 | **Pandit Ji: breath & aura** | Hero | Torso scale 1→1.012 over a 4s ease-in-out loop; aura radial glow opacity 0.5↔0.8 over 5s. |
| S4 | **Pandit Ji: gaze** | Hero, desktop only | Pupils translate at most 3px toward the cursor, eased. |
| S5 | **Diya flame** | Hero, Rituals, PDP band, empty cart | Flame path scale/skew flicker at irregular 120–300ms steps + a soft glow pulse. |
| S6 | **Incense smoke** | Hero | 2–3 thin SVG wisps rising, drifting and fading over an 8s loop. |
| S7 | **Vedic chakra** | Hero halo, 404, loaders | 3 rings: outer 120s clockwise, middle 90s anticlockwise, inner 60s clockwise. |
| S8 | **Rashi wheel auto-cycle** | Home §6, Rashifal page | Ambient rotation + a 30° spring step every 4s, highlight glow on the active segment, the panel crossfades in 300ms. Pauses on hover/interaction, resumes after 12s. |
| S9 | **Floating gemstones** | Hero edge, §9 intention, category header | translate3d Y ±10–18px, rotate ±6°, 6–11s loops with staggered delays; mouse-parallax depth on desktop. |
| S10 | **Footer cosmos** | Footer, night sections | Stars twinkle (opacity 0.2↔1, random 2–6s); constellation lines stroke-draw; mandala rotates over 180s; a shooting star every ~12s. |
| S11 | **Yantra draw** | Course cards | stroke-dashoffset draw in 1.6s on view/hover; gold glow at completion. |
| S12 | **Kundali chart draw** | Kundali tool | Diamond chart lines draw in sequence (1.2s), then planets pop into houses with a stagger. |
| S13 | **Love result** | Love Calculator | Initial medallions converge, the ring fills 0→% over 1.4s while the number counts up, then the label reveals. |

### 9.3 Page-level motion
- **Page transitions:** a quick fade + 12px lift, with a thin gold line sweeping across the top (a progress feel).
- **Headline reveals:** lines mask up from below (overflow-hidden wrappers), with a 60ms stagger per line.
- **Section entrances:** fade-up 24px, 600ms, children staggered by 80ms, triggered at 15% visibility, **once**.
- **Ornament draw:** section-header gold dividers draw from the centre outward.
- **Parallax:** hero layers and the "12" numeral at subtle 0.1–0.3 depth.
- **Sticky storytelling:** About timeline and the Rituals process line.
- **Counters:** count up on view.
- **Marquee:** infinite, slow, pauses on hover.
- **Smooth scrolling feel:** the build will add inertial smooth scroll.

### 9.4 Commerce micro-interactions
- **Add to cart:** the thumbnail flies in an arc to the cart icon (500ms), the cart badge bumps with a spring, and the button morphs to "Added ✓" for 1.5s. The cart drawer can auto-open on the first add.
- **Wishlist:** the heart fills with a small particle burst of 6 gold dots.
- **Product card hover:** the image swaps with a crossfade, the card lifts 4px, a gold hairline border fades in, and the quick-add bar slides up.
- **Qty stepper:** the number rolls vertically.
- **Variant chip select:** the gold ring scales in.
- **PDP:** zoom lens on hover; the swipe gallery follows the finger.
- **Checkout:** the progress line fills between steps; the payment-success check draws.
- **Buttons:** a gold shine sweep on primary hover; magnetic pull of at most 6px on key hero CTAs (desktop only).
- **Toasts:** slide up + fade, auto-dismiss after 4s.

### 9.5 Performance & accessibility rules for motion (so it stays light)
- Animate **only `transform` and `opacity`** (and SVG stroke-dashoffset). Never animate layout properties.
- Pause ambient animations when offscreen, and when the tab is hidden.
- **`prefers-reduced-motion`:** stop rotation, floating and parallax; keep instant fades; Pandit Ji stays static with open eyes.
- **Mobile:** halve the particle and star counts; no mouse-parallax; no magnetic buttons.
- At most 2 continuously animated signature elements in any single viewport.
- YouTube uses a click-to-load facade (no iframe on initial load).
- Deliver Pandit Ji, the chakra, the wheel, gemstones and yantras as **clean, layered SVG with named groups**, so the build can use CSS / GSAP / Rive without redrawing.

---

## 10. Mobile-first experience (designed for mobile, not shrunk desktop)

Design every page at **390×844 first**. Mobile should feel like a **premium shopping app**.

**Mobile-only patterns & sections:**
1. **Bottom tab bar:** Home · Shop · **Consult (raised centre chakra button)** · Cart · Account. Hides on scroll-down.
2. **Quick Actions grid** right under the hero: 4 app-style tiles with animated icons:
   - Kundali ₹99
   - Love Calculator
   - Aaj ka Rashifal
   - Book a Call
3. **Semicircle Rashi dial:** a half-wheel arc at the top of the Rashifal section. Swiping the rashi cards below rotates the dial and snaps the active rashi under the pointer.
4. **Stories-style Shorts row:** circular video avatars that open vertical 9:16 Shorts.
5. **Category snap-scroll** with peeking arches; **horizontal product rails** with swipe.
6. **PDP sticky bottom buy bar** (price + Add to Cart) plus a full-width swipe gallery.
7. **Bottom sheets** for filters, sort, variant pick and share.
8. **Full-screen cart**, a free-shipping bar, and a sticky checkout button.
9. **Checkout:** UPI apps shown first as large tap tiles; numeric keyboards for phone, pincode and OTP; autofill.
10. **WhatsApp FAB** above the bottom bar; tap-to-call in the menu.

**Mobile rules:**
- Tap targets ≥ 44×44px.
- Primary CTAs in the thumb zone.
- Body text ≥ 16px.
- No hover-only information.
- Swipe gestures have visible affordances (peeking cards, dots).

---

## 11. Bilingual (English + हिंदी)
- Show the **EN | हिं toggle** in the announcement bar (desktop) and in the header or menu (mobile). The active language is gold-underlined.
- Deliver **Hindi versions** of at least: Home hero + §3 categories, a Product detail page, and the mobile menu, to prove the Devanagari typography works.
- Hindi headings use Tiro Devanagari Hindi; Hindi body uses Mukta. Follow the Devanagari rules in §5.2.
- English pages keep **decorative Hindi accent lines** under key headings. This is a brand signature.
- Layouts must absorb 25% longer strings without breaking (buttons, nav, cards).

---

## 12. E-commerce UX & India-specific trust patterns (must appear)
- MRP strikethrough + % off + "incl. all taxes"
- Stock status and low-stock urgency (honest, not fake timers)
- **Delivery pincode checker** + estimated delivery date + COD availability
- **"Energized in Mahapuja" badge** and an explanation of the energization process
- **Lab / X-ray certified** Rudraksha, with a certificate image
- **Personal energization add-on** (name + gotra) at the product and checkout level
- Frequently bought together; "Complete your ritual" upsell; recently viewed
- Reviews with customer photos, a verified buyer tick, Q&A
- **Bracelet wrist-size guide** (modal with a measurement illustration)
- Gift wrap / gift message option **[confirm]**
- Razorpay-secured payments; UPI first; RuPay; COD
- Return policy snippet (7-day **[confirm]**), invoice download, order tracking timeline
- WhatsApp support everywhere; consultation satisfaction guarantee badge
- Guest checkout allowed; OTP login encouraged

---

## 13. Content & placeholders

**Product and service content:** take it from `client-requirements.md` (Sections 5–8). That covers all 13 Rudraksha beads (2–14 Mukhi), 2 malas, 15 bracelets with their intentions, 7 amulets, Bitter Havan 100g, Copper 12 Nag, 4 consultations, 6 Sadhana courses and rituals.

**Prices** (only three are confirmed; everything else is a realistic placeholder marked **[confirm]**):

| Item | Price |
|---|---|
| Hand-Energized Copper 12 Nag | **₹1,250** ✅ |
| Kundali PDF report | **₹99** ✅ |
| Sadhana course (each) | **₹50,000** ✅ |
| Rudraksha beads 2–14 Mukhi | ₹251 – ₹11,000 [confirm] |
| 5 Mukhi Mala / 7 Mukhi Mala | ₹1,100 / ₹3,100 [confirm] |
| Crystal bracelets | ₹699 – ₹1,299 (MRP ₹999 – ₹1,999) [confirm] |
| Bhojpatra amulets in copper tabiz | ₹1,100 – ₹2,100 [confirm] |
| Bitter Havan Packet 100g | ₹299 [confirm] |
| Consultations (Kundali / Palm / Tarot / Numerology) | ₹2,100 / ₹1,100 / ₹1,100 / ₹1,500 [confirm] |
| Free shipping threshold | ₹999 [confirm] |

**Stats, testimonials, review counts, YouTube videos, book titles, phone/email and the portrait** are placeholders. Keep them visually real, but list every placeholder in `HANDOFF-NOTES.md`.

**Voice & tone:**
- Calm, precise, respectful, confident.
- Short sentences.
- Sanskrit/Hindi terms used naturally (sadhana, muhurat, anushthan, vidhi, kavach).
- No fear-selling, no exaggerated guarantees.

**Sample microcopy:**
- "Energized during Mahapuja on an auspicious muhurat."
- "Ships in 2–4 days after energization."
- "Your cart is waiting for blessings."
- "Guidance continues until your doubts are resolved."

---

## 14. Accessibility & buildability guardrails
- **WCAG AA contrast.** Gold text only at ≥24px on ivory; use `gold-700` for small text.
- A visible focus ring (2px gold, offset 2px) on everything interactive; logical tab order; skip link.
- Form labels are always visible (no placeholder-only inputs); errors show both text and an icon.
- Alt text defined for key imagery in the handoff notes.
- **Buildable in Next.js with Lighthouse 90+ on mobile:**
  - Use fonts only from Google Fonts (listed above).
  - Deliver SVG for illustrations and icons.
  - Keep images in 4:5 / 1:1 / 16:9 ratios.
  - Keep the above-the-fold hero lightweight (SVG + CSS), with no autoplay video.
- Keep every animation reproducible with CSS/SVG/JS as specified in §9.

---

## 15. Deliverables & export structure

**Deliver, in order (following the prompt sequence):**
1. **Design System page:** colours, type scale (EN + HI), spacing, grid, radius, shadows, buttons, form elements, product card variants, badges, icons, ornaments, motion tokens with live demos.
2. **All storefront pages** from §7.1–7.18 as responsive interactive HTML prototypes (desktop + mobile).
3. **Signature assets as standalone layered SVGs** with named groups:
   - `pandit-ji.svg`: groups `#eyelids`, `#pupils`, `#mala-beads`, `#hand-thumb`, `#torso`, `#aura`, `#diya-flame`, `#smoke`
   - `chakra.svg`: `#ring-outer`, `#ring-middle`, `#ring-inner`
   - `rashi-wheel.svg` (12 segments with ids `#rashi-mesha` … `#rashi-meena`)
   - `gemstones/*.svg`, `yantras/*.svg`, `icons/*.svg`, `ornaments/*.svg`, `logo.svg`
4. **(Optional prompt)** Admin panel key screens (§7.19).
5. **`HANDOFF-NOTES.md`:** tokens (as CSS variables), component list, animation specs (durations, easing, triggers), the asset list, every placeholder **[confirm]** item, and open questions for the client.

**Export:** as a **Claude Code handoff bundle / downloadable project**, to be placed in the project's `design/` folder:
```
design/
  HANDOFF-NOTES.md
  design-system.html
  pages/  home.html, shop.html, category.html, product-rudraksha.html, product-copper-12-nag.html,
          cart.html, checkout.html, order-success.html, wishlist.html, search.html,
          account-login.html, account-dashboard.html, account-orders.html, account-order-detail.html,
          consultations.html, consultation-detail.html, booking.html, kundali-99.html,
          love-calculator.html, rashifal.html, rashi-detail.html, courses.html, course-detail.html,
          rituals.html, about.html, videos.html, blog.html, blog-article.html, contact.html,
          faq.html, policy.html, 404.html
  admin/  (optional)
  assets/ svg/ (pandit-ji, chakra, rashi-wheel, gemstones, yantras, icons, ornaments, logo) · images/
```

---

## 16. Anti-AI Self-Audit (run before calling any batch done)

- [ ] Could this be mistaken for a ThemeForest template or a one-shot AI site? **If yes, revise.**
- [ ] No two consecutive sections share a layout; the Day/Night rhythm is visible.
- [ ] Zero emoji; one consistent custom icon family; zodiac glyphs are custom SVG.
- [ ] Palette = tokens only. No purple, blue or neon. Gold used as accent, not flood.
- [ ] Fonts = Fraunces / Manrope / Tiro Devanagari Hindi / Mukta only.
- [ ] Every commerce surface shows price, MRP, % off, stock, rating and a working add-to-cart state.
- [ ] Cart drawer, cart page, checkout and order success all exist and connect. **It is clearly multi-page.**
- [ ] Copy is specific. No "unlock / embark / magic / mystical" clichés.
- [ ] Hindi screens render correctly (no letter-spacing, no italics, correct line-height).
- [ ] Mobile has: bottom tab bar, quick actions, rashi dial, Shorts row, sticky buy bar, bottom sheets.
- [ ] All 13 signature animations (S1–S13) are present; a reduced-motion fallback is defined.
- [ ] Client's reference features present: rotating auto Rashifal wheel ✔ Love Calculator ✔ Kundali ₹99 ✔ floating stones ✔ animated footer ✔ YouTube section ✔ animated Pandit Ji ✔ rotating chakra in the slider ✔
- [ ] The Gemini ✦ watermark is cropped out of supplied images; the logo is used faithfully.
- [ ] All placeholders are listed in HANDOFF-NOTES.md.
- [ ] AA contrast and focus states are verified.
