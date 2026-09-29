# Claude Design: Prompts (copy-paste)

## Pehle ye karo (setup, 2 minute)
1. **claude.ai/design** kholo → **New project** banao, naam do: `Maa Kali Astuti — Website`.
2. Ye files **upload / attach** karo:
   - `design-brief/DESIGN-BRIEF.md` ← master brief (sabse zaroori)
   - `client-requirements/client-requirements.md` ← sirf content data (products, services)
   - `client-requirements/images/maa-kali-astuti-logo.png`
   - `client-requirements/images/handmade-copper-tabiz.png`
   - `client-requirements/images/WhatsApp Image 2026-09-27 at 8.39.42 AM.jpeg` (Bitter Havan jar)
   - `client-requirements/images/WhatsApp Image 2026-09-27 at 8.39.49 AM.jpeg` (Copper 12 Nag)
3. Neeche wale prompts **order mein, ek-ek karke** paste karo. Agla prompt tabhi dena jab pichla batch pura ho jaye aur tumhe theek lage.
   - Kyun: 30+ pages ek saath maangne se quality gir jaati hai. Har batch brief ko dobara refer karta hai, isliye design consistent rehta hai.
4. Sab ho jaye to **Export → Handoff to Claude Code / Download** karo, aur saari files is project ke **`design/`** folder mein daal do. Folder: `KALA-JADU/design/`.

---

## PROMPT 1: Kickoff: Design System + Home Page

```
You are a senior brand & web designer with 15 years of experience designing premium Indian heritage and luxury D2C brands. Read the attached DESIGN-BRIEF.md completely before starting — it is the single source of truth. Use client-requirements.md only for content data. Use the attached images as real assets (crop out the small Gemini ✦ sparkle watermark from the logo and Bitter Havan images; crop the 12 Nag screenshot to the product only).

Context: the client REJECTED the previous design because (1) it was a one-page site, (2) it lacked real e-commerce (add to cart etc.), (3) reference features were missing, and (4) "it looks like Gemini made it". This redesign must look hand-crafted by a senior studio — follow Section 3 (Anti-AI craft rules) strictly.

Build in this order:
1. DESIGN SYSTEM page — tokens (Section 5), type scale EN + HI, buttons, forms, product card variants, badges, the custom monoline icon set, ornament kit, 12 SVG rashi glyphs, and live motion-token demos.
2. HOME page — all 18 sections from Section 7.1, mobile-first (390px) then desktop (1440px), with the global header, Shop mega menu, mobile menu, bottom tab bar, cart drawer, WhatsApp FAB and animated footer.

The site must have A LOT of animation but stay lightweight (SVG + CSS transforms + minimal JS, Section 9). Demonstrate in the prototype: the animated Pandit Ji (random eye blink, japa mala bead movement, breathing, diya flicker, incense smoke, cursor gaze), the counter-rotating Vedic chakra halo, the 3-slide hero text slider, the auto-rotating Rashifal wheel with a live detail panel, floating gemstones, the self-drawing Kundali chart, the Love Calculator result animation, yantra stroke-draw on course cards, fly-to-cart, and the twinkling-star footer with the slowly rotating mandala. Respect prefers-reduced-motion.

Mobile must feel like a premium shopping app, not a shrunk desktop — include the mobile-only patterns in Section 10 (Quick Actions tiles, semicircle Rashi dial, Shorts row, bottom tab bar).

Before you finish, run the Anti-AI Self-Audit (Section 16) and fix anything that fails. Then show me the Home page on desktop and mobile.
```

---

## PROMPT 2: Shop, Product, Cart, Checkout

```
Continue with the same design system and DESIGN-BRIEF.md. Build the full commerce flow — it must be clearly multi-page and feel like a store that already takes orders:
- Shop (all products) + Category page template (Section 7.2) with the filter sidebar, sort, active chips, mobile filter bottom sheet, editorial banner, load more, skeleton + empty states.
- Product Detail in TWO versions (Section 7.3): A) 5 Mukhi Original Nepali Rudraksha (mukhi variant chips, lab certificate, energization add-on with name + gotra, pincode checker, reviews with photos, Q&A, frequently bought together, sticky buy bar) and B) Hand-Energized Pure Copper 12 Nag ₹1,250 (copper accent, "Where to place" guide).
- Cart drawer + Cart page with the free-shipping progress bar, upsell, coupon, and empty state (Section 7.4).
- Checkout, 5 steps, UPI-first, pincode autofill, COD, error + payment-failed states (Section 7.5).
- Order Success with the energization timeline (Section 7.6), Wishlist, Search overlay + results (Section 7.7).
Include all commerce micro-interactions from Section 9.4. Design every page mobile-first, then desktop. Also give me Hindi versions of the Rudraksha product page. Run the Section 16 audit before finishing.
```

---

## PROMPT 3: Astro Tools, Consultations, Courses, Rituals

```
Continue with the same design system and DESIGN-BRIEF.md. Build:
- Consultations landing + Service detail + the 4-step Booking flow with slot picker and palm-photo upload (Section 7.9).
- Kundali ₹99 page: form → generating state (spinning chakra) → preview with the self-drawing North-Indian chart, planet table and blurred locked report pages → pay ₹99 → download success (Section 7.10).
- Love Calculator page with the converging-medallion result animation and related products (Section 7.11).
- Rashifal page with the large auto-rotating wheel, period tabs, 12-rashi grid and a DOB → rashi helper, plus a Rashi Detail page with a lucky-gemstone product cross-sell (Section 7.12). On mobile use the semicircle swipe dial.
- Sadhana Courses listing (₹50,000, 6 yantra cards with stroke-draw) + Course Detail with a sticky Enquire CTA (Section 7.13).
- Rituals & Anushthan page with the diya thali and a scroll-drawn process line (Section 7.14).
Mobile-first, then desktop. Keep the Day/Night section rhythm. Run the Section 16 audit before finishing.
```

---

## PROMPT 4: About, Videos, Blog, Account, Utility Pages

```
Continue with the same design system and DESIGN-BRIEF.md. Build:
- About Sadhak Pawan Pandey with the sticky scroll-story timeline and published works (Section 7.15).
- Videos page with YouTube facade players, category tabs and a Shorts row (Section 7.16).
- Blog listing + Article page with sticky TOC, "Products mentioned" cards and an FAQ block (Section 7.17).
- Account: OTP login (6-box OTP), Dashboard, Orders, Order Detail with tracking timeline, Bookings, My Kundali downloads, Addresses, Profile (Section 7.8).
- Contact, FAQ, Policy template (Shipping / Refund / Privacy / Terms / Astrology Disclaimer), and a creative 404 with the rotating chakra (Section 7.18).
Also give me the Hindi version of the Home hero + categories and the mobile menu. Mobile-first, then desktop. Run the Section 16 audit before finishing.
```

---

## PROMPT 5 (OPTIONAL: only after the storefront is approved): Admin Panel

```
Using the same brand system in a quieter, workspace-appropriate form, design the admin panel described in DESIGN-BRIEF.md Section 7.19: Login, Dashboard (KPIs incl. pending energization, bookings today, Kundali ₹99 sales, course inquiries; revenue chart; recent orders; upcoming consultations), Products list + create/edit (EN/HI tabs, image uploader, variant matrix, price/MRP, stock, SEO fields), Orders pipeline + detail (energization name/gotra, tracking, invoice), Bookings calendar + detail, Kundali ₹99 orders, Course inquiries, Content manager (YouTube URL manager with reorder + featured, Rashifal manager for 12 rashis × daily/weekly/monthly, Testimonials, Blog editor, Banners/Announcement bar, Home section toggles), Coupons, Customers, Settings. Desktop-first but usable on mobile. Include empty, loading and error states.
```

---

## PROMPT 6: Final Audit + Handoff Export

```
Final pass:
1. Run the full Anti-AI Self-Audit (DESIGN-BRIEF.md Section 16) across EVERY page and fix all failures. Check consistency of spacing, type, icons, buttons and animation timing across pages.
2. Make sure all pages link together (header, footer, cards, CTAs, cart → checkout → success) so the prototype can be clicked through like a real store.
3. Export the signature assets as standalone layered SVGs with the named groups listed in Section 15 (pandit-ji, chakra, rashi-wheel, gemstones, yantras, icons, ornaments, logo).
4. Write HANDOFF-NOTES.md: tokens as CSS variables, component inventory, every animation spec (duration, easing, trigger, reduced-motion fallback), asset list, every [confirm] placeholder, and open questions for the client.
5. Prepare the handoff bundle for Claude Code, organized as the design/ folder structure in Section 15.
```

---

## Fix / Feedback prompt (template, use whenever something looks off)

```
Revise [page / section name]. Problem: [what looks wrong — e.g. "looks templated", "too plain", "cards all look the same", "animation too fast", "mobile feels cramped"]. Keep the design system and DESIGN-BRIEF.md rules. Make it feel more hand-crafted and premium: vary the layout, add craft details (gold hairlines, ornaments, editorial type), and keep the animation lightweight. Re-run the Section 16 audit for this page.
```

---

### Yaad rakhne wali baatein
- **Pandit Ji:** abhi illustrated animation hai. Client se pucho: kya Sadhak Ji ka asli 8–10 second video (mala japa karte hue, seedha camera ki taraf dekhte hue) mil sakta hai? Wo milne par hero mein "real cinemagraph" lag sakta hai. Frame usi hisaab se design hua hai.
- **Client se ye cheezein mangwani hain** (inke bina placeholders lage hain):
  - Sadhak Ji ki photos
  - Original logo file (vector/PNG, jisme Gemini ka ✦ watermark na ho)
  - Saare product photos (khaaskar copper tabiz ki behtar photo)
  - Prices
  - YouTube channel link
  - Book ke naam
  - Phone, WhatsApp aur email
  - Testimonials
- Claude Design ka kaam pura ho jaye aur files `design/` folder mein aa jayein, tab Claude Code mein **"ho gaya"** likhna. Uske baad full build plan banega.
