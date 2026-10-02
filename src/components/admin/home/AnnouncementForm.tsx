"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { toast } from "@/components/admin/ui/toast";
import { updateAnnouncementAction } from "@/server/home/admin-actions";
import type { Loc } from "@/lib/domain/loc";

export const DEFAULT_ANNOUNCEMENT_ITEMS: { text: Loc; href: string | null }[] = [
  {
    text: {
      en: "Free shipping on orders above ₹999",
      hi: "₹999 से अधिक के ऑर्डर पर मुफ़्त शिपिंग",
    },
    href: null,
  },
  {
    text: {
      en: "Every product energized in Mahapuja before dispatch",
      hi: "हर उत्पाद भेजने से पहले महापूजा में ऊर्जित",
    },
    href: null,
  },
  {
    text: {
      en: "Download your Janam Kundali — ₹99",
      hi: "अपनी जन्म कुंडली डाउनलोड करें — ₹99",
    },
    href: "/kundali-99",
  },
];

export function AnnouncementForm({
  initialAnnouncement,
}: {
  initialAnnouncement: { items: { text: Loc; href: string | null }[] } | null;
}): React.JSX.Element {
  const [items, setItems] = useState<{ text: Loc; href: string | null }[]>(
    initialAnnouncement?.items && initialAnnouncement.items.length > 0
      ? initialAnnouncement.items
      : DEFAULT_ANNOUNCEMENT_ITEMS,
  );

  const [isPending, startTransition] = useTransition();

  const handleTextChange = (index: number, lang: "en" | "hi", val: string) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              text: {
                ...item.text,
                [lang]: val,
              },
            }
          : item,
      ),
    );
  };

  const handleHrefChange = (index: number, val: string) => {
    const trimmed = val.trim();
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              href: trimmed === "" ? null : trimmed,
            }
          : item,
      ),
    );
  };

  const handleAddItem = () => {
    if (items.length >= 5) {
      toast.warn("Maximum of 5 announcement messages allowed");
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        text: { en: "", hi: "" },
        href: null,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.warn("At least 1 announcement message is required");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate that every item has at least an English or Hindi text
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.text.en.trim() && !it.text.hi.trim()) {
        toast.error(`Message ${i + 1} cannot be empty`);
        return;
      }
    }

    startTransition(async () => {
      const res = await updateAnnouncementAction(items);
      if (res.ok) {
        toast.success("Announcement bar updated successfully");
      } else {
        toast.error(res.error || "Failed to update announcement bar");
      }
    });
  };

  const handleReset = async (): Promise<boolean> => {
    const res = await updateAnnouncementAction(null);
    if (res.ok) {
      setItems(DEFAULT_ANNOUNCEMENT_ITEMS);
      toast.success("Announcement bar reset to default messages");
      return true;
    }
    toast.error(res.error || "Failed to reset announcement bar");
    return false;
  };

  return (
    <Card>
      <CardHeader
        title="Announcement Bar Messages"
        description="The top 32px banner rotates these messages across all pages. You can have between 1 and 5 messages."
        action={
          <div className="flex items-center gap-2">
            <ConfirmDialog
              title="Reset to Default Announcements?"
              body="Are you sure you want to reset the announcement bar to default messages? Custom messages will be removed."
              confirmLabel="Reset to Default"
              tone="danger"
              onConfirm={handleReset}
              trigger={
                <button
                  type="button"
                  disabled={isPending}
                  className="inline-flex h-9 items-center justify-center rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-s1 disabled:opacity-50 cursor-pointer"
                >
                  Reset to default
                </button>
              }
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-iv shadow-xs transition-colors hover:bg-em5 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Saving..." : "Save Messages"}
            </button>
          </div>
        }
      />
      <CardBody className="space-y-6">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-btn border border-s2 bg-cream/50 p-4 transition-all hover:bg-cream"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-sans text-[13px] font-semibold text-em7">
                  Message #{index + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    aria-label={`Remove message ${index + 1}`}
                    className="flex size-7 items-center justify-center rounded-field text-sin transition-colors hover:bg-rose/40 cursor-pointer"
                  >
                    <span className="size-4">
                      <AdminIcon name="trash" />
                    </span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-sans text-[12px] font-semibold text-ink">
                    English Text
                  </label>
                  <input
                    type="text"
                    value={item.text.en}
                    onChange={(e) => handleTextChange(index, "en", e.target.value)}
                    placeholder="e.g. Free shipping on orders above ₹999"
                    className="h-10 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[14px] text-ink outline-none focus:border-em7"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-sans text-[12px] font-semibold text-ink">
                    Hindi Text (हिंदी)
                  </label>
                  <input
                    type="text"
                    value={item.text.hi}
                    onChange={(e) => handleTextChange(index, "hi", e.target.value)}
                    placeholder="उदा. ₹999 से अधिक के ऑर्डर पर मुफ़्त शिपिंग"
                    className="h-10 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[14px] text-ink outline-none focus:border-em7"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="mb-1 block font-sans text-[12px] font-semibold text-ink">
                  Optional Link URL (e.g. /kundali-99 or https://...)
                </label>
                <input
                  type="text"
                  value={item.href ?? ""}
                  onChange={(e) => handleHrefChange(index, e.target.value)}
                  placeholder="/kundali-99"
                  className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
                />
              </div>
            </div>
          ))}
        </div>

        {items.length < 5 && (
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-2 rounded-btn border border-dashed border-s2 bg-cream/60 px-4 py-2.5 font-sans text-[13px] font-semibold text-em7 hover:border-em7 hover:bg-cream cursor-pointer"
          >
            <span className="size-4">
              <AdminIcon name="plus" />
            </span>
            Add Announcement Message ({items.length}/5)
          </button>
        )}
      </CardBody>
    </Card>
  );
}
