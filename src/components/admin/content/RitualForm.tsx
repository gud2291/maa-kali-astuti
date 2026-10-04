"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/admin/ui/Sheet";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { Icon, type IconName } from "@/components/icons/Icon";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { toast } from "@/components/admin/ui/toast";
import {
  createRitualAction,
  updateRitualAction,
  deleteRitualAction,
  reorderRitualsAction,
} from "@/server/rituals/admin-actions";
import { SortableList } from "./SortableList";
import { IconPicker } from "./IconPicker";
import type { RitualAdminRow } from "@/server/rituals/admin";

export type RitualFormProps = {
  ritual?: RitualAdminRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function RitualForm({
  ritual,
  open,
  onOpenChange,
  onSuccess,
}: RitualFormProps): React.JSX.Element {
  const isEdit = !!ritual;

  const [icon, setIcon] = useState<string>(ritual?.icon ?? "diya");
  const [nameEn, setNameEn] = useState(ritual?.nameEn ?? "");
  const [nameHi, setNameHi] = useState(ritual?.nameHi ?? "");
  const [lineEn, setLineEn] = useState(ritual?.lineEn ?? "");
  const [lineHi, setLineHi] = useState(ritual?.lineHi ?? "");
  const [visible, setVisible] = useState(ritual?.visible ?? true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ritual) {
      setIcon(ritual.icon);
      setNameEn(ritual.nameEn);
      setNameHi(ritual.nameHi);
      setLineEn(ritual.lineEn);
      setLineHi(ritual.lineHi);
      setVisible(ritual.visible);
    } else {
      setIcon("diya");
      setNameEn("");
      setNameHi("");
      setLineEn("");
      setLineHi("");
      setVisible(true);
    }
  }, [ritual, open]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!nameEn.trim() || !lineEn.trim()) {
      toast.err("English name and line are required");
      return;
    }

    setPending(true);
    try {
      const payload = {
        icon,
        nameEn: nameEn.trim(),
        nameHi: nameHi.trim(),
        lineEn: lineEn.trim(),
        lineHi: lineHi.trim(),
        visible,
      };

      const res = isEdit
        ? await updateRitualAction(ritual.id, payload)
        : await createRitualAction(payload);

      if (res.ok) {
        toast.ok(isEdit ? "Ritual updated" : "Ritual created");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.err(res.message ?? "Failed to save ritual");
      }
    } catch {
      toast.err("An error occurred");
    } finally {
      setPending(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Sacred Ritual" : "Add Sacred Ritual"}
      description="Define ritual details, sacred icon, and English/Hindi descriptions"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block font-sans text-[12px] font-medium text-ink6">
            Sacred Icon
          </label>
          <IconPicker value={icon} onChange={(next) => setIcon(next)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              English Name *
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Mahamrityunjaya Jaap"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>

          <div>
            <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
              Hindi Name *
            </label>
            <input
              type="text"
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              placeholder="e.g. महामृत्युंजय जाप"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13px] text-ink outline-none focus:border-em7"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            English Summary Line *
          </label>
          <textarea
            required
            rows={2}
            value={lineEn}
            onChange={(e) => setLineEn(e.target.value)}
            placeholder="e.g. Complete Vedic anushthan for health and life protection."
            className="w-full rounded-field border border-s2 bg-cream p-2.5 font-sans text-[13px] text-ink outline-none focus:border-em7"
          />
        </div>

        <div>
          <label className="mb-1 block font-sans text-[12px] font-medium text-ink6">
            Hindi Summary Line
          </label>
          <textarea
            rows={2}
            value={lineHi}
            onChange={(e) => setLineHi(e.target.value)}
            placeholder="स्वास्थ्य और रक्षा हेतु वैदिक अनुष्ठान..."
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
            <span>{isEdit ? "Update Ritual" : "Create Ritual"}</span>
          </button>
        </div>
      </form>
    </Sheet>
  );
}

export function RitualsManager({
  initialRituals,
}: {
  initialRituals: RitualAdminRow[];
}): React.JSX.Element {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState<RitualAdminRow | null>(null);

  const handleEdit = (item: RitualAdminRow): void => {
    setSelectedRitual(item);
    setFormOpen(true);
  };

  const handleCreate = (): void => {
    setSelectedRitual(null);
    setFormOpen(true);
  };

  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      const res = await deleteRitualAction(id);
      if (res.ok) {
        toast.ok("Ritual deleted");
        router.refresh();
        return true;
      }
      toast.err(res.message ?? "Failed to delete ritual");
      return false;
    } catch {
      toast.err("Failed to delete ritual");
      return false;
    }
  };

  const handleReorder = async (ids: (string | number)[]): Promise<{ ok: boolean }> => {
    const numIds = ids.map((id) => Number(id));
    const res = await reorderRitualsAction(numIds);
    if (res.ok) {
      toast.ok("Order updated");
      router.refresh();
      return { ok: true };
    }
    return { ok: false };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sacred Rituals & Anushthans"
        description="Manage the list of traditional rituals, iconography, and descriptions displayed on /rituals."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="flex h-9 items-center gap-1.5 rounded-btn bg-em9 px-4 font-sans text-[13px] font-semibold text-em1 shadow-sm hover:bg-em7 cursor-pointer"
          >
            <span className="size-4">
              <AdminIcon name="plus" />
            </span>
            <span>Add Ritual</span>
          </button>
        }
      />

      {initialRituals.length === 0 ? (
        <div className="rounded-btn border border-dashed border-s2 bg-cream p-12 text-center">
          <p className="font-sans text-[14px] text-ink6">
            No rituals added yet.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="mt-3 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-em7 hover:underline cursor-pointer"
          >
            <span className="size-3.5">
              <AdminIcon name="plus" />
            </span>
            <span>Add the first ritual</span>
          </button>
        </div>
      ) : (
        <SortableList
          items={initialRituals}
          onReorder={handleReorder}
          renderItem={(item) => (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-1">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 flex-none items-center justify-center rounded-pill bg-s1 text-em7 shadow-hair">
                  <Icon name={(item.icon as IconName) || "diya"} className="size-5" />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-[14px] font-semibold text-ink">
                      {item.nameEn}
                    </p>
                    {item.nameHi && (
                      <span className="font-deva text-[13px] text-ink6">
                        ({item.nameHi})
                      </span>
                    )}
                    {!item.visible && (
                      <StatusBadge tone="muted">Hidden</StatusBadge>
                    )}
                  </div>

                  <p className="line-clamp-1 font-sans text-[12.5px] text-ink6/90 mt-0.5">
                    {item.lineEn}
                  </p>
                </div>
              </div>

              <div className="flex flex-none items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="flex size-8 items-center justify-center rounded-field text-ink6 hover:bg-s1 hover:text-ink cursor-pointer"
                  title="Edit ritual"
                  aria-label="Edit ritual"
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
                      title="Delete ritual"
                      aria-label="Delete ritual"
                    >
                      <span className="size-4">
                        <AdminIcon name="trash" />
                      </span>
                    </button>
                  }
                  title="Delete Ritual"
                  body={`Are you sure you want to delete the ritual "${item.nameEn}"?`}
                  confirmLabel="Delete"
                  tone="danger"
                  onConfirm={() => handleDelete(item.id)}
                />
              </div>
            </div>
          )}
        />
      )}

      <RitualForm
        ritual={selectedRitual}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
