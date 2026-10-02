"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/admin/ui/Sheet";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { toast } from "@/components/admin/ui/toast";
import { ImageManager } from "@/components/admin/products/ImageManager";
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialsAction,
} from "@/server/testimonials/admin-actions";
import { SortableList } from "./SortableList";
import type { TestimonialAdminRow } from "@/server/testimonials/admin";
import type { TestimonialKind } from "@/lib/domain/enums";
import type { MediaRef } from "@/lib/domain/media";

export type TestimonialFormProps = {
  testimonial?: TestimonialAdminRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function TestimonialForm({
  testimonial,
  open,
  onOpenChange,
  onSuccess,
}: TestimonialFormProps): React.JSX.Element {
  const isEdit = !!testimonial;

  const [kind, setKind] = useState<TestimonialKind>(testimonial?.kind ?? "text");
  const [name, setName] = useState(testimonial?.name ?? "");
  const [city, setCity] = useState(testimonial?.city ?? "");
  const [tag, setTag] = useState(testimonial?.tag ?? "");
  const [rating, setRating] = useState<number>(testimonial?.rating ?? 5);
  const [quoteEn, setQuoteEn] = useState(testimonial?.quoteEn ?? "");
  const [quoteHi, setQuoteHi] = useState(testimonial?.quoteHi ?? "");
  const [youtubeId, setYoutubeId] = useState(testimonial?.youtubeId ?? "");
  const [mediaRefs, setMediaRefs] = useState<MediaRef[]>([]);
  const [featured, setFeatured] = useState(testimonial?.featured ?? false);
  const [visible, setVisible] = useState(testimonial?.visible ?? true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setKind(testimonial.kind);
      setName(testimonial.name);
      setCity(testimonial.city ?? "");
      setTag(testimonial.tag ?? "");
      setRating(testimonial.rating ?? 5);
      setQuoteEn(testimonial.quoteEn);
      setQuoteHi(testimonial.quoteHi);
      setYoutubeId(testimonial.youtubeId ?? "");
      setMediaRefs(testimonial.mediaRef ? [testimonial.mediaRef] : []);
      setFeatured(testimonial.featured);
      setVisible(testimonial.visible);
    } else {
      setKind("text");
      setName("");
      setCity("");
      setTag("");
      setRating(5);
      setQuoteEn("");
      setQuoteHi("");
      setYoutubeId("");
      setMediaRefs([]);
      setFeatured(false);
      setVisible(true);
    }
  }, [testimonial, open]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (quoteEn.trim().length < 10) {
      toast.error("English quote must be at least 10 characters long");
      return;
    }

    setPending(true);
    try {
      const payload = {
        kind,
        name: name.trim(),
        city: city.trim() || null,
        tag: tag.trim() || null,
        rating: rating || null,
        quoteEn: quoteEn.trim(),
        quoteHi: quoteHi.trim(),
        youtubeId: kind === "video" ? youtubeId.trim() || null : null,
        mediaId: kind === "photo" && mediaRefs[0] ? mediaRefs[0].id : null,
        featured,
        visible,
      };

      const res = isEdit
        ? await updateTestimonialAction(testimonial.id, payload)
        : await createTestimonialAction(payload);

      if (res.ok) {
        toast.success(isEdit ? "Testimonial updated" : "Testimonial created");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.message ?? "Failed to save testimonial");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setPending(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Testimonial" : "Add Testimonial"}
      description="Manage devotee experiences, reviews, and video/photo testimonials"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              Format / Kind
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as TestimonialKind)}
              className="h-9 w-full rounded-field border border-s2 bg-cream px-2 font-sans text-[13px] text-ink outline-none focus:border-em7 cursor-pointer"
            >
              <option value="text">Text only</option>
              <option value="video">Video (YouTube)</option>
              <option value="photo">Photo / Picture</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              Rating (Stars)
            </label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="h-9 w-full rounded-field border border-s2 bg-cream px-2 font-sans text-[13px] text-ink outline-none focus:border-em7 cursor-pointer"
            >
              <option value="5">★★★★★ (5 Stars)</option>
              <option value="4">★★★★☆ (4 Stars)</option>
              <option value="3">★★★☆☆ (3 Stars)</option>
              <option value="2">★★☆☆☆ (2 Stars)</option>
              <option value="1">★☆☆☆☆ (1 Star)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              Author Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>

          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              City / Location
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Varanasi, UP"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Tag / Service
          </label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. Kundali Reading, 7 Mukhi Rudraksha"
            className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        {kind === "video" && (
          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              YouTube Video ID (11 chars)
            </label>
            <input
              type="text"
              value={youtubeId}
              onChange={(e) => setYoutubeId(e.target.value)}
              placeholder="e.g. dQw4w9WgXcQ"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-mono text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>
        )}

        {kind === "photo" && (
          <div>
            <label className="mb-1.5 block font-sans text-[12px] font-medium text-ink6">
              Devotee / Customer Photo
            </label>
            <ImageManager
              value={mediaRefs}
              onChange={setMediaRefs}
              max={1}
              purpose="testimonial"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Quote (English) * (10–600 chars)
          </label>
          <textarea
            required
            rows={3}
            value={quoteEn}
            onChange={(e) => setQuoteEn(e.target.value)}
            placeholder="Devotee feedback in English..."
            className="w-full rounded-field border border-s2 bg-cream p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Quote (Hindi)
          </label>
          <textarea
            rows={3}
            value={quoteHi}
            onChange={(e) => setQuoteHi(e.target.value)}
            placeholder="अनुभव व विचार (हिंदी)..."
            className="w-full rounded-field border border-s2 bg-cream p-2.5 font-deva text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div className="flex items-center gap-6 border-t border-s2 pt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="size-4 rounded-field accent-em7"
            />
            <span className="font-sans text-[13px] font-medium text-ink">
              Featured on Home
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="size-4 rounded-field accent-em7"
            />
            <span className="font-sans text-[13px] font-medium text-ink">
              Visible on Storefront
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-s2 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-btn border border-s2 px-4 font-sans text-[13px] font-medium text-ink hover:bg-s1 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex h-9 items-center gap-2 rounded-btn bg-em9 px-5 font-sans text-[13px] font-semibold text-em1 shadow-sm hover:bg-em7 disabled:opacity-50 cursor-pointer"
          >
            {pending && (
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            <span>{isEdit ? "Update Testimonial" : "Create Testimonial"}</span>
          </button>
        </div>
      </form>
    </Sheet>
  );
}

export function TestimonialsManager({
  initialTestimonials,
}: {
  initialTestimonials: TestimonialAdminRow[];
}): React.JSX.Element {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<TestimonialAdminRow | null>(null);

  const handleEdit = (item: TestimonialAdminRow): void => {
    setSelectedTestimonial(item);
    setFormOpen(true);
  };

  const handleCreate = (): void => {
    setSelectedTestimonial(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      const res = await deleteTestimonialAction(id);
      if (res.ok) {
        toast.success("Testimonial deleted");
        router.refresh();
        return true;
      }
      toast.error(res.message ?? "Failed to delete testimonial");
      return false;
    } catch {
      toast.error("Failed to delete testimonial");
      return false;
    }
  };

  const handleReorder = async (ids: (string | number)[]): Promise<{ ok: boolean }> => {
    const numIds = ids.map((id) => Number(id));
    const res = await reorderTestimonialsAction(numIds);
    if (res.ok) {
      toast.success("Order updated");
      router.refresh();
      return { ok: true };
    }
    return { ok: false };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials & Experiences"
        description="Manage customer testimonials, devotee experiences, and ratings shown on the site."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-9 items-center gap-1.5 rounded-btn bg-em9 px-4 font-sans text-[13px] font-semibold text-em1 shadow-sm hover:bg-em7 cursor-pointer"
          >
            <span className="size-4">
              <AdminIcon name="plus" />
            </span>
            <span>Add Testimonial</span>
          </button>
        }
      />

      {initialTestimonials.length === 0 ? (
        <div className="rounded-btn border border-dashed border-s2 bg-cream p-12 text-center">
          <p className="font-sans text-[14px] text-ink6">
            No testimonials added yet.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="mt-3 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-em7 hover:underline cursor-pointer"
          >
            <span className="size-3.5">
              <AdminIcon name="plus" />
            </span>
            <span>Add the first testimonial</span>
          </button>
        </div>
      ) : (
        <SortableList
          items={initialTestimonials}
          onReorder={handleReorder}
          renderItem={(item) => (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-1">
              <div className="flex min-w-0 items-start gap-3">
                {item.mediaRef ? (
                  <img
                    src={item.mediaRef.src}
                    alt={item.name}
                    className="size-11 flex-none rounded-full object-cover bg-s1 shadow-hair"
                  />
                ) : (
                  <div className="flex size-11 flex-none items-center justify-center rounded-full bg-s1 text-ink6 font-display font-semibold text-[15px]">
                    {item.name.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-sans text-[14px] font-semibold text-ink">
                      {item.name}
                    </p>
                    {item.city && (
                      <span className="text-[12px] text-ink6">
                        ({item.city})
                      </span>
                    )}
                    {item.rating && (
                      <span className="text-[12px] text-g5">
                        {"★".repeat(item.rating)}
                      </span>
                    )}
                    {item.featured && (
                      <StatusBadge tone="warn">Featured</StatusBadge>
                    )}
                    {!item.visible && (
                      <StatusBadge tone="muted">Hidden</StatusBadge>
                    )}
                  </div>

                  <p className="line-clamp-1 font-sans text-[13px] text-ink6/90 mt-0.5">
                    &ldquo;{item.quoteEn}&rdquo;
                  </p>

                  {item.tag && (
                    <span className="mt-1 inline-block rounded bg-s1 px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink6">
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-none items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="flex size-8 items-center justify-center rounded-field text-ink6 hover:bg-s1 hover:text-ink cursor-pointer"
                  title="Edit testimonial"
                  aria-label="Edit testimonial"
                >
                  <span className="size-4">
                    <AdminIcon name="edit" />
                  </span>
                </button>

                <ConfirmDialog
                  trigger={
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-field text-sin hover:bg-rose/40 cursor-pointer"
                      title="Delete testimonial"
                      aria-label="Delete testimonial"
                    >
                      <span className="size-4">
                        <AdminIcon name="trash" />
                      </span>
                    </button>
                  }
                  title="Delete Testimonial"
                  body={`Are you sure you want to delete the testimonial by "${item.name}"?`}
                  confirmLabel="Delete"
                  tone="danger"
                  onConfirm={() => handleDelete(item.id)}
                />
              </div>
            </div>
          )}
        />
      )}

      <TestimonialForm
        testimonial={selectedTestimonial}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
