/* Ported from mka-core.js 381. */

/** "Out of stock" at 0, "Only N left" at ≤ 5, otherwise empty. */
export const stockNote = (p: { stock: number }, hi?: boolean): string =>
  p.stock === 0
    ? hi
      ? "स्टॉक में नहीं"
      : "Out of stock"
    : p.stock <= 5
      ? hi
        ? `केवल ${p.stock} शेष`
        : `Only ${p.stock} left`
      : "";
