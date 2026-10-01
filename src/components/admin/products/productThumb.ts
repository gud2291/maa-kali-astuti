import type { MediaRef } from "@/lib/domain/media";

export type ProductThumbRow = {
  id: string;
  legacyPhoto?: string | null;
  media?: MediaRef[] | null;
};

/**
 * Returns thumbnail URL for a product:
 * first media 480 variant URL, else legacy photo, else /svg/products/<id>-main.svg
 */
export function productThumb(row: ProductThumbRow): string {
  const firstMedia = row.media?.[0];
  if (firstMedia) {
    if (firstMedia.srcSet) {
      const parts = firstMedia.srcSet.split(",").map((s) => s.trim().split(" "));
      const variant480 = parts.find(([, width]) => width === "480w");
      if (variant480 && variant480[0]) {
        return variant480[0];
      }
    }
    if (firstMedia.src) {
      return firstMedia.src;
    }
  }

  if (row.legacyPhoto && row.legacyPhoto.trim() !== "") {
    return row.legacyPhoto;
  }

  return `/svg/products/${row.id}-main.svg`;
}
