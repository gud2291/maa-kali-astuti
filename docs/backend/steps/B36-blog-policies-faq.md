# B36 — Blog, policies, FAQ page, rich-text editor
**Risk:** M · **Needs:** B35 · **Agent:** any · **User setup before QA:** none

## Goal
A safe rich-text editor in admin (Tiptap → JSON) and a safe renderer on the site (no HTML injection). Admins write blog articles (EN/HI, cover, FAQ block, products mentioned, SEO) and the 5 policy pages. The site gets `/blog`, `/blog/[slug]`, `/policies/[slug]` and a full `/faq` page — all static and theme-built.

## Read first (only these)
- `docs/backend/RULES.md` §2, §4–§6, §9 (forbidden list)
- `docs/backend/DATA-MODEL.md` §B (`RichDoc`, `RichNode`), §E (`articles`, `pages`, `faqs`)
- `design-brief/DESIGN-BRIEF.md` lines 615–634 (§7.17 blog, §7.18 FAQ/policies)
- `src/app/[locale]/blog/page.tsx`, `src/app/[locale]/policies/[slug]/page.tsx`, `src/app/[locale]/faq/page.tsx`, `src/lib/routes.ts` (`POLICIES`)
- `src/server/articles/queries.ts`, `src/server/faqs/queries.ts`, `src/lib/domain/labels.ts`, `src/components/ui/FaqList.tsx`, `src/components/commerce/ProductCard.tsx` (props), `src/components/media/useUpload.ts`
- `src/components/admin/nav.ts`, admin kit file list

## Install
```
pnpm add @tiptap/react@^3.31.4 @tiptap/pm@^3.31.4 @tiptap/starter-kit@^3.31.4 @tiptap/extension-image@^3.31.4
```

## Files
Create:
- `src/lib/validation/rich.ts`, `src/lib/validation/article.ts`, `src/lib/validation/page.ts`
- `src/components/content/RichText.tsx`, `src/components/content/Toc.tsx`
- `src/components/admin/editor/RichEditor.tsx`, `src/components/admin/editor/LinkDialog.tsx`
- `src/server/articles/admin.ts`, `src/server/articles/admin-actions.ts`, `src/server/pages/queries.ts`, `src/server/pages/admin.ts`, `src/server/pages/admin-actions.ts`
- `src/app/admin/(panel)/content/blog/page.tsx`, `content/blog/new/page.tsx`, `content/blog/[id]/page.tsx`, `content/pages/page.tsx`, `content/pages/[slug]/page.tsx`, `src/components/admin/blog/ArticleForm.tsx`, `src/components/admin/pages/PageForm.tsx`
- `src/app/[locale]/blog/[slug]/page.tsx`, `src/components/sections/blog/BlogList.tsx`, `ArticleView.tsx`, `ProductsMentioned.tsx`, `src/components/sections/policies/PolicyView.tsx`, `src/components/sections/faq/FaqPageView.tsx`
Modify: `src/server/articles/queries.ts` (list + by slug), `src/app/[locale]/blog/page.tsx`, `policies/[slug]/page.tsx`, `faq/page.tsx`, `src/components/admin/nav.ts` (+ Blog `scroll`, Pages `cert`, Content, `content.edit`), `messages/en.json`, `messages/hi.json` (namespaces `blog`, `policies`, `faqPage`)

## Tasks
- [x] T1. `validation/rich.ts`: `richDocSchema(mediaBase: string)` — recursive schema that only allows the `RichNode` types in DM §B; headings level 2–3; marks bold/italic/link; link `href` must be `https://`, `http://`, `mailto:` or start with `/`; image `src` must start with `mediaBase` (server passes `env.NEXT_PUBLIC_MEDIA_URL`; admin forms get it as a prop — no `process.env` in this file); max 2000 nodes. `article.ts` (slug, category, titles ≤ 140, excerpts ≤ 300, bodies, cover media, read mins 1–60, faq ≤ 10 × `{ q, a }` Loc, product ids ≤ 6, status, publishedAt, SEO) and `page.ts` (title, bodies). — antigravity
- [x] T2. `RichText.tsx` (server-compatible): renders the JSON to elements only (`p`, `h2`, `h3`, `ul`, `ol`, `li`, `blockquote`, `hr`, `br`, `img` lazy with alt, `strong`, `em`, `a` — external links `target="_blank" rel="noopener noreferrer"`); unknown nodes skipped; heading ids from slugified text (for the TOC). Reading styles: 680 px measure, `font-display` headings, comfortable line-height, Devanagari rules. — antigravity
- [x] T3. `RichEditor.tsx` (client, loaded with `next/dynamic`): `useEditor({ extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, strike: false, underline: false }), Image], immediatelyRender: false, content: value, onUpdate → onChange(editor.getJSON()) })`; toolbar: H2, H3, bold, italic, link (`LinkDialog`), bullets, numbers, quote, divider, image upload (`useUpload("article")` → insert the 960 variant URL), undo/redo; 44 px buttons, sticky toolbar on mobile. — antigravity
- [x] T4. `articles/admin.ts` (`content.edit`; audit): list (status tabs, category, search, page), get, create (slug unique), update (slug change invalidates old + new), delete, publish/unpublish (`published_at` defaults to now). `admin-actions.ts` → `invalidate(TAG.articles, TAG.article(slug))`. — antigravity
- [x] T5. `pages/queries.ts` (`getPage(slug)` cached `[TAG.pages, TAG.page(slug)]`) + `pages/admin.ts` (list 5, get, update) + actions. — antigravity
- [x] T6. Admin UI: blog list + `ArticleForm` (EN/HI tabs for title/excerpt/body; cover via single `ImageManager` purpose `article`; category; read time; FAQ list; products picker (reuse `RelatedPicker`); SEO; status/date) and pages list + `PageForm`. — antigravity
- [x] T7. `articles/queries.ts`: `getArticleList()` (published, newest first, ≤ 200, JSON-safe) and `getArticleBySlug(slug)` (`[TAG.articles, TAG.article(slug)]`). — antigravity
- [x] T8. `/blog` (static): featured latest article + category chips (client filter via `?c=` with `replaceState`, like the shop) + card grid (cover `MediaImg` or the legacy product art) + "Load more" (client, 12 at a time); empty state. — antigravity
- [x] T9. `/blog/[slug]` (static + `generateStaticParams`, `dynamicParams = true`): `ArticleView` — cover, title/meta, sticky `Toc` (client, active heading) ≥ 1024 px, `RichText` (Hindi body on `/hi` when present), author box (Sadhak Ji), `ProductsMentioned` (compact cards), FAQ block (`FaqList`), share, related (same category). `generateMetadata` from SEO fields. — antigravity
- [x] T10. `/policies/[slug]` (static, 5 slugs from `POLICIES`): `PolicyView` (sidebar list, title, "Last updated", `RichText`; empty body → a short "being updated" line). — antigravity
- [x] T11. `/faq` (static): `FaqPageView` — set tabs (general, shop, consult, kundali99, courses, rituals), client search across questions, `FaqList` accordions. — antigravity
- [x] T12. Messages (EN + HI); nav items. — antigravity
- [x] T13. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- Never render stored HTML or use `dangerouslySetInnerHTML` for content. No starter articles/policy texts (B37).

## Done-notes
- Installed TipTap packages (react, pm, starter-kit, extension-image v3.31.4).
- Validation: richDocSchema with recursive 2000-node limit, articleInputSchema, pageInputSchema.
- Components: RichText (safe element-only renderer), Toc (client sticky active heading tracker).
- Admin Editor: RichEditor (dynamic load, 44px buttons, sticky toolbar, image upload 960 variant), LinkDialog.
- Articles: admin service & actions with content.edit guard & audit; cached getArticleList & getArticleBySlug queries.
- Pages: cached getPage query; admin service & actions for 5 policy pages with upsert & audit.
- Admin UI: Blog list + ArticleForm (EN/HI tabs, ImageManager, RelatedPicker, FAQ editor, SEO) + Pages list + PageForm.
- Storefront: /blog (chips, featured, grid, load more), /blog/[slug] (ArticleView, Toc, ProductsMentioned, FaqList, share), /policies/[slug] (PolicyView), /faq (FaqPageView tabs + client search).
- Nav & i18n: Added Blog (scroll) and Pages (cert) under Content; added blog, policies, faqPage in en.json & hi.json.
- Migration added: no.

## Manual QA (user)
1. Admin → Blog → New: headings, bold, a link, an image from the phone, FAQ, products → Publish → `/blog` and `/blog/<slug>` show it (TOC, products, FAQ), `/hi/blog/<slug>` uses the Hindi body when filled.
2. Paste text with scripts/styles from another site → only clean text survives.
3. Pages → edit "Shipping" → `/policies/shipping` shows it with the date.
4. `/faq`: tabs + search work.
5. `pnpm build` passes.
