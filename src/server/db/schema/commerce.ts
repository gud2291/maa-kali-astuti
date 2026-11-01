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
import type { ShipAddress, CartLineInput } from "../../../lib/domain/types";
import {
  COUPON_KINDS,
  LOCALES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  SHIPMENT_STATUS,
  PAY_PREFS,
  DELIVERY_OPTIONS,
  WRIST_SIZES,
  PAY_ENTITIES,
  PAY_PROVIDERS,
  PAYMENT_ROW_STATUS,
  REFUND_STATUS,
  REVIEW_STATUS,
} from "../../../lib/domain/enums";

/* ---------- addresses ---------- */

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2").notNull().default(""),
    landmark: text("landmark").notNull().default(""),
    city: text("city").notNull(),
    state: text("state").notNull(),
    pincode: text("pincode").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("addresses_user_idx").on(t.userId),
  ],
);

/* ---------- coupons ---------- */

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  kind: text("kind", { enum: COUPON_KINDS }).notNull(),
  value: integer("value").notNull(),
  minCartInr: integer("min_cart_inr").notNull().default(0),
  maxDiscountInr: integer("max_discount_inr"),
  startsAt: timestamp("starts_at", { mode: "date", withTimezone: true }),
  endsAt: timestamp("ends_at", { mode: "date", withTimezone: true }),
  usageLimit: integer("usage_limit"),
  perCustomerLimit: integer("per_customer_limit"),
  firstOrderOnly: boolean("first_order_only").notNull().default(false),
  active: boolean("active").notNull().default(true),
  usedCount: integer("used_count").notNull().default(0),
  note: text("note"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- orders ---------- */

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    number: text("number").notNull().unique(),
    accessHash: text("access_hash").notNull(),
    userId: integer("user_id"),
    locale: text("locale", { enum: LOCALES }).notNull().default("en"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    shipAddress: jsonb("ship_address").$type<ShipAddress>().notNull(),
    status: text("status", { enum: ORDER_STATUS }).notNull(),
    paymentMethod: text("payment_method", { enum: PAYMENT_METHODS }).notNull(),
    paymentStatus: text("payment_status", { enum: PAYMENT_STATUS }).notNull(),
    payPref: text("pay_pref", { enum: PAY_PREFS }),
    delivery: text("delivery", { enum: DELIVERY_OPTIONS }).notNull().default("standard"),
    itemsInr: integer("items_inr").notNull(),
    mrpInr: integer("mrp_inr").notNull(),
    energInr: integer("energ_inr").notNull(),
    discountInr: integer("discount_inr").notNull(),
    giftInr: integer("gift_inr").notNull(),
    shippingInr: integer("shipping_inr").notNull(),
    expressInr: integer("express_inr").notNull(),
    codInr: integer("cod_inr").notNull(),
    totalInr: integer("total_inr").notNull(),
    refundedInr: integer("refunded_inr").notNull().default(0),
    couponCode: text("coupon_code"),
    gift: boolean("gift").notNull().default(false),
    giftMessage: text("gift_message"),
    customerNote: text("customer_note"),
    energizationOn: text("energization_on"),
    courier: text("courier"),
    awb: text("awb"),
    trackingUrl: text("tracking_url"),
    invoiceNo: text("invoice_no").unique(),
    razorpayOrderId: text("razorpay_order_id").unique(),
    needsAttention: boolean("needs_attention").notNull().default(false),
    attentionReason: text("attention_reason"),
    adminNote: text("admin_note"),
    ip: text("ip"),
    placedAt: timestamp("placed_at", { mode: "date", withTimezone: true }),
    paidAt: timestamp("paid_at", { mode: "date", withTimezone: true }),
    shippedAt: timestamp("shipped_at", { mode: "date", withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { mode: "date", withTimezone: true }),
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
    index("orders_status_idx").on(t.status, t.createdAt),
    index("orders_user_idx").on(t.userId, t.createdAt),
    index("orders_email_idx").on(t.email),
    index("orders_phone_idx").on(t.phone),
    index("orders_created_idx").on(t.createdAt),
  ],
);

/* ---------- order_items ---------- */

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull(),
    productId: text("product_id").notNull(),
    nameEn: text("name_en").notNull(),
    nameHi: text("name_hi").notNull(),
    slug: text("slug").notNull(),
    image: text("image"),
    variant: text("variant", { enum: WRIST_SIZES }),
    qty: integer("qty").notNull(),
    priceInr: integer("price_inr").notNull(),
    mrpInr: integer("mrp_inr").notNull(),
    energInr: integer("energ_inr").notNull().default(0),
    energName: text("energ_name"),
    energGotra: text("energ_gotra"),
    lineTotalInr: integer("line_total_inr").notNull(),
    gstRate: doublePrecision("gst_rate"),
    hsn: text("hsn"),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    index("order_items_product_idx").on(t.productId),
  ],
);

/* ---------- order_events ---------- */

export const orderEvents = pgTable(
  "order_events",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull(),
    type: text("type").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status"),
    message: text("message"),
    public: boolean("public").notNull().default(false),
    actorId: integer("actor_id"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("order_events_order_idx").on(t.orderId, t.createdAt),
  ],
);

/* ---------- payments ---------- */

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    entity: text("entity", { enum: PAY_ENTITIES }).notNull(),
    entityId: integer("entity_id").notNull(),
    provider: text("provider", { enum: PAY_PROVIDERS }).notNull(),
    rzpOrderId: text("rzp_order_id"),
    rzpPaymentId: text("rzp_payment_id").unique(),
    amountInr: integer("amount_inr").notNull(),
    status: text("status", { enum: PAYMENT_ROW_STATUS }).notNull(),
    method: text("method"),
    error: text("error"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("payments_entity_idx").on(t.entity, t.entityId),
    index("payments_rzp_order_idx").on(t.rzpOrderId),
  ],
);

/* ---------- refunds ---------- */

export const refunds = pgTable(
  "refunds",
  {
    id: serial("id").primaryKey(),
    paymentId: integer("payment_id").notNull(),
    entity: text("entity", { enum: PAY_ENTITIES }).notNull(),
    entityId: integer("entity_id").notNull(),
    rzpRefundId: text("rzp_refund_id").unique(),
    amountInr: integer("amount_inr").notNull(),
    reason: text("reason"),
    status: text("status", { enum: REFUND_STATUS }).notNull().default("pending"),
    actorId: integer("actor_id"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("refunds_entity_idx").on(t.entity, t.entityId),
  ],
);

/* ---------- coupon_redemptions ---------- */

export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: serial("id").primaryKey(),
    couponId: integer("coupon_id").notNull(),
    orderId: integer("order_id").notNull().unique(),
    email: text("email").notNull(),
    discountInr: integer("discount_inr").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("coupon_red_email_idx").on(t.couponId, t.email),
  ],
);

/* ---------- checkout_drafts ---------- */

export const checkoutDrafts = pgTable(
  "checkout_drafts",
  {
    id: serial("id").primaryKey(),
    token: text("token").notNull().unique(),
    email: text("email").notNull(),
    phone: text("phone"),
    name: text("name"),
    locale: text("locale", { enum: LOCALES }).notNull(),
    lines: jsonb("lines").$type<CartLineInput[]>().notNull(),
    totalInr: integer("total_inr").notNull(),
    remindedAt: timestamp("reminded_at", { mode: "date", withTimezone: true }),
    orderId: integer("order_id"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("checkout_drafts_remind_idx").on(t.orderId, t.remindedAt, t.updatedAt),
  ],
);

/* ---------- reviews ---------- */

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: text("product_id").notNull(),
    orderId: integer("order_id"),
    userId: integer("user_id"),
    name: text("name").notNull(),
    city: text("city"),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    mediaIds: jsonb("media_ids").$type<number[]>().notNull().$defaultFn(() => []),
    verified: boolean("verified").notNull().default(false),
    status: text("status", { enum: REVIEW_STATUS }).notNull().default("pending"),
    showOnHome: boolean("show_on_home").notNull().default(false),
    legacyDate: text("legacy_date"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    approvedAt: timestamp("approved_at", { mode: "date", withTimezone: true }),
  },
  (t) => [
    index("reviews_product_idx").on(t.productId, t.status, t.createdAt),
    index("reviews_status_idx").on(t.status, t.createdAt),
  ],
);

/* ---------- shipments (Shiprocket) ---------- */

export const shipments = pgTable(
  "shipments",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").notNull().unique(),
    provider: text("provider").notNull().default("shiprocket"),
    status: text("status", { enum: SHIPMENT_STATUS }).notNull().default("creating"),
    providerOrderId: text("provider_order_id"),
    shipmentId: text("shipment_id"),
    awb: text("awb"),
    courier: text("courier"),
    providerStatus: text("provider_status"),
    labelUrl: text("label_url"),
    lastError: text("last_error"),
    weightKg: doublePrecision("weight_kg"),
    lengthCm: integer("length_cm"),
    breadthCm: integer("breadth_cm"),
    heightCm: integer("height_cm"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [index("shipments_awb_idx").on(t.awb)],
);
