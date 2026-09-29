# BACKEND ROADMAP (captured requirements; to be planned in B0)

This is **not** a plan yet. It collects everything the client and user asked for, so that the B0 planning session starts complete. Verify all free-tier numbers at planning time.

## Requirements
- **Database:** free, with more storage than MongoDB Atlas M0 (512 MB), and preferably portable or self-ownable. It holds products, orders, users, bookings, Kundali orders, course inquiries and content.
  - Shortlist to evaluate: **Turso (libSQL/SQLite)**, **CockroachDB Basic (Postgres-compatible)**, **Supabase**, **Neon**.
  - ORM: Drizzle, which works with all of them and keeps a DB switch cheap.
- **Media storage:** product photos, palm photos, Kundali PDFs. Candidates: Cloudflare R2 (free egress) or Cloudinary.
- **Auth:** phone OTP login (plus optional Google); guest checkout allowed; admin roles.
- **Payments:** Razorpay (UPI first, cards, netbanking, wallets, COD + fee), webhooks, invoices.
- **Commerce:**
  - cart sync to the account, coupons, pincode serviceability + delivery ETA, stock;
  - energization add-on (name + gotra), order pipeline (New → Energization scheduled → Packed → Shipped → Delivered / Cancelled / Refunded), tracking;
  - reviews with photos, Q&A, wishlist, recently viewed.
- **Consultations:** booking slots (IST), palm photo upload, confirmations (email / WhatsApp), reschedule rule, calendar (.ics).
- **Kundali ₹99:** accurate positions with Swiss Ephemeris (Lahiri ayanamsa), PDF report generation (25+ pages, EN/HI), payment → download, email delivery.
- **Courses:** inquiry → conversation → eligibility → enrollment; instalments (to confirm).
- **Rituals:** inquiry pipeline.
- **Admin panel** (design brief §7.19):
  - dashboard KPIs; products with EN/HI fields, variants, images, SEO fields; orders; bookings calendar; Kundali orders; course inquiries;
  - content: YouTube manager, Rashifal manager (12 × daily/weekly/monthly, scheduled), testimonials, blog, banners/announcement, home section toggles;
  - coupons, customers, settings (shipping, COD, contact, social).
- **Notifications:** email (Resend or similar) and WhatsApp updates (opt-in).
- **Security:**
  - rate limiting, bot protection on forms and OTP, CSRF-safe Server Actions, input validation (shared zod), RBAC for admin;
  - audit log, secrets in Vercel env, CSP updates for Razorpay, `security-review` skill before launch.
- **SEO / GEO / AEO:**
  - per-page metadata, hreflang EN/HI, JSON-LD (Product, Offer, Review, FAQPage, Organization, Person, BreadcrumbList, VideoObject, Service);
  - sitemap and robots, `llms.txt`, blog with FAQ blocks, fast Core Web Vitals.
- **Hosting:** Vercel free plan (watch function and image-optimization limits); ISR or on-demand revalidation for admin edits.

## Frontend part 2 (needs designs first)
Cart page, Checkout (5 steps), Product detail (Rudraksha + 12 Nag), Wishlist, Search results, Order success, Account (OTP login, dashboard, orders, order detail, bookings, my Kundali, addresses, profile), Blog + Article, Contact, FAQ, Policies, Admin.
