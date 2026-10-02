"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { TextField } from "@/components/admin/form/TextField";
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
  const [activeTab, setActiveTab] = useState<"en" | "hi">("en");

  const [titleEn, setTitleEn] = useState(initialData.titleEn);
  const [titleHi, setTitleHi] = useState(initialData.titleHi);
  const [bodyEn, setBodyEn] = useState<RichDoc>(initialData.bodyEn);
  const [bodyHi, setBodyHi] = useState<RichDoc | null>(initialData.bodyHi);

  const [error, setError] = useState<string | null>(null);

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
        toast.success("Policy page updated successfully");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update page");
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
          <LocaleTabs value={activeTab} onChange={setActiveTab} />
        </CardHeader>
        <CardBody className="space-y-5">
          {activeTab === "en" ? (
            <>
              <TextField
                label="Page Title (English)"
                value={titleEn}
                onChange={setTitleEn}
                error={error || undefined}
                required
                maxLength={140}
              />

              <div>
                <label className="block font-sans text-[13px] font-medium text-ink6 mb-1.5">
                  Policy Content (English)
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
                label="Page Title (Hindi)"
                value={titleHi}
                onChange={setTitleHi}
                maxLength={140}
                placeholder="नीति का शीर्षक हिंदी में दर्ज करें"
              />

              <div>
                <label className="block font-sans text-[13px] font-medium text-ink6 mb-1.5">
                  Policy Content (Hindi)
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

      <FormBar
        saveLabel="Save Policy"
        isPending={isPending}
        onCancel={() => router.push("/admin/content/pages")}
      />
    </form>
  );
}
