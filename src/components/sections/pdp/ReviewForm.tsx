"use client";

import { useState, useRef, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Icon } from "@/components/icons/Icon";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { MediaImg } from "@/components/media/MediaImg";
import { useUpload } from "@/components/media/useUpload";
import { submitReviewAction } from "@/server/reviews/actions";
import { cn } from "@/lib/utils/cn";
import type { MediaRef } from "@/lib/domain/media";
import type { Locale } from "@/lib/domain/enums";

type Props = {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type UploadedPhoto = {
  mediaId: number;
  claimKey: string;
  media: MediaRef | null;
};

export function ReviewForm({
  productId,
  productName,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations("reviews");
  const locale = useLocale() as Locale;

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state: uploadState, upload: uploadFile, reset: resetUpload } = useUpload("review");

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setTitle("");
    setBody("");
    setName("");
    setCity("");
    setOrderNumber("");
    setContact("");
    setPhotos([]);
    setTurnstileToken(null);
    setFormError(null);
    setSuccess(false);
    resetUpload();
  };

  const handleClose = () => {
    onOpenChange(false);
    if (success) {
      setTimeout(resetForm, 300);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length >= 4) {
      setFormError(t("photoLimit"));
      return;
    }

    const file = files[0];
    if (!file) return;

    const res = await uploadFile(file);
    if (res && res.claimKey) {
      setPhotos((prev) => [
        ...prev,
        {
          mediaId: res.mediaId,
          claimKey: res.claimKey!,
          media: res.media,
        },
      ]);
    } else {
      setFormError(t("photoError"));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (mediaId: number) => {
    setPhotos((prev) => prev.filter((p) => p.mediaId !== mediaId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (rating < 1 || rating > 5) {
      setFormError(t("ratingRequired"));
      return;
    }
    if (name.trim().length < 2) {
      setFormError(t("nameRequired"));
      return;
    }
    if (body.trim().length < 20) {
      setFormError(t("bodyRequired"));
      return;
    }

    startTransition(async () => {
      const res = await submitReviewAction({
        productId,
        name: name.trim(),
        city: city.trim() || undefined,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
        orderNumber: orderNumber.trim() || undefined,
        contact: contact.trim() || undefined,
        photos: photos.map((p) => ({
          mediaId: p.mediaId,
          claimKey: p.claimKey,
        })),
        locale,
        turnstileToken: turnstileToken ?? undefined,
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setFormError(
          res.code === "RATE_LIMITED"
            ? "Too many review attempts. Please try again later."
            : "Review submission failed. Please check your inputs.",
        );
      }
    });
  };

  const activeRating = hoverRating || rating;

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content
          aria-describedby="review-form-desc"
          className={cn(
            "fixed z-60 max-w-full bg-iv px-6 py-6 shadow-2xl outline-none overflow-y-auto max-h-[92vh]",
            "inset-x-0 bottom-0 w-full rounded-t-[14px] pb-[calc(28px+env(safe-area-inset-bottom))]",
            "md:inset-auto md:top-1/2 md:left-1/2 md:w-[580px] md:[transform:translate(-50%,-50%)] md:rounded-[10px]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-s2 pb-4">
            <div>
              <Dialog.Title className="m-0 font-title text-[22px] font-normal text-em9">
                {t("formTitle")}
              </Dialog.Title>
              <p
                id="review-form-desc"
                className="m-0 font-sans text-[13px] text-ink6 truncate max-w-[340px] pt-0.5"
              >
                {productName}
              </p>
            </div>
            <Dialog.Close
              aria-label={t("close")}
              className="grid size-9 cursor-pointer place-items-center rounded-pill border-0 bg-transparent text-em7 hover:bg-s1 transition-colors"
            >
              <Icon name="close" className="size-4" />
            </Dialog.Close>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center text-center gap-4 animate-in fade-in">
              <div className="size-14 rounded-pill bg-em1 text-em7 grid place-items-center border border-em5/30">
                <Icon name="checkc" className="size-8" />
              </div>
              <h3 className="m-0 font-title text-[24px] font-normal text-em9">
                {t("successTitle")}
              </h3>
              <p className="m-0 font-sans text-[14.5px] leading-relaxed text-ink max-w-[420px]">
                {t("successMessage")}
              </p>
              <Button onClick={handleClose} variant="primary" className="mt-4">
                {t("close")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
              {/* Star Rating Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[13px] font-semibold text-em9">
                  {t("ratingLabel")} <span className="text-sin">*</span>
                </label>
                <div
                  className="flex items-center gap-1.5"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      aria-label={`${star} Star`}
                      className="p-1 cursor-pointer border-0 bg-transparent text-g5 transition-transform hover:scale-110"
                    >
                      <span className="size-7 block">
                        <Icon name={star <= activeRating ? "starF" : "star"} />
                      </span>
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 font-sans text-[13px] font-semibold text-em9">
                      {rating} / 5
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <Field
                id="review-title"
                label={t("titleLabel")}
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                placeholder={t("titlePlaceholder")}
              />

              {/* Body */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="review-body"
                  className="font-sans text-[13px] font-semibold text-em9"
                >
                  {t("bodyLabel")} <span className="text-sin">*</span>
                </label>
                <textarea
                  id="review-body"
                  rows={4}
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 1500))}
                  placeholder={t("bodyPlaceholder")}
                  className="w-full rounded-field border border-s2 bg-white px-3 py-2 font-sans text-[14px] text-ink outline-none focus:border-em7 focus:ring-1 focus:ring-em7 resize-y"
                />
                <span className="font-sans text-[11.5px] text-ink6 text-right">
                  {t("charCount", { current: body.length, max: 1500 })}
                </span>
              </div>

              {/* Reviewer Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  id="reviewer-name"
                  label={t("nameLabel")}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 60))}
                  placeholder={t("namePlaceholder")}
                />
                <Field
                  id="reviewer-city"
                  label={t("cityLabel")}
                  value={city}
                  onChange={(e) => setCity(e.target.value.slice(0, 60))}
                  placeholder={t("cityPlaceholder")}
                />
              </div>

              {/* Photo Upload */}
              <div className="flex flex-col gap-2 pt-1 border-t border-s2">
                <div className="flex items-center justify-between">
                  <label className="font-sans text-[13px] font-semibold text-em9">
                    {t("addPhotos")}
                  </label>
                  <span className="font-sans text-[12px] text-ink6">
                    {photos.length} / 4
                  </span>
                </div>
                <p className="m-0 font-sans text-[12px] text-ink6">
                  {t("photoLimit")}
                </p>

                {/* Previews and add button */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {photos.map((p) => (
                    <div
                      key={p.mediaId}
                      className="relative size-18 rounded-btn overflow-hidden border border-s2 bg-cream/40"
                    >
                      {p.media ? (
                        <MediaImg
                          media={p.media}
                          sizes="72px"
                          alt="Review upload preview"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="size-full bg-s1 grid place-items-center text-xs text-ink6">
                          Photo
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(p.mediaId)}
                        aria-label="Remove photo"
                        className="absolute top-1 right-1 grid size-5 place-items-center rounded-pill bg-black/70 text-white border-0 cursor-pointer hover:bg-black"
                      >
                        <Icon name="close" className="size-3" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 4 && (
                    <button
                      type="button"
                      disabled={uploadState.status === "uploading" || uploadState.status === "preparing"}
                      onClick={() => fileInputRef.current?.click()}
                      className="size-18 rounded-btn border border-dashed border-em7/40 bg-s1/60 hover:bg-s1 transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer text-em7 disabled:opacity-50"
                    >
                      <Icon name="camera" className="size-5" />
                      <span className="font-sans text-[10.5px] font-semibold">
                        {uploadState.status === "uploading" ? "..." : "+ Photo"}
                      </span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Order Verification (Optional) */}
              <div className="flex flex-col gap-3 p-3.5 rounded-btn bg-s1/50 border border-s2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[13px] font-semibold text-em9 flex items-center gap-1.5">
                    <span className="size-3.5 text-em7">
                      <Icon name="checkc" />
                    </span>
                    {t("verifyBuyer")}
                  </span>
                  <p className="m-0 font-sans text-[12px] leading-relaxed text-ink6">
                    {t("verifyBuyerDesc")}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Field
                    id="review-order-number"
                    label={t("orderNumberLabel")}
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                    placeholder={t("orderNumberPlaceholder")}
                  />
                  <Field
                    id="review-contact"
                    label={t("contactLabel")}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={t("contactPlaceholder")}
                  />
                </div>
              </div>

              {/* Turnstile */}
              <TurnstileWidget action="review" onToken={setTurnstileToken} />

              {/* Error Alert */}
              {formError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-3 rounded-field bg-sin/10 border border-sin/30 text-sin font-sans text-[13px]"
                >
                  <span className="size-4 flex-none">
                    <Icon name="alert" />
                  </span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isPending || uploadState.status === "uploading"}
                className="w-full"
              >
                {isPending ? t("submitting") : t("submit")}
              </Button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
