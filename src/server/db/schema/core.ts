import {
  integer,
  text,
  real,
  sqliteTable,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
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

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value", { mode: "json" }).$type<unknown>().notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  updatedBy: integer("updated_by"),
});

/* ---------- users ---------- */

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").unique(),
    phone: text("phone"),
    name: text("name"),
    role: text("role", { enum: ROLES }).notNull().default("customer"),
    status: text("status", { enum: USER_STATUS }).notNull().default("active"),
    emailVerifiedAt: integer("email_verified_at", { mode: "timestamp_ms" }),
    phoneVerifiedAt: integer("phone_verified_at", { mode: "timestamp_ms" }),
    birth: text("birth", { mode: "json" }).$type<BirthProfile>(),
    marketingOptIn: integer("marketing_opt_in", { mode: "boolean" }).notNull().default(false),
    lastLoginAt: integer("last_login_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
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

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id").notNull(),
    kind: text("kind", { enum: SESSION_KINDS }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("sessions_user_idx").on(t.userId),
    index("sessions_expires_idx").on(t.expiresAt),
  ],
);

/* ---------- otp_codes ---------- */

export const otpCodes = sqliteTable(
  "otp_codes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    purpose: text("purpose", { enum: OTP_PURPOSES }).notNull(),
    channel: text("channel", { enum: OTP_CHANNELS }).notNull().default("email"),
    identifier: text("identifier").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    consumedAt: integer("consumed_at", { mode: "timestamp_ms" }),
    ip: text("ip"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("otp_lookup_idx").on(t.identifier, t.purpose, t.createdAt),
  ],
);

/* ---------- rate_limits ---------- */

export const rateLimits = sqliteTable(
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

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorId: integer("actor_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary").notNull(),
    diff: text("diff", { mode: "json" }).$type<Record<string, [unknown, unknown]>>(),
    ip: text("ip"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("audit_entity_idx").on(t.entity, t.entityId),
    index("audit_created_idx").on(t.createdAt),
  ],
);

/* ---------- counters ---------- */

export const counters = sqliteTable("counters", {
  key: text("key").primaryKey(),
  value: integer("value").notNull().default(0),
});

/* ---------- media ---------- */

export const media = sqliteTable(
  "media",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    kind: text("kind", { enum: MEDIA_KINDS }).notNull(),
    bucket: text("bucket", { enum: MEDIA_BUCKETS }).notNull(),
    purpose: text("purpose", { enum: MEDIA_PURPOSES }).notNull(),
    status: text("status", { enum: MEDIA_STATUS }).notNull().default("pending"),
    variants: text("variants", { mode: "json" }).$type<MediaVariant[]>().notNull(),
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
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("media_status_idx").on(t.status, t.createdAt),
    index("media_owner_idx").on(t.ownerType, t.ownerId),
  ],
);

/* ---------- webhook_events ---------- */

export const webhookEvents = sqliteTable("webhook_events", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  type: text("type").notNull(),
  receivedAt: integer("received_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  processedAt: integer("processed_at", { mode: "timestamp_ms" }),
});
