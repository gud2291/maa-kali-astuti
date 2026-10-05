"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { TextField } from "@/components/admin/form/TextField";
import { TextArea } from "@/components/admin/form/TextArea";
import { MoneyField } from "@/components/admin/form/MoneyField";
import { NumberField } from "@/components/admin/form/NumberField";
import { SelectField } from "@/components/admin/form/SelectField";
import { SwitchField } from "@/components/admin/form/SwitchField";
import { LocaleTabs } from "@/components/admin/form/LocaleTabs";
import { FormBar } from "@/components/admin/form/FormBar";
import { useActionForm } from "@/components/admin/form/useActionForm";
import { LocListEditor } from "./LocListEditor";
import { SpecsEditor, type SpecItem } from "./SpecsEditor";
import {
  productInputSchema,
  type ProductInput,
} from "@/lib/validation/product";
import {
  createProductAction,
  updateProductAction,
} from "@/server/catalog/admin-actions";
import {
  CATEGORY_KEYS,
  INTENT_KEYS,
  STONE_KEYS,
  WRIST_SIZES,
  BADGE_KEYS,
  PRODUCT_STATUS,
  type CategoryKey,
  type IntentKey,
  type WristSize,
  type BadgeKey,
  type StoneKey,
} from "@/lib/domain/enums";
import type { MediaRef } from "@/lib/domain/media";
import type { ProductEditData } from "@/server/catalog/admin";
import type { Loc } from "@/lib/domain/loc";

const ImageManager = dynamic(
  () => import("./ImageManager").then((mod) => mod.ImageManager),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 rounded-btn border border-dashed border-s2 bg-s1/20 animate-pulse" />
    ),
  },
);

const RelatedPicker = dynamic(
  () => import("./RelatedPicker").then((mod) => mod.RelatedPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-20 rounded-btn border border-dashed border-s2 bg-s1/20 animate-pulse" />
    ),
  },
);

const CATEGORY_OPTIONS = CATEGORY_KEYS.map((k) => ({
  value: k,
  label:
    k === "rudraksha"
      ? "Rudraksha"
      : k === "bracelets"
        ? "Bracelets"
        : k === "amulets"
          ? "Amulets & Yantras"
          : k === "havan"
            ? "Havan & Puja"
            : "Pure Copper",
}));

const INTENT_OPTIONS = INTENT_KEYS.map((k) => ({
  value: k,
  label: k.charAt(0).toUpperCase() + k.slice(1),
}));

const STONE_OPTIONS = STONE_KEYS.map((k) => ({
  value: k,
  label: k.charAt(0).toUpperCase() + k.slice(1),
}));

const STATUS_OPTIONS = PRODUCT_STATUS.map((s) => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}));

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type ProductFormProps = {
  initialData?: ProductEditData;
  productOptions: { id: string; name: string }[];
  canEdit: boolean;
};

export function ProductForm({
  initialData,
  productOptions,
  canEdit,
}: ProductFormProps): React.JSX.Element {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [photos, setPhotos] = useState<MediaRef[]>(initialData?.media ?? []);
  const [certPhoto, setCertPhoto] = useState<MediaRef[]>([]);
  const [isSlugManuallySet, setIsSlugManuallySet] = useState(isEditing);

  const defaultValues: Partial<ProductInput> = {
    slug: initialData?.product.slug ?? "",
    categoryKey: (initialData?.product.categoryKey as CategoryKey) ?? "rudraksha",
    sub: initialData?.product.sub ?? null,
    mukhi: initialData?.product.mukhi ?? null,
    stone: (initialData?.product.stone as StoneKey | null) ?? null,
    stoneName: initialData?.product.stoneName ?? null,
    nameEn: initialData?.product.nameEn ?? "",
    nameHi: initialData?.product.nameHi ?? "",
    longEn: initialData?.product.longEn ?? null,
    longHi: initialData?.product.longHi ?? null,
    intentEn: initialData?.product.intentEn ?? "",
    intentHi: initialData?.product.intentHi ?? "",
    intentKey: (initialData?.product.intentKey as IntentKey) ?? "wealth",
    priceInr: initialData?.product.priceInr ?? 999,
    mrpInr: initialData?.product.mrpInr ?? 1499,
    stock: initialData?.product.stock ?? 10,
    lowStockAt: initialData?.product.lowStockAt ?? 5,
    sizes: (initialData?.product.sizes as WristSize[]) ?? null,
    badges: (initialData?.product.badges as BadgeKey[]) ?? [],
    content: initialData?.product.content ?? {
      description: { en: "", hi: "" },
      benefits: [],
      howToWear: { en: "", hi: "" },
      specs: [],
      placement: [],
      certificateMediaId: null,
      youtubeId: null,
    },
    mediaIds: initialData?.media.map((m) => m.id) ?? [],
    relatedIds: (initialData?.product.relatedIds as string[]) ?? [],
    energizable: initialData?.product.energizable ?? true,
    gstRate: initialData?.product.gstRate ?? null,
    hsn: initialData?.product.hsn ?? null,
    weightG: initialData?.product.weightG ?? null,
    seoTitleEn: initialData?.product.seoTitleEn ?? null,
    seoTitleHi: initialData?.product.seoTitleHi ?? null,
    seoDescEn: initialData?.product.seoDescEn ?? null,
    seoDescHi: initialData?.product.seoDescHi ?? null,
    status: initialData?.product.status ?? "draft",
    featured: initialData?.product.featured ?? false,
    sort: initialData?.product.sort ?? 0,
  };

  const { form, submit, pending } = useActionForm({
    schema: productInputSchema,
    defaultValues: defaultValues as ProductInput,
    action: async (values) => {
      if (isEditing && initialData) {
        return await updateProductAction({
          id: initialData.product.id,
          ...values,
        });
      }
      return await createProductAction(values);
    },
    onSuccess: (data) => {
      if (!isEditing) {
        router.push(`/admin/products/${data.id}`);
      } else {
        router.refresh();
      }
    },
    successMessage: isEditing ? "Product saved successfully" : "Product created successfully",
  });

  const { control, watch, setValue, formState: { isDirty } } = form;

  const watchedCategory = watch("categoryKey");
  const watchedNameEn = watch("nameEn");
  const watchedPrice = watch("priceInr");
  const watchedMrp = watch("mrpInr");
  const watchedBadges = watch("badges") ?? [];
  const watchedSizes = watch("sizes") ?? [];
  const watchedContent = watch("content");
  const watchedRelatedIds = watch("relatedIds") ?? [];

  // Auto-generate slug from English name if not manually modified
  useEffect(() => {
    if (!isSlugManuallySet && watchedNameEn) {
      setValue("slug", slugify(watchedNameEn), { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedNameEn, isSlugManuallySet, setValue]);

  // Sync photos to form mediaIds
  const handlePhotosChange = (next: MediaRef[]): void => {
    setPhotos(next);
    setValue(
      "mediaIds",
      next.map((m) => m.id),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  // Sync single certificate photo
  const handleCertChange = (next: MediaRef[]): void => {
    setCertPhoto(next);
    setValue(
      "content.certificateMediaId",
      next[0]?.id ?? null,
      { shouldDirty: true },
    );
  };

  // Calculate discount percentage
  const discountPct =
    watchedMrp && watchedPrice && watchedMrp > watchedPrice
      ? Math.round(((watchedMrp - watchedPrice) / watchedMrp) * 100)
      : 0;

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {/* ── Basics ────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Basics"
          description="Primary product identity, naming, category, and classification."
        />
        <CardBody className="space-y-4">
          <LocaleTabs
            en={
              <TextField
                name="nameEn"
                control={control}
                label="Product Name (English)"
                placeholder="e.g. 5 Mukhi Rudraksha Mala"
                required
                maxLength={120}
                disabled={!canEdit}
              />
            }
            hi={
              <TextField
                name="nameHi"
                control={control}
                label="उत्पाद का नाम (हिन्दी)"
                placeholder="उदा. ५ मुखी रुद्राक्ष माला"
                maxLength={120}
                disabled={!canEdit}
              />
            }
          />

          <LocaleTabs
            en={
              <TextField
                name="longEn"
                control={control}
                label="Long Title (English) — optional"
                placeholder="e.g. Authentic 108 Beads Himalayan 5 Mukhi Rudraksha Mala"
                maxLength={200}
                disabled={!canEdit}
              />
            }
            hi={
              <TextField
                name="longHi"
                control={control}
                label="विस्तृत शीर्षक (हिन्दी) — वैकल्पिक"
                placeholder="उदा. प्रमाणिक १०८ दानों वाली हिमालयी ५ मुखी रुद्राक्ष माला"
                maxLength={200}
                disabled={!canEdit}
              />
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="slug"
              control={control}
              label="URL Slug"
              hint="Lowercase letters, numbers, and hyphens"
              required
              maxLength={80}
              disabled={!canEdit}
              onChange={(e) => {
                setIsSlugManuallySet(true);
                setValue("slug", e.target.value, { shouldDirty: true, shouldValidate: true });
              }}
            />

            <SelectField
              name="categoryKey"
              control={control}
              label="Category"
              options={CATEGORY_OPTIONS}
              required
              disabled={!canEdit}
            />
          </div>

          {/* Conditional Rudraksha fields */}
          {watchedCategory === "rudraksha" && (
            <div className="grid grid-cols-1 gap-4 rounded-field border border-s2 bg-s1/30 p-3 sm:grid-cols-2">
              <NumberField
                name="mukhi"
                control={control}
                label="Mukhi count (1–30)"
                min={1}
                max={30}
                disabled={!canEdit}
              />
              <TextField
                name="sub"
                control={control}
                label="Sub-filter label (e.g. 5 or malas)"
                maxLength={50}
                disabled={!canEdit}
              />
            </div>
          )}

          {/* Conditional Bracelet fields */}
          {watchedCategory === "bracelets" && (
            <div className="grid grid-cols-1 gap-4 rounded-field border border-s2 bg-s1/30 p-3 sm:grid-cols-2">
              <SelectField
                name="stone"
                control={control}
                label="Crystal Stone Key"
                options={STONE_OPTIONS}
                placeholder="Select a stone..."
                disabled={!canEdit}
              />
              <TextField
                name="stoneName"
                control={control}
                label="Display Stone Name (e.g. Pyrite)"
                maxLength={60}
                disabled={!canEdit}
              />
            </div>
          )}

          {/* Intent pill line */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <LocaleTabs
                en={
                  <TextField
                    name="intentEn"
                    control={control}
                    label="Intent Line (English)"
                    placeholder="e.g. For Wealth & Prosperity"
                    required
                    maxLength={80}
                    disabled={!canEdit}
                  />
                }
                hi={
                  <TextField
                    name="intentHi"
                    control={control}
                    label="संकल्प / उद्देश्य (हिन्दी)"
                    placeholder="उदा. धन और समृद्धि के लिए"
                    maxLength={80}
                    disabled={!canEdit}
                  />
                }
              />
            </div>
            <div className="sm:col-span-1">
              <SelectField
                name="intentKey"
                control={control}
                label="Intent Filter Key"
                options={INTENT_OPTIONS}
                required
                disabled={!canEdit}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Photos ────────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Product Photography"
          description="Drag to reorder photos. The first photo serves as the primary card image."
        />
        <CardBody>
          <ImageManager
            value={photos}
            onChange={handlePhotosChange}
            max={12}
            purpose="product"
            disabled={!canEdit}
          />
        </CardBody>
      </Card>

      {/* ── Price & Stock ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Price & Inventory"
          description="Set retail price, MRP, stock count, and low-stock warning threshold."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MoneyField
              name="priceInr"
              control={control}
              label="Selling Price"
              required
              min={1}
              disabled={!canEdit}
            />

            <div>
              <MoneyField
                name="mrpInr"
                control={control}
                label="MRP (List Price)"
                required
                min={1}
                disabled={!canEdit}
              />
              {discountPct > 0 && (
                <div className="mt-1 flex items-center gap-1.5 font-sans text-[12px] font-semibold text-ok">
                  <span className="rounded-pill bg-em1 px-2 py-0.5">
                    {discountPct}% OFF
                  </span>
                  <span>Customer saves ₹{watchedMrp - watchedPrice}</span>
                </div>
              )}
            </div>

            <NumberField
              name="stock"
              control={control}
              label="Units in Stock"
              min={0}
              max={100000}
              disabled={!canEdit}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NumberField
              name="lowStockAt"
              control={control}
              label="Low Stock Alert Threshold"
              hint="Shows 'Only N left' badge when stock reaches this level or below"
              min={0}
              max={1000}
              disabled={!canEdit}
            />

            {/* Wrist sizes for bracelets */}
            {watchedCategory === "bracelets" && (
              <div className="space-y-2">
                <label className="block font-sans text-[13px] font-medium text-ink">
                  Available Wrist Sizes
                </label>
                <div className="flex items-center gap-4 pt-1">
                  {WRIST_SIZES.map((size) => {
                    const checked = watchedSizes.includes(size);
                    return (
                      <label
                        key={size}
                        className="flex items-center gap-2 font-sans text-[14px] text-ink cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          disabled={!canEdit}
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...watchedSizes, size]
                              : watchedSizes.filter((s) => s !== size);
                            setValue("sizes", next, { shouldDirty: true });
                          }}
                          className="size-4 rounded-field text-em7 focus:ring-em7 cursor-pointer"
                        />
                        <span className="font-semibold">{size}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── Badges & Options ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Badges & Add-ons"
          description="Highlight special attributes and energization options."
        />
        <CardBody className="space-y-4">
          <div>
            <label className="block font-sans text-[13px] font-medium text-ink mb-2">
              Product Badges
            </label>
            <div className="flex flex-wrap gap-4">
              {BADGE_KEYS.map((badge) => {
                const checked = watchedBadges.includes(badge);
                return (
                  <label
                    key={badge}
                    className="flex items-center gap-2 rounded-field border border-s2 bg-cream px-3 py-2 font-sans text-[13px] text-ink cursor-pointer hover:bg-s1"
                  >
                    <input
                      type="checkbox"
                      disabled={!canEdit}
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...watchedBadges, badge]
                          : watchedBadges.filter((b) => b !== badge);
                        setValue("badges", next, { shouldDirty: true });
                      }}
                      className="size-4 rounded-field text-em7 focus:ring-em7 cursor-pointer"
                    />
                    <span className="font-medium capitalize">{badge}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <SwitchField
              name="featured"
              control={control}
              label="Featured on Homepage"
              description="Display this product prominently on the storefront home page"
              disabled={!canEdit}
            />

            <SwitchField
              name="energizable"
              control={control}
              label="Allow Vedic Energization Add-on"
              description="Customers can add personalized name & gotra energization"
              disabled={!canEdit}
            />
          </div>
        </CardBody>
      </Card>

      {/* ── Product Page Content ─────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Product Page Content"
          description="Full descriptions, sacred vidhi instructions, benefits, specifications, and video."
        />
        <CardBody className="space-y-6">
          <LocaleTabs
            en={
              <TextArea
                name="content.description.en"
                control={control}
                label="Full Description (English)"
                placeholder="Detailed description, spiritual significance, and history..."
                rows={5}
                disabled={!canEdit}
              />
            }
            hi={
              <TextArea
                name="content.description.hi"
                control={control}
                label="विस्तृत विवरण (हिन्दी)"
                placeholder="विस्तृत विवरण, आध्यात्मिक महत्व और इतिहास..."
                rows={5}
                disabled={!canEdit}
              />
            }
          />

          <div className="space-y-2">
            <label className="block font-sans text-[13.5px] font-semibold text-ink">
              Key Benefits (Bullet points)
            </label>
            <LocListEditor
              label="benefit"
              max={12}
              value={watchedContent?.benefits ?? []}
              onChange={(next: Loc[]) => setValue("content.benefits", next, { shouldDirty: true })}
              disabled={!canEdit}
            />
          </div>

          <LocaleTabs
            en={
              <TextArea
                name="content.howToWear.en"
                control={control}
                label="How to Wear / Vidhi (English)"
                placeholder="Day, auspicious time, mantra, and ritual for wearing..."
                rows={3}
                disabled={!canEdit}
              />
            }
            hi={
              <TextArea
                name="content.howToWear.hi"
                control={control}
                label="धारण करने की विधि (हिन्दी)"
                placeholder="दिन, शुभ मुहूर्त, मंत्र और धारण करने का अनुष्ठान..."
                rows={3}
                disabled={!canEdit}
              />
            }
          />

          <div className="space-y-2">
            <label className="block font-sans text-[13.5px] font-semibold text-ink">
              Specifications Table
            </label>
            <SpecsEditor
              max={20}
              value={watchedContent?.specs ?? []}
              onChange={(next: SpecItem[]) => setValue("content.specs", next, { shouldDirty: true })}
              disabled={!canEdit}
            />
          </div>

          {watchedCategory === "copper" && (
            <div className="space-y-2">
              <label className="block font-sans text-[13.5px] font-semibold text-ink">
                Placement Recommendations
              </label>
              <LocListEditor
                label="placement line"
                max={8}
                value={watchedContent?.placement ?? []}
                onChange={(next: Loc[]) => setValue("content.placement", next, { shouldDirty: true })}
                disabled={!canEdit}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              name="content.youtubeId"
              control={control}
              label="YouTube Video ID (11 characters)"
              hint="e.g. dQw4w9WgXcQ (from youtube.com/watch?v=...)"
              placeholder="11-character video ID"
              maxLength={11}
              disabled={!canEdit}
            />

            <div>
              <label className="block font-sans text-[13px] font-medium text-ink mb-1.5">
                Authenticity Certificate Image
              </label>
              <ImageManager
                value={certPhoto}
                onChange={handleCertChange}
                max={1}
                purpose="product"
                disabled={!canEdit}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Related Products ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Related Products"
          description="Choose up to 12 recommended complementary products."
        />
        <CardBody>
          <RelatedPicker
            value={watchedRelatedIds}
            onChange={(next) => setValue("relatedIds", next, { shouldDirty: true })}
            options={productOptions}
            max={12}
            disabled={!canEdit}
          />
        </CardBody>
      </Card>

      {/* ── Invoice & Shipping ───────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Invoicing & Shipping Data"
          description="HSN code, GST rate, and package weight for legal compliance and shipping calculations."
        />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NumberField
            name="gstRate"
            control={control}
            label="GST Rate (%)"
            hint="0 to 28%"
            min={0}
            max={28}
            step={0.1}
            disabled={!canEdit}
          />

          <TextField
            name="hsn"
            control={control}
            label="HSN / SAC Code"
            hint="Up to 12 digits"
            maxLength={12}
            disabled={!canEdit}
          />

          <NumberField
            name="weightG"
            control={control}
            label="Weight in Grams"
            hint="For shipping calculations"
            min={0}
            max={100000}
            disabled={!canEdit}
          />
        </CardBody>
      </Card>

      {/* ── SEO Metadata ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Search Engine Optimization (SEO)"
          description="Custom page title and meta description for search engines."
        />
        <CardBody className="space-y-4">
          <LocaleTabs
            en={
              <TextField
                name="seoTitleEn"
                control={control}
                label="SEO Meta Title (English)"
                hint="Optimal length: 50–60 characters"
                maxLength={70}
                showCount
                disabled={!canEdit}
              />
            }
            hi={
              <TextField
                name="seoTitleHi"
                control={control}
                label="SEO शीर्षक (हिन्दी)"
                hint="अधिकतम 70 अक्षर"
                maxLength={70}
                showCount
                disabled={!canEdit}
              />
            }
          />

          <LocaleTabs
            en={
              <TextArea
                name="seoDescEn"
                control={control}
                label="SEO Meta Description (English)"
                hint="Optimal length: 120–160 characters"
                maxLength={170}
                rows={2}
                disabled={!canEdit}
              />
            }
            hi={
              <TextArea
                name="seoDescHi"
                control={control}
                label="SEO विवरण (हिन्दी)"
                hint="अधिकतम 170 अक्षर"
                maxLength={170}
                rows={2}
                disabled={!canEdit}
              />
            }
          />
        </CardBody>
      </Card>

      {/* ── Status & Ordering ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Publishing Status"
          description="Draft products are only visible to admins. Active products appear immediately on the storefront."
        />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            name="status"
            control={control}
            label="Visibility Status"
            options={STATUS_OPTIONS}
            required
            disabled={!canEdit}
          />

          <NumberField
            name="sort"
            control={control}
            label="Catalogue Sort Order"
            hint="Lower numbers appear first"
            disabled={!canEdit}
          />
        </CardBody>
      </Card>

      {/* Sticky save bar */}
      <FormBar
        pending={pending}
        dirty={isDirty}
        cancelHref="/admin/products"
        saveLabel={isEditing ? "Update product" : "Create product"}
      />
    </form>
  );
}
