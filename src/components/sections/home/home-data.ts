/* Inline data from the Home script (Home.dc.html vCats 1427–1434, bestList 1059–1065, vBest 1450–1451). */
import type { LocalizedString } from "@/types/localized";
import type { CategoryKey } from "@/types/product";

export type HomeCat = {
  key: CategoryKey;
  /** Product whose main image fills the arch, or a category artwork. */
  pid: string | null;
  art: "havan" | "copper" | null;
  /** Gem that floats in on hover. */
  gem: string;
  name: LocalizedString;
  count: LocalizedString;
  /** Arch aspect (1 : ar) on ≥768 — the crescent rhythm; mobile uses 1.3 for all. */
  ar: number;
};

export const HOME_CATS: HomeCat[] = [
  {
    key: "rudraksha",
    pid: "r5",
    art: null,
    gem: "amethyst",
    name: { en: "Rudraksha & Malas", hi: "रुद्राक्ष एवं माला" },
    count: { en: "2 to 14 Mukhi · 2 malas", hi: "2 से 14 मुखी · 2 माला" },
    ar: 1.3,
  },
  {
    key: "bracelets",
    pid: "b-pyrite",
    art: null,
    gem: "rose",
    name: { en: "Crystal Bracelets", hi: "क्रिस्टल ब्रेसलेट" },
    count: { en: "15 natural stones", hi: "15 प्राकृतिक रत्न" },
    ar: 1.36,
  },
  {
    key: "amulets",
    pid: "a-bagla",
    art: null,
    gem: "citrine",
    name: { en: "Sacred Amulets on Bhojpatra", hi: "भोजपत्र कवच" },
    count: { en: "7 kavach in copper tabiz", hi: "तांबे के ताबीज़ में 7 कवच" },
    ar: 1.43,
  },
  {
    key: "havan",
    pid: null,
    art: "havan",
    gem: "garnet",
    name: { en: "Havan Samagri", hi: "हवन सामग्री" },
    count: { en: "Bitter Havan · 100 g", hi: "कड़वा हवन · 100 ग्राम" },
    ar: 1.36,
  },
  {
    key: "copper",
    pid: null,
    art: "copper",
    gem: "pyrite",
    name: { en: "Energized Copper", hi: "ऊर्जित ताम्र" },
    count: { en: "Copper 12 Nag set", hi: "12 नाग सेट" },
    ar: 1.3,
  },
];

export type BestTab = "best" | "new" | "rud" | "br" | "am";
export const BEST_TABS: BestTab[] = ["best", "new", "rud", "br", "am"];

/** Hand-picked "Bestsellers" order (bestList 1061). */
export const BEST_IDS = ["r5", "b-pyrite", "nag12", "a-child", "m5", "havan", "b-rose", "a-bagla"];

export const BEST_TAB_CAT: Partial<Record<BestTab, CategoryKey>> = {
  rud: "rudraksha",
  br: "bracelets",
  am: "amulets",
};
