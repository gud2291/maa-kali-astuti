import {
  integer,
  text,
  real,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";
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

export const bookings = sqliteTable(
  "bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ref: text("ref").notNull().unique(),
    accessHash: text("access_hash").notNull(),
    userId: integer("user_id"),
    locale: text("locale", { enum: LOCALES }).notNull(),
    serviceKey: text("service_key", { enum: SERVICE_KEYS }).notNull(),
    tierKey: text("tier_key", { enum: TIER_KEYS }).notNull(),
    mode: text("mode", { enum: MODE_KEYS }).notNull(),
    startAt: integer("start_at", { mode: "timestamp_ms" }),
    endAt: integer("end_at", { mode: "timestamp_ms" }),
    priceInr: integer("price_inr").notNull(),
    payPref: text("pay_pref", { enum: PAY_PREFS }),
    status: text("status", { enum: BOOKING_STATUS }).notNull(),
    holdExpiresAt: integer("hold_expires_at", { mode: "timestamp_ms" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    details: text("details", { mode: "json" }).$type<BookingDetailsRecord>().notNull(),
    palmMediaIds: text("palm_media_ids", { mode: "json" }).$type<number[]>().notNull().$defaultFn(() => []),
    meetingLink: text("meeting_link"),
    reportMediaId: integer("report_media_id"),
    rescheduleCount: integer("reschedule_count").notNull().default(0),
    adminNote: text("admin_note"),
    reminderDayAt: integer("reminder_day_at", { mode: "timestamp_ms" }),
    reminderHourAt: integer("reminder_hour_at", { mode: "timestamp_ms" }),
    razorpayOrderId: text("razorpay_order_id").unique(),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
    cancelledAt: integer("cancelled_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
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

export const kundaliOrders = sqliteTable(
  "kundali_orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ref: text("ref").notNull().unique(),
    accessHash: text("access_hash").notNull(),
    userId: integer("user_id"),
    locale: text("locale", { enum: LOCALES }).notNull(),
    reportLang: text("report_lang", { enum: LOCALES }).notNull(),
    name: text("name").notNull(),
    dob: text("dob").notNull(),
    tob: text("tob"),
    tobUnknown: integer("tob_unknown", { mode: "boolean" }).notNull().default(false),
    place: text("place").notNull(),
    lat: real("lat").notNull(),
    lon: real("lon").notNull(),
    tz: text("tz").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    priceInr: integer("price_inr").notNull(),
    status: text("status", { enum: KUNDALI_STATUS }).notNull(),
    chart: text("chart", { mode: "json" }).$type<ChartSnapshot>(),
    pdfMediaId: integer("pdf_media_id"),
    emailedAt: integer("emailed_at", { mode: "timestamp_ms" }),
    genStartedAt: integer("gen_started_at", { mode: "timestamp_ms" }),
    genAttempts: integer("gen_attempts").notNull().default(0),
    error: text("error"),
    razorpayOrderId: text("razorpay_order_id").unique(),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
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
