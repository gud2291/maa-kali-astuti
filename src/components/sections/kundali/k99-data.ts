/* Static copy of the Kundali ₹99 page that the design keeps as data (Kundali-99.dc.html renderVals
   464–465, 493–494). English on both locales, like the other report-page data (F9 copy rule). */

/** The six preview pages (lk0…lk5 in REPORT_PAGE_K99_SVG): caption + page number. */
export const K99_PAGES: { cap: string; n: string }[] = [
  { cap: "Cover & birth details", n: "p. 1" },
  { cap: "Lagna & Navamsa charts", n: "p. 3" },
  { cap: "120-year dasha timeline", n: "p. 8" },
  { cap: "Dosha checks, read honestly", n: "p. 12" },
  { cap: "Life areas, house by house", n: "p. 18" },
  { cap: "Gemstone, rudraksha & mantra", n: "p. 26" },
];

/** The four sample pages (sm0…sm3): caption. */
export const K99_SAMPLES = ["Cover", "Lagna chart", "Dasha timeline", "Remedies"] as const;

/** "What's inside" — table of contents: title + pages. */
export const K99_CONTENTS: [string, string][] = [
  ["Birth details & Panchang", "1–2"],
  ["Lagna (D1) & Chandra charts", "3–4"],
  ["Navamsa (D9) chart", "5"],
  ["Planetary positions & nakshatras", "6–7"],
  ["Vimshottari dasha, 120 years", "8–11"],
  ["Manglik, Kaal Sarp & Sade Sati", "12–14"],
  ["Yogas in your chart", "15–17"],
  ["Career, marriage, health & money", "18–23"],
  ["Gemstone & rudraksha guidance", "24–25"],
  ["Remedies you can follow", "26–28"],
];

/** Report price (design: ₹99, MRP M.fmt(499), 80% off). [client-confirm] */
export const K99_PRICE = 99;
export const K99_MRP = 499;
export const K99_OFF = 80;
