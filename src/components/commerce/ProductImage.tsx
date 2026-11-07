import Image from "next/image";
import type { Product, ProductImageSlot } from "@/types/product";
import { cn } from "@/lib/utils/cn";
import { MediaImg } from "@/components/media/MediaImg";

const TABIZ = "/images/p-tabiz.webp";

/**
 * Where a product slot's picture lives (port of mka-core.js M.img 291–304):
 * - main: the photo, else the generated art;
 * - alt (hover): photo2, the copper tabiz for amulets, else the close-up "detail" art;
 * - detail: the close-up art (photographed products fall back to their photos).
 */
export function productImageSrc(p: Product, slot: ProductImageSlot = "main"): { src: string; raster: boolean } {
  if (slot === "main")
    return p.photo ? { src: p.photo, raster: true } : { src: `/svg/products/${p.id}-main.svg`, raster: false };
  if (slot === "alt") {
    // A photographed product never swaps to its generated art on hover.
    const photo = p.photo2 ?? (p.cat === "amulets" ? TABIZ : (p.photo ?? null));
    if (photo) return { src: photo, raster: true };
  }
  if (p.art) return { src: `/svg/products/${p.id}-detail.svg`, raster: false };
  return { src: p.photo2 ?? p.photo ?? TABIZ, raster: true };
}

type Props = {
  p: Product;
  slot?: ProductImageSlot;
  /** `sizes` for raster photos (next/image). */
  sizes?: string;
  priority?: boolean;
  /** Decorative duplicates (hover image) pass "". Defaults to the product name. */
  alt?: string;
  className?: string;
};

/** Fills its (positioned) parent, object-fit cover. Photos go through next/image; art is a static SVG. */
export function ProductImage({
  p,
  slot = "main",
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority,
  alt,
  className,
}: Props) {
  if (p.images && p.images.length > 0) {
    const media = slot === "alt" ? (p.images[1] ?? p.images[0]) : p.images[0];
    const label = alt ?? p.name;
    return (
      <MediaImg
        media={media}
        sizes={sizes}
        alt={label}
        priority={priority}
        className={className}
        fill
      />
    );
  }

  const { src, raster } = productImageSrc(p, slot);
  // External items (books) show the whole cover: never cropped, centred on the frame's background.
  const whole = !!p.buyUrl;
  const label = alt === "" ? "" : whole ? (p.long ?? p.name) : (alt ?? p.name);
  if (raster)
    return (
      <Image
        src={src}
        alt={label}
        fill
        sizes={sizes}
        priority={priority}
        draggable={false}
        className={cn("block", whole ? "object-contain" : "object-cover", className)}
      />
    );
  return (
    // Generated SVG art: next/image adds nothing for vector files.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      width={400}
      height={500}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={cn("block size-full object-cover", className)}
    />
  );
}
