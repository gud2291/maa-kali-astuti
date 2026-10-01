# CLIENT DEMO — Maa Kali Astuti

Frontend demo of sadhakpawanpandey.com (phase F). Every page is built 1:1 from `design/`.
There is no backend yet: payments, bookings, forms and the cart are mocks that run in the browser.

## Run locally
Requirements: Node 20+ and pnpm 10 (`corepack enable`).

```bash
pnpm install          # pause OneDrive sync while this runs
pnpm dev              # http://localhost:3000   (Hindi: http://localhost:3000/hi)
pnpm build && pnpm start   # production check before a demo
```

No environment variables are needed for the demo.

## Deploy a Vercel preview (free plan)
1. Push the repo to a private GitHub repo. Only the owner does this; the build agent never pushes.
2. In Vercel: **Add New → Project**, import the repo. The framework is detected as Next.js and the install command as `pnpm install`. Keep the defaults.
3. Deploy. Every later push to a branch gets its own preview URL. Share the preview URL with the client, not the production domain.
4. Optional: Settings → Deployment Protection → keep Vercel Authentication on, so only invited people can open previews.
5. The domain `sadhakpawanpandey.com` is connected only at launch (phase B).

## What to show the client
| Route | What it demonstrates |
|---|---|
| `/` | Home: hero slider, bestsellers, 12 Nag spotlight, rashifal wheel, tools, courses, videos, FAQ |
| `/shop`, `/shop/rudraksha-malas` | Catalogue, filters, sort, quick add, cart drawer |
| `/consultations`, `/consultations/kundali-reading` | Services, tiers, sample report pages, inquiry form |
| `/book/kundali-reading?tier=premium` | 4-step booking with the mock payment |
| `/kundali-99` | Kundali generator → preview → ₹99 pay sheet (`?demo=preview`, `?demo=success`, `?pay=fail` for quick states) |
| `/love-calculator` | Name compatibility tool |
| `/rashifal`, `/rashifal/mesha?p=week` | Rashifal hub and rashi detail |
| `/sadhana-courses`, `/sadhana-courses/kali-sadhana`, `/rituals` | Courses, course detail, rituals + inquiry |
| `/about`, `/videos` | Founder story, discourses, Shorts viewer |
| `/hi/...` | Hindi version of every route |
| `/anything-else` | Branded 404 |

Cart, checkout, wishlist, account, track order, blog, contact, FAQ page and policies are **coming-soon pages**: the design has no screens for them yet.

## Demo behaviour to mention
- The first visit is seeded with 2 cart items, 3 wishlist items and 2 recent searches (`DEMO_SEED` in `src/lib/core/commerce.ts`). Turn this off before launch.
- Videos play a design preview until the real YouTube IDs are added to `YT_IDS` in `src/lib/site.ts`.
- Rashifal and Kundali calculations are demo-grade (template sentences, approximate planets). Real data and ephemeris come in phase B.
- WhatsApp buttons open the placeholder number +91 90000 12345.

## Client-confirm list
The full, current list lives in `PROGRESS.md` → **Client-confirm list**. In short, we need from the client:
- **Brand assets:** original logo file (without the watermark), a simple favicon mark, a portrait of Sadhak Ji, real product photos.
- **Contact:** WhatsApp number, phone, email, hours, and the social profile URLs (YouTube, Instagram, Facebook, WhatsApp channel).
- **Prices and offers:** products, consultations (tiers and durations), courses and instalments, rituals, shipping and COD fees, coupons.
- **Claims and numbers:** stats (years, seekers, rituals), ratings, testimonials, book titles, timeline years, buyer's-note claims (sourcing, lab tests, energization).
- **Content:** real video and Shorts IDs, subscriber count, rashifal authoring, gemstone and remedy mappings, and copy for the policy, FAQ, contact and blog pages.
- **Hindi review:** most Hindi UI copy outside Home and the site chrome was written by us and needs a native review (`[HI review]` items).
- **Design gaps:** booking order summary between 768 and 1023px; whether English-only Home sections should be translated on `/hi`.
