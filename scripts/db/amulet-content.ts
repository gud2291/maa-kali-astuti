import type { ProductContent, Loc } from "../../src/lib/domain/types";

/* Copy for the five copper amulets supplied by the business. Descriptions and the "traditional significance"
   lines are the supplied text; manufacturing or ritual claims (Bhojpatra, muhurat, mantra counts) are deliberately
   left out because they have not been confirmed for these specific pieces. */

export const AMULET_PRICE_INR = 369;

const L = (en: string): Loc => ({ en, hi: "" });

const NOTE =
  " The spiritual associations described are traditional beliefs and devotional symbolism, not guaranteed results.";

type AmuletCopy = {
  nameEn: string;
  nameHi: string;
  deity: string;
  thread: string;
  description: string;
  significance: string[];
  seoTitle: string;
  seoDesc: string;
};

export const AMULET_COPY: Record<string, AmuletCopy> = {
  "a-bagla": {
    nameEn: "Maa Baglamukhi Amulet",
    nameHi: "माँ बगलामुखी ताबीज कवच",
    deity: "Maa Baglamukhi",
    thread: "Yellow (Peela Dhaaga)",
    description:
      "A sacred copper amulet dedicated to Maa Baglamukhi, traditionally prepared with devotion and associated with the spiritual practices of Maa Baglamukhi.",
    significance: [
      "Associated with protection from adversities and negative influences.",
      "Traditionally worshipped for courage, confidence and strength in speech.",
      "Symbolically associated with victory, determination and overcoming obstacles.",
    ],
    seoTitle: "Maa Baglamukhi Amulet – Copper Taabij Kavach",
    seoDesc:
      "Sacred copper Maa Baglamukhi amulet (taabij kavach) on a yellow thread, traditionally linked with courage and protection. Shop at Maa Kali Astuti.",
  },
  "a-hanuman": {
    nameEn: "Hanuman Amulet",
    nameHi: "संकटमोचन श्री हनुमान ताबीज कवच",
    deity: "Sankatmochan Shri Hanuman Ji",
    thread: "Red (Laal Dhaaga)",
    description:
      "A sacred copper amulet dedicated to Sankatmochan Shri Hanuman Ji, traditionally associated with courage, devotion, strength and protection.",
    significance: [
      "Associated with protection from negative influences and fear.",
      "Symbolizes courage, self-confidence and determination.",
      "Traditionally worn as a devotional symbol for strength during difficult circumstances.",
    ],
    seoTitle: "Hanuman Amulet – Sankatmochan Copper Taabij Kavach",
    seoDesc:
      "Sacred copper Sankatmochan Hanuman amulet (taabij kavach) on a red thread, traditionally linked with courage and strength. Shop at Maa Kali Astuti.",
  },
  "a-durga": {
    nameEn: "Maa Durga Amulet",
    nameHi: "माँ दुर्गा ताबीज कवच",
    deity: "Maa Durga",
    thread: "Red (Laal Dhaaga)",
    description:
      "A sacred copper amulet dedicated to Maa Durga, traditionally associated with divine feminine power, protection and spiritual strength.",
    significance: [
      "Symbolizes strength and protection from adversity.",
      "Associated with family well-being, courage and positivity.",
      "Represents devotion, prosperity and peace.",
    ],
    seoTitle: "Maa Durga Amulet – Copper Taabij Kavach",
    seoDesc:
      "Sacred copper Maa Durga amulet (taabij kavach) on a red thread, traditionally linked with divine strength and protection. Shop at Maa Kali Astuti.",
  },
  "a-bhairav": {
    nameEn: "Batuk Bhairav Amulet",
    nameHi: "बटुक भैरव ताबीज कवच",
    deity: "Bhagwan Batuk Bhairav",
    thread: "Black (Kaala Dhaaga)",
    description:
      "A sacred copper amulet dedicated to Bhagwan Batuk Bhairav, traditionally associated with spiritual protection, courage and the removal of obstacles.",
    significance: [
      "Traditionally associated with protection from negative influences.",
      "Symbolizes courage, confidence and spiritual discipline.",
      "Associated with overcoming fears and difficult circumstances.",
    ],
    seoTitle: "Batuk Bhairav Amulet – Copper Taabij Kavach",
    seoDesc:
      "Sacred copper Batuk Bhairav amulet (taabij kavach) on a black thread, traditionally linked with courage and protection. Shop at Maa Kali Astuti.",
  },
  "a-child": {
    nameEn: "Child Evil Eye Protection Amulet",
    nameHi: "बच्चों की नजर सुरक्षा कवच",
    deity: "",
    thread: "Black (Kaala Dhaaga)",
    description:
      "A devotional copper amulet traditionally associated with protecting children from buri nazar and negative influences.",
    significance: [
      "Traditionally worn as a symbol of protection against buri nazar.",
      "Represents blessings, love and positive intentions for children.",
      "Symbolizes parental devotion and wishes for a child's well-being.",
    ],
    seoTitle: "Child Evil Eye Protection Amulet – Buri Nazar Kavach",
    seoDesc:
      "Devotional copper amulet on a black thread, traditionally worn to protect children from buri nazar. A symbol of blessings and care. Shop at Maa Kali Astuti.",
  },
};

/** Content block for one of the five amulets, or null for any other product. */
export function amuletContent(id: string): ProductContent | null {
  const c = AMULET_COPY[id];
  if (!c) return null;
  const specs = [
    { k: L("Material"), v: L("Copper") },
    { k: L("Thread colour"), v: L(c.thread) },
  ];
  if (c.deity) specs.splice(1, 0, { k: L("Dedicated to"), v: L(c.deity) });
  return {
    description: L(c.description + NOTE),
    benefits: c.significance.map(L),
    howToWear: L(""),
    specs,
    placement: [],
    certificateMediaId: null,
    youtubeId: null,
  };
}
