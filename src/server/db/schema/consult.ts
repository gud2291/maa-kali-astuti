import {
  integer,
  text,
  index,
  pgTable,
  serial,
  timestamp,
  boolean,
  jsonb,
  doublePrecision,
} from "drizzle-orm/pg-core";
import type { BookingDetailsRecord } from "../../../lib/domain/types";
import type { ChartSnapshot } from "../../../lib/domain/kundali";
import {
  LOCALES,
  SERVICE_KEYS,
  TIER_KEYS,
  MODE_KEYS,
  PAY_PREFS,
  BOOKING_STATUS,
  KUNDALI_STATUS,
} from "../../../lib/domain/enums";

/* ---------- bookings ---------- */

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    ref: text("ref").notNull().unique(),
    accessHash: text("access_hash").notNull(),
    userId: integer("user_id"),
    locale: text("locale", { enum: LOCALES }).notNull(),
    serviceKey: text("service_key", { enum: SERVICE_KEYS }).notNull(),
    tierKey: text("tier_key", { enum: TIER_KEYS }).notNull(),
    mode: text("mode", { enum: MODE_KEYS }).notNull(),
    startAt: timestamp("start_at", { mode: "date", withTimezone: true }),
    endAt: timestamp("end_at", { mode: "date", withTimezone: true }),
    priceInr: integer("price_inr").notNull(),
    payPref: text("pay_pref", { enum: PAY_PREFS }),
    status: text("status", { enum: BOOKING_STATUS }).notNull(),
    holdExpiresAt: timestamp("hold_expires_at", { mode: "date", withTimezone: true }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    details: jsonb("details").$type<BookingDetailsRecord>().notNull(),
    palmMediaIds: jsonb("palm_media_ids").$type<number[]>().notNull().$defaultFn(() => []),
    meetingLink: text("meeting_link"),
    reportMediaId: integer("report_media_id"),
    rescheduleCount: integer("reschedule_count").notNull().default(0),
    adminNote: text("admin_note"),
    reminderDayAt: timestamp("reminder_day_at", { mode: "date", withTimezone: true }),
    reminderHourAt: timestamp("reminder_hour_at", { mode: "date", withTimezone: true }),
    razorpayOrderId: text("razorpay_order_id").unique(),
    paidAt: timestamp("paid_at", { mode: "date", withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("bookings_start_idx").on(t.startAt),
    index("bookings_status_idx").on(t.status, t.startAt),
    index("bookings_user_idx").on(t.userId),
    index("bookings_email_idx").on(t.email),
    index("bookings_phone_idx").on(t.phone),
  ],
);

/* ---------- kundali_orders ---------- */

export const kundaliOrders = pgTable(
  "kundali_orders",
  {
    id: serial("id").primaryKey(),
    ref: text("ref").notNull().unique(),
    accessHash: text("access_hash").notNull(),
    userId: integer("user_id"),
    locale: text("locale", { enum: LOCALES }).notNull(),
    reportLang: text("report_lang", { enum: LOCALES }).notNull(),
    name: text("name").notNull(),
    dob: text("dob").notNull(),
    tob: text("tob"),
    tobUnknown: boolean("tob_unknown").notNull().default(false),
    place: text("place").notNull(),
    lat: doublePrecision("lat").notNull(),
    lon: doublePrecision("lon").notNull(),
    tz: text("tz").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    priceInr: integer("price_inr").notNull(),
    status: text("status", { enum: KUNDALI_STATUS }).notNull(),
    chart: jsonb("chart").$type<ChartSnapshot>(),
    pdfMediaId: integer("pdf_media_id"),
    emailedAt: timestamp("emailed_at", { mode: "date", withTimezone: true }),
    genStartedAt: timestamp("gen_started_at", { mode: "date", withTimezone: true }),
    genAttempts: integer("gen_attempts").notNull().default(0),
    error: text("error"),
    razorpayOrderId: text("razorpay_order_id").unique(),
    paidAt: timestamp("paid_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("kundali_status_idx").on(t.status, t.createdAt),
    index("kundali_user_idx").on(t.userId),
    index("kundali_email_idx").on(t.email),
    index("kundali_phone_idx").on(t.phone),
  ],
);
