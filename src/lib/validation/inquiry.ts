/* Course / ritual inquiry validation (InquiryForm.dc.html errors 104–115). One error per field;
   the issue message is the field name and the form maps it to copy. Phone is kept as digits only
   (max 10); the message is counted trimmed (20–600). */
import { z } from "zod";

export type InquiryKind = "course" | "ritual";

export const INQUIRY_EXP = ["new", "some", "guru"] as const;
export const INQUIRY_AREAS = ["legal", "health", "family", "career", "negative", "other"] as const;
export const INQUIRY_LANGS = ["hindi", "english"] as const;
export const WHY_MIN = 20;
export const WHY_MAX = 600;

const values = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  city: z.string(),
  /** Course key (course inquiries). */
  course: z.string(),
  exp: z.enum(["", ...INQUIRY_EXP]),
  area: z.enum(["", ...INQUIRY_AREAS]),
  lang: z.enum(INQUIRY_LANGS),
  why: z.string(),
  agree: z.boolean(),
});

export type InquiryValues = z.infer<typeof values>;
export type InquiryField = "name" | "phone" | "email" | "city" | "exp" | "area" | "why" | "agree";

export const inquiryDefaults = (course: string): InquiryValues => ({
  name: "",
  phone: "",
  email: "",
  city: "",
  course,
  exp: "",
  area: "",
  lang: "hindi",
  why: "",
  agree: false,
});

const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const inquirySchema = (kind: InquiryKind) =>
  values.superRefine((f, ctx) => {
    const add = (path: InquiryField) => ctx.addIssue({ code: "custom", path: [path], message: path });
    if (f.name.trim().length < 2) add("name");
    if (!PHONE.test(f.phone)) add("phone");
    if (f.email.trim() && !EMAIL.test(f.email.trim())) add("email");
    if (f.city.trim().length < 2) add("city");
    if (kind === "ritual" && !f.area) add("area");
    if (kind === "course" && !f.exp) add("exp");
    if (f.why.trim().length < WHY_MIN) add("why");
    if (!f.agree) add("agree");
  });
