"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { PlainText } from "@/components/admin/form/plain";
import { LocaleTabs } from "@/components/admin/form/LocaleTabs";
import { FormBar } from "@/components/admin/form/FormBar";
import { toast } from "@/components/admin/ui/toast";
import { updatePageAction } from "@/server/pages/admin-actions";
import type { AdminPageDetail } from "@/server/pages/admin";
import type { RichDoc } from "@/lib/domain/types";

const RichEditor = dynamic(
  () => import("@/components/admin/editor/RichEditor").then((mod) => mod.RichEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded-btn border border-s2 bg-iv animate-pulse" />
    ),
  },
);

export type PageFormProps = {
  initialData: AdminPageDetail;
  mediaBase: string;
};

export function PageForm({ initialData, mediaBase }: PageFormProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [titleEn, setTitleEn] = useState(initialData.titleEn);
  const [titleHi, setTitleHi] = useState(initialData.titleHi);
  const [bodyEn, setBodyEn] = useState<RichDoc>(initialData.bodyEn);
  const [bodyHi, setBodyHi] = useState<RichDoc | null>(initialData.bodyHi);

  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const edit =
    <V,>(set: (v: V) => void) =>
    (v: V): void => {
      set(v);
      setDirty(true);
    };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!titleEn.trim()) {
      setError("English title is required");
      return;
    }
    setError(null);

    startTransition(async () => {
      const res = await updatePageAction(initialData.slug, {
        slug: initialData.slug,
        titleEn: titleEn.trim(),
        titleHi: titleHi.trim(),
        bodyEn,
        bodyHi: bodyHi && bodyHi.content?.length ? bodyHi : null,
      });

      if (res.ok) {
        toast.ok("Policy page updated successfully");
        setDirty(false);
        router.refresh();
      } else {
        toast.err(res.message || "Failed to update page");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 max-w-4xl">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-ink">{initialData.titleEn}</span>
            <span className="ml-2 font-mono text-[12px] text-ink6 bg-cream px-2 py-0.5 rounded-pill border border-s2">
              /policies/{initialData.slug}
            </span>
          </div>
        </CardHeader>
        <CardBody>
          <LocaleTabs
            hiEmpty={!titleHi.trim()}
            en={
              <div className="space-y-5">
                <PlainText
                  label="Page Title (English)"
                  value={titleEn}
                  onChange={edit(setTitleEn)}
                  error={error ?? undefined}
                  required
                  maxLength={140}
                />
                <div>
                  <label className="block font-sans text-[13px] font-medium text-ink6 mb-1.5">
                    Policy Content (English)
                  </label>
                  <RichEditor
                    value={bodyEn}
                    onChange={edit(setBodyEn)}
                    mediaBase={mediaBase}
                    disabled={isPending}
                  />
                </div>
              </div>
            }
            hi={
              <div className="space-y-5">
                <PlainText
                  label="Page Title (Hindi)"
                  value={titleHi}
                  onChange={edit(setTitleHi)}
                  placeholder="नीति का शीर्षक हिंदी में दर्ज करें"
                  maxLength={140}
                />
                <div>
                  <label className="block font-sans text-[13px] font-medium text-ink6 mb-1.5">
                    Policy Content (Hindi)
                  </label>
                  <RichEditor
                    value={bodyHi || { type: "doc", content: [] }}
                    onChange={edit<RichDoc | null>(setBodyHi)}
                    mediaBase={mediaBase}
                    disabled={isPending}
                  />
                </div>
              </div>
            }
          />
        </CardBody>
      </Card>

      <FormBar
        saveLabel="Save Policy"
        pending={isPending}
        dirty={dirty}
        cancelHref="/admin/content/pages"
      />
    </form>
  );
}
