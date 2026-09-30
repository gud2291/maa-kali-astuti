/* Client-side validation for the free astro tools (Home kSubmit 1118–1125, lOk 1132).
   Each schema reports one error code per field (the first issue wins); components map the
   codes to messages. */
import { z } from "zod";
import { hasTwoLetters } from "@/lib/astro/love";
import type { City } from "@/lib/astro/kundali";

export type KundaliField = "name" | "dob" | "tob" | "place";
export type KundaliErrCode = "nameShort" | "dobEmpty" | "dobBad" | "tobEmpty" | "placeEmpty" | "placePick";
export type KundaliErrors = Partial<Record<KundaliField, KundaliErrCode>>;

export type KundaliDraft = {
  name: string;
  dob: string;
  tob: string;
  unknown: boolean;
  place: string;
  /** The town picked from the list, or the best match for the typed text. */
  city: City | null;
};

/** `today` = yyyy-mm-dd (the latest valid birth date). */
const kundaliSchema = (today: string) =>
  z
    .object({
      name: z.string(),
      dob: z.string(),
      tob: z.string(),
      unknown: z.boolean(),
      place: z.string(),
      city: z.unknown().nullable(),
    })
    .superRefine((f, ctx) => {
      const add = (path: KundaliField, message: KundaliErrCode) =>
        ctx.addIssue({ code: "custom", path: [path], message });
      if (!hasTwoLetters(f.name)) add("name", "nameShort");
      if (!f.dob) add("dob", "dobEmpty");
      else if (f.dob > today || f.dob < "1900-01-01") add("dob", "dobBad");
      if (!f.unknown && !f.tob) add("tob", "tobEmpty");
      if (!f.city) add("place", f.place.trim() ? "placePick" : "placeEmpty");
    });

export function checkKundali(f: KundaliDraft, today: string): KundaliErrors {
  const r = kundaliSchema(today).safeParse(f);
  const out: KundaliErrors = {};
  if (r.success) return out;
  for (const i of r.error.issues) {
    const k = i.path[0] as KundaliField;
    if (!out[k]) out[k] = i.message as KundaliErrCode;
  }
  return out;
}

const loveName = z.string().refine(hasTwoLetters);

/** Both names need two letters (Latin or Devanagari). */
export const checkLove = (a: string, b: string) => ({
  a: !loveName.safeParse(a).success,
  b: !loveName.safeParse(b).success,
});
