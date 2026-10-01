# B13 — Admin: products & categories
**Risk:** M · **Needs:** B12 · **Agent:** any · **User setup before QA:** USER-SETUP §3 (R2)

## Goal
The team can add, edit, photograph (from a phone camera), reorder, price, stock, archive and delete products, and edit category texts — and the storefront updates right after saving.

## Read first (only these)
- `docs/backend/RULES.md` §2–§7
- `docs/backend/ARCHITECTURE.md` §3, §4 (tags), §8
- `docs/backend/DATA-MODEL.md` §B (`ProductContent`), §D
- `src/server/catalog/queries.ts`, `src/server/catalog/mappers.ts`, `src/server/media/service.ts`, `src/server/media/actions.ts`, `src/server/audit.ts`, `src/server/cache.ts`, `src/server/ids.ts`
- `src/components/media/useUpload.ts`, `src/components/media/MediaImg.tsx`
- `src/components/admin/nav.ts` and the file list of `src/components/admin/ui/` + `src/components/admin/form/` (open a component only when you use it)
- `src/types/product.ts`, `src/lib/domain/enums.ts`

## Install
```
pnpm add @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^10.0.0 @dnd-kit/utilities@^3.2.2
```

## Files
Create:
- `src/lib/validation/product.ts`, `src/lib/validation/category.ts`
- `src/server/catalog/admin.ts`, `src/server/catalog/admin-actions.ts`
- `src/app/admin/(panel)/products/page.tsx`, `products/new/page.tsx`, `products/[id]/page.tsx`
- `src/app/admin/(panel)/categories/page.tsx`, `categories/[key]/page.tsx`
- `src/components/admin/products/ProductForm.tsx`, `ImageManager.tsx`, `LocListEditor.tsx`, `SpecsEditor.tsx`, `RelatedPicker.tsx`, `StockAdjust.tsx`, `ProductActions.tsx`, `productThumb.ts`
- `src/components/admin/categories/CategoryForm.tsx`
Modify: `src/components/admin/nav.ts` (+ Products `tag` · Categories `grid`, group "Catalog", perm `products.view`)

## Tasks
- [ ] T1. `src/lib/validation/product.ts`: `productContentSchema` and `productInputSchema` with these limits — names 2–120 (hi ≤ 120), long ≤ 200, slug `^[a-z0-9]+(?:-[a-z0-9]+)*$` ≤ 80, intent 2–80, price/mrp int 1–500000 with price ≤ mrp, stock 0–100000, lowStockAt 0–1000, sizes only for bracelets, `sub`/`mukhi` only for rudraksha, `stone`/`stoneName` only for bracelets, badges ⊆ `BADGE_KEYS`, content lists (benefits ≤ 12, specs ≤ 20, placement ≤ 8), `youtubeId` `^[\w-]{11}$` or null, gstRate 0–28 or null, hsn ≤ 12, weightG 0–100000, SEO title ≤ 70 / description ≤ 170, `mediaIds` ≤ 12, `relatedIds` ≤ 12. `category.ts`: names, short, descriptions (≤ 600), SEO, sort, visible.
- [ ] T2. `src/server/catalog/admin.ts` (every export starts with `requireAdmin`; writes call `audit()` with a `diffOf` of changed fields):
  `listProducts({ search?, category?, status?, stock?: "low" | "out", page }): Promise<{ rows; total }>` (20 per page; search matches name, slug or id) · `getProductForEdit(id)` (row + ordered `MediaRef[]`) · `listProductOptions()` (`{ id, name }` for the related picker) · `createProduct(input, actor)` (`newProductId()`, slug unique → `CONFLICT` with `fieldErrors.slug`) · `updateProduct(id, input, actor)` (replaces `product_media` order in one batch, `attachMedia` for new ids, removed media deleted in `after()`) · `setProductStatus(id, status)` · `duplicateProduct(id)` (new id, slug `<slug>-copy[-n]`, status draft, no images) · `adjustStock(id, delta, reason)` (atomic, never below 0) · `deleteProduct(id)` (only when no `order_items` reference it, else `CONFLICT`; deletes links, media, row) · `listCategoriesAdmin()` · `updateCategory(key, input)`.
- [ ] T3. `src/server/catalog/admin-actions.ts` (`"use server"`): one action per write above, `runAction` + zod parse; every product write calls `invalidate(TAG.catalog, TAG.product(id))`; category writes `invalidate(TAG.catalog)`.
- [ ] T4. `products/page.tsx`: `requireAdminPage("products.view")`; `PageHeader` with "New product" (only with `products.edit`); `SearchBox` + `FilterSelect`s (category, status, stock); `DataTable` (thumb + name + id, category, price / MRP, stock with low/out badge, status badge); `Pagination`.
- [ ] T5. `productThumb.ts`: `productThumb(row): string` → first media 480 variant URL, else legacy photo, else `/svg/products/<id>-main.svg`.
- [ ] T6. `ProductForm.tsx` (client, `useActionForm`): cards **Basics** (name EN/HI via `LocaleTabs`, long title, slug auto-filled from the English name until edited, category, conditional mukhi/sub/stone/stone name, intent EN/HI + intent key) · **Photos** (`ImageManager`) · **Price & stock** (price, MRP with live "% off", stock, low-stock level, wrist sizes for bracelets) · **Badges & options** (badges checkboxes, featured, energization add-on allowed) · **Product page content** (description EN/HI, benefits `LocListEditor`, how to wear, specs `SpecsEditor`, placement list, YouTube id, certificate image via a single-image `ImageManager`) · **Related products** (`RelatedPicker`) · **Invoice** (GST %, HSN, weight) · **SEO** (title/description EN/HI with counters) · **Status**. `FormBar` at the bottom. `ImageManager` and `RelatedPicker` load with `next/dynamic`.
- [ ] T7. `ImageManager.tsx` (client): `{ value: MediaRef[]; onChange(next: MediaRef[]): void; max: number; purpose: "product" }`; "Add photos" = `<input type="file" accept="image/*" multiple>` (phones offer camera or gallery); uploads 2 at a time through `useUpload`, per-file progress tiles; dnd-kit sortable grid (Pointer + Touch sensors, 200 ms touch delay) plus "Move left/right" buttons; first tile labelled "Main"; remove with confirm.
- [ ] T8. `LocListEditor.tsx`, `SpecsEditor.tsx`, `RelatedPicker.tsx` (search box over `listProductOptions`, chips, max 12), `StockAdjust.tsx` (dialog: +/− quantity and reason → `adjustStockAction`), `ProductActions.tsx` (View on site, Duplicate, Archive/Activate, Delete with `ConfirmDialog`; hidden without `products.edit`).
- [ ] T9. `products/new/page.tsx` (`products.edit`) and `products/[id]/page.tsx` (`products.view`; read-only form controls disabled without `products.edit`; `notFound()` for unknown id).
- [ ] T10. `categories/page.tsx` (cards with name, product count, visible badge) and `categories/[key]/page.tsx` with `CategoryForm` (EN/HI names, short, description, SEO, sort, visible). Slug shown read-only.
- [ ] T11. `nav.ts`: add the two items.
- [ ] T12. Finish per AGENTS.md §1 step 8.

## Must not
- No changes to storefront components. No category creation/deletion (fixed keys). No server-side image processing.

## Done-notes
_(agent: ≤ 12 lines)_

## Manual QA (user)
1. `/admin/products`: search "mukhi", filter Bracelets, filter stock "low"; pagination works; on a phone the list shows cards.
2. New product from the phone: 3 photos via camera/gallery, drag to reorder, fill fields, status Active → Save → it appears on `/shop`, in search and on `/product/<slug>` (still the coming-soon page until B15) with the first photo on its card.
3. Edit price → `/shop` shows the new price after refresh. Archive → it disappears. Duplicate → a draft copy appears.
4. Delete a fresh draft → works; try deleting an old product later (after B17 orders) → refused.
5. Edit a category description → the shop header shows it.
6. `pnpm build` passes.
