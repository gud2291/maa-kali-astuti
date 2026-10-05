"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { ReviewSummary } from "./ReviewSummary";
import { ReviewList } from "./ReviewList";
import { ReviewForm } from "./ReviewForm";
import type { ProductReviewsData } from "@/server/reviews/queries";

type Props = {
  productId: string;
  productName: string;
  reviewsData: ProductReviewsData;
};

export function ReviewsSection({
  productId,
  productName,
  reviewsData,
}: Props) {
  const t = useTranslations("reviews");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);

  const hasReviews = reviewsData.count > 0;

  return (
    <section id="reviews" className="mt-12 md:mt-16 border-t border-s2 pt-10">
      <div className="flex flex-col gap-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <SectionHeader
            eyebrow={t("eyebrow")}
            title={t("title")}
            size="sm"
          />
          {hasReviews && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormOpen(true)}
              className="self-start sm:self-auto"
            >
              <span className="size-4 mr-1">
                <Icon name="edit" />
              </span>
              {t("writeReview")}
            </Button>
          )}
        </div>

        {/* Summary Block (Hidden when count = 0) */}
        {hasReviews ? (
          <ReviewSummary
            avg={reviewsData.avg}
            count={reviewsData.count}
            dist={reviewsData.dist}
            onWriteReview={() => setFormOpen(true)}
            selectedStar={selectedStar}
            onSelectStar={setSelectedStar}
          />
        ) : (
          <div className="p-8 rounded-btn bg-cream/40 border border-dashed border-s2 text-center flex flex-col items-center gap-3">
            <span className="size-10 rounded-pill bg-s1 text-em7 grid place-items-center">
              <Icon name="star" className="size-5" />
            </span>
            <h3 className="m-0 font-title text-[20px] font-normal text-em9">
              {t("noReviews")}
            </h3>
            <p className="m-0 font-sans text-[13.5px] text-ink6 max-w-[420px]">
              {t("beTheFirst")}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setFormOpen(true)}
              className="mt-2"
            >
              <span className="size-4 mr-1">
                <Icon name="edit" />
              </span>
              {t("writeReview")}
            </Button>
          </div>
        )}

        {/* Review list */}
        {hasReviews && (
          <ReviewList
            productId={productId}
            initialItems={reviewsData.items}
            selectedStar={selectedStar}
            onSelectStar={setSelectedStar}
          />
        )}
      </div>

      {/* Review Submission Sheet */}
      <ReviewForm
        productId={productId}
        productName={productName}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </section>
  );
}
