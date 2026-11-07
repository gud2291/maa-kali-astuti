import type { ProductContent, Loc } from "../../src/lib/domain/types";

/* Copy for "प्रहार" (Prahar), a book sold on Flipkart (external purchase link, not our cart).
   Only facts shown on the book cover or confirmed on the Flipkart listing (checked 2026-11-07) are used:
   title, subtitle, author, theme line, Hindi, hardcover, first edition, BlueRose Publishers Pvt. Ltd.,
   publication November 2026, ISBN-13. No synopsis, page count or price is stated (none was verified). */

const L = (en: string, hi: string): Loc => ({ en, hi });

type BookCopy = { description: Loc; specs: { k: Loc; v: Loc }[]; seoTitle: string; seoDesc: string };

export const BOOK_COPY: Record<string, BookCopy> = {
  "prahar-book": {
    description: L(
      "Prahar: Ek Aadhunik Grihastha Sadhak Ki Seedhi Lalkaar (Satya, Sadhana, Sangharsh) by Sadhak Pawan Pandey. A Hindi book, first edition, published by BlueRose Publishers Pvt. Ltd. Available to buy on Flipkart.",
      "प्रहार – एक आधुनिक गृहस्थ साधक की सीधी ललकार (सत्य • साधना • संघर्ष), लेखक साधक पवन पाण्डेय। हिन्दी पुस्तक, प्रथम संस्करण, प्रकाशक ब्लूरोज़ पब्लिशर्स प्राइवेट लिमिटेड। फ्लिपकार्ट पर खरीदने के लिए उपलब्ध।",
    ),
    specs: [
      { k: L("Author", "लेखक"), v: L("Sadhak Pawan Pandey", "साधक पवन पाण्डेय") },
      { k: L("Theme", "विषय"), v: L("सत्य • साधना • संघर्ष", "सत्य • साधना • संघर्ष") },
      { k: L("Language", "भाषा"), v: L("Hindi", "हिन्दी") },
      { k: L("Format", "प्रारूप"), v: L("Hardcover", "हार्डकवर") },
      { k: L("Edition", "संस्करण"), v: L("First", "प्रथम") },
      { k: L("Publisher", "प्रकाशक"), v: L("BlueRose Publishers Pvt. Ltd.", "ब्लूरोज़ पब्लिशर्स प्राइवेट लिमिटेड") },
      { k: L("Publication", "प्रकाशन"), v: L("November 2026", "नवंबर 2026") },
      { k: L("ISBN-13", "ISBN-13"), v: L("9788162971819", "9788162971819") },
    ],
    seoTitle: "प्रहार – एक आधुनिक गृहस्थ साधक की सीधी ललकार | साधक पवन पाण्डेय",
    seoDesc:
      "प्रहार – एक आधुनिक गृहस्थ साधक की सीधी ललकार (सत्य • साधना • संघर्ष), साधक पवन पाण्डेय की हिन्दी पुस्तक। प्रकाशक: ब्लूरोज़ पब्लिशर्स। फ्लिपकार्ट पर खरीदें।",
  },
};

/** Content block for a book, or null for any other product. */
export function bookContent(id: string): ProductContent | null {
  const c = BOOK_COPY[id];
  if (!c) return null;
  return {
    description: c.description,
    benefits: [],
    howToWear: L("", ""),
    specs: c.specs,
    placement: [],
    certificateMediaId: null,
    youtubeId: null,
  };
}
