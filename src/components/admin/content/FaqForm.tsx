"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/admin/ui/Sheet";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { toast } from "@/components/admin/ui/toast";
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
  reorderFaqsAction,
} from "@/server/faqs/admin-actions";
import { SortableList } from "./SortableList";
import { FAQ_SETS, type FaqSet } from "@/lib/domain/enums";
import type { FaqAdminRow } from "@/server/faqs/admin";
import { cn } from "@/lib/utils/cn";

export type FaqFormProps = {
  faq?: FaqAdminRow | null;
  defaultSetKey: FaqSet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function FaqForm({
  faq,
  defaultSetKey,
  open,
  onOpenChange,
  onSuccess,
}: FaqFormProps): React.JSX.Element {
  const isEdit = !!faq;

  const [setKey, setSetKey] = useState<FaqSet>(faq?.setKey ?? defaultSetKey);
  const [qEn, setQEn] = useState(faq?.qEn ?? "");
  const [qHi, setQHi] = useState(faq?.qHi ?? "");
  const [aEn, setAEn] = useState(faq?.aEn ?? "");
  const [aHi, setAHi] = useState(faq?.aHi ?? "");
  const [visible, setVisible] = useState(faq?.visible ?? true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (faq) {
      setSetKey(faq.setKey);
      setQEn(faq.qEn);
      setQHi(faq.qHi);
      setAEn(faq.aEn);
      setAHi(faq.aHi);
      setVisible(faq.visible);
    } else {
      setSetKey(defaultSetKey);
      setQEn("");
      setQHi("");
      setAEn("");
      setAHi("");
      setVisible(true);
    }
  }, [faq, defaultSetKey, open]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!qEn.trim() || !aEn.trim()) {
      toast.error("English question and answer are required");
      return;
    }

    setPending(true);
    try {
      const payload = {
        setKey,
        qEn: qEn.trim(),
        qHi: qHi.trim(),
        aEn: aEn.trim(),
        aHi: aHi.trim(),
        visible,
      };

      const res = isEdit
        ? await updateFaqAction(faq.id, payload)
        : await createFaqAction(payload);

      if (res.ok) {
        toast.success(isEdit ? "FAQ updated" : "FAQ created");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.message ?? "Failed to save FAQ");
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
      title={isEdit ? "Edit FAQ" : "Add FAQ"}
      description="Add or edit questions and answers for storefront sections"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            FAQ Section / Set
          </label>
          <select
            value={setKey}
            onChange={(e) => setSetKey(e.target.value as FaqSet)}
            className="h-9 w-full rounded-field border border-s2 bg-cream px-2 font-sans text-[13px] text-ink outline-none focus:border-em7 cursor-pointer"
          >
            {FAQ_SETS.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()} section
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Question (English) *
          </label>
          <input
            type="text"
            required
            value={qEn}
            onChange={(e) => setQEn(e.target.value)}
            placeholder="e.g. How are products energized?"
            className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Question (Hindi)
          </label>
          <input
            type="text"
            value={qHi}
            onChange={(e) => setQHi(e.target.value)}
            placeholder="प्रश्न (हिंदी में)..."
            className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Answer (English) *
          </label>
          <textarea
            required
            rows={4}
            value={aEn}
            onChange={(e) => setAEn(e.target.value)}
            placeholder="Clear, helpful response in English..."
            className="w-full rounded-field border border-s2 bg-cream p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Answer (Hindi)
          </label>
          <textarea
            rows={4}
            value={aHi}
            onChange={(e) => setAHi(e.target.value)}
            placeholder="उत्तर (हिंदी में)..."
            className="w-full rounded-field border border-s2 bg-cream p-2.5 font-deva text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div className="border-t border-s2 pt-3">
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
            <span>{isEdit ? "Update FAQ" : "Create FAQ"}</span>
          </button>
        </div>
      </form>
    </Sheet>
  );
}

export function FaqsManager({
  initialFaqs,
}: {
  initialFaqs: FaqAdminRow[];
}): React.JSX.Element {
  const router = useRouter();
  const [activeSet, setActiveSet] = useState<FaqSet>("home");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqAdminRow | null>(null);

  const setFaqs = initialFaqs.filter((f) => f.setKey === activeSet);

  const handleEdit = (item: FaqAdminRow): void => {
    setSelectedFaq(item);
    setFormOpen(true);
  };

  const handleCreate = (): void => {
    setSelectedFaq(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      const res = await deleteFaqAction(id);
      if (res.ok) {
        toast.success("FAQ deleted");
        router.refresh();
        return true;
      }
      toast.error(res.message ?? "Failed to delete FAQ");
      return false;
    } catch {
      toast.error("Failed to delete FAQ");
      return false;
    }
  };

  const handleReorder = async (ids: (string | number)[]): Promise<{ ok: boolean }> => {
    const numIds = ids.map((id) => Number(id));
    const res = await reorderFaqsAction(activeSet, numIds);
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
        title="Frequently Asked Questions"
        description="Manage FAQ questions, answers and ordering for each storefront section."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-9 items-center gap-1.5 rounded-btn bg-em9 px-4 font-sans text-[13px] font-semibold text-em1 shadow-sm hover:bg-em7 cursor-pointer"
          >
            <span className="size-4">
              <AdminIcon name="plus" />
            </span>
            <span>Add FAQ</span>
          </button>
        }
      />

      {/* Set Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-s2 pb-2">
        {FAQ_SETS.map((set) => {
          const count = initialFaqs.filter((f) => f.setKey === set).length;
          const isActive = activeSet === set;
          return (
            <button
              key={set}
              type="button"
              onClick={() => setActiveSet(set)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-btn px-3 py-1.5 font-sans text-[12.5px] font-semibold transition-colors cursor-pointer",
                isActive
                  ? "bg-em9 text-em1 shadow-sm"
                  : "bg-cream text-ink6 hover:bg-s1 hover:text-ink border border-s2",
              )}
            >
              <span>{set}</span>
              <span
                className={cn(
                  "rounded-pill px-1.5 py-0.2 font-mono text-[10.5px]",
                  isActive ? "bg-em7 text-em1" : "bg-s1 text-ink6",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {setFaqs.length === 0 ? (
        <div className="rounded-btn border border-dashed border-s2 bg-cream p-12 text-center">
          <p className="font-sans text-[14px] text-ink6">
            No FAQs added to the &ldquo;{activeSet}&rdquo; set yet.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="mt-3 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-em7 hover:underline cursor-pointer"
          >
            <span className="size-3.5">
              <AdminIcon name="plus" />
            </span>
            <span>Add the first FAQ</span>
          </button>
        </div>
      ) : (
        <SortableList
          items={setFaqs}
          onReorder={handleReorder}
          renderItem={(item) => (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-1">
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <p className="font-sans text-[14px] font-semibold text-ink">
                    {item.qEn}
                  </p>
                  {!item.visible && (
                    <StatusBadge tone="muted">Hidden</StatusBadge>
                  )}
                </div>

                {item.qHi && (
                  <p className="font-deva text-[13px] text-ink6 mt-0.5">
                    {item.qHi}
                  </p>
                )}

                <p className="line-clamp-2 font-sans text-[12.5px] text-ink6/80 mt-1">
                  {item.aEn}
                </p>
              </div>

              <div className="flex flex-none items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="flex size-8 items-center justify-center rounded-field text-ink6 hover:bg-s1 hover:text-ink cursor-pointer"
                  title="Edit FAQ"
                  aria-label="Edit FAQ"
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
                      title="Delete FAQ"
                      aria-label="Delete FAQ"
                    >
                      <span className="size-4">
                        <AdminIcon name="trash" />
                      </span>
                    </button>
                  }
                  title="Delete FAQ"
                  body={`Are you sure you want to delete this FAQ: "${item.qEn}"?`}
                  confirmLabel="Delete"
                  tone="danger"
                  onConfirm={() => handleDelete(item.id)}
                />
              </div>
            </div>
          )}
        />
      )}

      <FaqForm
        faq={selectedFaq}
        defaultSetKey={activeSet}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
