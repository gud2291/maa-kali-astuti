# PLAN — Phase B: backend, admin panel, real commerce

Planned in session B00 (2026-10-01). Step status lives in `PROGRESS.md`; step specs in `docs/backend/steps/`.

## Goal
Turn the finished frontend demo into a working, fast, secure store and practice site that the client's team can run from a phone or a laptop:
real products, orders and payments, consultations with slot booking, the ₹99 Kundali report, course/ritual inquiries, and a CMS for every piece of content — all in the existing theme.

## Decisions
| # | Decision | Why |
|---|---|---|
| 1 | Pages that have no design file (PDP, cart, checkout, order success, account, track-order, wishlist, search, blog, contact, FAQ, policies) are built **from the existing theme** (tokens, fonts, components) following `design-brief/DESIGN-BRIEF.md` §7.3–§7.8, §7.17–§7.18. | User choice; no extra design round. |
| 2 | Customer login = **email OTP**; guest checkout always allowed; SMS/WhatsApp OTP = optional O2. | No DLT registration needed to launch. |
| 3 | Admin panel UI = **English only**; content keeps EN + HI fields. | User choice; less work, fewer bugs. |
| 4 | Kundali report text (EN + HI) is **drafted by AI** (B26–B28) and flagged `[client-review]`. | User choice. |
| 5 | DB **Turso (libSQL/SQLite) + Drizzle**. | Free ~5 GB (user asked > 512 MB, not Mongo), portable SQLite file, serverless-safe HTTP client. |
| 6 | Caching = Next "previous model" (`unstable_cache` + tags, `updateTag` / `revalidateTag(tag, "max")`); `cacheComponents` off. | Keeps the finished static frontend safe. |
| 7 | Own session auth (DB sessions, httpOnly cookies) — no auth vendor. | Small, auditable, no lock-in. |
| 8 | Media on **Cloudflare R2**; images resized in the browser to WebP variants; plain `<img srcset>`. | Free egress; no Vercel image-optimisation quota. |
| 9 | Payments **Razorpay** (Orders, Checkout.js, webhooks, refunds, payment links) + COD. | India / UPI first. |
| 10 | Email **Resend + React Email**; WhatsApp = click-to-chat links (Cloud API optional O3). | Free tier, zero setup for WhatsApp. |
| 11 | Bot/abuse: **Turnstile** + DB rate limits. | Free; no Redis. |
| 12 | Kundali maths **astronomy-engine** + Lahiri ayanamsa; report = HTML page; PDF via **Cloudflare Browser Rendering**. | Swiss Ephemeris is AGPL/commercial; Chromium on Vercel is fragile; Hindi needs a real browser engine. |
| 13 | Categories (5), services (4), courses (6), intents, badges keep fixed keys; admin edits their text, prices, order, visibility. | Routes, filters and generated art depend on them. New categories = developer work. |
| 14 | Vercel region `bom1`; daily Vercel cron + optional external 15-min pinger. | Hobby limits. |
| 15 | Every step is one session; any AI may do any step except the audits; Claude audits at the end. | User's multi-AI workflow. |

## What exists when B46 is done
**Storefront (EN + HI)**
- Catalog from DB: shop, categories, filters, search, mega menu, quick-add — same UI as phase F.
- Product page: gallery (photos or generated art), variants, energization add-on (name + gotra), qty, add to cart / buy now, pincode delivery check, accordions (description, benefits, how to wear, specs, shipping), wrist-size guide, related, recently viewed, reviews with photos, sticky mobile buy bar.
- Cart drawer + cart page; server-validated coupons; settings-driven fees (free-shipping bar, express, COD, gift wrap, energization).
- Checkout (contact → address with pincode autofill → delivery → payment → review), Razorpay (UPI first) or COD, abandoned-checkout reminder.
- Order success with timeline, invoice page (printable), guest order tracking.
- Account: email OTP login, orders + timelines, invoices, bookings (reschedule), My Kundali downloads, addresses, profile with saved birth details, wishlist page.
- Consultations: real services/tiers/prices, live slot availability (IST), atomic slot hold, payment, private palm-photo upload, confirmation email + calendar file, reminders.
- Kundali ₹99: accurate chart (Lahiri), free preview, payment, 28-page report (EN/HI) as web page + PDF, email delivery.
- Free tools (home Kundali mini, Rashi finder) use the same accurate server maths; birth places with real coordinates/time zones.
- Rashifal from the CMS (daily/weekly/monthly/yearly), template fallback when empty.
- Course & ritual inquiries, contact form, newsletter — stored, emailed, rate-limited, bot-checked.
- Blog with articles, FAQ blocks and product mentions; FAQ page; policy pages; all CMS-driven.
- SEO/GEO/AEO: metadata, canonical + hreflang, JSON-LD, sitemap, robots, llms.txt, OG images.

**Admin (`/admin`, phone + laptop)**
- Email-OTP login; roles owner / manager / staff / editor; staff management; audit log.
- Dashboard: revenue today/month, orders, pending energization, bookings today, Kundali sales, open inquiries, low stock, charts, recent activity.
- Products & categories (EN/HI, images drag-drop from phone camera, sizes, stock, badges, SEO, PDP content, status), coupons, customers.
- Orders pipeline (New → Energizing → Packed → Shipped → Delivered / Cancelled / Returned), tracking, refunds, invoice + packing slip, WhatsApp/email buttons, CSV export.
- Bookings calendar + detail, services/tiers/prices, availability (slot times, open days, blocked dates), report upload.
- Kundali orders (regenerate, resend), inquiries pipeline with payment links, messages inbox, subscribers.
- Content: videos (paste a YouTube URL), testimonials, FAQs, courses, rituals, home (hero slides, section toggles, announcement bar), rashifal, blog, policies, media library.
- Settings: fees, COD, contact, social, SEO, notification emails, Kundali price, course fee, invoice details. System-health page showing which services are configured.

**Platform**: rate limits, Turnstile, CSP, signed uploads, idempotent webhooks, atomic stock/slot writes, cached static pages, daily cron jobs, structured logs.

## Out of scope for v1 (optional steps only on request)
O1 Google sign-in · O2 SMS/WhatsApp OTP (MSG91) · O3 WhatsApp Cloud API notifications · O4 Shiprocket shipping integration · O5 cart/wishlist sync to the account.
Not planned: multi-currency, gift cards, loyalty points, affiliate, product Q&A, live chat, push notifications, new categories/services/courses beyond the fixed keys.

## Phase-F demo behaviour that phase B removes
- Mock payments (booking, Kundali) → Razorpay (B18, B22, B30).
- `localStorage` inquiries/bookings → DB (B22, B31).
- Hard-coded coupons (`COUPONS` in `src/lib/core/commerce.ts`) → DB coupons (B08).
- Fee constants in `src/lib/core/commerce.ts` → `store` settings (B08).
- `DEMO_SEED` cart/wishlist/recent-search seeds → off before launch (B44).
- `?demo=` / `?pay=fail` QA params on `/kundali-99` → development only (B44).
- Approximate Kundali maths → server engine (B25).

## Client-confirm (added in phase B)
- All Hindi strings written by us for new pages and emails (`[HI review]`).
- Kundali report texts (B26–B28) `[client-review]`.
- Starter blog articles and policy drafts (B37) `[client-review]`.
- GST details for invoices (GSTIN, legal name, address, state code, HSN codes, GST rates).
- Real slot times, open days, reschedule rule; COD limit; express-delivery promise.
- Razorpay business KYC, Resend domain, Cloudflare account, Vercel plan.
