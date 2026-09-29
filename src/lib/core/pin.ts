/* Ported 1:1 from mka-core.js 384–395: pincode → delivery estimate + COD availability.
   Demo logic only; phase B swaps in the courier API. */
import { addDays } from "./dates";

const PIN: Record<string, [string, string]> = {
  221001: ["Varanasi", "Uttar Pradesh"], 226001: ["Lucknow", "Uttar Pradesh"], 110001: ["New Delhi", "Delhi"],
  400001: ["Mumbai", "Maharashtra"], 800001: ["Patna", "Bihar"], 302001: ["Jaipur", "Rajasthan"],
  452001: ["Indore", "Madhya Pradesh"], 560001: ["Bengaluru", "Karnataka"], 700001: ["Kolkata", "West Bengal"],
  411001: ["Pune", "Maharashtra"], 380001: ["Ahmedabad", "Gujarat"], 208001: ["Kanpur", "Uttar Pradesh"],
  273001: ["Gorakhpur", "Uttar Pradesh"], 248001: ["Dehradun", "Uttarakhand"], 122001: ["Gurugram", "Haryana"],
  500001: ["Hyderabad", "Telangana"], 600001: ["Chennai", "Tamil Nadu"], 462001: ["Bhopal", "Madhya Pradesh"],
  834001: ["Ranchi", "Jharkhand"], 160017: ["Chandigarh", "Chandigarh"], 211001: ["Prayagraj", "Uttar Pradesh"],
  282001: ["Agra", "Uttar Pradesh"],
};
const ST: [number, string][] = [
  [11, "Delhi"], [12, "Haryana"], [14, "Punjab"], [17, "Himachal Pradesh"], [18, "Jammu & Kashmir"], [20, "Uttar Pradesh"],
  [24, "Uttarakhand"], [25, "Uttar Pradesh"], [30, "Rajasthan"], [36, "Gujarat"], [40, "Maharashtra"], [45, "Madhya Pradesh"],
  [49, "Chhattisgarh"], [50, "Telangana"], [51, "Andhra Pradesh"], [56, "Karnataka"], [60, "Tamil Nadu"], [67, "Kerala"],
  [70, "West Bengal"], [75, "Odisha"], [78, "Assam"], [79, "North East"], [80, "Bihar"], [81, "Jharkhand"], [85, "Bihar"],
];
const DAYS_BY_ZONE: Record<string, number> = { 1: 4, 2: 3, 3: 5, 4: 5, 5: 6, 6: 7, 8: 4 };

export type PinResult =
  | { ok: false }
  | { ok: true; city: string; state: string; cod: boolean; date: Date; days: number };

export function pin(value: string | number, express = false, now?: Date | number): PinResult {
  const p = String(value ?? "").trim();
  if (!/^[1-9]\d{5}$/.test(p)) return { ok: false };
  const two = +p.slice(0, 2);
  let state = "India";
  ST.forEach(([k, s]) => {
    if (two >= k) state = s;
  });
  const known = PIN[p];
  const days = p[0] === "7" ? (two >= 78 ? 8 : 6) : (DAYS_BY_ZONE[p[0]] ?? 6);
  const lead = 2 + days - (express ? 2 : 0);
  return { ok: true, city: known ? known[0] : "", state: known ? known[1] : state, cod: two < 78 || two > 79, date: addDays(lead, now), days: lead };
}
