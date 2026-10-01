"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import {
  setProductStatusAction,
  duplicateProductAction,
  deleteProductAction,
} from "@/server/catalog/admin-actions";
import { toast } from "@/components/admin/ui/toast";
import type { ProductStatus } from "@/lib/domain/enums";

export type ProductActionsProps = {
  product: {
    id: string;
    slug: string;
    nameEn: string;
    status: ProductStatus;
  };
  canEdit: boolean;
};

export function ProductActions({
  product,
  canEdit,
}: ProductActionsProps): React.JSX.Element {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDuplicate = (): void => {
    startTransition(async () => {
      const res = await duplicateProductAction({ id: product.id });
      if (res.ok) {
        toast.success("Product duplicated as draft");
        router.push(`/admin/products/${res.data.id}`);
      } else {
        toast.error(res.error || "Failed to duplicate product");
      }
    });
  };

  const handleToggleArchive = (): void => {
    const nextStatus: ProductStatus =
      product.status === "archived" ? "draft" : "archived";

    startTransition(async () => {
      const res = await setProductStatusAction({
        id: product.id,
        status: nextStatus,
      });
      if (res.ok) {
        toast.success(`Product marked as ${nextStatus}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to change status");
      }
    });
  };

  const handleDelete = async (): Promise<boolean> => {
    const res = await deleteProductAction({ id: product.id });
    if (res.ok) {
      toast.success("Product deleted permanently");
      router.push("/admin/products");
      return true;
    } else {
      toast.error(res.error || "Failed to delete product");
      return false;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* View on site (always visible if product has slug) */}
      <Link
        href={`/product/${product.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-s1"
      >
        <span className="size-3.5 text-ink6">
          <AdminIcon name="arrowR" />
        </span>
        <span>View on site</span>
      </Link>

      {/* Admin edit actions */}
      {canEdit && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={handleDuplicate}
            className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-s1 disabled:opacity-50 cursor-pointer"
          >
            <span className="size-3.5 text-ink6">
              <AdminIcon name="copy" />
            </span>
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={handleToggleArchive}
            className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-s1 disabled:opacity-50 cursor-pointer"
          >
            <span className="size-3.5 text-ink6">
              <AdminIcon name="history" />
            </span>
            <span>{product.status === "archived" ? "Unarchive" : "Archive"}</span>
          </button>

          <ConfirmDialog
            title="Delete this product?"
            body={
              <span>
                Are you sure you want to permanently delete <strong>{product.nameEn}</strong>?
                This will remove all photos and product data. Products that have already been ordered cannot be deleted and must be archived instead.
              </span>
            }
            confirmLabel="Delete permanently"
            tone="danger"
            onConfirm={handleDelete}
            trigger={
              <button
                type="button"
                disabled={pending}
                className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-sin/30 bg-rose/30 px-3 font-sans text-[13px] font-semibold text-sin transition-colors hover:bg-rose/60 disabled:opacity-50 cursor-pointer"
              >
                <span className="size-3.5">
                  <AdminIcon name="trash" />
                </span>
                <span>Delete</span>
              </button>
            }
          />
        </>
      )}
    </div>
  );
}
