# Handoff notes — Consultations, astro tools, courses, rituals

## Pages in this batch
- `Consultations.dc.html` · `Consultation-Detail.dc.html#s=kundali|palm|tarot|numerology`
- `Booking.dc.html#s=…&tier=…` — 4 steps + confirmation (.ics and Google Calendar)
- `Kundali-99.dc.html` — Tweaks: `demoState` (form / generating / preview / success), `payOutcome` (success / fail)
- `Love-Calculator.dc.html`
- `Rashifal.dc.html#p=today|tomorrow|week|month|year` · `Rashi-Detail.dc.html#r=mesha&p=today`
- `Sadhana-Courses.dc.html` · `Course-Detail.dc.html#c=kali`
- `Rituals.dc.html`

## Placeholders to confirm with the client
- Consultation prices, durations and package contents (Essential / Detailed / Premium)
- Booking slot times, Sunday closure, 30-day booking window, reschedule rule (once, 12 hrs before)
- Kundali report: MRP ₹499, page count (28), contents list, “4.8 from 3,400+ reports”, reviews
- Kundali PDF generation: prototype downloads the chart page as SVG; build generates the full PDF
- Rashifal and rashi predictions are generated sample copy; lucky colours, gemstones and remedies per rashi
- Course durations (27–41 days), modules, instalments (3 × ₹16,667), refund policy wording
- Ritual examples, 5-step process wording, “What you receive” inclusions (photo updates, prasad by post, 40 days of guidance)
- WhatsApp number +91 90000 12345
- Planet positions use an approximate formula; the build should use Swiss Ephemeris (Lahiri)

## Motion (this batch)
- S7 chakra: Kundali generating state spins up (playback rate ramps 0.12 → 2.6), booking payment overlay
- S8 wheel: 30° step every 4 s with ~6% overshoot, pauses 12 s after hover/tap, pause button; mobile semicircle dial follows the card rail
- S11 yantra draw on view and on hover; S12 chart lines then planets; S13 medallions converge, ring fills over 1.4 s with count-up
- Rituals process line fills with scroll; reduced motion shows everything static and complete

---

# Handoff notes — Home, Videos, About

## Pages in this batch
- `Home.dc.html`: hero plus sections 2–17, footer with its newsletter switched off (`newsletter="off"`), because section 17 is the newsletter band
- `Videos.dc.html#c=pravachan|sadhana|remedies|qa&v=v3`: featured player, category tabs, library grid, Shorts row and viewer, subscribe band
- `About.dc.html`: hero portrait, sticky six-chapter story, three pillars, published works, discourses, contact band
- Shared art and content live in `mka-home.js` (MKA.H): Pandit Ji, hero arch frame, gemstones, havan and copper art, video and Shorts thumbnails, book covers, guarantee seal, About chapters, video, review and timeline data

## Wiring changed in shared files
- `SiteChrome`: the logo and Home tab link to `Home.dc.html` (on Home they scroll back to the top); Videos and About nav and menu links are real, with active states
- `SiteFooter`: Videos and About links; new `newsletter` prop (`on` by default)
- `mka-core.js`: `M.BUILT` lists home, videos and about; `M.soon('The Home page' | 'Videos' | 'About Sadhak Ji')` now navigates, so existing breadcrumbs and "Read his story" links work without editing those pages
- `mka-astro.js`: new FAQ set `home` (7 questions)

## Signature SVG, named groups (Pandit Ji, `H.pandit`)
`#aura` `#torso` `#torso-front` `#head` `#eyelids` `#pupils` `#mala-beads` (30 `[data-bead]`) `#hand-thumb` `#legs` `#altar` `#diya-flame` `#smoke`. The mala path is an arc-length lookup (`H.malaAt`) shared by the SVG and the animation.

## Motion on Home
- S1 blink: `#eyelids` scaleY 1 → .05 → 1 in 160 ms, every 3–6 s at random, with a 20% double blink
- S2 japa: beads step one position every 1.2 s (300 ms ease-out), and the thumb moves 1.2 × 1.8 px
- S3 breath: `#torso` and `#torso-front` scale 1 → 1.012 over 4 s; the aura's opacity moves between .5 and .82 over 5 s
- S4 gaze (desktop only): pupils move at most 2.2 × 0.9 user units toward the cursor, lerped at .12
- S5 diya (hero, rituals thali), S6 incense (3 wisps, 8–10 s), S7 chakra halo (120 s / −90 s / 60 s)
- S8 wheel: 4 s step, pauses 12 s after interaction; mobile uses the half-dial and swipe rail
- S9 gems: hero edge (scroll and mouse parallax 0.16–0.32), category hover, section 7 layer (10 stones, mouse depth up to 36 px)
- S10 footer cosmos (SiteFooter), S11 yantra draw on the course track, S12 chart draw (again after Generate), S13 love result
- Page level:
  - hero lines mask up with a 60 ms stagger and a 6 s progress line; the slider pauses on hover and while offscreen
  - section headings mask up once, at 25% visibility
  - the "12" numeral parallax runs at −0.2
  - the rituals process line fills with scroll, and About stats count up on view
  - the marquee loops in 56 s and pauses on hover
  - hero CTAs have a magnetic pull of up to 6 px on desktop
- Reduced motion: no slider auto-advance, no blink, mala, breath, gaze or parallax; charts, yantras and the process line show complete; ambient loops stay off (core)
- Every loop pauses when offscreen and when the tab is hidden

## Placeholders to confirm with the client
- Hero trust row "4.9 · 2,000+ reviews"; stats 18+ years, 12,000+ seekers, 3,500+ rituals
- Kundali MRP ₹499 (80% off); consultation prices from the existing SVC data
- Timeline years (2001–2008, 2008, 2008–2016, 2012 onwards, 2019) and chapter wording
- Book titles, years and page counts: साधना के सत्य, अदृश्य के अनुभव, मंत्र और मन
- YouTube: channel handle @SadhakPawanPandey, "1.2 lakh subscribers", "new discourse every Sunday"; all 12 video and 6 Shorts titles, durations and dates. Playback is a preview (progress bar and timer); the build swaps in a click-to-load iframe (youtube-nocookie) with IDs managed in the admin panel
- Video testimonials (Sunita Pathak, Deepak Srivastava); photo reviews use product art as photo placeholders
- Return policy wording in the Home FAQ (7 days; energized-with-sankalp items exchange only)
- Portrait of Sadhak Ji: tonal silhouette placeholder; the Pandit Ji hero is an illustration, not a likeness

## Build notes
- Home renders about 10,000 DOM nodes because every illustration is inline SVG. In the build, serve the Pandit, gems, category art, thumbnails and chapters as external SVG files, or an `<img>` sprite, and lazy-load below the fold. That cuts the DOM to a few thousand nodes and keeps Lighthouse above 90.
- Cart, Checkout, Product, Wishlist, Search and Order Success are linked by filename (M.BUILT); they are not in this project folder.

## Section 16 audit (Home, Videos, About)
- Layout: no two consecutive sections share a structure. Home runs ivory → sand band → ivory → ivory (hairline break, different grid) → sand → night → sand → ivory → sand → night → ivory → sand → night → ivory → sand → ivory → emerald band → night footer.
- No emoji. One 1.5 px icon family; rashi glyphs are custom SVG; Devanagari ॥ used as punctuation only.
- Palette: tokens plus the tints already in the system (#FFFDF8, #F6E7BC, #E6CB86, #C9D6CF, #9FB3AA). Stone colours are product colours; no blue or purple UI.
- Fonts: Fraunces, Manrope, Tiro Devanagari Hindi and Mukta only. Devanagari has no tracking and no italics; headings use 1.35 line-height.
- Commerce: product cards and the 12 Nag spotlight show price, MRP, % off, stock, rating, add-to-cart morph, fly-to-cart and wishlist burst.
- Mobile: tab bar, quick-action tiles, rashi half-dial, Shorts stories row and viewer, snap rails for categories, intentions, testimonials and courses.
- Reference features: rotating wheel, Love Calculator, Kundali ₹99, floating stones, animated footer, YouTube section, animated Pandit Ji, chakra in the slider.
- Accessibility: global 2 px gold focus ring; small gold text uses #7A5C1C on ivory; form errors show an icon and text; slider, wheel and Shorts have keyboard controls (arrows, pause, Esc).
