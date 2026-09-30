/* Ported from mka-core.js 20–26. Always pass `from`/`now` from the caller when rendering on the
   server so SSR and the client agree (INV gotcha 14). */

export const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
export const DAYH = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] as const;
export const MONH = ["जन", "फ़र", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अग", "सित", "अक्टू", "नव", "दिस"] as const;
export const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const MON_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
/* Hindi long forms (ours, [HI review]): the design only has the short Hindi day/month names. */
export const DAYH_LONG = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"] as const;
export const MONH_LONG = [
  "जनवरी",
  "फ़रवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
] as const;

/** Noon on (from + n days). Noon avoids DST/timezone edge flips. */
export function addDays(n: number, from?: Date | number | string): Date {
  const d = from != null ? new Date(from) : new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

/** "Thu, 2 Oct" · hi: "गुरु, 2 अक्टू" */
export const dfmt = (d: Date, hi?: boolean): string =>
  hi ? `${DAYH[d.getDay()]}, ${d.getDate()} ${MONH[d.getMonth()]}` : `${DAY[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`;

/** "Thursday, 2 Oct 2026" · hi: "गुरुवार, 2 अक्टू 2026" */
export const dlong = (d: Date, hi?: boolean): string =>
  hi
    ? `${DAYH_LONG[d.getDay()]}, ${d.getDate()} ${MONH[d.getMonth()]} ${d.getFullYear()}`
    : `${DAY_LONG[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;

/** "October 2026" · hi: "अक्टूबर 2026" (calendar titles). */
export const monthTitle = (d: Date, hi?: boolean): string =>
  `${(hi ? MONH_LONG : MON_LONG)[d.getMonth()]} ${d.getFullYear()}`;

/** Next Mahapuja muhurat = next Thursday at least 2 days out. [confirm calendar with client] */
export function muhurat(now?: Date | number): Date {
  let d = addDays(2, now);
  while (d.getDay() !== 4) d = addDays(1, d);
  return d;
}
