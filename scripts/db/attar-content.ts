import type { ProductContent, Loc } from "../../src/lib/domain/types";

/* Copy for the two attar / fragrance-oil products. Descriptions are the supplied text. They are third-party
   products, so ingredients, fragrance notes, purity, longevity, therapeutic benefits and any
   "energized / consecrated" wording are deliberately left out (none has been confirmed). */

const L = (en: string): Loc => ({ en, hi: "" });

type AttarCopy = {
  size: string;
  description: string;
  seoTitle: string;
  seoDesc: string;
};

export const ATTAR_COPY: Record<string, AttarCopy> = {
  "attar-oud": {
    size: "50 ml",
    description:
      "Natural Oud Attar is a fragrance oil product presented in a convenient 50ml bottle. Explore its distinctive oud-inspired fragrance in a compact, easy-to-use format.",
    seoTitle: "Natural Oud Attar (Fragrance Oil) | Maa Kali Astuti",
    seoDesc:
      "Natural Oud Attar (Fragrance Oil) in a 50 ml bottle: an oud-inspired fragrance oil in a compact, easy-to-use format. Order online from Maa Kali Astuti.",
  },
  "attar-sandal": {
    size: "12 ml",
    description:
      "Natural Sandal Attar is a fragrance oil product presented in a 12ml bottle. Discover its sandalwood-inspired fragrance in a compact format.",
    seoTitle: "Natural Sandal Attar (Fragrance Oil) | Maa Kali Astuti",
    seoDesc:
      "Natural Sandal Attar (Fragrance Oil) in a 12 ml bottle: a sandalwood-inspired fragrance oil in a compact format. Order online from Maa Kali Astuti.",
  },
};

/** Content block for one of the two attars, or null for any other product. */
export function attarContent(id: string): ProductContent | null {
  const c = ATTAR_COPY[id];
  if (!c) return null;
  return {
    description: L(c.description),
    benefits: [],
    howToWear: L(""),
    specs: [
      { k: L("Bottle size"), v: L(c.size) },
      { k: L("Product type"), v: L("Fragrance oil (attar)") },
    ],
    placement: [],
    certificateMediaId: null,
    youtubeId: null,
  };
}
