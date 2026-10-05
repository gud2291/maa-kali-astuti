"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog } from "radix-ui";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { toast } from "@/components/admin/ui/toast";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { Stars } from "@/components/ui/Rating";
import { MediaImg } from "@/components/media/MediaImg";
import {
  approveReviewAction,
  rejectReviewAction,
  setShowOnHomeAction,
  deleteReviewAction,
} from "@/server/reviews/admin-actions";
import { formatIst } from "@/lib/core/ist";
import type { AdminReviewRow } from "@/server/reviews/admin";
import type { MediaRef } from "@/lib/domain/media";

type Props = {
  review: AdminReviewRow;
};

export function ReviewCard({ review }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [previewPhoto, setPreviewPhoto] = useState<MediaRef | null>(null);

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approveReviewAction(review.id);
      if (res.ok) {
        toast.ok(`Approved review #${review.id}`);
        router.refresh();
      } else {
        toast.err("Failed to approve review");
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectReviewAction(review.id);
      if (res.ok) {
        toast.ok(`Rejected review #${review.id}`);
        router.refresh();
      } else {
        toast.err("Failed to reject review");
      }
    });
  };

  const handleToggleHome = () => {
    startTransition(async () => {
      const nextState = !review.showOnHome;
      const res = await setShowOnHomeAction(review.id, nextState);
      if (res.ok) {
        toast.ok(
          nextState
            ? `Review #${review.id} will show on home`
            : `Review #${review.id} removed from home`,
        );
        router.refresh();
      } else {
        toast.err("Failed to update home display");
      }
    });
  };

  const handleDelete = async (): Promise<boolean> => {
    const res = await deleteReviewAction(review.id);
    if (res.ok) {
      toast.ok(`Deleted review #${review.id}`);
      router.refresh();
      return true;
    }
    toast.err("Failed to delete review");
    return false;
  };

  const statusTone =
    review.status === "approved"
      ? "ok"
      : review.status === "rejected"
        ? "danger"
        : "warn";

  return (
    <article className="flex flex-col gap-4 rounded-btn border border-s2 bg-cream/30 p-5 transition-shadow hover:shadow-card">
      {/* Top row: Product info + status badges + date */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-s2/60 pb-3">
        <div className="flex items-center gap-3">
          {review.productThumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.productThumb}
              alt=""
              className="size-11 rounded-btn object-cover border border-s2/60 bg-cream flex-none"
            />
          ) : (
            <div className="size-11 rounded-btn bg-s1 border border-s2/60 flex-none grid place-items-center text-em7">
              <Icon name="package" className="size-5" />
            </div>
          )}
          <div className="flex flex-col">
            <Link
              href={`/admin/products/${review.productId}`}
              className="font-sans text-[14px] font-semibold text-em9 no-underline hover:underline hover:text-em7 transition-colors truncate max-w-[280px]"
            >
              {review.productName}
            </Link>
            <span className="font-sans text-[11.5px] text-ink6">
              ID: {review.productId}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={statusTone}>
            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
          </StatusBadge>
          {review.verified && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-em1 px-2 py-0.5 font-sans text-[11.5px] font-semibold text-em9 border border-em5/30">
              <span className="size-3 text-em7">
                <Icon name="checkc" />
              </span>
              Verified
            </span>
          )}
          {review.showOnHome && (
            <span className="inline-flex items-center gap-1 rounded-pill bg-g1 px-2 py-0.5 font-sans text-[11.5px] font-semibold text-g7 border border-g3/40">
              <span className="size-3 text-g5">
                <Icon name="starF" />
              </span>
              On Home
            </span>
          )}
          <span className="font-sans text-[12px] text-ink6 ml-1">
            {formatIst(review.createdAt)}
          </span>
        </div>
      </div>

      {/* Middle row: Rating + Reviewer name + Title + Body */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24">
            <Stars n={review.rating} />
          </div>
          <span className="font-sans text-[13px] font-bold text-ink">
            {review.rating}.0
          </span>
          <span className="text-ink6 font-sans text-[13px]">·</span>
          <span className="font-sans text-[13px] font-medium text-ink">
            {review.name}
          </span>
          {review.city && (
            <span className="font-sans text-[13px] text-ink6">
              ({review.city})
            </span>
          )}
        </div>

        {review.title && (
          <h4 className="m-0 font-sans text-[15px] font-semibold text-em9">
            {review.title}
          </h4>
        )}

        <p className="m-0 font-sans text-[13.5px] leading-relaxed text-ink whitespace-pre-line">
          {review.body}
        </p>
      </div>

      {/* Photos row */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {review.photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setPreviewPhoto(photo)}
              aria-label="View photo"
              className="size-16 rounded-btn overflow-hidden border border-s2 bg-cream/40 p-0 cursor-pointer hover:opacity-90 transition-opacity flex-none"
            >
              <MediaImg
                media={photo}
                sizes="64px"
                alt="Review photo"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Bottom row: Moderation actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-s2/60 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {review.status !== "approved" && (
            <Button
              variant="primary"
              size="xs"
              onClick={handleApprove}
              disabled={isPending}
            >
              <span className="size-3.5 mr-1">
                <Icon name="check" />
              </span>
              Approve
            </Button>
          )}

          {review.status !== "rejected" && (
            <Button
              variant="outline"
              size="xs"
              onClick={handleReject}
              disabled={isPending}
            >
              <span className="size-3.5 mr-1 text-sin">
                <Icon name="close" />
              </span>
              Reject
            </Button>
          )}

          {review.status === "approved" && (
            <Button
              variant={review.showOnHome ? "primary" : "outline"}
              size="xs"
              onClick={handleToggleHome}
              disabled={isPending}
            >
              <span className="size-3.5 mr-1">
                <Icon name="star" />
              </span>
              {review.showOnHome ? "Featured on Home" : "Show on Home"}
            </Button>
          )}
        </div>

        <ConfirmDialog
          trigger={
            <Button
              variant="outline"
              size="xs"
              disabled={isPending}
              className="text-sin hover:bg-rose/40"
            >
              <span className="size-3.5 mr-1">
                <Icon name="trash" />
              </span>
              Delete
            </Button>
          }
          title="Delete Review"
          body={`Are you sure you want to permanently delete review #${review.id}? This will also delete any uploaded photos and recalculate the product rating.`}
          confirmLabel="Delete Review"
          tone="danger"
          onConfirm={handleDelete}
        />
      </div>

      {/* Photo Preview Dialog */}
      <Dialog.Root
        open={previewPhoto !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewPhoto(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs animate-in fade-in" />
          <Dialog.Content className="fixed inset-4 md:inset-12 z-60 flex items-center justify-center p-2 outline-none">
            {previewPhoto && (
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <Dialog.Close
                  aria-label="Close"
                  className="absolute -top-3 -right-3 z-10 grid size-9 cursor-pointer place-items-center rounded-pill border-0 bg-iv text-em9 shadow-lg hover:bg-s1"
                >
                  <Icon name="close" className="size-4" />
                </Dialog.Close>
                <div className="overflow-hidden rounded-btn border border-s2/40 bg-black shadow-2xl max-w-[90vw] max-h-[85vh]">
                  <MediaImg
                    media={previewPhoto}
                    sizes="90vw"
                    alt="Full preview"
                    className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain block"
                  />
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </article>
  );
}
