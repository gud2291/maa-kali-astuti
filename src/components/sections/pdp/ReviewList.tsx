"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { MediaImg } from "@/components/media/MediaImg";
import { Stars } from "@/components/ui/Rating";
import { moreReviewsAction } from "@/server/reviews/actions";
import type { ProductReviewItem } from "@/server/reviews/queries";
import type { MediaRef } from "@/lib/domain/media";

type Props = {
  productId: string;
  initialItems: ProductReviewItem[];
  selectedStar: number | null;
  onSelectStar: (star: number | null) => void;
};

export function ReviewList({
  productId,
  initialItems,
  selectedStar,
  onSelectStar,
}: Props) {
  const t = useTranslations("reviews");
  const locale = useLocale();

  const [items, setItems] = useState<ProductReviewItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length >= 10);
  const [lightboxPhoto, setLightboxPhoto] = useState<MediaRef | null>(null);

  const filteredItems = selectedStar
    ? items.filter((item) => item.rating === selectedStar)
    : items;

  const handleLoadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await moreReviewsAction({
        productId,
        offset: items.length,
      });
      if (res.ok) {
        setItems((prev) => [...prev, ...res.data.items]);
        setHasMore(res.data.hasMore);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ms: number): string => {
    try {
      return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(ms));
    } catch {
      return new Date(ms).toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Star filter chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Chip
          on={selectedStar === null}
          onClick={() => onSelectStar(null)}
          variant="filter"
        >
          {t("allRatings")}
        </Chip>
        {[5, 4, 3, 2, 1].map((stars) => (
          <Chip
            key={stars}
            on={selectedStar === stars}
            onClick={() => onSelectStar(selectedStar === stars ? null : stars)}
            variant="filter"
          >
            <span>{stars}</span>
            <span className="size-3 text-g5 inline-block">
              <Icon name="starF" />
            </span>
          </Chip>
        ))}
      </div>

      {/* Review cards */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-ink6 font-sans text-[14px]">
          {selectedStar
            ? `No reviews found with ${selectedStar} stars.`
            : t("noReviews")}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-s2">
          {filteredItems.map((review) => (
            <article key={review.id} className="py-6 flex flex-col gap-3">
              {/* Rating + verified badge + date */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-24">
                    <Stars n={review.rating} />
                  </div>
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-em1 text-em9 font-sans text-[11.5px] font-semibold border border-em5/30">
                      <span className="size-3 text-em7">
                        <Icon name="checkc" />
                      </span>
                      {t("verifiedBuyer")}
                    </span>
                  )}
                </div>
                <time
                  dateTime={new Date(review.date).toISOString()}
                  className="font-sans text-[12px] text-ink6"
                >
                  {formatDate(review.date)}
                </time>
              </div>

              {/* Title & Body */}
              {review.title && (
                <h4 className="m-0 font-sans text-[15px] font-semibold text-em9">
                  {review.title}
                </h4>
              )}
              <p className="m-0 font-sans text-[14px] leading-relaxed text-ink whitespace-pre-line">
                {review.body}
              </p>

              {/* Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {review.photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightboxPhoto(photo)}
                      aria-label="View photo full screen"
                      className="size-16 sm:size-20 rounded-btn overflow-hidden border border-s2 bg-cream/40 p-0 cursor-pointer hover:opacity-90 transition-opacity flex-none"
                    >
                      <MediaImg
                        media={photo}
                        sizes="80px"
                        alt="Customer review photo"
                        className="size-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Author & City */}
              <div className="flex items-center gap-1.5 font-sans text-[12.5px] text-ink6 pt-1">
                <span className="font-medium text-ink">{review.name}</span>
                {review.city && (
                  <>
                    <span>·</span>
                    <span>{review.city}</span>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && selectedStar === null && (
        <div className="pt-4 flex justify-center">
          <Button
            variant="secondary"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      <Dialog.Root
        open={lightboxPhoto !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxPhoto(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs animate-in fade-in" />
          <Dialog.Content className="fixed inset-4 md:inset-10 z-60 flex items-center justify-center p-2 outline-none">
            {lightboxPhoto && (
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <Dialog.Close
                  aria-label={t("close")}
                  className="absolute -top-3 -right-3 z-10 grid size-9 cursor-pointer place-items-center rounded-pill border-0 bg-iv text-em9 shadow-lg hover:bg-s1"
                >
                  <Icon name="close" className="size-4" />
                </Dialog.Close>
                <div className="overflow-hidden rounded-btn border border-s2/40 bg-black shadow-2xl max-w-[90vw] max-h-[85vh]">
                  <MediaImg
                    media={lightboxPhoto}
                    sizes="90vw"
                    alt="Review photo full preview"
                    className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain block"
                  />
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
