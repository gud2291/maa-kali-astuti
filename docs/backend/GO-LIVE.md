# GO-LIVE CHECKLIST — Maa Kali Astuti

This checklist outlines the sequential steps required to take the **Maa Kali Astuti** platform from development to production on [sadhakpawanpandey.com](https://sadhakpawanpandey.com).

Follow each step in order before accepting live customer traffic and real payments.

---

## 1. Hosting & Infrastructure (Vercel)

- [ ] **Plan Selection**: Upgrade the Vercel project to the **Pro** plan. (The Free Hobby plan is strictly for non-commercial use; commerce and real payment processing require Pro).
- [ ] **Function Region**: Set the Serverless Function Region to **Mumbai, India (`bom1`)** in Vercel Project Settings → Functions for minimal latency to Indian users.
- [ ] **Custom Domain**:
  - Add `sadhakpawanpandey.com` and `www.sadhakpawanpandey.com` in Vercel Project Settings → Domains.
  - Configure the recommended DNS records (A / CNAME) at your domain registrar/DNS provider.
  - Verify SSL certificate generation finishes cleanly.

---

## 2. Production Database (Turso)

- [ ] **Database Creation**:
  - In [turso.tech](https://turso.tech), create the production database named **`mka-prod`**.
  - Choose the region closest to India (e.g. AWS Mumbai `ap-south-1`).
- [ ] **Access Credentials**:
  - Generate a read/write token for `mka-prod`.
  - Note the database URL (`libsql://mka-prod-<org>.turso.io`) and auth token.
- [ ] **Run Migrations**:
  - Apply the database schema to production from your local PowerShell:
    ```powershell
    $env:TURSO_DATABASE_URL="libsql://mka-prod-....turso.io"; $env:TURSO_AUTH_TOKEN="..."; pnpm db:migrate
    ```
- [ ] **Seed Initial Owner & Settings**:
  - Populate the default system settings and create the initial owner account:
    ```powershell
    $env:TURSO_DATABASE_URL="libsql://mka-prod-....turso.io"; $env:TURSO_AUTH_TOKEN="..."; $env:SEED_OWNER_EMAIL="owner@sadhakpawanpandey.com"; $env:SEED_OWNER_NAME="Sadhak Pawan Pandey"; pnpm db:seed
    ```

---

## 3. Environment Variables (Vercel Production)

Configure the following variables in **Vercel Project Settings → Environment Variables** (target: **Production only**):

| Variable | Recommended Production Value / Notes |
|---|---|
| `APP_URL` | `https://sadhakpawanpandey.com` |
| `AUTH_SECRET` | Generate a 32-byte base64url secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `TURSO_DATABASE_URL` | `libsql://mka-prod-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | Production Turso Auth Token |
| `CF_ACCOUNT_ID` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 API Token Key ID |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 API Token Secret |
| `R2_BUCKET_PUBLIC` | `mka-media` (or your dedicated prod bucket) |
| `R2_BUCKET_PRIVATE` | `mka-private` (or your dedicated prod private bucket) |
| `NEXT_PUBLIC_MEDIA_URL` | `https://media.sadhakpawanpandey.com` (custom R2 domain) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Site Key for production domain |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Secret Key |
| `RESEND_API_KEY` | Production Resend API Key |
| `EMAIL_FROM` | `Maa Kali Astuti <care@sadhakpawanpandey.com>` |
| `EMAIL_REPLY_TO` | `care@sadhakpawanpandey.com` |
| `RAZORPAY_KEY_ID` | Live Razorpay Key (`rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Live Razorpay Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Secret string matching Razorpay Webhook configuration |
| `CF_BROWSER_TOKEN` | Cloudflare API Token with `Browser Rendering: Edit` permission |
| `CRON_SECRET` | Random 32+ character string for protecting cron endpoints |

---

## 4. Cloudflare R2 Storage & CORS

- [ ] **Custom Domain for Media**:
  - In Cloudflare Dashboard → R2 → `mka-media` → Settings → Public access, connect custom domain `media.sadhakpawanpandey.com`.
- [ ] **CORS Configuration**:
  - In both `mka-media` and `mka-private` bucket settings, verify CORS policy includes the production domain:
    ```json
    [
      {
        "AllowedOrigins": [
          "https://sadhakpawanpandey.com",
          "https://www.sadhakpawanpandey.com"
        ],
        "AllowedMethods": ["PUT", "GET", "HEAD"],
        "AllowedHeaders": ["content-type"],
        "MaxAgeSeconds": 3600
      }
    ]
    ```

---

## 5. Cloudflare Turnstile (Bot Check)

- [ ] In Cloudflare Dashboard → Turnstile, add `sadhakpawanpandey.com` and `www.sadhakpawanpandey.com` to the widget domain list.
- [ ] Ensure the mode is set to **Managed**.
- [ ] Ensure local test keys (`1x00000000000000000000AA`) are replaced with real keys in production.

---

## 6. Email Delivery (Resend)

- [ ] In [resend.com](https://resend.com) → Domains, add `sadhakpawanpandey.com`.
- [ ] Add the DNS records (DKIM, SPF / MX, and DMARC) at your domain's DNS provider.
- [ ] Click **Verify Domain** and confirm all status indicators are green.
- [ ] Send a test email (e.g. admin login OTP) to confirm delivery to public inboxes (Gmail, Yahoo, etc.).

---

## 7. Payments & Webhooks (Razorpay)

- [ ] **Business KYC**: Ensure business KYC is approved on [dashboard.razorpay.com](https://dashboard.razorpay.com).
- [ ] **Live API Keys**: Generate Live Mode API keys and update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel.
- [ ] **Payment Capture**: Under Settings → Payment Capture, set to **Automatic**.
- [ ] **Live Webhook**:
  - URL: `https://sadhakpawanpandey.com/api/webhooks/razorpay`
  - Secret: Same value as `RAZORPAY_WEBHOOK_SECRET`
  - Active Events:
    - `payment.captured`
    - `order.paid`
    - `payment.failed`
    - `refund.processed`
    - `refund.failed`
    - `payment_link.paid`

---

## 8. Cron Jobs & Reminders

- [ ] **Vercel Cron**: Confirm `vercel.json` schedules daily cleanup and abandonment cron at `02:30 UTC` (08:00 IST) to `GET /api/cron/daily`.
- [ ] **Frequent 15-Minute Pinger (Optional)**:
  - In [cron-job.org](https://cron-job.org), configure a recurring request every 15 minutes:
    - URL: `https://sadhakpawanpandey.com/api/cron/frequent`
    - Method: `GET`
    - Headers: `Authorization: Bearer <CRON_SECRET>`
  - This handles 1-hour booking reminder emails and Kundali report PDF retries.

---

## 9. Store Settings & Legal Details (Admin Panel)

Log in to `/admin` using your owner email OTP and update:

- [ ] **Contact Information** (`/admin/settings`):
  - Real WhatsApp number (for click-to-chat links)
  - Real customer support phone and email
  - Office / Ashram address
- [ ] **Social Links**: Real YouTube channel handle, Instagram, Facebook profiles.
- [ ] **Store Fees & Limits**:
  - Free shipping order threshold
  - COD availability and extra fee (e.g. ₹50)
  - Maximum order value for Cash on Delivery
  - Express shipping fee
  - Sacred energization fee per item
- [ ] **Invoicing & GST**:
  - Registered business legal name
  - Official GSTIN and state code
  - HSN codes for goods/services
- [ ] **Consultation Availability** (`/admin/availability`):
  - Configure actual open days of the week
  - Daily slot hours and appointment durations
  - Any blocked vacation/holiday dates

---

## 10. Content & Legal Review

- [ ] **Policies** (`/admin/content/pages`):
  - Privacy Policy
  - Terms & Conditions
  - Shipping & Delivery Policy
  - Cancellation & Refund Policy
- [ ] **Client Review Flags**:
  - Review all texts previously marked with `[client-review]` in Kundali reports and starter blog articles.
  - Review Hindi translations (`[HI review]`).

---

## 11. Catalog & Staff Setup

- [ ] **Staff Accounts** (`/admin/staff`):
  - Invite your operations team with appropriate roles (`manager`, `staff`, `editor`).
- [ ] **Coupons** (`/admin/coupons`):
  - Remove or deactivate any prototype/demo coupon codes (`WELCOME10`, `SHIV50`, etc.).
  - Configure actual launch promotion coupons with valid start/expiry dates and customer limits.
- [ ] **Product Reviews & Ratings**:
  - Navigate to `/admin/health` and review existing demo reviews.
  - Recalculate authentic ratings based on real approved reviews.

---

## 12. Verification & Live Smoke Test

- [ ] **Clean Browser Test**:
  - Open a fresh incognito window to `https://sadhakpawanpandey.com`.
  - Confirm the cart and wishlist start empty (demo seed is automatically disabled in production).
  - Confirm `/kundali-99?demo=success` does not trigger demo mock states.
- [ ] **Live Test Transaction**:
  - Create a temporary ₹1 test product or test consultation.
  - Complete a real payment via UPI/Card.
  - Verify order confirmation email arrives with accurate invoice details.
  - Verify the order appears in `/admin/orders` with status `placed` and payment status `paid`.
  - Issue a refund from `/admin/orders` and verify the webhook processes the refund in Razorpay.
  - Delete or unpublish the test product.

---

## 13. Search Engines & Monitoring

- [ ] **Google Search Console**:
  - Verify property ownership for `https://sadhakpawanpandey.com`.
  - Submit the sitemap: `https://sadhakpawanpandey.com/sitemap.xml`.
- [ ] **Robots & AI Indexing**:
  - Verify `https://sadhakpawanpandey.com/robots.txt` is accessible and points to the sitemap.
  - Verify `https://sadhakpawanpandey.com/llms.txt` is accessible.
- [ ] **Backups**:
  - Verify Turso Point-in-Time Recovery status.
  - Test running a manual backup dump via the Turso CLI:
    ```bash
    turso db shell mka-prod .dump > backup-prod-$(date +%Y%m%d).sql
    ```
- [ ] **Live Logging**:
  - Monitor runtime logs in Vercel Dashboard → Functions to ensure zero unhandled exceptions.
