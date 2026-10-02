# B33 — Content managers: videos, testimonials, FAQs, courses, rituals
**Risk:** M · **Needs:** B32 · **Agent:** any · **User setup before QA:** none

## Goal
The team edits all page content from the admin: add a YouTube video by pasting its link, manage testimonials (text/video/photo), FAQ sets, the six courses, and the rituals list — with drag-to-reorder, EN/HI fields and instant storefront updates. Real YouTube ids play on the site.

## Read first (only these)
- `docs/backend/RULES.md` §2, §4, §6, §7
- `docs/backend/DATA-MODEL.md` §B (`CourseContent`), §E, §I (`videos`, `courses`)
- `src/server/videos/queries.ts`, `src/server/testimonials/queries.ts`, `src/server/faqs/queries.ts`, `src/server/courses/queries.ts`, `src/server/rituals/queries.ts`, `src/server/settings/admin.ts` (`writeSetting`)
- `src/lib/api/content.ts` (video/course mapping), `src/lib/site.ts` (`YT_IDS`, `ytEmbed`)
- `grep -rn "YT_IDS\|ytEmbed" src` and `grep -rn "50,000\|50000\|16,667" src messages` — read those lines
- `src/components/admin/products/ImageManager.tsx`, `LocListEditor.tsx` (props), `src/components/admin/nav.ts`, admin kit file list, `src/components/icons/Icon.tsx` (`IconName`)

## Install
None.

## Files
Create:
- `src/lib/validation/content.ts`
- `src/server/videos/admin.ts`, `admin-actions.ts`, `src/server/testimonials/admin.ts`, `admin-actions.ts`, `src/server/faqs/admin.ts`, `admin-actions.ts`, `src/server/courses/admin.ts`, `admin-actions.ts`, `src/server/rituals/admin.ts`, `admin-actions.ts`
- `src/app/admin/(panel)/content/videos/page.tsx`, `content/testimonials/page.tsx`, `content/faqs/page.tsx`, `content/courses/page.tsx`, `content/courses/[key]/page.tsx`, `content/rituals/page.tsx`
- `src/components/admin/content/SortableList.tsx`, `VideoForm.tsx`, `VideoCategories.tsx`, `TestimonialForm.tsx`, `FaqForm.tsx`, `CourseForm.tsx`, `RitualForm.tsx`, `IconPicker.tsx`
Modify: every file from the `YT_IDS` grep (prefer the video's `yt` id), every file from the fee grep (fee from course `fee_inr ?? settings.courses.feeInr`, instalments from settings), `src/components/admin/nav.ts` (Content group: Videos `video`, Testimonials `star`, FAQs `question`, Courses `yantra`, Rituals `diya`; perm `content.edit`)

## Tasks
- [x] T1. `validation/content.ts`: `videoSchema` (kind, youtubeId `^[\w-]{11}$` or null, category key, titles EN/HI ≤ 140, descriptions ≤ 1000, duration `^\d{1,2}:\d{2}(:\d{2})?$`, published date, featured, visible), `videoCategoriesSchema`, `testimonialSchema` (kind, quote EN/HI 10–600, name, city, tag, rating 1–5 or null, youtubeId, mediaId, featured, visible), `faqSchema` (set, q/a EN/HI), `courseSchema` (names, deity, days 1–120, content Loc fields ≤ 2000, attain ≤ 8, fee or null, visible), `ritualSchema` (icon ∈ `IconName`, names, lines), `reorderSchema` (ids ≤ 200). — antigravity
- [x] T2. `videos/admin.ts`: `listVideosAdmin(kind)`, `createVideo`, `updateVideo`, `deleteVideo`, `reorderVideos(kind, ids)`, `updateVideoCategories(list)` (`writeSetting("videos", …)`), and `youtubeLookup(urlOrId)` → parses watch/youtu.be/shorts/embed URLs to the 11-char id, then `https://www.youtube.com/oembed?url=…&format=json` (5 s timeout) → `{ youtubeId, title, thumbnail }` (title optional on failure). Other domains: `list…`, `create…`, `update…`, `delete…`, `reorder…` for testimonials, FAQs (per set), rituals; courses: `listCoursesAdmin`, `updateCourse(key, input)` (fixed keys, no create/delete). Every export `requireAdmin("content.edit")` + audit. — antigravity
- [x] T3. `admin-actions.ts` per domain: `invalidate(TAG.videos | TAG.testimonials | TAG.faqs | TAG.courses | TAG.rituals)`; video categories also `TAG.settings`. — antigravity
- [x] T4. `SortableList` (client, dnd-kit vertical list: drag handle `drag` icon + Move up/down buttons for keyboard/touch; `onReorder(ids)` → action, optimistic order with rollback on error). — antigravity
- [x] T5. `/admin/content/videos`: tabs Videos | Shorts; "Add video" → paste link → `youtubeLookup` prefill → `VideoForm` (sheet); list with thumbnail (`i.ytimg.com/vi/<id>/mqdefault.jpg`, else placeholder icon), featured/visible badges; `VideoCategories` editor. — antigravity
- [x] T6. `/admin/content/testimonials` (list + `TestimonialForm`; photo via single `ImageManager` purpose `testimonial`), `/admin/content/faqs` (set tabs, list + `FaqForm`), `/admin/content/rituals` (list + `RitualForm` with `IconPicker`), `/admin/content/courses` (6 cards) + `/admin/content/courses/[key]` (`CourseForm` with `LocaleTabs`, `LocListEditor` for attain). — antigravity
- [x] T7. Storefront: video players/thumbnails use `video.yt` when present (`ytEmbed(yt)`, thumbnail `https://i.ytimg.com/vi/<yt>/hqdefault.jpg`), else the current design preview; `YT_IDS` stays only as a fallback. Course fee/instalment texts come from data/settings (same formatting). — antigravity
- [x] T8. `nav.ts` items. — antigravity
- [x] T9. Finish per AGENTS.md §1 step 8. — antigravity

## Must not
- No home/hero/announcement/contact work (B34). No new course or category keys.

## Done-notes
- Created validation schemas in `src/lib/validation/content.ts` for videos, categories, testimonials, FAQs, courses, rituals, reorder.
- Implemented admin services (`admin.ts`) and server actions (`admin-actions.ts`) with `content.edit` permission checks and audit logs across videos, testimonials, FAQs, courses, rituals.
- Implemented `SortableList` with @dnd-kit vertical drag-and-drop and keyboard/touch up/down controls with optimistic rollback.
- Built Admin UI panels: `/admin/content/videos` (Videos & Shorts tabs, YouTube auto-lookup, categories editor), `/admin/content/testimonials` (single photo upload via ImageManager), `/admin/content/faqs` (set tabs), `/admin/content/rituals` (IconPicker), and `/admin/content/courses` (6 cards + `/admin/content/courses/[key]` with LocaleTabs and LocListEditor).
- Updated storefront video players/cards on home and `/videos` to prefer `video.yt` for player/thumbnails, keeping design previews as fallback.
- Updated course fee and instalment texts on course pages to dynamically format from course `fee_inr ?? settings.courses.feeInr` and settings instalments.
- Added "Content" group items (Videos, Testimonials, FAQs, Courses, Rituals) to `src/components/admin/nav.ts`.
- Migration added: no.

## Manual QA (user)
1. Videos → paste a real YouTube link → title auto-fills → save → `/videos` and the home video section show it and it plays. Reorder → order changes on the site.
2. Testimonials: add a photo testimonial; FAQs: add one to "home" → home FAQ shows it.
3. Courses: add Hindi essence for Kali Sadhana → `/hi/sadhana-courses/kali-sadhana` shows Hindi. Change the course fee in Settings → Offers → course pages show it.
4. Rituals: add one with an icon → `/rituals` shows it.
5. `pnpm build` passes.
