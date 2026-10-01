/* Booking stepper validation (Booking.dc.html errs() 495–511). One schema per step, run with
   zod's superRefine so the rules stay 1:1 with the prototype; each field reports one error code
   (the first issue wins) and the component maps codes to messages. */
import { z } from "zod";
import type { ModeKey, ServiceKey } from "@/lib/api/consult";
import {
  LOCALES,
  PAY_PREFS,
  SERVICE_KEYS,
  TIER_KEYS,
  MODE_KEYS,
} from "@/lib/domain/enums";

export type PayMethod = "upi" | "card" | "netbanking" | "nb";
export type UpiApp = "gpay" | "phonepe" | "paytm" | "id";
export type SessionLang = "hi" | "en";

export const PAY_METHODS: PayMethod[] = ["upi", "card", "netbanking"];
export const UPI_APPS: UpiApp[] = ["gpay", "phonepe", "paytm", "id"];
/** Netbanking chips (Booking 575). Bank names are proper nouns: not translated. */
export const BANKS = ["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak", "Bank of Baroda"] as const;

export type BookingDetails = {
  name: string;
  phone: string;
  email: string;
  dob: string;
  tob: string;
  unknown: boolean;
  place: string;
  q: string;
  lang: SessionLang;
  /** Numerology: the mobile number to analyse (optional). */
  mobile: string;
  /** Numerology: business or brand name (optional). */
  biz: string;
};

export const bookingDefaults = (): BookingDetails => ({
  name: "",
  phone: "",
  email: "",
  dob: "",
  tob: "",
  unknown: false,
  place: "",
  q: "",
  lang: "hi",
  mobile: "",
  biz: "",
});

export type BookingDraft = {
  svc: ServiceKey;
  mode: ModeKey;
  f: BookingDetails;
  /** Which palm photos are attached. */
  palm: { left: boolean; right: boolean };
  date: Date | null;
  time: string | null;
  pay: PayMethod;
  app: UpiApp;
  upiId: string;
  bank: string;
};

export type BookingField =
  | "name"
  | "phone"
  | "email"
  | "dob"
  | "tob"
  | "place"
  | "mobile"
  | "q"
  | "left"
  | "right"
  | "slot"
  | "upi"
  | "bank";

export type BookingErrCode =
  | "name"
  | "phone"
  | "email"
  | "dobEmpty"
  | "dobFuture"
  | "tob"
  | "place"
  | "mobile"
  | "q"
  | "left"
  | "right"
  | "slotTime"
  | "slotBoth"
  | "upi"
  | "bank";

export type BookingErrors = Partial<Record<BookingField, BookingErrCode>>;

const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UPI = /^[\w.-]{2,}@[a-z]{2,}$/i;

/** Report-only sessions (mode "report") have no slot. */
export const needsSlot = (mode: ModeKey) => mode !== "report";

/** `today` = yyyy-mm-dd (the latest valid birth date). */
const stepSchema = (step: number, today: string) =>
  z.custom<BookingDraft>().superRefine((s, ctx) => {
    const add = (path: BookingField, message: BookingErrCode) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    const { f, svc: k } = s;
    if (step === 2) {
      if (f.name.trim().length < 2) add("name", "name");
      if (!PHONE.test(f.phone)) add("phone", "phone");
      if (f.email && !EMAIL.test(f.email)) add("email", "email");
      if (k === "kundali" || k === "numerology") {
        if (!f.dob) add("dob", "dobEmpty");
        else if (f.dob > today) add("dob", "dobFuture");
      }
      if (k === "kundali") {
        if (!f.unknown && !f.tob) add("tob", "tob");
        if (f.place.trim().length < 2) add("place", "place");
      }
      if (k === "numerology" && f.mobile && !PHONE.test(f.mobile)) add("mobile", "mobile");
      if (k === "palm") {
        if (!s.palm.left) add("left", "left");
        if (!s.palm.right) add("right", "right");
      }
      if (k === "tarot" && f.q.trim().length < 8) add("q", "q");
    }
    if (step === 3 && needsSlot(s.mode) && !(s.date && s.time)) add("slot", s.date ? "slotTime" : "slotBoth");
    if (step === 4 && s.pay === "upi" && s.app === "id" && !UPI.test(s.upiId)) add("upi", "upi");
    if (step === 4 && (s.pay === "nb" || s.pay === "netbanking") && !s.bank) add("bank", "bank");
  });

/** Errors for one step (1 never has any). */
export function checkBookingStep(step: number, s: BookingDraft, today: string): BookingErrors {
  const r = stepSchema(step, today).safeParse(s);
  const out: BookingErrors = {};
  if (r.success) return out;
  for (const i of r.error.issues) {
    const key = i.path[0] as BookingField;
    if (!out[key]) out[key] = i.message as BookingErrCode;
  }
  return out;
}

export const palmUploadItemSchema = z.object({
  mediaId: z.number().int().positive(),
  claimKey: z.string().min(1),
});

export const bookingDetailsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().regex(PHONE, "Invalid 10-digit mobile number"),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  dob: z.string().default(""),
  tob: z.string().default(""),
  unknown: z.boolean().default(false),
  place: z.string().default(""),
  q: z.string().max(1000).default(""),
  lang: z.enum(["hi", "en"]).default("hi"),
  mobile: z.string().default(""),
  biz: z.string().max(80).default(""),
});

export const bookingCreateSchema = z
  .object({
    serviceKey: z.enum(SERVICE_KEYS),
    tierKey: z.enum(TIER_KEYS),
    mode: z.enum(MODE_KEYS),
    details: bookingDetailsSchema,
    start: z.string().nullable(),
    palms: z.array(palmUploadItemSchema),
    payPref: z.enum(PAY_PREFS),
    locale: z.enum(LOCALES),
  })
  .superRefine((data, ctx) => {
    // Mode & slot check
    if (data.mode === "report") {
      if (data.start !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["start"],
          message: "Report mode must not have a start time",
        });
      }
    } else {
      if (!data.start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["start"],
          message: "Start time is required for live sessions",
        });
      } else {
        const d = new Date(data.start);
        if (isNaN(d.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["start"],
            message: "Invalid start timestamp",
          });
        }
      }
    }

    // Palms check
    if (data.serviceKey === "palm") {
      if (data.palms.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["palms"],
          message: "Palm reading requires exactly 2 palm photos",
        });
      }
    } else {
      if (data.palms.length !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["palms"],
          message: "Palms must be empty for non-palm services",
        });
      }
    }

    // Step 2 service-specific validation re-checked on the server
    const k = data.serviceKey;
    const f = data.details;

    if (k === "kundali" || k === "numerology") {
      if (!f.dob) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["details", "dob"],
          message: "dobEmpty",
        });
      }
    }

    if (k === "kundali") {
      if (!f.unknown && !f.tob) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["details", "tob"],
          message: "tob",
        });
      }
      if (f.place.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["details", "place"],
          message: "place",
        });
      }
    }

    if (k === "numerology" && f.mobile) {
      if (!PHONE.test(f.mobile)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["details", "mobile"],
          message: "mobile",
        });
      }
    }

    if (k === "tarot" && f.q.trim().length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details", "q"],
        message: "q",
      });
    }
  });

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
