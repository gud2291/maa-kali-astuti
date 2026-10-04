import { z } from "zod";
import { HOME_SECTIONS } from "../domain/enums";
import type { HomeSection } from "../domain/enums";

/* ---------- shared primitives ---------- */

const locSchema = z.object({
  en: z.string().max(4000),
  hi: z.string().max(4000),
});

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const dayRegex = /^\d{4}-\d{2}-\d{2}$/;

/* ---------- per-key schemas ---------- */

export const storeSettingsSchema = z.object({
  freeShippingInr: z.int().nonnegative(),
  shippingInr: z.int().nonnegative(),
  expressInr: z.int().nonnegative(),
  codEnabled: z.boolean(),
  codFeeInr: z.int().nonnegative(),
  codMaxInr: z.int().nonnegative(),
  giftWrapInr: z.int().nonnegative(),
  energizationInr: z.int().nonnegative(),
  maxLineQty: z.int().nonnegative(),
  standardDays: z.tuple([z.int().nonnegative(), z.int().nonnegative()]),
  expressDays: z.tuple([z.int().nonnegative(), z.int().nonnegative()]),
  onlinePayments: z.boolean(),
  nextMahapuja: z.string().regex(dayRegex).nullable(),
});

export const contactSettingsSchema = z.object({
  phoneDisplay: z.string().max(30),
  phoneTel: z.string().max(20),
  whatsapp: z.string().max(20),
  email: z.string().max(120),
  address: locSchema,
  hours: locSchema,
});

export const socialSettingsSchema = z.object({
  youtube: z.string().max(200).nullable(),
  instagram: z.string().max(200).nullable(),
  facebook: z.string().max(200).nullable(),
  whatsappChannel: z.string().max(200).nullable(),
  youtubeHandle: z.string().max(100),
  youtubeSubs: locSchema,
});

export const seoSettingsSchema = z.object({
  title: locSchema,
  description: locSchema,
  ogMediaId: z.int().nonnegative().nullable(),
});

export const notifySettingsSchema = z.object({
  adminEmails: z.array(z.email().max(120)).max(10),
  orderAlerts: z.boolean(),
  bookingAlerts: z.boolean(),
  inquiryAlerts: z.boolean(),
});

export const kundaliSettingsSchema = z.object({
  enabled: z.boolean(),
  priceInr: z.int().nonnegative(),
  mrpInr: z.int().nonnegative(),
});

export const coursesSettingsSchema = z.object({
  feeInr: z.int().nonnegative(),
  instalments: z
    .object({
      count: z.int().nonnegative(),
      amountInr: z.int().nonnegative(),
    })
    .nullable(),
});

export const consultSettingsSchema = z.object({
  startTimes: z.record(
    z.enum(["30", "45", "60", "90"]),
    z.array(z.string().regex(timeRegex)),
  ),
  openDays: z.array(z.int().nonnegative()),
  bookingWindowDays: z.int().nonnegative(),
  minLeadHours: z.int().nonnegative(),
  holdMinutes: z.int().nonnegative(),
  rescheduleMinHours: z.int().nonnegative(),
  maxReschedules: z.int().nonnegative(),
  blocked: z.array(
    z.object({
      from: z.string().regex(dayRegex),
      to: z.string().regex(dayRegex),
      note: z.string().max(200),
    }),
  ),
});

export const homeSettingsSchema = z.object({
  sections: z.record(z.enum(HOME_SECTIONS), z.boolean()),
  hero: z
    .record(
      z.enum(["s1", "s2", "s3"]),
      z.object({
        eyebrow: locSchema,
        l1: locSchema,
        l2: locSchema,
        sub: locSchema,
        body: locSchema,
        cta1: locSchema,
        cta2: locSchema,
        mediaId: z.int().nonnegative().nullable(),
      }),
    )
    .nullable(),
});

export const announcementSettingsSchema = z
  .object({
    items: z.array(
      z.object({
        text: locSchema,
        href: z.string().max(500).nullable(),
      }),
    ),
  })
  .nullable();

export const videosSettingsSchema = z.object({
  categories: z.array(
    z.object({
      key: z.string().max(50),
      label: locSchema,
    }),
  ),
});

export const invoiceSettingsSchema = z.object({
  legalName: z.string().max(200),
  gstin: z.string().max(20).nullable(),
  address: z.string().max(500),
  stateCode: z.string().max(10),
  prefix: z.string().max(10),
});

/* ---------- keys, schemas record, types ---------- */

export const SETTINGS_KEYS = [
  "store",
  "contact",
  "social",
  "seo",
  "notify",
  "kundali",
  "courses",
  "consult",
  "home",
  "announcement",
  "videos",
  "invoice",
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];

export type SettingsMap = {
  store: z.infer<typeof storeSettingsSchema>;
  contact: z.infer<typeof contactSettingsSchema>;
  social: z.infer<typeof socialSettingsSchema>;
  seo: z.infer<typeof seoSettingsSchema>;
  notify: z.infer<typeof notifySettingsSchema>;
  kundali: z.infer<typeof kundaliSettingsSchema>;
  courses: z.infer<typeof coursesSettingsSchema>;
  consult: z.infer<typeof consultSettingsSchema>;
  home: z.infer<typeof homeSettingsSchema>;
  announcement: z.infer<typeof announcementSettingsSchema>;
  videos: z.infer<typeof videosSettingsSchema>;
  invoice: z.infer<typeof invoiceSettingsSchema>;
};

export const SETTINGS_SCHEMAS: { [K in SettingsKey]: z.ZodType<SettingsMap[K]> } = {
  store: storeSettingsSchema,
  contact: contactSettingsSchema,
  social: socialSettingsSchema,
  seo: seoSettingsSchema,
  notify: notifySettingsSchema,
  kundali: kundaliSettingsSchema,
  courses: coursesSettingsSchema,
  consult: consultSettingsSchema,
  home: homeSettingsSchema,
  announcement: announcementSettingsSchema,
  videos: videosSettingsSchema,
  invoice: invoiceSettingsSchema,
};

/* ---------- defaults ---------- */

export const SETTINGS_DEFAULTS: SettingsMap = {
  store: {
    freeShippingInr: 999,
    shippingInr: 79,
    expressInr: 99,
    codEnabled: true,
    codFeeInr: 49,
    codMaxInr: 5000,
    giftWrapInr: 49,
    energizationInr: 251,
    maxLineQty: 10,
    standardDays: [4, 7],
    expressDays: [2, 4],
    onlinePayments: true,
    nextMahapuja: null,
  },
  contact: {
    phoneDisplay: "+91 90000 12345",
    phoneTel: "+919000012345",
    whatsapp: "919000012345",
    email: "care@sadhakpawanpandey.com",
    address: { en: "", hi: "" },
    hours: { en: "Mon–Sat · 10:00–19:00 IST", hi: "सोम–शनि · 10:00–19:00 IST" },
  },
  social: {
    youtube: null,
    instagram: null,
    facebook: null,
    whatsappChannel: null,
    youtubeHandle: "@SadhakPawanPandey",
    youtubeSubs: { en: "1.2 lakh subscribers", hi: "1.2 लाख सब्सक्राइबर" },
  },
  seo: {
    title: {
      en: "Maa Kali Astuti — Sadhak Pawan Pandey",
      hi: "माँ काली अस्तुति — साधक पवन पाण्डेय",
    },
    description: {
      en: "Energized rudraksha, gemstones, yantras and authentic Vedic consultations with Sadhak Pawan Pandey.",
      hi: "सिद्ध रुद्राक्ष, रत्न, यंत्र और साधक पवन पाण्डेय के साथ प्रामाणिक वैदिक परामर्श।",
    },
    ogMediaId: null,
  },
  notify: {
    adminEmails: [],
    orderAlerts: true,
    bookingAlerts: true,
    inquiryAlerts: true,
  },
  kundali: {
    enabled: true,
    priceInr: 99,
    mrpInr: 499,
  },
  courses: {
    feeInr: 50000,
    instalments: { count: 3, amountInr: 16667 },
  },
  consult: {
    startTimes: {
      "30": ["10:00", "10:45", "11:30", "12:15", "14:30", "15:15", "16:00", "16:45", "17:30", "18:15"],
      "45": ["10:00", "11:00", "12:00", "14:30", "15:30", "16:30", "17:30", "18:15"],
      "60": ["10:00", "11:30", "14:30", "16:00", "17:30"],
      "90": ["10:00", "14:30", "16:30"],
    },
    openDays: [1, 2, 3, 4, 5, 6],
    bookingWindowDays: 30,
    minLeadHours: 12,
    holdMinutes: 10,
    rescheduleMinHours: 12,
    maxReschedules: 1,
    blocked: [],
  },
  home: {
    sections: {
      hero: true,
      trust: true,
      categories: true,
      bestsellers: true,
      nagSpotlight: true,
      rashifal: true,
      astroTools: true,
      consult: true,
      intentions: true,
      courses: true,
      rituals: true,
      about: true,
      videos: true,
      testimonials: true,
      journal: true,
      faq: true,
      newsletter: true,
    } satisfies Record<HomeSection, boolean>,
    hero: null,
  },
  announcement: null,
  videos: {
    categories: [
      { key: "all", label: { en: "All", hi: "सभी" } },
      { key: "pravachan", label: { en: "Pravachan", hi: "प्रवचन" } },
      { key: "sadhana", label: { en: "Sadhana", hi: "साधना" } },
      { key: "remedies", label: { en: "Remedies", hi: "उपाय" } },
      { key: "qa", label: { en: "Q&A", hi: "प्रश्नोत्तर" } },
    ],
  },
  invoice: {
    legalName: "Maa Kali Astuti",
    gstin: null,
    address: "",
    stateCode: "",
    prefix: "MKA",
  },
};
