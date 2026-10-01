# PROGRESS — Maa Kali Astuti · Phase B (backend · admin · commerce)

**Current: B18**  ·  Claude → type `/next`  ·  Another AI → paste the prompt from `docs/backend/AGENT-PROMPT.md`
Status: `TODO` · `IN-PROGRESS` · `DONE` · `BLOCKED`. Agent = lower-case name(s) of who worked on the step (`claude`, `antigravity`, … — `a+b` when two). Date = YYYY-MM-DD.
Phase F (finished frontend) tracker: `docs/frontend/PROGRESS-F.md` — reference only, don't open unless a step says so.

## Fix-list (from the user's manual QA — fixed before the next step)
- (none)

## Blockers
- (none)

## Steps
Spec files are in `docs/backend/steps/`. Each step needs the previous one DONE.

| Step | Title | Status | Agent | Date | Risk | Best agent | Spec |
|---|---|---|---|---|---|---|---|
| B00 | Backend plan + multi-AI workflow | DONE | claude | 2026-10-01 | — | — | `docs/backend/PLAN.md` |
| B01 | Foundation: env, helpers, tooling | DONE | antigravity | 2026-10-01 | M | any | `B01-foundation.md` |
| B02 | Schema 1: domain types + core, catalog, content | DONE | antigravity | 2026-10-01 | H | Claude rec. | `B02-schema-core-catalog-content.md` |
| B03 | Schema 2: commerce, consult, CRM | DONE | antigravity | 2026-10-01 | H | Claude rec. | `B03-schema-commerce-consult-crm.md` |
| B04 | Seed script | DONE | antigravity | 2026-10-01 | M | any | `B04-seed.md` |
| B05 | Data layer 1: catalog from the DB | DONE | antigravity | 2026-10-01 | H | Claude rec. | `B05-data-catalog.md` |
| B06 | Data layer 2: content queries + content pages | DONE | antigravity | 2026-10-01 | H | Claude rec. | `B06-data-content.md` |
| B07 | Data layer 3: home sections from the DB | DONE | antigravity | 2026-10-01 | M | any | `B07-data-home.md` |
| B08 | Data layer 4: client snapshot, server coupons, fees | DONE | antigravity | 2026-10-01 | H | Claude rec. | `B08-client-snapshot-coupons-fees.md` |
| B09 | Auth + email core | DONE | antigravity | 2026-10-01 | H | Claude rec. | `B09-auth-email.md` |
| B10 | Media uploads (Cloudflare R2) | DONE | antigravity | 2026-10-02 | M | any | `B10-media-r2.md` |
| B11 | Admin shell + login | DONE | antigravity | 2026-10-02 | M | any | `B11-admin-shell-login.md` |
| B12 | Admin UI kit | DONE | antigravity | 2026-10-02 | M | any | `B12-admin-ui-kit.md` |
| B13 | Admin: products & categories | DONE | antigravity | 2026-10-02 | M | any | `B13-admin-products.md` |
| B14 | Admin: settings, coupons, staff | DONE | antigravity | 2026-10-02 | M | any | `B14-admin-settings-coupons-staff.md` |
| B15 | Product page (PDP) | DONE | antigravity | 2026-10-02 | M | any | `B15-product-page.md` |
| B16 | Order engine (server) | DONE | antigravity | 2026-10-02 | H | Claude rec. | `B16-order-engine.md` |
| B17 | Cart page + checkout UI (COD) | DONE | antigravity | 2026-10-02 | M | any | `B17-cart-checkout-ui.md` |
| B18 | Online payments (Razorpay) | TODO | | | H | Claude rec. | `B18-razorpay.md` |
| B19 | Customer account, invoices, checkout prefill | TODO | | | M | any | `B19-account.md` |
| B20 | Track order, wishlist page, search page | TODO | | | L | any | `B20-track-wishlist-search.md` |
| B21 | Admin: orders (incl. refunds) | TODO | | | H | any (exact spec) | `B21-admin-orders.md` |
| B22 | Consultation booking backend | TODO | | | H | Claude rec. | `B22-booking-backend.md` |
| B23 | Booking manage page + reschedule | TODO | | | M | any | `B23-booking-manage.md` |
| B24 | Admin: consultations | TODO | | | M | any | `B24-admin-consultations.md` |
| B25 | Kundali engine + birth places | TODO | | | H | Claude rec. | `B25-kundali-engine.md` |
| B26 | Report content — English | TODO | | | L | any | `B26-report-content-en.md` |
| B27 | Report content — Hindi part 1 | TODO | | | L | any | `B27-report-content-hi-1.md` |
| B28 | Report content — Hindi part 2 | TODO | | | L | any | `B28-report-content-hi-2.md` |
| B29 | Kundali report document | TODO | | | M | any | `B29-kundali-report-document.md` |
| B30 | Kundali ₹99 purchase, PDF, delivery | TODO | | | H | Claude rec. | `B30-kundali-purchase-pdf.md` |
| B31 | Inquiries + payment links | TODO | | | M | any | `B31-inquiries-payment-links.md` |
| B32 | Contact page, newsletter, inbox | TODO | | | L | any | `B32-contact-newsletter.md` |
| B33 | Content managers | TODO | | | M | any | `B33-content-managers.md` |
| B34 | Home & site settings | TODO | | | M | any | `B34-home-site-settings.md` |
| B35 | Rashifal manager | TODO | | | M | any | `B35-rashifal-manager.md` |
| B36 | Blog, policies, FAQ page, editor | TODO | | | M | any | `B36-blog-policies-faq.md` |
| B37 | Starter articles + policy drafts | TODO | | | L | any | `B37-starter-content.md` |
| B38 | Product reviews | TODO | | | M | any | `B38-reviews.md` |
| B39 | Admin dashboard, badges, search | TODO | | | M | any | `B39-dashboard-search.md` |
| B40 | Customers, exports, audit log, health | TODO | | | M | any | `B40-customers-audit-health.md` |
| B41 | Cron jobs & reminders | TODO | | | M | any | `B41-cron-reminders.md` |
| B42 | SEO foundation | TODO | | | M | any | `B42-seo-foundation.md` |
| B43 | Per-page metadata & structured data | TODO | | | L | any | `B43-seo-pages.md` |
| B44 | Hardening & go-live prep | TODO | | | M | any | `B44-hardening-go-live.md` |
| B45 | Final audit 1 — other agents' work | TODO | | | — | **Claude only** | `B45-audit-agent-work.md` |
| B46 | Final audit 2 — security, scale, build | TODO | | | — | **Claude only** | `B46-audit-security-scale.md` |

## Optional (only when the user asks — Claude writes the spec first)
| Step | Title |
|---|---|
| O1 | Google sign-in for customers |
| O2 | SMS / WhatsApp OTP login (MSG91 — needs DLT registration) |
| O3 | WhatsApp Cloud API notifications |
| O4 | Shiprocket shipping integration |
| O5 | Cart & wishlist sync to the account |

## Decisions log (phase B)
- 2026-10-01 (B00) user choices: pages without a design are built from the existing theme; customer login = email OTP (SMS later, O2); admin UI English only; Kundali report text drafted by AI for Sadhak Ji's review.
- 2026-10-01 (B00) stack: Turso + Drizzle; Next "previous" caching model (`cacheComponents` off); own DB sessions; Cloudflare R2 + browser-side WebP; Razorpay + COD; Resend + React Email; Turnstile + DB rate limits; astronomy-engine + Lahiri; Cloudflare Browser Rendering for PDFs; Tiptap JSON + safe renderer; Vercel region bom1.
- 2026-10-01 (B00) fixed keys for categories, services, courses, intents, badges — admins edit their content, not the keys.
- 2026-10-01 (B00) customer access keys (order/booking/kundali links) are HMAC-derived, never stored.
- 2026-10-01 (B00) phase-F docs moved to `docs/frontend/` (reference only). Client-confirm list for phase B: `docs/backend/PLAN.md`.
