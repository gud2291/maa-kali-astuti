/* Inline data from the Home script (Home.dc.html vCats 1427–1434, bestList 1059–1065, vBest 1450–1451,
   vIntent 1233–1247). */
import type { LocalizedString } from "@/types/localized";
import type { CategoryKey, IntentKey } from "@/types/product";

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

/* §9 Shop by intention (vIntent 1233–1247). */

/** Extra matches on the product's intention line, besides its `ik` (vIntent 1234). */
export const INTENT_RX: Record<IntentKey, RegExp> = {
  health: /health|heal|vital/i,
  love: /love|relation|harmony|marri/i,
  peace: /peace|calm|emotion/i,
  clarity: /clarity|wisdom|learning|focus|obstacle/i,
  courage: /courage|fear|confidence|strength/i,
  protection: /protect|negativ|shield|evil/i,
  wealth: /wealth|prosper|abundance|success/i,
};

/** A floating stone: gem, left, top, width (px), mouse depth, float params, opacity. */
export type IntentStone = { k: string; l: string; t: string; w: number; d: number; amb: string; op: number };
const st = (k: string, l: string, t: string, w: number, d: number, amb: string, op: number): IntentStone => ({
  k,
  l,
  t,
  w,
  d,
  amb,
  op,
});

/** <768: five small stones along the top (vIntent 1237). */
export const STONES_MOB: IntentStone[] = [
  st("amethyst", "4%", "10px", 56, 0.6, "float:9:12:6:0", 1),
  st("citrine", "84%", "6px", 44, 0.4, "float:7:10:-5:.3", 0.95),
  st("rose", "70%", "64px", 34, 0.3, "float:8:8:6:.6", 0.8),
  st("rudraksha", "22%", "70px", 30, 0.25, "float:11:8:4:.5", 0.75),
  st("quartz", "46%", "14px", 38, 0.35, "float:10:10:-4:.2", 0.9),
];

/** ≥768: ten stones framing the section (vIntent 1238). */
export const STONES_DESK: IntentStone[] = [
  st("amethyst", "6%", "10%", 96, 0.9, "float:9:16:6:0", 1),
  st("citrine", "15%", "44%", 64, 0.5, "float:7:12:-5:.3", 0.92),
  st("rudraksha", "4%", "64%", 56, 0.35, "float:11:10:4:.6", 0.8),
  st("rose", "21%", "17%", 48, 0.3, "float:8:12:6:.2", 0.75),
  st("jade", "10%", "84%", 72, 0.7, "float:10:14:-6:.5", 0.9),
  st("pyrite", "82%", "9%", 74, 0.7, "float:8:14:5:.1", 1),
  st("quartz", "90%", "37%", 90, 0.9, "float:10:18:-4:.4", 1),
  st("tiger", "76%", "28%", 46, 0.3, "float:7:10:6:.7", 0.75),
  st("garnet", "86%", "68%", 58, 0.5, "float:9:12:-6:.2", 0.88),
  st("rudraksha", "94%", "86%", 44, 0.25, "float:12:10:4:.8", 0.7),
];
