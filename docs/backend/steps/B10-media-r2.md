# B10 — Media uploads (Cloudflare R2)
**Risk:** M · **Needs:** B09 · **Agent:** any · **User setup before QA:** USER-SETUP §3 (R2) — tested for real in B13

## Goal
The complete upload pipeline: the browser resizes and encodes images, uploads straight to R2 with presigned URLs, the server confirms every file, and pages render uploads with `MediaImg`. Product cards/pages show uploaded photos when a product has them.

## Read first (only these)
- `docs/backend/RULES.md` §2, §5
- `docs/backend/ARCHITECTURE.md` §8
- `docs/backend/DATA-MODEL.md` §B (`MediaVariant`), §C (`media`), §D (`product_media`)
- `src/server/media/refs.ts`, `src/server/rate-limit.ts`, `src/server/request.ts`, `src/server/ids.ts`, `src/server/env.ts`, `src/server/auth/guards.ts`
- `src/lib/domain/media.ts`, `src/components/commerce/ProductImage.tsx`

## Install
```
pnpm add aws4fetch@^1.0.20
```

## Files
Create: `src/server/storage/r2.ts`, `src/server/media/service.ts`, `src/server/media/actions.ts`, `src/lib/validation/media.ts`, `src/lib/media/prepare-image.ts`, `src/components/media/MediaImg.tsx`, `src/components/media/useUpload.ts`
Modify: `src/components/commerce/ProductImage.tsx`

## Tasks
- [ ] T1. `src/server/storage/r2.ts` exactly per ARCH §8 (`AwsClient` from `aws4fetch` with `service: "s3", region: "auto"`; path-style endpoint; keys URL-encoded per segment). `presignPut` signs with `{ aws: { signQuery: true, allHeaders: true } }` and headers `content-type` + `content-length`, `X-Amz-Expires` = expiresSec. `presignGet({ key, expiresSec = 600, filename? })` (adds `response-content-disposition` when filename given). `headObject` → `{ size, contentType } | null` (404 → null). `putObject`, `deleteObject` (404 ok). Every request 8 s timeout. Not configured → `AppError("NOT_CONFIGURED")`.
- [ ] T2. `src/lib/validation/media.ts`: `UPLOAD_PURPOSES` = public purposes `product category banner article testimonial setting`, customer purposes `palm review`, admin private `report`; `createUploadSchema` `{ purpose, files: 1–3 × { w: int 1–4000, type: "image/webp" | "image/jpeg" | "application/pdf", size: int 1–10 485 760 }, width?, height?, blur?: string ≤ 600 }`; `confirmUploadSchema` `{ mediaId: int }`.
- [ ] T3. `src/server/media/service.ts`:
  - `createUpload(input, actor: { userId: number | null }): Promise<{ mediaId: number; uploads: { w: number; url: string; type: string }[]; claimKey: string | null }>` — bucket/kind/limits from purpose (images ≤ 2 MB each; `report` PDF ≤ 10 MB, private); keys per ARCH §8; inserts the `pending` row with variants; customer purposes get `claimKey = randomToken(24)` and `claim_hash`.
  - `confirmUpload(mediaId: number, actor: { userId: number | null; admin: boolean }): Promise<{ id: number; ref: MediaRef | null }>` — row must be `pending` and (admin purposes) uploaded by an admin / (customer purposes) have a `claim_hash`; `headObject` every variant (exists, size ≤ limit, content-type equals declared); any failure → delete objects + row → `UPLOAD_INVALID`; else `ready`; public → `toMediaRef`, private → `ref: null`.
  - `attachMedia(ids: number[], owner: { type: string; id: string }): Promise<void>` (admin flows), `claimMedia(items: { mediaId: number; claimKey: string }[], owner): Promise<number[]>` (verifies `sha256Hex(claimKey)` with `safeEqualHex`, status `ready`, unowned; sets owner, clears `claim_hash`; returns ids; any mismatch → `UPLOAD_INVALID`), `deleteMedia(id: number): Promise<void>` (deletes `product_media` links, the objects and the row), `signedPrivateUrl(mediaId: number, filename?: string): Promise<string>` (private media only).
- [ ] T4. `src/server/media/actions.ts` (`"use server"`): `createUploadAction(input)` — admin/private-admin purposes → `requireAdmin("media.upload")`; customer purposes → `rateLimit("upload:ip", ip, 20, 3600)`; `confirmUploadAction(input)` — same guard split. Both wrapped in `runAction`.
- [ ] T5. `src/lib/media/prepare-image.ts` (browser only): `prepareImage(file: File, preset: "public" | "review" | "palm"): Promise<{ files: { w: number; h: number; blob: Blob; type: string }[]; width: number; height: number; blur: string | null }>` — reject non-images or > 15 MB (`Error("UPLOAD_INVALID")`); `createImageBitmap(file, { imageOrientation: "from-image" })`; widths: public 480/960/1600, review 480/960 (never upscale; drop duplicates); palm = one file, longest side ≤ 2000; encode WebP 0.82 (fallback JPEG 0.85 when the browser returns another type); palm always JPEG 0.85; `blur` = 16-px-wide WebP data URL (null if > 600 chars). Use `OffscreenCanvas` when available, else a canvas element.
- [ ] T6. `src/components/media/useUpload.ts` (client hook): `useUpload(purpose)` → `{ state: { status: "idle" | "preparing" | "uploading" | "confirming" | "done" | "error"; progress: number; error: ErrorCode | null }; upload(file: File): Promise<{ mediaId: number; media: MediaRef | null; claimKey: string | null } | null>; reset() }`. PDFs (purpose `report`) skip `prepareImage`. Uploads use `XMLHttpRequest` PUT (progress events, header `content-type`), all files in parallel.
- [ ] T7. `src/components/media/MediaImg.tsx` (server-compatible, no hooks): props `{ media: MediaRef; sizes: string; alt: string; className?: string; priority?: boolean; fill?: boolean }` → plain `<img>` with `src`, `srcSet`, `sizes`, `width`/`height`, `loading` (`eager` when priority), `fetchPriority="high"` when priority, `decoding="async"`, blur as `background-image` (cover), `fill` → `absolute inset-0 size-full object-cover`. Keep the `@next/next/no-img-element` disable comment like `ProductImage`.
- [ ] T8. `ProductImage.tsx`: when `p.images?.length` → `main` = `images[0]`, `alt` slot = `images[1] ?? images[0]`, `detail` = `images[0]`, rendered with `MediaImg` (same `sizes`, `priority`, `className`, `fill`); otherwise the current behaviour unchanged.
- [ ] T9. Finish per AGENTS.md §1 step 8.

## Must not
- No admin screens (B13 builds the image manager). No `next/image` for R2 media. No server-side image processing.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
Nothing new is visible yet (no product has uploads). Check `pnpm dev` and `pnpm build`. Real upload QA happens in B13 after you finish USER-SETUP §3.
