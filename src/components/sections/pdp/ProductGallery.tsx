"use client";

import { useId, useMemo, useRef, useState, useEffect } from "react";
import { Dialog } from "radix-ui";
import { useTranslations } from "next-intl";
import { MediaImg } from "@/components/media/MediaImg";
import { ProductImage } from "@/components/commerce/ProductImage";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";
import type { Product, ProductImageSlot } from "@/types/product";
import type { MediaRef } from "@/lib/domain/media";

type GalleryItem =
  | { kind: "media"; media: MediaRef; label: string }
  | { kind: "legacy"; slot: ProductImageSlot; label: string }
  | { kind: "cert"; media: MediaRef; label: string }
  | { kind: "yt"; ytId: string; label: string };

type Props = {
  product: Product;
  certificate: MediaRef | null;
  youtubeId: string | null;
};

export function ProductGallery({ product, certificate, youtubeId }: Props) {
  const t = useTranslations("pdp");
  const dialogId = useId();
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [ytPlaying, setYtPlaying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const items: GalleryItem[] = useMemo(() => {
    const list: GalleryItem[] = [];

    if (product.images && product.images.length > 0) {
      product.images.forEach((m, i) => {
        list.push({ kind: "media", media: m, label: `${product.name} ${i + 1}` });
      });
    } else {
      list.push({ kind: "legacy", slot: "main", label: product.name });
      if (product.photo2 || product.cat === "amulets") {
        list.push({ kind: "legacy", slot: "alt", label: `${product.name} view 2` });
      }
      if (product.art && !product.photo) {
        list.push({ kind: "legacy", slot: "detail", label: `${product.name} detail` });
      }
    }

    if (certificate) {
      list.push({ kind: "cert", media: certificate, label: t("labCertBadge") });
    }

    if (youtubeId) {
      list.push({ kind: "yt", ytId: youtubeId, label: t("videoBadge") });
    }

    return list;
  }, [product, certificate, youtubeId, t]);

  const current = items[active] ?? items[0];

  const scrollTo = (idx: number) => {
    setActive(idx);
    setYtPlaying(false);
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
    }
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active && idx >= 0 && idx < items.length) {
      setActive(idx);
      setYtPlaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop layout: thumbnails left, main viewer right */}
      <div className="hidden lg:grid lg:grid-cols-[80px_minmax(0,1fr)] lg:gap-3.5 items-start">
        {/* Vertical thumb rail */}
        <div
          role="tablist"
          aria-label={product.name}
          className="flex flex-col gap-2.5 max-h-[580px] overflow-y-auto no-scrollbar pr-0.5"
        >
          {items.map((it, idx) => {
            const on = idx === active;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setActive(idx);
                  setYtPlaying(false);
                }}
                className={cn(
                  "relative aspect-[4/5] w-20 overflow-hidden rounded-[3px] border bg-s1 p-0 cursor-pointer transition-all duration-150",
                  on
                    ? "border-g5 shadow-[0_0_0_1.5px_#B8923A]"
                    : "border-s2 opacity-70 hover:opacity-100",
                )}
              >
                {it.kind === "media" && (
                  <MediaImg media={it.media} sizes="80px" alt={it.label} fill className="object-cover" />
                )}
                {it.kind === "legacy" && (
                  <ProductImage p={product} slot={it.slot} sizes="80px" alt={it.label} />
                )}
                {it.kind === "cert" && (
                  <div className="relative size-full">
                    <MediaImg media={it.media} sizes="80px" alt={it.label} fill className="object-cover" />
                    <span className="absolute bottom-1 inset-x-1 rounded-[2px] bg-em9/90 py-0.5 text-center font-sans text-[9px] font-bold text-g3 uppercase">
                      Lab
                    </span>
                  </div>
                )}
                {it.kind === "yt" && (
                  <div className="relative grid size-full place-items-center bg-black text-g3">
                    <Icon name="play" className="size-6" />
                    <span className="absolute bottom-1 inset-x-1 rounded-[2px] bg-black/80 py-0.5 text-center font-sans text-[9px] font-bold text-iv uppercase">
                      Video
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Main stage */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-btn bg-s1 shadow-[inset_0_0_0_1px_rgba(234,224,202,.8)]">
          {current.kind === "yt" ? (
            ytPlaying ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${current.ytId}?autoplay=1`}
                title={product.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setYtPlaying(true)}
                className="relative grid size-full cursor-pointer place-items-center bg-black text-iv"
                aria-label={t("videoBadge")}
              >
                <span className="grid size-16 place-items-center rounded-pill bg-em7/90 text-g3 shadow-ring-gold transition-transform duration-200 hover:scale-105">
                  <Icon name="play" className="ml-1 size-8" />
                </span>
                <span className="absolute bottom-4 font-sans text-[13px] font-semibold tracking-wider text-g3 uppercase">
                  {t("videoBadge")}
                </span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="group relative block size-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
              aria-label={t("viewGallery")}
            >
              {current.kind === "media" && (
                <MediaImg
                  media={current.media}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={current.label}
                  priority
                  fill
                  className="object-cover transition-transform duration-500 ease-mka group-hover:scale-[1.02]"
                />
              )}
              {current.kind === "legacy" && (
                <ProductImage
                  p={product}
                  slot={current.slot}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  alt={current.label}
                  priority
                />
              )}
              {current.kind === "cert" && (
                <div className="relative size-full">
                  <MediaImg
                    media={current.media}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    alt={current.label}
                    priority
                    fill
                    className="object-contain"
                  />
                  <span className="absolute top-3 left-3 rounded-pill bg-em9/90 px-3 py-1 font-sans text-[11px] font-bold tracking-wider text-g3 uppercase">
                    {t("labCertBadge")}
                  </span>
                </div>
              )}
              <span className="absolute right-3.5 bottom-3.5 grid size-9 place-items-center rounded-pill bg-iv/85 text-em7 shadow-sm transition-transform duration-200 group-hover:scale-110">
                <Icon name="zoom" className="size-4" />
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile layout: scroll-snap swipe container */}
      <div className="lg:hidden flex flex-col gap-2.5">
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-btn bg-s1"
        >
          {items.map((it, idx) => (
            <div key={idx} className="relative aspect-[4/5] w-full flex-none snap-start overflow-hidden">
              {it.kind === "yt" ? (
                ytPlaying && idx === active ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${it.ytId}?autoplay=1`}
                    title={product.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full border-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActive(idx);
                      setYtPlaying(true);
                    }}
                    className="relative grid size-full cursor-pointer place-items-center bg-black text-iv"
                    aria-label={t("videoBadge")}
                  >
                    <span className="grid size-14 place-items-center rounded-pill bg-em7/90 text-g3 shadow-ring-gold">
                      <Icon name="play" className="ml-1 size-7" />
                    </span>
                    <span className="absolute bottom-3 font-sans text-[12px] font-semibold text-g3 uppercase">
                      {t("videoBadge")}
                    </span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActive(idx);
                    setZoomOpen(true);
                  }}
                  className="relative block size-full cursor-zoom-in border-0 bg-transparent p-0"
                  aria-label={t("viewGallery")}
                >
                  {it.kind === "media" && (
                    <MediaImg
                      media={it.media}
                      sizes="100vw"
                      alt={it.label}
                      priority={idx === 0}
                      fill
                      className="object-cover"
                    />
                  )}
                  {it.kind === "legacy" && (
                    <ProductImage p={product} slot={it.slot} sizes="100vw" alt={it.label} priority={idx === 0} />
                  )}
                  {it.kind === "cert" && (
                    <div className="relative size-full">
                      <MediaImg
                        media={it.media}
                        sizes="100vw"
                        alt={it.label}
                        fill
                        className="object-contain"
                      />
                      <span className="absolute top-3 left-3 rounded-pill bg-em9/90 px-3 py-1 font-sans text-[11px] font-bold text-g3 uppercase">
                        {t("labCertBadge")}
                      </span>
                    </div>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Mobile dots indicator */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-1">
            {items.map((_, idx) => {
              const on = idx === active;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollTo(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={cn(
                    "h-2 rounded-pill transition-all duration-200 p-0 border-0 cursor-pointer",
                    on ? "w-5 bg-em7" : "w-2 bg-s2 hover:bg-s3",
                  )}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Full-screen zoom modal */}
      <Dialog.Root open={zoomOpen} onOpenChange={setZoomOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-60 bg-black/92 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content
            aria-describedby={`${dialogId}-desc`}
            className="fixed inset-0 z-60 flex flex-col items-center justify-center p-3 outline-none"
          >
            <Dialog.Title className="sr-only">{product.name}</Dialog.Title>
            <p id={`${dialogId}-desc`} className="sr-only">
              {t("viewGallery")}
            </p>

            <Dialog.Close
              aria-label={t("close")}
              className="absolute top-4 right-4 z-10 grid size-11 cursor-pointer place-items-center rounded-pill bg-iv/15 text-iv border-0 transition-colors hover:bg-iv/25"
            >
              <Icon name="close" className="size-5" />
            </Dialog.Close>

            <div className="relative max-h-[85vh] max-w-[92vw] aspect-[4/5] w-full max-w-[620px] overflow-hidden rounded-btn">
              {current.kind === "media" && (
                <MediaImg media={current.media} sizes="95vw" alt={current.label} fill className="object-contain" />
              )}
              {current.kind === "legacy" && (
                <ProductImage p={product} slot={current.slot} sizes="95vw" alt={current.label} />
              )}
              {current.kind === "cert" && (
                <MediaImg media={current.media} sizes="95vw" alt={current.label} fill className="object-contain" />
              )}
            </div>

            {items.length > 1 && (
              <div className="absolute bottom-4 flex gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "size-2.5 rounded-pill border-0 transition-all",
                      i === active ? "w-6 bg-g3" : "bg-iv/40",
                    )}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
