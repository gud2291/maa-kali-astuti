"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { TextField } from "@/components/admin/form/TextField";
import { TextArea } from "@/components/admin/form/TextArea";
import { SelectField } from "@/components/admin/form/SelectField";
import { NumberField } from "@/components/admin/form/NumberField";
import { LocaleTabs } from "@/components/admin/form/LocaleTabs";
import { FormBar } from "@/components/admin/form/FormBar";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { slugifyText } from "@/components/content/RichText";
import {
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
} from "@/server/articles/admin-actions";
import { ARTICLE_CATEGORIES, CONTENT_STATUS, type ArticleCategory, type ContentStatus } from "@/lib/domain/enums";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/domain/labels";
import type { AdminArticleDetail } from "@/server/articles/admin";
import type { RichDoc } from "@/lib/domain/types";
import type { MediaRef } from "@/lib/domain/media";
import type { ProductOption } from "@/components/admin/products/RelatedPicker";

const RichEditor = dynamic(
  () => import("@/components/admin/editor/RichEditor").then((mod) => mod.RichEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-btn border border-s2 bg-iv animate-pulse" />
    ),
  },
);

const ImageManager = dynamic(
  () => import("@/components/admin/products/ImageManager").then((mod) => mod.ImageManager),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 rounded-btn border border-dashed border-s2 bg-s1/20 animate-pulse" />
    ),
  },
);

const RelatedPicker = dynamic(
  () => import("@/components/admin/products/RelatedPicker").then((mod) => mod.RelatedPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-20 rounded-btn border border-dashed border-s2 bg-s1/20 animate-pulse" />
    ),
  },
);

export type ArticleFormProps = {
  initialData?: AdminArticleDetail;
  productOptions: ProductOption[];
  mediaBase: string;
};

const CATEGORY_OPTIONS = ARTICLE_CATEGORIES.map((cat) => ({
  value: cat,
  label: ARTICLE_CATEGORY_LABELS[cat]?.en ?? cat,
}));

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export function ArticleForm({
  initialData,
  productOptions,
  mediaBase,
}: ArticleFormProps): React.JSX.Element {
  const router = useRouter();
  const isEditing = Boolean(initialData);
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"en" | "hi">("en");

  // Form State
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [category, setCategory] = useState<ArticleCategory>(
    initialData?.category ?? "rudraksha",
  );
  const [titleEn, setTitleEn] = useState(initialData?.titleEn ?? "");
  const [titleHi, setTitleHi] = useState(initialData?.titleHi ?? "");
  const [excerptEn, setExcerptEn] = useState(initialData?.excerptEn ?? "");
  const [excerptHi, setExcerptHi] = useState(initialData?.excerptHi ?? "");
  const [bodyEn, setBodyEn] = useState<RichDoc>(
    initialData?.bodyEn ?? { type: "doc", content: [] },
  );
  const [bodyHi, setBodyHi] = useState<RichDoc | null>(
    initialData?.bodyHi ?? null,
  );
  const [coverMedia, setCoverMedia] = useState<MediaRef | null>(
    initialData?.coverMedia ?? null,
  );
  const [coverMediaId, setCoverMediaId] = useState<number | null>(
    initialData?.coverMediaId ?? null,
  );
  const [readMins, setReadMins] = useState(initialData?.readMins ?? 5);
  const [productIds, setProductIds] = useState<string[]>(
    initialData?.productIds ?? [],
  );
  const [status, setStatus] = useState<ContentStatus>(
    initialData?.status ?? "draft",
  );
  const [publishedAt, setPublishedAt] = useState<string>(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : "",
  );
  const [faq, setFaq] = useState<{ q: { en: string; hi: string }; a: { en: string; hi: string } }[]>(
    initialData?.faq?.map((f) => ({
      q: { en: f.q.en, hi: f.q.hi || "" },
      a: { en: f.a.en, hi: f.a.hi || "" },
    })) ?? [],
  );
  const [seoTitleEn, setSeoTitleEn] = useState(initialData?.seoTitleEn ?? "");
  const [seoTitleHi, setSeoTitleHi] = useState(initialData?.seoTitleHi ?? "");
  const [seoDescEn, setSeoDescEn] = useState(initialData?.seoDescEn ?? "");
  const [seoDescHi, setSeoDescHi] = useState(initialData?.seoDescHi ?? "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAutoSlug = (): void => {
    if (titleEn.trim()) {
      setSlug(slugifyText(titleEn));
    }
  };

  const handleAddFaq = (): void => {
    if (faq.length >= 10) return;
    setFaq([...faq, { q: { en: "", hi: "" }, a: { en: "", hi: "" } }]);
  };

  const handleRemoveFaq = (index: number): void => {
    setFaq(faq.filter((_, i) => i !== index));
  };

  const handleFaqChange = (
    index: number,
    field: "q" | "a",
    lang: "en" | "hi",
    value: string,
  ): void => {
    setFaq(
      faq.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [field]: {
            ...item[field],
            [lang]: value,
          },
        };
      }),
    );
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!slug.trim()) newErrors.slug = "Slug is required";
    if (!titleEn.trim()) newErrors.titleEn = "English title is required";
    if (!excerptEn.trim()) newErrors.excerptEn = "English excerpt is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.err("Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      const payload = {
        slug: slug.trim(),
        category,
        titleEn: titleEn.trim(),
        titleHi: titleHi.trim(),
        excerptEn: excerptEn.trim(),
        excerptHi: excerptHi.trim(),
        bodyEn,
        bodyHi: bodyHi && bodyHi.content?.length ? bodyHi : null,
        coverMediaId,
        legacyArt: null,
        readMins,
        faq,
        productIds,
        status,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
        seoTitleEn: seoTitleEn.trim() || null,
        seoTitleHi: seoTitleHi.trim() || null,
        seoDescEn: seoDescEn.trim() || null,
        seoDescHi: seoDescHi.trim() || null,
      };

      if (isEditing && initialData) {
        const res = await updateArticleAction(initialData.id, payload);
        if (res.ok) {
          toast.ok("Article updated successfully");
          router.refresh();
        } else {
          toast.err(res.message || "Failed to update article");
        }
      } else {
        const res = await createArticleAction(payload);
        if (res.ok) {
          toast.ok("Article created successfully");
          router.push(`/admin/content/blog/${res.data.id}`);
        } else {
          toast.err(res.message || "Failed to create article");
        }
      }
    });
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!initialData) return false;
    const res = await deleteArticleAction(initialData.id);
    if (res.ok) {
      toast.ok("Article deleted");
      router.push("/admin/content/blog");
      return true;
    }
    toast.err(res.message || "Failed to delete article");
    return false;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Bilingual Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <span className="font-semibold text-ink">Article Content</span>
              <LocaleTabs value={activeTab} onChange={setActiveTab} />
            </CardHeader>
            <CardBody className="space-y-5">
              {activeTab === "en" ? (
                <>
                  <TextField
                    label="Title (English)"
                    value={titleEn}
                    onChange={(v) => {
                      setTitleEn(v);
                      if (!isEditing && !slug) {
                        setSlug(slugifyText(v));
                      }
                    }}
                    error={errors.titleEn}
                    required
                    maxLength={140}
                    placeholder="Enter article title in English"
                  />

                  <TextArea
                    label="Excerpt (English)"
                    value={excerptEn}
                    onChange={setExcerptEn}
                    error={errors.excerptEn}
                    required
                    maxLength={300}
                    rows={3}
                    placeholder="Short summary for listing cards and search engines"
                  />

                  <div>
                    <label className="block font-sans text-[13px] font-medium text-ink6 mb-1.5">
                      Body (English)
                    </label>
                    <RichEditor
                      value={bodyEn}
                      onChange={setBodyEn}
                      mediaBase={mediaBase}
                      disabled={isPending}
                    />
                  </div>
                </>
              ) : (
                <>
                  <TextField
                    label="Title (Hindi)"
                    value={titleHi}
                    onChange={setTitleHi}
                    error={errors.titleHi}
                    maxLength={140}
                    placeholder="लेख का शीर्षक हिंदी में दर्ज करें"
                  />

                  <TextArea
                    label="Excerpt (Hindi)"
                    value={excerptHi}
                    onChange={setExcerptHi}
                    error={errors.excerptHi}
                    maxLength={300}
                    rows={3}
                    placeholder="संक्षिप्त विवरण (Hindi summary)"
                  />

                  <div>
                    <label className="block font-sans text-[13px] font-medium text-ink6 mb-1.5">
                      Body (Hindi)
                    </label>
                    <RichEditor
                      value={bodyHi || { type: "doc", content: [] }}
                      onChange={setBodyHi}
                      mediaBase={mediaBase}
                      disabled={isPending}
                    />
                  </div>
                </>
              )}
            </CardBody>
          </Card>

          {/* FAQ Block (for AEO / Schema) */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-ink">Article FAQ Block</span>
                <span className="ml-2 font-mono text-[12px] text-ink6">({faq.length}/10)</span>
              </div>
              {faq.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-em5 hover:underline"
                >
                  <AdminIcon name="plus" className="size-3.5" />
                  Add Question
                </button>
              )}
            </CardHeader>
            <CardBody className="space-y-4">
              {faq.length === 0 ? (
                <p className="text-center py-4 font-sans text-[13px] text-ink6">
                  No FAQs added. Add questions and answers to show in the FAQ section at the end of the article.
                </p>
              ) : (
                faq.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-field border border-s2 bg-cream/40 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[12px] font-semibold text-g7 tracking-wider uppercase">
                        Question #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(index)}
                        className="text-sin hover:text-sin/80 font-sans text-[12px] font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <TextField
                        label="Question (EN)"
                        value={item.q.en}
                        onChange={(v) => handleFaqChange(index, "q", "en", v)}
                        placeholder="e.g. Which Rudraksha is best for meditation?"
                      />
                      <TextField
                        label="Question (HI)"
                        value={item.q.hi}
                        onChange={(v) => handleFaqChange(index, "q", "hi", v)}
                        placeholder="उदा. ध्यान के लिए कौन सा रुद्राक्ष सर्वोत्तम है?"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <TextArea
                        label="Answer (EN)"
                        value={item.a.en}
                        onChange={(v) => handleFaqChange(index, "a", "en", v)}
                        rows={2}
                        placeholder="Answer in English"
                      />
                      <TextArea
                        label="Answer (HI)"
                        value={item.a.hi}
                        onChange={(v) => handleFaqChange(index, "a", "hi", v)}
                        rows={2}
                        placeholder="उत्तर हिंदी में"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* Products Mentioned */}
          <Card>
            <CardHeader>
              <span className="font-semibold text-ink">Products Mentioned</span>
              <span className="ml-2 font-mono text-[12px] text-ink6">({productIds.length}/6)</span>
            </CardHeader>
            <CardBody>
              <p className="font-sans text-[13px] text-ink6 mb-3">
                Select up to 6 products referenced in this article to display as inline product cards.
              </p>
              <RelatedPicker
                value={productIds}
                onChange={setProductIds}
                options={productOptions}
                max={6}
                disabled={isPending}
              />
            </CardBody>
          </Card>

          {/* SEO Metadata */}
          <Card>
            <CardHeader>
              <span className="font-semibold text-ink">SEO / Meta Tags</span>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Meta Title (EN)"
                  value={seoTitleEn}
                  onChange={setSeoTitleEn}
                  maxLength={70}
                  placeholder="Defaults to article title"
                />
                <TextField
                  label="Meta Title (HI)"
                  value={seoTitleHi}
                  onChange={setSeoTitleHi}
                  maxLength={70}
                  placeholder="Defaults to Hindi title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextArea
                  label="Meta Description (EN)"
                  value={seoDescEn}
                  onChange={setSeoDescEn}
                  maxLength={170}
                  rows={2}
                  placeholder="Defaults to English excerpt"
                />
                <TextArea
                  label="Meta Description (HI)"
                  value={seoDescHi}
                  onChange={setSeoDescHi}
                  maxLength={170}
                  rows={2}
                  placeholder="Defaults to Hindi excerpt"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column (1 col): Settings, Cover Image & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <span className="font-semibold text-ink">Publishing Settings</span>
            </CardHeader>
            <CardBody className="space-y-4">
              <SelectField
                label="Status"
                value={status}
                onChange={(v) => setStatus(v as ContentStatus)}
                options={STATUS_OPTIONS}
              />

              <SelectField
                label="Category"
                value={category}
                onChange={(v) => setCategory(v as ArticleCategory)}
                options={CATEGORY_OPTIONS}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="article-slug"
                    className="block font-sans text-[13px] font-medium text-ink6"
                  >
                    Slug
                  </label>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={handleAutoSlug}
                      className="font-sans text-[11px] font-medium text-em5 hover:underline"
                    >
                      Generate from title
                    </button>
                  )}
                </div>
                <input
                  id="article-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-field border border-s2 bg-iv font-sans text-[14px] text-ink focus:border-em5 focus:outline-none"
                  placeholder="article-url-slug"
                />
                {errors.slug ? (
                  <p className="mt-1 font-sans text-[12px] text-sin" role="alert">
                    {errors.slug}
                  </p>
                ) : null}
              </div>

              <NumberField
                label="Read Time (Minutes)"
                value={readMins}
                onChange={setReadMins}
                min={1}
                max={60}
              />

              <div>
                <label
                  htmlFor="article-published-at"
                  className="block font-sans text-[13px] font-medium text-ink6 mb-1.5"
                >
                  Publish Date & Time
                </label>
                <input
                  id="article-published-at"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-field border border-s2 bg-iv font-sans text-[14px] text-ink focus:border-em5 focus:outline-none"
                />
              </div>
            </CardBody>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <span className="font-semibold text-ink">Cover Image</span>
            </CardHeader>
            <CardBody>
              <ImageManager
                value={coverMedia ? [coverMedia] : []}
                onChange={(refs) => {
                  setCoverMedia(refs[0] ?? null);
                  setCoverMediaId(refs[0]?.id ?? null);
                }}
                max={1}
                purpose="article"
                disabled={isPending}
              />
            </CardBody>
          </Card>

          {isEditing && (
            <Card>
              <CardHeader>
                <span className="font-semibold text-sin">Danger Zone</span>
              </CardHeader>
              <CardBody>
                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className="w-full h-10 rounded-btn border border-sin/30 bg-sin/5 text-sin hover:bg-sin/10 font-sans text-[14px] font-medium transition-colors"
                    >
                      Delete Article
                    </button>
                  }
                  title="Delete Article"
                  body={`Are you sure you want to delete "${titleEn}"? This action cannot be undone.`}
                  confirmLabel="Delete"
                  tone="danger"
                  onConfirm={handleDelete}
                />
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <FormBar
        saveLabel={isEditing ? "Save Changes" : "Create Article"}
        isPending={isPending}
        onCancel={() => router.push("/admin/content/blog")}
      />
    </form>
  );
}
