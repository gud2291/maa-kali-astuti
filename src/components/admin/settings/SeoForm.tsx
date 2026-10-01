"use client";

import { useState } from "react";
import { z } from "zod";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { TextField } from "@/components/admin/form/TextField";
import { TextArea } from "@/components/admin/form/TextArea";
import { LocaleTabs } from "@/components/admin/form/LocaleTabs";
import { FormBar } from "@/components/admin/form/FormBar";
import { useActionForm, useLeaveGuard } from "@/components/admin/form/useActionForm";
import { ImageManager } from "@/components/admin/products/ImageManager";
import { updateSettingAction } from "@/server/settings/admin-actions";
import type { SettingsMap } from "@/lib/validation/settings";
import type { MediaRef } from "@/lib/domain/media";

const seoFormSchema = z.object({
  titleEn: z.string().min(1, "English title is required").max(80, "Maximum 80 characters"),
  titleHi: z.string().max(80, "Maximum 80 characters").default(""),
  descriptionEn: z
    .string()
    .min(1, "English description is required")
    .max(250, "Maximum 250 characters"),
  descriptionHi: z.string().max(250, "Maximum 250 characters").default(""),
  ogMediaId: z.number().int().nonnegative().nullable(),
});

type SeoFormData = z.infer<typeof seoFormSchema>;

export type SeoFormProps = {
  initialValues: SettingsMap["seo"];
  initialOgMedia: MediaRef | null;
};

export function SeoForm({
  initialValues,
  initialOgMedia,
}: SeoFormProps): React.JSX.Element {
  const [ogMedia, setOgMedia] = useState<MediaRef | null>(initialOgMedia);

  const { form, submit, pending } = useActionForm({
    schema: seoFormSchema,
    defaultValues: {
      titleEn: initialValues.title.en,
      titleHi: initialValues.title.hi,
      descriptionEn: initialValues.description.en,
      descriptionHi: initialValues.description.hi,
      ogMediaId: initialValues.ogMediaId,
    },
    action: async (values: SeoFormData) => {
      return await updateSettingAction({
        key: "seo",
        value: {
          title: { en: values.titleEn, hi: values.titleHi },
          description: { en: values.descriptionEn, hi: values.descriptionHi },
          ogMediaId: values.ogMediaId,
        },
      });
    },
    successMessage: "SEO settings saved successfully",
  });

  const { control, formState: { isDirty } } = form;
  useLeaveGuard(isDirty);

  const hiEmpty = !form.watch("titleHi") && !form.watch("descriptionHi");

  const handleMediaChange = (next: MediaRef[]): void => {
    const first = next[0] ?? null;
    setOgMedia(first);
    form.setValue("ogMediaId", first?.id ?? null, { shouldDirty: true });
  };

  return (
    <form onSubmit={submit} className="space-y-6 pb-24">
      {/* ── Metadata ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Global Site Title & Description"
          description="Default metadata used by Google and social search engines when no specific page title is provided."
        />
        <CardBody className="space-y-4">
          <LocaleTabs
            hiEmpty={hiEmpty}
            en={
              <div className="space-y-4">
                <TextField
                  name="titleEn"
                  control={control}
                  label="Site Title (English)"
                  hint="Brand title shown in browser tab and search results"
                  maxLength={80}
                  showCount
                  required
                />
                <TextArea
                  name="descriptionEn"
                  control={control}
                  label="Meta Description (English)"
                  hint="Concise store overview for search snippets"
                  maxLength={250}
                  showCount
                  rows={3}
                  required
                />
              </div>
            }
            hi={
              <div className="space-y-4">
                <TextField
                  name="titleHi"
                  control={control}
                  label="साइट शीर्षक (हिंदी)"
                  hint="ब्राउज़र टैब और खोज परिणामों में प्रदर्शित"
                  maxLength={80}
                  showCount
                />
                <TextArea
                  name="descriptionHi"
                  control={control}
                  label="मेटा विवरण (हिंदी)"
                  hint="सर्च इंजन स्निपेट हेतु संक्षिप्त विवरण"
                  maxLength={250}
                  showCount
                  rows={3}
                />
              </div>
            }
          />
        </CardBody>
      </Card>

      {/* ── Social Share Card ───────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Default Social Share Image (Open Graph)"
          description="1200×630px image displayed when the homepage is shared on WhatsApp, Facebook, or Twitter."
        />
        <CardBody>
          <div className="max-w-md">
            <ImageManager
              value={ogMedia ? [ogMedia] : []}
              onChange={handleMediaChange}
              max={1}
              purpose="setting"
            />
          </div>
        </CardBody>
      </Card>

      <FormBar
        pending={pending}
        dirty={isDirty}
        cancelHref="/admin/settings?tab=seo"
        saveLabel="Save SEO Settings"
      />
    </form>
  );
}
