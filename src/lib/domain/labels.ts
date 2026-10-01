import type { ArticleCategory } from "@/lib/domain/enums";
import type { Loc } from "@/lib/domain/loc";

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, Loc> = {
  rudraksha: { en: "Rudraksha guide", hi: "रुद्राक्ष गाइड" },
  crystals: { en: "Crystals", hi: "क्रिस्टल" },
  rashifal: { en: "Rashifal", hi: "राशिफल" },
  sadhana: { en: "Sadhana", hi: "साधना" },
  remedies: { en: "Remedies", hi: "उपाय" },
  festivals: { en: "Festivals", hi: "त्योहार" },
  astrology: { en: "Astrology", hi: "ज्योतिष" },
};
