import {
  integer,
  text,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";
import {
  INQUIRY_KINDS,
  COURSE_KEYS,
  LOCALES,
  INQUIRY_STATUS,
  LINK_ENTITIES,
  LINK_STATUS,
  MESSAGE_TOPICS,
  MESSAGE_STATUS,
  SUBSCRIBER_STATUS,
} from "../../../lib/domain/enums";

/* ---------- inquiries ---------- */

export const inquiries = sqliteTable(
  "inquiries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ref: text("ref").notNull().unique(),
    kind: text("kind", { enum: INQUIRY_KINDS }).notNull(),
    courseKey: text("course_key", { enum: COURSE_KEYS }),
    locale: text("locale", { enum: LOCALES }).notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    city: text("city").notNull(),
    exp: text("exp"),
    area: text("area"),
    lang: text("lang").notNull(),
    why: text("why").notNull(),
    status: text("status", { enum: INQUIRY_STATUS }).notNull().default("new"),
    assignedTo: integer("assigned_to"),
    nextActionAt: integer("next_action_at", { mode: "timestamp_ms" }),
    feeInr: integer("fee_inr"),
    paidInr: integer("paid_inr").notNull().default(0),
    userId: integer("user_id"),
    ip: text("ip"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("inquiries_status_idx").on(t.status, t.createdAt),
    index("inquiries_kind_idx").on(t.kind, t.status),
    index("inquiries_phone_idx").on(t.phone),
  ],
);

/* ---------- inquiry_events ---------- */

export const inquiryEvents = sqliteTable(
  "inquiry_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    inquiryId: integer("inquiry_id").notNull(),
    type: text("type").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status"),
    message: text("message"),
    actorId: integer("actor_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("inquiry_events_idx").on(t.inquiryId, t.createdAt),
  ],
);

/* ---------- payment_links ---------- */

export const paymentLinks = sqliteTable(
  "payment_links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    rzpLinkId: text("rzp_link_id").notNull().unique(),
    entity: text("entity", { enum: LINK_ENTITIES }).notNull(),
    entityId: integer("entity_id"),
    amountInr: integer("amount_inr").notNull(),
    purpose: text("purpose").notNull(),
    shortUrl: text("short_url").notNull(),
    status: text("status", { enum: LINK_STATUS }).notNull().default("created"),
    customer: text("customer", { mode: "json" })
      .$type<{ name: string; phone: string; email: string | null }>()
      .notNull(),
    createdBy: integer("created_by"),
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
    index("payment_links_entity_idx").on(t.entity, t.entityId),
  ],
);

/* ---------- messages ---------- */

export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    phone: text("phone"),
    email: text("email"),
    topic: text("topic", { enum: MESSAGE_TOPICS }).notNull(),
    body: text("body").notNull(),
    locale: text("locale", { enum: LOCALES }).notNull(),
    status: text("status", { enum: MESSAGE_STATUS }).notNull().default("new"),
    ip: text("ip"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("messages_status_idx").on(t.status, t.createdAt),
  ],
);

/* ---------- subscribers ---------- */

export const subscribers = sqliteTable("subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  locale: text("locale", { enum: LOCALES }).notNull(),
  source: text("source").notNull(),
  status: text("status", { enum: SUBSCRIBER_STATUS }).notNull().default("subscribed"),
  unsubToken: text("unsub_token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp_ms" }),
});
