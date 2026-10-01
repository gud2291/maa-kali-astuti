# USER-SETUP — accounts, keys and commands (for the user, not for AIs)

Each step's "User setup before QA" line points to a section here. Do that section before you test the step.
Secrets go only into `.env.local` (your PC) and Vercel → Settings → Environment Variables. Never paste a secret into an AI chat.
Free-plan numbers below were true when planned (Oct 2026); check the provider's pricing page.

---

## §0 Local env file (before B01 QA)
1. Copy `.env.example` → `.env.local` (B01 creates `.env.example`). Fill values as you finish the sections below.
2. `APP_URL=http://localhost:3000`
3. `AUTH_SECRET` — generate once:
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

## §1 Turso database (before B01 QA)
1. Sign up at turso.tech (free plan).
2. Create database **`mka-dev`**; pick the location closest to India (AWS Mumbai `ap-south-1` if listed).
3. Open it → create a token (read + write). Copy the database URL (`libsql://mka-dev-<org>.turso.io`) and the token.
4. `.env.local`: `TURSO_DATABASE_URL=…` and `TURSO_AUTH_TOKEN=…`
5. Before going live, create **`mka-prod`** the same way. Its URL/token go only into Vercel **Production** env.

## §2 Commands you run (AIs never run these)
| When | Command |
|---|---|
| After pulling new work / new packages | `pnpm install` |
| A step's Done-notes say "migration added" | `pnpm db:migrate` |
| Once after B04 (re-run any time to restore demo content) | `pnpm db:seed` |
| Look at the data in a browser UI | `pnpm db:studio` |
| Manual QA | `pnpm dev` → http://localhost:3000 and http://localhost:3000/admin |
| Before every deploy | `pnpm build` |

Migrating the **production** DB (PowerShell, one time per new migration):
```powershell
$env:TURSO_DATABASE_URL="libsql://mka-prod-…"; $env:TURSO_AUTH_TOKEN="…"; pnpm db:migrate
```
(The scripts read `.env.local` only when these variables are not already set.)

## §3 Cloudflare — R2 storage (before B13 QA), Turnstile (before B11 QA), Browser Rendering (before B30 QA)
**R2**
1. dash.cloudflare.com → R2 Object Storage → enable (Cloudflare may ask for a card; the free tier covers ~10 GB storage and egress is free).
2. Create buckets **`mka-media`** (public files) and **`mka-private`** (palm photos, PDFs).
3. `mka-media` → Settings → Public access → enable the **r2.dev** URL for development → copy `https://pub-….r2.dev`.
   For production connect a custom domain `media.sadhakpawanpandey.com` (the domain's DNS must be on Cloudflare) and use that URL instead.
4. Both buckets → Settings → CORS policy (add every origin you test from):
   ```json
   [{ "AllowedOrigins": ["http://localhost:3000", "https://sadhakpawanpandey.com", "https://<your-project>.vercel.app"],
      "AllowedMethods": ["PUT", "GET", "HEAD"], "AllowedHeaders": ["content-type"], "MaxAgeSeconds": 3600 }]
   ```
5. R2 → Manage API tokens → Create → "Object Read & Write" on both buckets. Copy Access Key ID, Secret Access Key and your Account ID.
6. `.env.local`: `CF_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_PUBLIC=mka-media`, `R2_BUCKET_PRIVATE=mka-private`, `NEXT_PUBLIC_MEDIA_URL=https://pub-….r2.dev`

**Turnstile (bot check)**
1. Cloudflare → Turnstile → Add widget → hostnames: `localhost`, `sadhakpawanpandey.com`, your `*.vercel.app` domain → mode **Managed**.
2. `.env.local`: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
3. Local testing may use Cloudflare's always-pass test keys: site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

**Browser Rendering (Kundali PDF)**
1. Cloudflare → My Profile → API Tokens → Create custom token → Account permission **Browser Rendering: Edit**.
2. `.env.local`: `CF_BROWSER_TOKEN=…` (uses the same `CF_ACCOUNT_ID`). The free allowance is small daily browser time; one report takes a few seconds.

## §4 Resend email (before B11 QA; optional in dev)
1. resend.com → sign up → API Keys → create → `RESEND_API_KEY`.
2. Domains → add `sadhakpawanpandey.com` → add the shown DNS records (SPF, DKIM; DMARC recommended) at the domain's DNS → Verify.
3. `.env.local`: `EMAIL_FROM="Maa Kali Astuti <care@sadhakpawanpandey.com>"`, optional `EMAIL_REPLY_TO=care@sadhakpawanpandey.com`.
4. Until the domain is verified Resend delivers only to your own account email — enough for QA. Without `RESEND_API_KEY`, `pnpm dev` prints OTP codes in the terminal instead.

## §5 Razorpay (before B18 QA)
1. dashboard.razorpay.com → sign up with the client's business. **Test mode** works at once.
2. Settings → API Keys → Generate **test** key → `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.
3. Settings → Webhooks → Add: URL `https://<deployed-domain>/api/webhooks/razorpay`, a random secret → `RAZORPAY_WEBHOOK_SECRET`; events: `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, `refund.failed`, `payment_link.paid`.
   Webhooks can't reach localhost; local payments still complete through the browser confirmation. Test webhooks on a Vercel preview.
4. Settings → Payment capture → **Automatic**.
5. Live mode after KYC: live keys + a live webhook, only in Vercel **Production** env.

## §6 Vercel (before the first deploy; cron before B41 QA)
1. Project → Settings → Environment Variables: every variable from `.env.example`.
   **Production** = prod DB, live keys, `APP_URL=https://sadhakpawanpandey.com`. **Preview** = dev DB, test keys, your preview URL.
2. Settings → Functions → Region → **Mumbai (bom1)**.
3. `CRON_SECRET` = a random string. Vercel Cron sends it automatically (`Authorization: Bearer …`).
4. Optional 15-minute reminders: cron-job.org → new job every 15 min → `https://<domain>/api/cron/frequent` → header `Authorization: Bearer <CRON_SECRET>`.
5. **Plan:** Vercel Hobby (free) is for non-commercial use. Move to Pro before taking real payments; the code works on both.

## §7 Optional providers (only when you start an O-step)
MSG91 (SMS/WhatsApp OTP, needs DLT registration) · WhatsApp Cloud API (Meta business verification) · Google OAuth client · Shiprocket.

## §8 Backups
- Turso keeps point-in-time restore (check the retention of your plan).
- Manual dump with the Turso CLI (Windows via WSL): `turso db shell mka-prod .dump > backup.sql`.

## §9 Variables
| Variable | Public | Section | Needed from |
|---|---|---|---|
| `APP_URL` | no | §0 / §6 | B01 |
| `AUTH_SECRET` | no | §0 | B01 |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | no | §1 | B01 |
| `SEED_OWNER_EMAIL`, `SEED_OWNER_NAME` | no | your own email + name | B04 |
| `CF_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_PUBLIC`, `R2_BUCKET_PRIVATE` | no | §3 | B10 |
| `NEXT_PUBLIC_MEDIA_URL` | yes | §3 | B10 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | yes | §3 | B09 |
| `TURNSTILE_SECRET_KEY` | no | §3 | B09 |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | no | §4 | B09 |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | no | §5 | B18 |
| `CF_BROWSER_TOKEN` | no | §3 | B30 |
| `CRON_SECRET` | no | §6 | B41 |
