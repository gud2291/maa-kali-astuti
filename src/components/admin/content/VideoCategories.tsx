"use client";

import { useState } from "react";
import { Sheet } from "@/components/admin/ui/Sheet";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { toast } from "@/components/admin/ui/toast";
import { updateVideoCategoriesAction } from "@/server/videos/admin-actions";
import type { VideoCategoryItem } from "@/lib/validation/content";
import { useRouter } from "next/navigation";

export type VideoCategoriesProps = {
  initialCategories: VideoCategoryItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VideoCategories({
  initialCategories,
  open,
  onOpenChange,
}: VideoCategoriesProps): React.JSX.Element {
  const router = useRouter();
  const [categories, setCategories] = useState<VideoCategoryItem[]>(initialCategories);
  const [pending, setPending] = useState(false);

  const addCategory = (): void => {
    setCategories([
      ...categories,
      {
        key: `cat_${Date.now().toString(36)}`,
        label: { en: "", hi: "" },
      },
    ]);
  };

  const removeCategory = (index: number): void => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: "key" | "en" | "hi",
    val: string,
  ): void => {
    const next = [...categories];
    const current = next[index]!;
    if (field === "key") {
      // Lowercase, hyphenated key
      next[index] = {
        ...current,
        key: val.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
      };
    } else {
      next[index] = {
        ...current,
        label: {
          ...current.label,
          [field]: val,
        },
      };
    }
    setCategories(next);
  };

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (categories.some((c) => !c.key || !c.label.en)) {
      toast.err("All categories must have a key and an English name");
      return;
    }

    setPending(true);
    try {
      const res = await updateVideoCategoriesAction(categories);
      if (res.ok) {
        toast.ok("Video categories saved");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.err(res.message ?? "Failed to save categories");
      }
    } catch {
      toast.err("An error occurred while saving categories");
    } finally {
      setPending(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Video Categories"
      description="Manage category tabs used to filter videos on the storefront"
    >
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="space-y-3">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-btn border border-s2 bg-cream p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-ink6">
                  Category #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  title="Remove category"
                  aria-label="Remove category"
                  className="flex size-7 items-center justify-center rounded-field text-sin hover:bg-rose/30 cursor-pointer"
                >
                  <span className="size-3.5">
                    <AdminIcon name="trash" />
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-sans text-[11px] font-medium text-ink6 uppercase">
                    Key / Slug
                  </label>
                  <input
                    type="text"
                    value={cat.key}
                    onChange={(e) => updateItem(index, "key", e.target.value)}
                    placeholder="e.g. pravachan"
                    className="h-8 w-full rounded-field border border-s2 bg-cream px-2 font-mono text-[12px] text-ink outline-none focus:border-em7"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-sans text-[11px] font-medium text-ink6 uppercase">
                    English Label
                  </label>
                  <input
                    type="text"
                    value={cat.label.en}
                    onChange={(e) => updateItem(index, "en", e.target.value)}
                    placeholder="e.g. Pravachan"
                    className="h-8 w-full rounded-field border border-s2 bg-cream px-2 font-sans text-[13px] text-ink outline-none focus:border-em7"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-sans text-[11px] font-medium text-ink6 uppercase">
                    Hindi Label
                  </label>
                  <input
                    type="text"
                    value={cat.label.hi}
                    onChange={(e) => updateItem(index, "hi", e.target.value)}
                    placeholder="e.g. प्रवचन"
                    className="h-8 w-full rounded-field border border-s2 bg-cream px-2 font-deva text-[13px] text-ink outline-none focus:border-em7"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCategory}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-btn border border-dashed border-s2 bg-s1/50 font-sans text-[13px] font-semibold text-em7 hover:border-em7 hover:bg-s1 cursor-pointer"
        >
          <span className="size-4">
            <AdminIcon name="plus" />
          </span>
          <span>Add Category</span>
        </button>

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
            <span>Save Categories</span>
          </button>
        </div>
      </form>
    </Sheet>
  );
}
