"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { toast } from "@/components/admin/ui/toast";
import {
  setProductStatusAction,
  duplicateProductAction,
  deleteProductAction,
} from "@/server/catalog/admin-actions";
import type { ProductStatus } from "@/lib/domain/enums";
import { cn } from "@/lib/utils/cn";

export type ProductRowMenuProps = {
  product: {
    id: string;
    slug: string;
    nameEn: string;
    status: ProductStatus;
  };
  canEdit: boolean;
};

const STATUS_ITEMS: { status: ProductStatus; label: string }[] = [
  { status: "active", label: "Set active (show on site)" },
  { status: "draft", label: "Move to draft (hide)" },
  { status: "archived", label: "Archive" },
];

const itemClass =
  "flex cursor-pointer select-none items-center gap-2.5 rounded-field px-2.5 py-2 font-sans text-[13.5px] text-ink outline-none data-[highlighted]:bg-s1 data-[disabled]:pointer-events-none data-[disabled]:opacity-50";

/** Row-level actions for the admin products table: edit, view, status, duplicate, delete. */
export function ProductRowMenu({ product, canEdit }: ProductRowMenuProps): React.JSX.Element {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setStatus = (status: ProductStatus): void => {
    startTransition(async () => {
      const res = await setProductStatusAction({ id: product.id, status });
      if (res.ok) {
        toast.ok(`Product marked as ${status}`);
        router.refresh();
      } else {
        toast.err(res.message ?? "Failed to change status");
      }
    });
  };

  const duplicate = (): void => {
    startTransition(async () => {
      const res = await duplicateProductAction({ id: product.id });
      if (res.ok) {
        toast.ok("Product duplicated as draft");
        router.push(`/admin/products/${res.data.id}`);
      } else {
        toast.err(res.message ?? "Failed to duplicate product");
      }
    });
  };

  const remove = async (): Promise<boolean> => {
    const res = await deleteProductAction({ id: product.id });
    if (res.ok) {
      toast.ok("Product deleted permanently");
      router.refresh();
      return true;
    }
    toast.err(res.message ?? "Failed to delete product");
    return false;
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {canEdit && (
        <Link
          href={`/admin/products/${product.id}`}
          title="Edit product"
          aria-label={`Edit ${product.nameEn}`}
          className="inline-flex size-8 items-center justify-center rounded-btn text-ink6 transition-colors hover:bg-s2 hover:text-ink"
        >
          <span className="size-4">
            <AdminIcon name="edit" />
          </span>
        </Link>
      )}

      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            disabled={pending}
            title="More actions"
            aria-label={`More actions for ${product.nameEn}`}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-btn text-ink6 transition-colors hover:bg-s2 hover:text-ink disabled:opacity-50 data-[state=open]:bg-s2"
          >
            {pending ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <span className="size-4">
                <AdminIcon name="more" />
              </span>
            )}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            className="z-50 min-w-[220px] rounded-btn border border-s2 bg-cream p-1.5 shadow-card"
          >
            {canEdit && (
              <DropdownMenu.Item asChild className={itemClass}>
                <Link href={`/admin/products/${product.id}`}>
                  <span className="size-4 text-ink6">
                    <AdminIcon name="edit" />
                  </span>
                  Edit details
                </Link>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item asChild className={itemClass}>
              <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer">
                <span className="size-4 text-ink6">
                  <AdminIcon name="eye" />
                </span>
                View on site
              </a>
            </DropdownMenu.Item>

            {canEdit && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-s2" />
                <DropdownMenu.Label className="px-2.5 pb-1 pt-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink6">
                  Status
                </DropdownMenu.Label>
                {STATUS_ITEMS.map((s) => {
                  const current = product.status === s.status;
                  return (
                    <DropdownMenu.Item
                      key={s.status}
                      disabled={current}
                      onSelect={() => setStatus(s.status)}
                      className={itemClass}
                    >
                      <span className={cn("size-4", current ? "text-em7" : "text-transparent")}>
                        <AdminIcon name="check" />
                      </span>
                      {s.label}
                    </DropdownMenu.Item>
                  );
                })}

                <DropdownMenu.Separator className="my-1 h-px bg-s2" />
                <DropdownMenu.Item onSelect={duplicate} className={itemClass}>
                  <span className="size-4 text-ink6">
                    <AdminIcon name="copy" />
                  </span>
                  Duplicate
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => setConfirmDelete(true)}
                  className={cn(itemClass, "text-sin data-[highlighted]:bg-rose/40")}
                >
                  <span className="size-4">
                    <AdminIcon name="trash" />
                  </span>
                  Delete
                </DropdownMenu.Item>
              </>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      {canEdit && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Delete this product?"
          body={
            <span>
              Are you sure you want to permanently delete <strong>{product.nameEn}</strong>? This
              will remove all photos and product data. Products that have already been ordered
              cannot be deleted and must be archived instead.
            </span>
          }
          confirmLabel="Delete permanently"
          tone="danger"
          onConfirm={remove}
        />
      )}
    </div>
  );
}
