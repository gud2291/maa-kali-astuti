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

/* ---------------- Kundali ₹99 page (Kundali-99.dc.html errs 414–423) ---------------- */

export type K99Field = "name" | "dob" | "tob" | "place" | "phone" | "email";
export type K99ErrCode = "name" | "dobEmpty" | "dobFuture" | "dobYear" | "tob" | "place" | "phone" | "email";
export type K99Errors = Partial<Record<K99Field, K99ErrCode>>;

export type K99Draft = {
  name: string;
  dob: string;
  tob: string;
  unknown: boolean;
  place: string;
  /** Report language. */
  lang: "en" | "hi";
  /** 10 digits, no +91. */
  phone: string;
  email: string;
};

/** `today` = yyyy-mm-dd. One code per field, 1:1 with the design's rules. */
const k99Schema = (today: string) =>
  z
    .object({
      name: z.string(),
      dob: z.string(),
      tob: z.string(),
      unknown: z.boolean(),
      place: z.string(),
      lang: z.enum(["en", "hi"]),
      phone: z.string(),
      email: z.string(),
    })
    .superRefine((f, ctx) => {
      const add = (path: K99Field, message: K99ErrCode) => ctx.addIssue({ code: "custom", path: [path], message });
      if (f.name.trim().length < 2) add("name", "name");
      if (!f.dob) add("dob", "dobEmpty");
      else if (f.dob > today) add("dob", "dobFuture");
      else if (f.dob < "1900-01-01") add("dob", "dobYear");
      if (!f.unknown && !f.tob) add("tob", "tob");
      if (f.place.trim().length < 2) add("place", "place");
      if (!/^[6-9]\d{9}$/.test(f.phone)) add("phone", "phone");
      if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) add("email", "email");
    });

export function checkKundali99(f: K99Draft, today: string): K99Errors {
  const r = k99Schema(today).safeParse(f);
  const out: K99Errors = {};
  if (r.success) return out;
  for (const i of r.error.issues) {
    const k = i.path[0] as K99Field;
    if (!out[k]) out[k] = i.message as K99ErrCode;
  }
  return out;
}
