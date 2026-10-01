"use client";

import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { TextField } from "@/components/admin/form/TextField";
import { TextArea } from "@/components/admin/form/TextArea";
import { NumberField } from "@/components/admin/form/NumberField";
import { SwitchField } from "@/components/admin/form/SwitchField";
import { LocaleTabs } from "@/components/admin/form/LocaleTabs";
import { FormBar } from "@/components/admin/form/FormBar";
import { useActionForm } from "@/components/admin/form/useActionForm";
import { categoryInputSchema, type CategoryInput } from "@/lib/validation/category";
import { updateCategoryAction } from "@/server/catalog/admin-actions";
import type { AdminCategoryRow } from "@/server/catalog/admin";
import type { CategoryKey } from "@/lib/domain/enums";

export type CategoryFormProps = {
  category: AdminCategoryRow;
  canEdit: boolean;
};

export function CategoryForm({
  category,
  canEdit,
}: CategoryFormProps): React.JSX.Element {
  const router = useRouter();

  const defaultValues: CategoryInput = {
    nameEn: category.nameEn,
    nameHi: category.nameHi ?? "",
    shortEn: category.shortEn,
    shortHi: category.shortHi ?? "",
    descEn: category.descEn,
    descHi: category.descHi ?? "",
    seoTitleEn: category.seoTitleEn ?? null,
    seoTitleHi: category.seoTitleHi ?? null,
    seoDescEn: category.seoDescEn ?? null,
    seoDescHi: category.seoDescHi ?? null,
    sort: category.sort,
    visible: Boolean(category.visible),
  };

  const { form, submit, pending } = useActionForm({
    schema: categoryInputSchema,
    defaultValues,
    action: async (values) => {
      return await updateCategoryAction({
        key: category.key as CategoryKey,
        ...values,
      });
    },
    onSuccess: () => {
      router.refresh();
    },
    successMessage: "Category updated successfully",
  });

  const { control, formState: { isDirty } } = form;

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {/* ── Category Identity & Names ────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Category Details"
          description="Category names, short tags, and unique URL routing identifier."
        />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Read-only Slug */}
            <div className="space-y-1">
              <label className="block font-sans text-[13px] font-medium text-ink">
                URL Slug (Read-only)
              </label>
              <div className="flex h-11 items-center rounded-field border border-s2 bg-s1/40 px-3.5 font-mono text-[13.5px] text-ink6 select-all">
                /{category.slug}
              </div>
              <p className="font-sans text-[11.5px] text-ink6">
                System routes and links depend on this slug and cannot be changed.
              </p>
            </div>

            {/* Read-only Category Key */}
            <div className="space-y-1">
              <label className="block font-sans text-[13px] font-medium text-ink">
                Category System Key (Read-only)
              </label>
              <div className="flex h-11 items-center rounded-field border border-s2 bg-s1/40 px-3.5 font-mono text-[13.5px] text-ink6 select-all">
                {category.key}
              </div>
              <p className="font-sans text-[11.5px] text-ink6">
                Internal system key assigned to this category.
              </p>
            </div>
          </div>

          <LocaleTabs
            en={
              <TextField
                name="nameEn"
                control={control}
                label="Category Name (English)"
                placeholder="e.g. Rudraksha"
                required
                maxLength={120}
                disabled={!canEdit}
              />
            }
            hi={
              <TextField
                name="nameHi"
                control={control}
                label="श्रेणी का नाम (हिन्दी)"
                placeholder="उदा. रुद्राक्ष"
                maxLength={120}
                disabled={!canEdit}
              />
            }
          />

          <LocaleTabs
            en={
              <TextField
                name="shortEn"
                control={control}
                label="Short Label / Tag (English)"
                placeholder="e.g. Sacred Beads"
                required
                maxLength={200}
                disabled={!canEdit}
              />
            }
            hi={
              <TextField
                name="shortHi"
                control={control}
                label="संक्षिप्त शीर्षक (हिन्दी)"
                placeholder="उदा. सिद्ध रुद्राक्ष"
                maxLength={200}
                disabled={!canEdit}
              />
            }
          />
        </CardBody>
      </Card>

      {/* ── Descriptions ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Category Description"
          description="Shown on the storefront shop and category banner pages (up to 600 characters)."
        />
        <CardBody>
          <LocaleTabs
            en={
              <TextArea
                name="descEn"
                control={control}
                label="Storefront Description (English)"
                placeholder="Spiritual overview of this category, its benefits, and significance..."
                maxLength={600}
                rows={4}
                showCount
                disabled={!canEdit}
              />
            }
            hi={
              <TextArea
                name="descHi"
                control={control}
                label="श्रेणी का विवरण (हिन्दी)"
                placeholder="इस श्रेणी का आध्यात्मिक परिचय, इसके लाभ और महत्व..."
                maxLength={600}
                rows={4}
                showCount
                disabled={!canEdit}
              />
            }
          />
        </CardBody>
      </Card>

      {/* ── SEO Metadata ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Search Engine Optimization (SEO)"
          description="Custom page title and description for search engines."
        />
        <CardBody className="space-y-4">
          <LocaleTabs
            en={
              <TextField
                name="seoTitleEn"
                control={control}
                label="SEO Meta Title (English)"
                placeholder="Category Title | Maa Kali Astuti"
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
                placeholder="श्रेणी शीर्षक | माँ काली अस्तुति"
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
                placeholder="Brief summary for search engine snippets..."
                maxLength={170}
                rows={2}
                showCount
                disabled={!canEdit}
              />
            }
            hi={
              <TextArea
                name="seoDescHi"
                control={control}
                label="SEO विवरण (हिन्दी)"
                placeholder="सर्च इंजन के लिए संक्षिप्त विवरण..."
                maxLength={170}
                rows={2}
                showCount
                disabled={!canEdit}
              />
            }
          />
        </CardBody>
      </Card>

      {/* ── Visibility & Sort ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Visibility & Sorting"
          description="Control ordering and public storefront visibility."
        />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            name="sort"
            control={control}
            label="Sort Order"
            hint="Lower numbers appear first in the menu and category lists"
            disabled={!canEdit}
          />

          <div className="pt-2">
            <SwitchField
              name="visible"
              control={control}
              label="Visible on Storefront"
              description="When turned off, this category is hidden from storefront navigation"
              disabled={!canEdit}
            />
          </div>
        </CardBody>
      </Card>

      {/* Sticky Save Bar */}
      <FormBar
        pending={pending}
        dirty={isDirty}
        cancelHref="/admin/categories"
        saveLabel="Save category"
      />
    </form>
  );
}
