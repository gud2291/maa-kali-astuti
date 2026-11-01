import {
  integer,
  text,
  index,
  uniqueIndex,
  pgTable,
  serial,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import type { BirthProfile, MediaVariant } from "../../../lib/domain/types";
import {
  ROLES,
  USER_STATUS,
  SESSION_KINDS,
  OTP_PURPOSES,
  OTP_CHANNELS,
  MEDIA_KINDS,
  MEDIA_BUCKETS,
  MEDIA_STATUS,
  MEDIA_PURPOSES,
} from "../../../lib/domain/enums";

/* ---------- settings ---------- */

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  updatedBy: integer("updated_by"),
});

/* ---------- users ---------- */

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").unique(),
    phone: text("phone"),
    name: text("name"),
    role: text("role", { enum: ROLES }).notNull().default("customer"),
    status: text("status", { enum: USER_STATUS }).notNull().default("active"),
    emailVerifiedAt: timestamp("email_verified_at", { mode: "date", withTimezone: true }),
    phoneVerifiedAt: timestamp("phone_verified_at", { mode: "date", withTimezone: true }),
    birth: jsonb("birth").$type<BirthProfile>(),
    marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
    lastLoginAt: timestamp("last_login_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("users_phone_idx").on(t.phone),
    index("users_role_idx").on(t.role),
  ],
);

/* ---------- sessions ---------- */

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id").notNull(),
    kind: text("kind", { enum: SESSION_KINDS }).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("sessions_user_idx").on(t.userId),
    index("sessions_expires_idx").on(t.expiresAt),
  ],
);

/* ---------- otp_codes ---------- */

export const otpCodes = pgTable(
  "otp_codes",
  {
    id: serial("id").primaryKey(),
    purpose: text("purpose", { enum: OTP_PURPOSES }).notNull(),
    channel: text("channel", { enum: OTP_CHANNELS }).notNull().default("email"),
    identifier: text("identifier").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { mode: "date", withTimezone: true }),
    ip: text("ip"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("otp_lookup_idx").on(t.identifier, t.purpose, t.createdAt),
  ],
);

/* ---------- rate_limits ---------- */

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    windowStart: integer("window_start").notNull(),
    count: integer("count").notNull(),
  },
  (t) => [
    index("rate_limits_window_idx").on(t.windowStart),
  ],
);

/* ---------- audit_logs ---------- */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary").notNull(),
    diff: jsonb("diff").$type<Record<string, [unknown, unknown]>>(),
    ip: text("ip"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("audit_entity_idx").on(t.entity, t.entityId),
    index("audit_created_idx").on(t.createdAt),
  ],
);

/* ---------- counters ---------- */

export const counters = pgTable("counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});

/* ---------- media ---------- */

export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    kind: text("kind", { enum: MEDIA_KINDS }).notNull(),
    bucket: text("bucket", { enum: MEDIA_BUCKETS }).notNull(),
    purpose: text("purpose", { enum: MEDIA_PURPOSES }).notNull(),
    status: text("status", { enum: MEDIA_STATUS }).notNull().default("pending"),
    variants: jsonb("variants").$type<MediaVariant[]>().notNull(),
    width: integer("width"),
    height: integer("height"),
    blur: text("blur"),
    mime: text("mime").notNull(),
    altEn: text("alt_en"),
    altHi: text("alt_hi"),
    ownerType: text("owner_type"),
    ownerId: text("owner_id"),
    claimHash: text("claim_hash"),
    uploadedBy: integer("uploaded_by"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("media_status_idx").on(t.status, t.createdAt),
    index("media_owner_idx").on(t.ownerType, t.ownerId),
  ],
);

/* ---------- webhook_events ---------- */

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  type: text("type").notNull(),
  receivedAt: timestamp("received_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  processedAt: timestamp("processed_at", { mode: "date", withTimezone: true }),
});
