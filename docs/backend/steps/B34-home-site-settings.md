# B34 — Home & site settings (hero, sections, announcement, contact/social on the site)
**Risk:** M · **Needs:** B33 · **Agent:** any · **User setup before QA:** none

## Goal
The admin controls the home page (show/hide sections, edit the 3 hero slides with images, announcement-bar messages), and the whole storefront uses the contact/social settings (WhatsApp number, phone, email, social links) instead of hard-coded constants.

## Read first (only these)
- `docs/backend/RULES.md` §4–§6
- `docs/backend/DATA-MODEL.md` §B (`HeroSlideText`), §I (`home`, `announcement`, `contact`, `social`)
- `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/components/sections/home/Hero.tsx`, `HeroSlides.tsx`, `src/components/layout/AnnouncementBar.tsx`, `src/lib/site.ts`, `src/lib/core/commerce.ts`
- `grep -rn "waLink(\|WHATSAPP_DISPLAY\|WHATSAPP_NUMBER\|PHONE_TEL\|\bEMAIL\b\|SOCIAL" src` — read those lines
- `src/lib/validation/settings.ts`, `src/server/settings/admin.ts`, `src/components/admin/products/ImageManager.tsx` (props), `src/components/admin/nav.ts`
- `messages/en.json` → `home.hero`, `chrome.ann`

## Install
None.

## Files
Create:
- `src/server/home/admin.ts`, `src/server/home/admin-actions.ts`
- `src/app/admin/(panel)/content/home/page.tsx`, `src/components/admin/home/SectionToggles.tsx`, `HeroSlidesForm.tsx`, `AnnouncementForm.tsx`
- `src/components/layout/SiteSettingsProvider.tsx`, `src/components/sections/home/em.tsx`
Modify: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `Hero.tsx`, `HeroSlides.tsx`, `AnnouncementBar.tsx`, `src/lib/core/commerce.ts` (`waLinkTo`), `src/lib/site.ts` (constants become documented fallbacks), every file from the grep, `src/components/admin/nav.ts` (+ Home `home`, Content, `content.edit`)

## Tasks
- [ ] T1. `home/admin.ts` (`content.edit`; audit): `getHomeAdmin()`, `updateSections(map)`, `updateHero(slides | null)` (null = back to the default texts), `updateAnnouncement(items | null)` — all through `writeSetting`. `admin-actions.ts` → `invalidate(TAG.settings)`.
- [ ] T2. `/admin/content/home`: tabs **Sections** (17 switches with readable names, in page order), **Hero** (3 slide cards: eyebrow, line 1, line 2 (`<em>word</em>` marks the gold italic word — show this hint), Hindi sub-line, body, CTA labels; EN/HI tabs; optional image via single `ImageManager` purpose `banner`; "Reset to default"), **Announcement** (1–5 items, text EN/HI + optional link; "Reset to default").
- [ ] T3. `SiteSettingsProvider` (client context `{ contact, social, announcement }`) + `useSiteSettings()`. `[locale]/layout.tsx` loads the three settings with `getSetting` and wraps the app with the provider.
- [ ] T4. `commerce.ts`: `waLinkTo(number: string, text?: string)`; `waLink` keeps working as the fallback. Every grep hit switches: client components → `useSiteSettings()`; server components → `getSetting("contact" | "social")`. Social icons with a URL open it (`rel="noopener noreferrer"`); null keeps today's "coming soon" toast.
- [ ] T5. `AnnouncementBar`: settings items (via `loc`) when not null, else the `chrome.ann` messages; same rotation/motion rules.
- [ ] T6. Home page: render a section only when `getSetting("home").sections[key]` is true (keys = `HOME_SECTIONS`, mapped to the existing section components in order).
- [ ] T7. `Hero`/`HeroSlides`: optional `slides` prop (server-localised strings + optional `MediaRef`); when present they replace the message texts and the slide image (`MediaImg`, same box and `priority` rules); `em.tsx` `renderEm(text)` turns `<em>…</em>` into `<em>` elements (no HTML parsing, no `dangerouslySetInnerHTML`).
- [ ] T8. `nav.ts` item.
- [ ] T9. Finish per AGENTS.md §1 step 8.

## Must not
- Must not change hero motion/layout or section markup. Must not remove the message defaults.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. Admin → Home → hide "Journal" → home no longer shows it; show it again.
2. Edit hero slide 2 (EN + HI) with a new image → home slider shows it on `/` and `/hi`; "Reset to default" restores the original.
3. Announcement: set 2 messages → the top bar rotates them.
4. Settings → Contact: new WhatsApp number → the floating button, footer, product and contact links use it; add an Instagram URL → the footer icon opens it.
5. `pnpm build` passes.
