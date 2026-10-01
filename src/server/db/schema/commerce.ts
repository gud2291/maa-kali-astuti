import {
  integer,
  text,
  real,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";
import type { ShipAddress, CartLineInput } from "../../../lib/domain/types";
import {
  COUPON_KINDS,
  LOCALES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
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

export const addresses = sqliteTable(
  "addresses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2").notNull().default(""),
    landmark: text("landmark").notNull().default(""),
    city: text("city").notNull(),
    state: text("state").notNull(),
    pincode: text("pincode").notNull(),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("addresses_user_idx").on(t.userId),
  ],
);

/* ---------- coupons ---------- */

export const coupons = sqliteTable("coupons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  kind: text("kind", { enum: COUPON_KINDS }).notNull(),
  value: integer("value").notNull(),
  minCartInr: integer("min_cart_inr").notNull().default(0),
  maxDiscountInr: integer("max_discount_inr"),
  startsAt: integer("starts_at", { mode: "timestamp_ms" }),
  endsAt: integer("ends_at", { mode: "timestamp_ms" }),
  usageLimit: integer("usage_limit"),
  perCustomerLimit: integer("per_customer_limit"),
  firstOrderOnly: integer("first_order_only", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  usedCount: integer("used_count").notNull().default(0),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

/* ---------- orders ---------- */

export const orders = sqliteTable(
  "orders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    number: text("number").notNull().unique(),
    accessHash: text("access_hash").notNull(),
    userId: integer("user_id"),
    locale: text("locale", { enum: LOCALES }).notNull().default("en"),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    shipAddress: text("ship_address", { mode: "json" }).$type<ShipAddress>().notNull(),
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
    gift: integer("gift", { mode: "boolean" }).notNull().default(false),
    giftMessage: text("gift_message"),
    customerNote: text("customer_note"),
    energizationOn: text("energization_on"),
    courier: text("courier"),
    awb: text("awb"),
    trackingUrl: text("tracking_url"),
    invoiceNo: text("invoice_no").unique(),
    razorpayOrderId: text("razorpay_order_id").unique(),
    needsAttention: integer("needs_attention", { mode: "boolean" }).notNull().default(false),
    attentionReason: text("attention_reason"),
    adminNote: text("admin_note"),
    ip: text("ip"),
    placedAt: integer("placed_at", { mode: "timestamp_ms" }),
    paidAt: integer("paid_at", { mode: "timestamp_ms" }),
    shippedAt: integer("shipped_at", { mode: "timestamp_ms" }),
    deliveredAt: integer("delivered_at", { mode: "timestamp_ms" }),
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
    index("orders_status_idx").on(t.status, t.createdAt),
    index("orders_user_idx").on(t.userId, t.createdAt),
    index("orders_email_idx").on(t.email),
    index("orders_phone_idx").on(t.phone),
    index("orders_created_idx").on(t.createdAt),
  ],
);

/* ---------- order_items ---------- */

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
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
    gstRate: real("gst_rate"),
    hsn: text("hsn"),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    index("order_items_product_idx").on(t.productId),
  ],
);

/* ---------- order_events ---------- */

export const orderEvents = sqliteTable(
  "order_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: integer("order_id").notNull(),
    type: text("type").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status"),
    message: text("message"),
    public: integer("public", { mode: "boolean" }).notNull().default(false),
    actorId: integer("actor_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("order_events_order_idx").on(t.orderId, t.createdAt),
  ],
);

/* ---------- payments ---------- */

export const payments = sqliteTable(
  "payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entity: text("entity", { enum: PAY_ENTITIES }).notNull(),
    entityId: integer("entity_id").notNull(),
    provider: text("provider", { enum: PAY_PROVIDERS }).notNull(),
    rzpOrderId: text("rzp_order_id"),
    rzpPaymentId: text("rzp_payment_id").unique(),
    amountInr: integer("amount_inr").notNull(),
    status: text("status", { enum: PAYMENT_ROW_STATUS }).notNull(),
    method: text("method"),
    error: text("error"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
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

export const refunds = sqliteTable(
  "refunds",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    paymentId: integer("payment_id").notNull(),
    entity: text("entity", { enum: PAY_ENTITIES }).notNull(),
    entityId: integer("entity_id").notNull(),
    rzpRefundId: text("rzp_refund_id").unique(),
    amountInr: integer("amount_inr").notNull(),
    reason: text("reason"),
    status: text("status", { enum: REFUND_STATUS }).notNull().default("pending"),
    actorId: integer("actor_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("refunds_entity_idx").on(t.entity, t.entityId),
  ],
);

/* ---------- coupon_redemptions ---------- */

export const couponRedemptions = sqliteTable(
  "coupon_redemptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    couponId: integer("coupon_id").notNull(),
    orderId: integer("order_id").notNull().unique(),
    email: text("email").notNull(),
    discountInr: integer("discount_inr").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("coupon_red_email_idx").on(t.couponId, t.email),
  ],
);

/* ---------- checkout_drafts ---------- */

export const checkoutDrafts = sqliteTable(
  "checkout_drafts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    token: text("token").notNull().unique(),
    email: text("email").notNull(),
    phone: text("phone"),
    name: text("name"),
    locale: text("locale", { enum: LOCALES }).notNull(),
    lines: text("lines", { mode: "json" }).$type<CartLineInput[]>().notNull(),
    totalInr: integer("total_inr").notNull(),
    remindedAt: integer("reminded_at", { mode: "timestamp_ms" }),
    orderId: integer("order_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("checkout_drafts_remind_idx").on(t.orderId, t.remindedAt, t.updatedAt),
  ],
);

/* ---------- reviews ---------- */

export const reviews = sqliteTable(
  "reviews",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: text("product_id").notNull(),
    orderId: integer("order_id"),
    userId: integer("user_id"),
    name: text("name").notNull(),
    city: text("city"),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    mediaIds: text("media_ids", { mode: "json" }).$type<number[]>().notNull().$defaultFn(() => []),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: REVIEW_STATUS }).notNull().default("pending"),
    showOnHome: integer("show_on_home", { mode: "boolean" }).notNull().default(false),
    legacyDate: text("legacy_date"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("reviews_product_idx").on(t.productId, t.status, t.createdAt),
    index("reviews_status_idx").on(t.status, t.createdAt),
  ],
);
