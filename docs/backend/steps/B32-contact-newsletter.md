# B32 — Contact page, newsletter, admin inbox & subscribers
**Risk:** L · **Needs:** B31 · **Agent:** any · **User setup before QA:** Turnstile test keys or none (dev)

## Goal
A real `/contact` page (form + contact cards from settings), working newsletter sign-ups (footer + home band) with unsubscribe, and admin screens for messages and subscribers.

## Read first (only these)
- `docs/backend/RULES.md` §2, §6, §8
- `design-brief/DESIGN-BRIEF.md` lines 626–634 (§7.18 contact)
- `docs/backend/DATA-MODEL.md` §H (`messages`, `subscribers`)
- `src/app/[locale]/contact/page.tsx`, `src/components/layout/FooterClient.tsx`, `src/components/sections/home/NewsletterBand.tsx`, `src/components/layout/SiteFooter.tsx` (newsletter part only)
- `src/components/auth/TurnstileWidget.tsx`, `src/server/settings/queries.ts`, `src/server/email/components.tsx`, `src/components/admin/nav.ts`

## Install
None.

## Files
Create:
- `src/lib/validation/contact.ts`, `src/lib/validation/newsletter.ts`
- `src/server/messages/service.ts`, `src/server/messages/actions.ts`, `src/server/messages/admin.ts`, `src/server/messages/admin-actions.ts`, `src/server/email/templates/ContactAlertEmail.tsx`
- `src/components/sections/contact/ContactForm.tsx`, `ContactCards.tsx`, `src/components/forms/NewsletterForm.tsx`
- `src/app/[locale]/newsletter/unsubscribe/page.tsx`, `src/components/sections/contact/UnsubscribeConfirm.tsx`
- `src/app/admin/(panel)/messages/page.tsx`, `subscribers/page.tsx`, `src/components/admin/messages/MessageList.tsx`
Modify: `src/app/[locale]/contact/page.tsx`, `FooterClient.tsx` and `NewsletterBand.tsx` (use `NewsletterForm`, same look), `src/components/admin/nav.ts` (+ Messages `mail`, Subscribers `bell`, group "Leads", `messages.view`), `messages/en.json`, `messages/hi.json` (namespaces `contact`, `newsletter`)

## Tasks
- [x] T1. Schemas: contact (name 2–80, phone optional `^[6-9]\d{9}$`, email optional — at least one required, topic ∈ `MESSAGE_TOPICS`, body 10–2000, locale, turnstileToken); newsletter (email ≤ 120, locale, source ∈ footer/home/checkout/account, turnstileToken). — antigravity
- [x] T2. `messages/service.ts`: `createMessage`, `subscribe(email, locale, source)` (insert with `unsub_token = randomToken(24)`; existing → status `subscribed`, `unsubscribed_at = null`), `unsubscribe(token)`. — antigravity
- [x] T3. `messages/actions.ts`: `submitContactAction` (Turnstile, `rateLimit("contact:ip", ip, 5, 3600)`, `after()` admin alert), `subscribeAction` (Turnstile, `rateLimit("newsletter:ip", ip, 5, 3600)`), `unsubscribeAction({ token })`. — antigravity
- [x] T4. `/contact` (static): heading, `ContactForm` (fields + topic select + Turnstile + success state) and `ContactCards` (WhatsApp, call, email, hours from `getSetting("contact")`; links with `rel="noopener noreferrer"`); metadata. — antigravity
- [x] T5. `NewsletterForm` (client): email + subscribe; mounts `TurnstileWidget` only after the input is focused (keeps pages light); states idle/pending/done/error; used by the footer and the home band with their existing styles. — antigravity
- [x] T6. `/newsletter/unsubscribe?t=` (dynamic, noindex) → `UnsubscribeConfirm` (button → `unsubscribeAction`; never unsubscribes on page load). — antigravity
- [x] T7. `messages/admin.ts` (`messages.view`; audit writes): `listMessages({ status, page })`, `setMessageStatus(id, status)`, `listSubscribers({ search, status, page })`, `countSubscribers()`, `exportSubscribersCsv()` (`exports.run`, CSV-injection safe), `deleteSubscriber(id)`. `admin-actions.ts` wraps them. — antigravity
- [x] T8. `/admin/messages` (`MessageList`: tabs new/replied/closed, expandable message, reply by email (`mailto:` with subject), WhatsApp when phone, mark replied/closed) and `/admin/subscribers` (count, search, status filter, export, delete with confirm). — antigravity
- [x] T9. Messages (EN + HI) for the new pages/states; nav items. — antigravity
- [x] T10. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No mailing-list provider integration (export CSV is enough for v1). No map embed.

## Done-notes
- Created: `src/lib/validation/contact.ts`, `src/lib/validation/newsletter.ts` (Zod schemas)
- Created: `src/server/messages/service.ts` (createMessage, subscribe, unsubscribe)
- Created: `src/server/messages/actions.ts` (submitContactAction, subscribeAction, unsubscribeAction — Turnstile + rate-limit + after() admin alert)
- Created: `src/server/email/templates/ContactAlertEmail.tsx` (admin notification email)
- Created: `src/components/sections/contact/ContactForm.tsx`, `ContactCards.tsx` (async server), `UnsubscribeConfirm.tsx`
- Created: `src/components/forms/NewsletterForm.tsx` (shared; lazy Turnstile mount on focus)
- Modified: `src/app/[locale]/contact/page.tsx` (replaced coming-soon with real page + metadata)
- Modified: `FooterClient.tsx` + `NewsletterBand.tsx` → now use shared `NewsletterForm`
- Created: `src/app/[locale]/newsletter/unsubscribe/page.tsx` (dynamic, noindex)
- Created: `src/server/messages/admin.ts`, `admin-actions.ts` (list/status/count/export/delete with audit)
- Created: `/admin/messages/page.tsx`, `/admin/subscribers/page.tsx`, `MessageList.tsx`, `SubscriberActions.tsx`
- Modified: `nav.ts` (+Messages mail, +Subscribers bell, Leads group), `en.json` + `hi.json` (+contact, +newsletter namespaces)
- Migration: no (tables already exist from B06)

## Manual QA (user)
1. `/contact` (EN + `/hi`): send a message → success; admin email arrives; `/admin/messages` shows it; mark replied.
2. Footer and home newsletter: subscribe → success; the same email again → still success (no duplicate row).
3. `/newsletter/unsubscribe?t=<token from studio>` → confirm → status unsubscribed.
4. `/admin/subscribers` → export CSV.
5. `pnpm build` passes.
