# DATA-MODEL — Turso (SQLite) via Drizzle

Binding spec for `src/server/db/schema/*.ts`, `src/lib/domain/enums.ts`, `src/lib/domain/types.ts` and `src/lib/validation/settings.ts`.

**Loader rule:** schema files are also loaded by drizzle-kit and `scripts/db/seed.ts` outside Next. So files in `src/server/db/schema/**`, `src/lib/domain/**` and `src/lib/validation/settings.ts` must **not** import `server-only` (it throws outside Next) and import runtime values with **relative** paths (`../../../lib/domain/enums`). `import type … from "@/…"` is fine (erased).
Steps say which section to read ("DM §C3"). Never rename a table or column once its migration exists — add new columns instead.

---

## §A Notation → Drizzle (`drizzle-orm/sqlite-core`)

| Spec | Drizzle |
|---|---|
| `int` | `integer("col")` |
| `real` | `real("col")` |
| `text` | `text("col")` |
| `bool` | `integer("col", { mode: "boolean" })` |
| `ts` | `integer("col", { mode: "timestamp_ms" })` → `Date` in TS |
| `json<T>` | `text("col", { mode: "json" }).$type<T>()` |
| `enum(X)` | `text("col", { enum: X })` — `X` imported from `@/lib/domain/enums` |
| `pk auto` | `integer("id").primaryKey({ autoIncrement: true })` |
| `pk` | `.primaryKey()` on that column |
| `!` | `.notNull()` (no `!` = nullable) |
| `=v` | `.default(v)`; `=now` → `.$defaultFn(() => new Date())`; `=[]` → `.$defaultFn(() => [])` |
| `uniq` | `.unique()` |
| `→t.c` | `.references(() => t.c)` (documentation; app code keeps integrity) |
| `upd` | `updated_at ts ! =now` plus `.$onUpdate(() => new Date())` |
| `crt` | `created_at ts ! =now` |

- SQL names are snake_case; TS property names are camelCase (`createdAt: integer("created_at", …)`).
- Index names are given; declare them in the table's third argument: `(t) => [index("orders_status_idx").on(t.status, t.createdAt)]`; `uniqueIndex(...)` for `uniq:` lines.
- Files: `core.ts` (§C), `catalog.ts` (§D), `content.ts` (§E), `commerce.ts` (§F), `consult.ts` (§G), `crm.ts` (§H); `index.ts` re-exports all of them.
- Money is **integer rupees** (`*_inr`). Times are `ts` (UTC). Dates without time are `text` `yyyy-mm-dd` (IST calendar day).

---

## §B Shared code (isomorphic)

### `src/lib/domain/enums.ts` (exact values)
```ts
export const LOCALES = ["en", "hi"] as const;
export const ROLES = ["customer", "editor", "staff", "manager", "owner"] as const;
export const ADMIN_ROLES = ["editor", "staff", "manager", "owner"] as const;
export const USER_STATUS = ["active", "blocked"] as const;
export const SESSION_KINDS = ["customer", "admin"] as const;
export const OTP_PURPOSES = ["login", "admin_login"] as const;
export const OTP_CHANNELS = ["email", "sms", "whatsapp"] as const;
export const MEDIA_KINDS = ["image", "pdf"] as const;
export const MEDIA_BUCKETS = ["public", "private"] as const;
export const MEDIA_STATUS = ["pending", "ready"] as const;
export const MEDIA_PURPOSES = ["product", "category", "banner", "article", "testimonial", "setting", "review", "palm", "report", "kundali"] as const;
export const CATEGORY_KEYS = ["rudraksha", "bracelets", "amulets", "havan", "copper"] as const;
export const INTENT_KEYS = ["wealth", "protection", "love", "peace", "health", "courage", "clarity"] as const;
export const BADGE_KEYS = ["bestseller", "energized", "new", "rare", "featured"] as const;
export const STONE_KEYS = ["pyrite", "citrine", "jade", "tourmaline", "tiger", "rose", "amethyst", "chakra", "quartz", "lapis", "moon", "garnet", "blood", "jasper", "malachite"] as const;
export const WRIST_SIZES = ["S", "M", "L"] as const;
export const PRODUCT_STATUS = ["draft", "active", "archived"] as const;
export const SERVICE_KEYS = ["kundali", "palm", "tarot", "numerology"] as const;
export const TIER_KEYS = ["essential", "detailed", "premium"] as const;
export const MODE_KEYS = ["call", "video", "wa", "report"] as const;
export const COURSE_KEYS = ["baglamukhi", "hanuman", "kali", "durga", "shiva", "bhairav"] as const;
export const RASHI_KEYS = ["mesha", "vrishabha", "mithuna", "karka", "simha", "kanya", "tula", "vrishchika", "dhanu", "makara", "kumbha", "meena"] as const;
export const RASHIFAL_PERIODS = ["day", "week", "month", "year"] as const;
export const CONTENT_STATUS = ["draft", "published"] as const;
export const VIDEO_KINDS = ["video", "short"] as const;
export const TESTIMONIAL_KINDS = ["text", "video", "photo"] as const;
export const FAQ_SETS = ["home", "consult", "kundali99", "courses", "kundali", "palm", "tarot", "numerology", "rituals", "shop", "general"] as const;
export const ARTICLE_CATEGORIES = ["rudraksha", "crystals", "rashifal", "sadhana", "remedies", "festivals", "astrology"] as const;
export const POLICY_SLUGS = ["shipping", "refund-returns", "privacy", "terms", "astrology-disclaimer"] as const;
export const HOME_SECTIONS = ["hero", "trust", "categories", "bestsellers", "nagSpotlight", "rashifal", "astroTools", "consult", "intentions", "courses", "rituals", "about", "videos", "testimonials", "journal", "faq", "newsletter"] as const;
export const ORDER_STATUS = ["pending_payment", "placed", "energizing", "packed", "shipped", "delivered", "cancelled", "returned"] as const;
export const PAYMENT_STATUS = ["unpaid", "paid", "failed", "refunded", "partially_refunded", "cod_pending", "cod_collected"] as const;
export const PAYMENT_METHODS = ["online", "cod"] as const;
export const PAY_PREFS = ["upi", "card", "netbanking", "wallet"] as const;
export const DELIVERY_OPTIONS = ["standard", "express"] as const;
export const PAY_ENTITIES = ["order", "booking", "kundali", "link"] as const;
export const PAY_PROVIDERS = ["razorpay", "cod", "manual"] as const;
export const PAYMENT_ROW_STATUS = ["created", "captured", "failed", "refunded", "partially_refunded"] as const;
export const REFUND_STATUS = ["pending", "processed", "failed"] as const;
export const COUPON_KINDS = ["percent", "flat"] as const;
export const REVIEW_STATUS = ["pending", "approved", "rejected"] as const;
export const BOOKING_STATUS = ["pending_payment", "confirmed", "completed", "no_show", "cancelled", "expired"] as const;
export const KUNDALI_STATUS = ["pending_payment", "paid", "generating", "ready", "failed"] as const;
export const INQUIRY_KINDS = ["course", "ritual"] as const;
export const INQUIRY_STATUS = ["new", "contacted", "call_scheduled", "approved", "enrolled", "declined", "closed"] as const;
export const LINK_ENTITIES = ["inquiry", "booking", "order", "custom"] as const;
export const LINK_STATUS = ["created", "paid", "cancelled", "expired"] as const;
export const MESSAGE_TOPICS = ["order", "consultation", "kundali", "course", "ritual", "other"] as const;
export const MESSAGE_STATUS = ["new", "replied", "closed"] as const;
export const SUBSCRIBER_STATUS = ["subscribed", "unsubscribed"] as const;
```
Each array also exports its union type, e.g. `export type OrderStatus = (typeof ORDER_STATUS)[number];`.
`CATEGORY_KEYS`, `INTENT_KEYS`, `WRIST_SIZES`, `BADGE_KEYS`, `STONE_KEYS` must match the phase-F types in `src/types/product.ts`: declare them with `satisfies readonly CategoryKey[]` (etc.) so a mismatch fails type-check. `SERVICE_KEYS`/`TIER_KEYS`/`MODE_KEYS` likewise match `src/lib/api/consult.ts`.

### Flows (`src/lib/domain/flows.ts`)
```ts
export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["placed", "cancelled"],
  placed: ["energizing", "packed", "cancelled"],
  energizing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};
export const BOOKING_FLOW: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ["confirmed", "expired", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [], no_show: [], cancelled: [], expired: [],
};
export const KUNDALI_FLOW: Record<KundaliStatus, KundaliStatus[]> = {
  pending_payment: ["paid"], paid: ["generating"], generating: ["ready", "failed"], failed: ["generating"], ready: ["generating"],
};
// inquiries: any status → any other status (admin pipeline)
```

### `src/lib/domain/types.ts` (JSON shapes + shared DTOs)
```ts
import type { Loc } from "./loc";          // Loc lives in src/lib/domain/loc.ts (B01)
export type { Loc };
export type MediaVariant = { w: number; h: number; key: string; bytes: number };
export type ProductContent = {
  description: Loc;                 // paragraphs separated by a blank line
  benefits: Loc[];                  // bullet lines
  howToWear: Loc;                   // vidhi: day, time, mantra
  specs: { k: Loc; v: Loc }[];
  placement: Loc[];                 // "where to place" lines (copper items)
  certificateMediaId: number | null;
  youtubeId: string | null;
};
export const EMPTY_PRODUCT_CONTENT: ProductContent; // all Loc = { en: "", hi: "" }, arrays empty, ids null
export type ServiceContent = {
  line: Loc; deliver: Loc; get: Loc; modesLine: Loc;
  covered: { icon: string; t: Loc; d: Loc }[];
  samples: { kind: string; cap: Loc }[];
};
export type CourseContent = { essence: Loc; overview: Loc; niyam: Loc; attain: Loc[] };
export type ShipAddress = { name: string; phone: string; line1: string; line2: string; landmark: string; city: string; state: string; pincode: string };
export type BirthProfile = { name: string; dob: string; tob: string | null; tobUnknown: boolean; place: string; lat: number | null; lon: number | null; tz: string | null };
export type BookingDetailsRecord = { dob: string; tob: string; unknown: boolean; place: string; q: string; lang: "hi" | "en"; mobile: string; biz: string };
export type CartLineInput = { pid: string; variant: WristSize | null; qty: number; energ: { name: string; gotra: string } | null };
export type RichMark = { type: "bold" | "italic" | "link"; attrs?: { href: string } };
export type RichNode = { type: "paragraph" | "heading" | "bulletList" | "orderedList" | "listItem" | "blockquote" | "horizontalRule" | "image" | "text" | "hardBreak"; attrs?: Record<string, string | number | null>; content?: RichNode[]; text?: string; marks?: RichMark[] };
export type RichDoc = { type: "doc"; content: RichNode[] };
export type HeroSlideText = { eyebrow: Loc; l1: Loc; l2: Loc; sub: Loc; body: Loc; cta1: Loc; cta2: Loc; mediaId: number | null }; // l2 may contain <em>…</em>
export type CatalogSnapshot = {
  v: number;                                        // Date.now() when built
  products: ProductLite[];
  categories: { key: CategoryKey; slug: string; name: Loc; short: Loc }[];
  services: { key: string; slug: string; name: Loc; icon: string; line: Loc; price: number; dur: string }[];
  articles: { slug: string; title: Loc; category: string; mins: number; pid: string | null }[];
  trending: string[];
  fees: { freeShippingInr: number; shippingInr: number; expressInr: number; codFeeInr: number; codEnabled: boolean; giftWrapInr: number; energizationInr: number; maxLineQty: number };
};
export type ProductLite = Pick<Product, "id" | "slug" | "cat" | "name" | "hi" | "price" | "mrp" | "stock" | "sizes" | "art" | "photo" | "photo2" | "badges" | "rating" | "reviews" | "intent" | "ik" | "sub" | "mukhi" | "stone" | "stoneName" | "catName"> & { images: MediaRef[]; catShort: string };
```
### `src/lib/domain/kundali.ts` (created in B03, filled by the B25 engine)
```ts
export type GrahaKey = "su" | "mo" | "ma" | "me" | "ju" | "ve" | "sa" | "ra" | "ke";   // same keys as src/lib/astro/kundali.ts
export type ChartPlanet = {
  k: GrahaKey; lon: number;        // sidereal longitude 0–360
  sign: number; deg: number;       // sign 0 = Mesha … 11 = Meena; degrees inside the sign
  house: number;                   // 1–12, whole-sign from the lagna (from the Moon sign when birth time is unknown)
  nak: number; pada: number;       // nakshatra 0–26, pada 1–4
  retro: boolean; d9: number;      // retrograde; navamsa sign 0–11
};
export type DashaPeriod = { lord: GrahaKey; start: number; end: number; sub: { lord: GrahaKey; start: number; end: number }[] }; // epoch ms
export type ChartSnapshot = {
  v: 1;
  input: { name: string; dob: string; tob: string | null; tobUnknown: boolean; place: string; lat: number; lon: number; tz: string; utcMs: number };
  ayanamsa: number;                                                     // Lahiri (true), degrees
  lagna: { lon: number; sign: number; deg: number; nak: number; pada: number } | null;   // null when birth time is unknown
  planets: ChartPlanet[];                                               // 9, order su mo ma me ju ve sa ra ke
  moonSign: number; sunSign: number;
  nakshatra: { index: number; pada: number; lord: GrahaKey };           // Moon's
  panchang: { tithi: number; paksha: "shukla" | "krishna"; yoga: number; karana: number; vara: number };
  dashas: DashaPeriod[];                                                // Vimshottari, birth → 120 years
  doshas: {
    manglik: { fromLagna: boolean; fromMoon: boolean };
    kaalSarp: { present: boolean; type: number | null };               // type = Rahu's house 1–12
    sadeSati: { active: boolean; phase: "rising" | "peak" | "setting" | null; periods: { start: number; end: number }[] };
  };
  yogas: string[];                                                      // keys from YOGA_KEYS (B25)
};
```

---

## §C core.ts

```
settings
  key              text pk                       -- §I keys
  value            json<unknown> !               -- parsed with the §I zod schema on read and write
  updated_at       ts ! =now
  updated_by       int →users.id

users
  id               pk auto
  email            text uniq                     -- lower-case
  phone            text                          -- 10-digit Indian mobile, no +91
  name             text
  role             enum(ROLES) ! ="customer"
  status           enum(USER_STATUS) ! ="active"
  email_verified_at ts
  phone_verified_at ts
  birth            json<BirthProfile>
  marketing_opt_in bool ! =false
  last_login_at    ts
  crt, upd
  idx: users_phone_idx(phone) · users_role_idx(role)

sessions
  id               text pk                       -- sha256Hex(cookie token)
  user_id          int ! →users.id
  kind             enum(SESSION_KINDS) !
  expires_at       ts !
  ip               text
  user_agent       text                          -- first 200 chars
  crt
  idx: sessions_user_idx(user_id) · sessions_expires_idx(expires_at)

otp_codes
  id               pk auto
  purpose          enum(OTP_PURPOSES) !
  channel          enum(OTP_CHANNELS) ! ="email"
  identifier       text !                        -- normalized email
  code_hash        text !                        -- hmacHex(identifier + ":" + code)
  attempts         int ! =0
  expires_at       ts !
  consumed_at      ts
  ip               text
  crt
  idx: otp_lookup_idx(identifier, purpose, created_at)

rate_limits
  key              text pk                       -- "<bucket>:<id>"
  window_start     int !                         -- epoch seconds
  count            int !
  idx: rate_limits_window_idx(window_start)

audit_logs
  id               pk auto
  actor_id         int →users.id
  action           text !                        -- "product.update", "order.status" …
  entity           text !
  entity_id        text !
  summary          text !
  diff             json<Record<string, [unknown, unknown]>>
  ip               text
  crt
  idx: audit_entity_idx(entity, entity_id) · audit_created_idx(created_at)

counters
  key              text pk                       -- "invoice:2025-26"
  value            int ! =0

media
  id               pk auto
  kind             enum(MEDIA_KINDS) !
  bucket           enum(MEDIA_BUCKETS) !
  purpose          enum(MEDIA_PURPOSES) !
  status           enum(MEDIA_STATUS) ! ="pending"
  variants         json<MediaVariant[]> !        -- one entry for PDFs / private files
  width            int
  height           int
  blur             text                          -- data URI ≤ 600 chars
  mime             text !
  alt_en           text
  alt_hi           text
  owner_type       text                          -- "product" | "category" | "article" | "testimonial" | "booking" | "review" | "kundali" | "setting" …
  owner_id         text
  claim_hash       text                          -- customer uploads only, cleared when claimed
  uploaded_by      int →users.id
  crt
  idx: media_status_idx(status, created_at) · media_owner_idx(owner_type, owner_id)

webhook_events
  id               text pk                       -- x-razorpay-event-id
  provider         text !                        -- "razorpay"
  type             text !
  received_at      ts ! =now
  processed_at     ts
```

---

## §D catalog.ts

```
categories
  key              enum(CATEGORY_KEYS) pk
  slug             text ! uniq                   -- fixed; routes depend on it (admin cannot edit)
  name_en          text !
  name_hi          text !
  short_en         text !
  short_hi         text ! =""
  desc_en          text !
  desc_hi          text !
  seo_title_en / seo_title_hi / seo_desc_en / seo_desc_hi   text
  sort             int ! =0
  visible          bool ! =true
  upd

products
  id               text pk                       -- seeds keep design ids ("r5", "havan"); new: "p" + 8 Crockford chars
  slug             text ! uniq
  category_key     enum(CATEGORY_KEYS) ! →categories.key
  sub              text                          -- mukhi as string, or "malas"
  mukhi            int
  stone            enum(STONE_KEYS)
  stone_name       text                          -- filter label ("Pyrite")
  name_en          text !
  name_hi          text !
  long_en          text                          -- long PDP title
  long_hi          text
  intent_en        text !                        -- card pill line
  intent_hi        text ! =""
  intent_key       enum(INTENT_KEYS) !
  price_inr        int !
  mrp_inr          int !
  stock            int ! =0
  low_stock_at     int ! =5
  sizes            json<WristSize[]>             -- bracelets
  badges           json<BadgeKey[]> ! =[]
  rating_avg       real ! =0
  rating_count     int ! =0
  popularity       real ! =0
  art              json<ProductArt>              -- phase-F generated SVG recipe (seeded products)
  legacy_photo     text                          -- "/images/…" (seeded)
  legacy_photo2    text
  content          json<ProductContent> ! (default EMPTY_PRODUCT_CONTENT)
  related_ids      json<string[]> ! =[]
  energizable      bool ! =true
  gst_rate         real                          -- percent, invoice only
  hsn              text
  weight_g         int
  seo_title_en / seo_title_hi / seo_desc_en / seo_desc_hi   text
  status           enum(PRODUCT_STATUS) ! ="draft"
  featured         bool ! =false
  sort             int ! =0                      -- catalogue order
  published_at     ts                            -- "Newest" sort
  crt, upd
  idx: products_list_idx(status, category_key, sort) · products_sort_idx(status, sort) · products_published_idx(status, published_at)

product_media
  product_id       text ! →products.id
  media_id         int ! →media.id
  sort             int ! =0
  pk: primaryKey({ columns: [productId, mediaId] })
  idx: product_media_sort_idx(product_id, sort)
```

---

## §E content.ts

```
services
  key              enum(SERVICE_KEYS) pk
  slug             text ! uniq                   -- fixed
  name_en          text !
  name_hi          text !
  icon             text !                        -- IconName
  modes            json<ModeKey[]> !
  guarantee        bool ! =false
  content          json<ServiceContent> !
  sort             int ! =0
  visible          bool ! =true
  upd

service_tiers
  id               pk auto
  service_key      enum(SERVICE_KEYS) ! →services.key
  tier_key         enum(TIER_KEYS) !
  title_en         text !
  title_hi         text ! =""
  price_inr        int !
  mins             int !
  recommended      bool ! =false
  inclusions       json<Loc[]> ! =[]
  uniq: service_tier_uniq(service_key, tier_key)

courses
  key              enum(COURSE_KEYS) pk
  slug             text ! uniq                   -- fixed "<key>-sadhana"
  name_en          text !
  name_hi          text !
  deity            text !
  icon             text !
  days             int !
  content          json<CourseContent> !
  fee_inr          int                           -- null → settings.courses.feeInr
  sort             int ! =0
  visible          bool ! =true
  upd

rituals
  id               pk auto
  icon             text !
  name_en          text !
  name_hi          text !
  line_en          text !
  line_hi          text ! =""
  sort             int ! =0
  visible          bool ! =true
  upd

videos
  id               pk auto
  kind             enum(VIDEO_KINDS) !
  youtube_id       text uniq                     -- null for design placeholders
  legacy_key       text                          -- design id "v1" / "s1" (placeholder art)
  category         text !                        -- key from settings.videos.categories ("pravachan" …)
  title_en         text !
  title_hi         text !                        -- two lines joined with "\n"
  desc_en          text
  desc_hi          text
  duration         text !                        -- "12:34"
  published_on     text                          -- yyyy-mm-dd
  motif            text                          -- placeholder art motif
  featured         bool ! =false
  sort             int ! =0
  visible          bool ! =true
  crt, upd
  idx: videos_list_idx(kind, visible, sort)

testimonials
  id               pk auto
  kind             enum(TESTIMONIAL_KINDS) ! ="text"
  quote_en         text !
  quote_hi         text ! =""
  name             text !
  city             text
  tag              text                          -- "Kundali Reading" …
  rating           int                           -- 1–5
  youtube_id       text
  media_id         int →media.id
  featured         bool ! =false
  sort             int ! =0
  visible          bool ! =true
  crt, upd

faqs
  id               pk auto
  set_key          enum(FAQ_SETS) !
  q_en             text !
  q_hi             text ! =""
  a_en             text !
  a_hi             text ! =""
  sort             int ! =0
  visible          bool ! =true
  upd
  idx: faqs_set_idx(set_key, visible, sort)

articles
  id               pk auto
  slug             text ! uniq
  category         enum(ARTICLE_CATEGORIES) !
  title_en         text !
  title_hi         text ! =""
  excerpt_en       text !
  excerpt_hi       text ! =""
  body_en          json<RichDoc> !
  body_hi          json<RichDoc>
  cover_media_id   int →media.id
  legacy_art       text                          -- product id whose art the home Journal card shows
  read_mins        int ! =5
  faq              json<{ q: Loc; a: Loc }[]> ! =[]
  product_ids      json<string[]> ! =[]
  status           enum(CONTENT_STATUS) ! ="draft"
  published_at     ts
  seo_title_en / seo_title_hi / seo_desc_en / seo_desc_hi   text
  crt, upd
  idx: articles_list_idx(status, published_at)

rashifal_entries
  id               pk auto
  rashi            enum(RASHI_KEYS) !
  period           enum(RASHIFAL_PERIODS) !
  starts_on        text !                        -- yyyy-mm-dd IST: the day / Monday / 1st of month / 1 Jan
  text_en          text !
  text_hi          text ! =""
  scores           json<{ love: number; career: number; health: number; finance: number }>   -- 1–5
  lucky            json<{ number: number; colour: Loc }>
  status           enum(CONTENT_STATUS) ! ="published"
  updated_by       int →users.id
  upd
  uniq: rashifal_uniq(rashi, period, starts_on)

pages
  slug             enum(POLICY_SLUGS) pk
  title_en         text !
  title_hi         text ! =""
  body_en          json<RichDoc> !
  body_hi          json<RichDoc>
  updated_by       int →users.id
  upd
```

---

## §F commerce.ts

```
addresses
  id               pk auto
  user_id          int ! →users.id
  name             text !
  phone            text !
  line1            text !
  line2            text ! =""
  landmark         text ! =""
  city             text !
  state            text !
  pincode          text !
  is_default       bool ! =false
  crt, upd
  idx: addresses_user_idx(user_id)

coupons
  id               pk auto
  code             text ! uniq                   -- UPPER CASE
  kind             enum(COUPON_KINDS) !
  value            int !                         -- percent 1–90, or rupees
  min_cart_inr     int ! =0
  max_discount_inr int
  starts_at        ts
  ends_at          ts
  usage_limit      int
  per_customer_limit int                         -- counted by email
  first_order_only bool ! =false
  active           bool ! =true
  used_count       int ! =0
  note             text
  crt, upd

orders
  id               pk auto
  number           text ! uniq                   -- "MKA-251001-7KQ2"
  access_hash      text !                        -- sha256Hex(accessKey)
  user_id          int →users.id
  locale           enum(LOCALES) ! ="en"
  name             text !
  email            text !
  phone            text !
  ship_address     json<ShipAddress> !
  status           enum(ORDER_STATUS) !
  payment_method   enum(PAYMENT_METHODS) !
  payment_status   enum(PAYMENT_STATUS) !
  pay_pref         enum(PAY_PREFS)               -- online orders: method preselected in Razorpay
  delivery         enum(DELIVERY_OPTIONS) ! ="standard"
  items_inr        int !                         -- Σ price × qty
  mrp_inr          int !
  energ_inr        int !
  discount_inr     int !
  gift_inr         int !
  shipping_inr     int !
  express_inr      int !
  cod_inr          int !
  total_inr        int !
  refunded_inr     int ! =0
  coupon_code      text
  gift             bool ! =false
  gift_message     text
  customer_note    text
  energization_on  text                          -- yyyy-mm-dd Mahapuja date
  courier          text
  awb              text
  tracking_url     text
  invoice_no       text uniq
  razorpay_order_id text uniq
  needs_attention  bool ! =false
  attention_reason text
  admin_note       text
  ip               text
  placed_at / paid_at / shipped_at / delivered_at / cancelled_at   ts
  crt, upd
  idx: orders_status_idx(status, created_at) · orders_user_idx(user_id, created_at) · orders_email_idx(email) · orders_phone_idx(phone) · orders_created_idx(created_at)

order_items
  id               pk auto
  order_id         int ! →orders.id
  product_id       text !
  name_en          text !
  name_hi          text !
  slug             text !
  image            text                          -- snapshot URL (MediaRef.src or legacy path / svg)
  variant          enum(WRIST_SIZES)
  qty              int !
  price_inr        int !
  mrp_inr          int !
  energ_inr        int ! =0                      -- per unit
  energ_name       text
  energ_gotra      text
  line_total_inr   int !                         -- (price + energ) × qty
  gst_rate         real
  hsn              text
  idx: order_items_order_idx(order_id) · order_items_product_idx(product_id)

order_events
  id               pk auto
  order_id         int ! →orders.id
  type             text !                        -- created | paid | status | tracking | note | refund | email | attention
  from_status      text
  to_status        text
  message          text
  public           bool ! =false                 -- shown on the customer timeline
  actor_id         int →users.id
  crt
  idx: order_events_order_idx(order_id, created_at)

payments
  id               pk auto
  entity           enum(PAY_ENTITIES) !
  entity_id        int !
  provider         enum(PAY_PROVIDERS) !
  rzp_order_id     text
  rzp_payment_id   text uniq
  amount_inr       int !
  status           enum(PAYMENT_ROW_STATUS) !
  method           text                          -- upi | card | netbanking | wallet …
  error            text
  crt, upd
  idx: payments_entity_idx(entity, entity_id) · payments_rzp_order_idx(rzp_order_id)

refunds
  id               pk auto
  payment_id       int ! →payments.id
  entity           enum(PAY_ENTITIES) !
  entity_id        int !
  rzp_refund_id    text uniq
  amount_inr       int !
  reason           text
  status           enum(REFUND_STATUS) ! ="pending"
  actor_id         int →users.id
  crt, upd
  idx: refunds_entity_idx(entity, entity_id)

coupon_redemptions
  id               pk auto
  coupon_id        int ! →coupons.id
  order_id         int ! uniq →orders.id
  email            text !
  discount_inr     int !
  crt
  idx: coupon_red_email_idx(coupon_id, email)

checkout_drafts
  id               pk auto
  token            text ! uniq                   -- random, kept by the checkout page
  email            text !
  phone            text
  name             text
  locale           enum(LOCALES) !
  lines            json<CartLineInput[]> !
  total_inr        int !
  reminded_at      ts
  order_id         int →orders.id               -- set when it became an order
  crt, upd
  idx: checkout_drafts_remind_idx(order_id, reminded_at, updated_at)

reviews
  id               pk auto
  product_id       text ! →products.id
  order_id         int →orders.id
  user_id          int →users.id
  name             text !
  city             text
  rating           int !                         -- 1–5
  title            text
  body             text !
  media_ids        json<number[]> ! =[]
  verified         bool ! =false
  status           enum(REVIEW_STATUS) ! ="pending"
  show_on_home     bool ! =false
  legacy_date      text                          -- design display date (seeded photo reviews)
  crt
  approved_at      ts
  idx: reviews_product_idx(product_id, status, created_at) · reviews_status_idx(status, created_at)
```

---

## §G consult.ts

```
bookings
  id               pk auto
  ref              text ! uniq                   -- "MKA-B" + 5 Crockford chars (phase-F format)
  access_hash      text !
  user_id          int →users.id
  locale           enum(LOCALES) !
  service_key      enum(SERVICE_KEYS) !
  tier_key         enum(TIER_KEYS) !
  mode             enum(MODE_KEYS) !
  start_at         ts                            -- null for written reports
  end_at           ts
  price_inr        int !
  pay_pref         enum(PAY_PREFS)
  status           enum(BOOKING_STATUS) !
  hold_expires_at  ts
  name             text !
  phone            text !
  email            text
  details          json<BookingDetailsRecord> !
  palm_media_ids   json<number[]> ! =[]
  meeting_link     text
  report_media_id  int →media.id
  reschedule_count int ! =0
  admin_note       text
  reminder_day_at  ts
  reminder_hour_at ts
  razorpay_order_id text uniq
  paid_at          ts
  cancelled_at     ts
  crt, upd
  idx: bookings_start_idx(start_at) · bookings_status_idx(status, start_at) · bookings_user_idx(user_id) · bookings_email_idx(email) · bookings_phone_idx(phone)

kundali_orders
  id               pk auto
  ref              text ! uniq                   -- "MKA-K" + 6 Crockford chars
  access_hash      text !
  user_id          int →users.id
  locale           enum(LOCALES) !               -- site locale (emails)
  report_lang      enum(LOCALES) !
  name             text !
  dob              text !                        -- yyyy-mm-dd
  tob              text                          -- HH:mm
  tob_unknown      bool ! =false
  place            text !
  lat              real !
  lon              real !
  tz               text !                        -- IANA zone
  phone            text !
  email            text
  price_inr        int !
  status           enum(KUNDALI_STATUS) !
  chart            json<ChartSnapshot>
  pdf_media_id     int →media.id
  emailed_at       ts
  gen_started_at   ts
  gen_attempts     int ! =0
  error            text
  razorpay_order_id text uniq
  paid_at          ts
  crt, upd
  idx: kundali_status_idx(status, created_at) · kundali_user_idx(user_id) · kundali_email_idx(email) · kundali_phone_idx(phone)
```

---

## §H crm.ts

```
inquiries
  id               pk auto
  ref              text ! uniq                   -- "MKA-S-123456" / "MKA-R-123456" (phase-F format)
  kind             enum(INQUIRY_KINDS) !
  course_key       enum(COURSE_KEYS)
  locale           enum(LOCALES) !
  name             text !
  phone            text !
  email            text
  city             text !
  exp              text                          -- INQUIRY_EXP value
  area             text                          -- INQUIRY_AREAS value
  lang             text !                        -- INQUIRY_LANGS value
  why              text !
  status           enum(INQUIRY_STATUS) ! ="new"
  assigned_to      int →users.id
  next_action_at   ts
  fee_inr          int
  paid_inr         int ! =0
  user_id          int →users.id
  ip               text
  crt, upd
  idx: inquiries_status_idx(status, created_at) · inquiries_kind_idx(kind, status) · inquiries_phone_idx(phone)

inquiry_events
  id               pk auto
  inquiry_id       int ! →inquiries.id
  type             text !                        -- status | note | call | payment_link | payment
  from_status      text
  to_status        text
  message          text
  actor_id         int →users.id
  crt
  idx: inquiry_events_idx(inquiry_id, created_at)

payment_links
  id               pk auto
  rzp_link_id      text ! uniq
  entity           enum(LINK_ENTITIES) !
  entity_id        int
  amount_inr       int !
  purpose          text !
  short_url        text !
  status           enum(LINK_STATUS) ! ="created"
  customer         json<{ name: string; phone: string; email: string | null }> !
  created_by       int →users.id
  paid_at          ts
  crt, upd
  idx: payment_links_entity_idx(entity, entity_id)

messages
  id               pk auto
  name             text !
  phone            text
  email            text
  topic            enum(MESSAGE_TOPICS) !
  body             text !
  locale           enum(LOCALES) !
  status           enum(MESSAGE_STATUS) ! ="new"
  ip               text
  crt, upd
  idx: messages_status_idx(status, created_at)

subscribers
  id               pk auto
  email            text ! uniq
  locale           enum(LOCALES) !
  source           text !                        -- footer | home | checkout | account
  status           enum(SUBSCRIBER_STATUS) ! ="subscribed"
  unsub_token      text ! uniq
  crt
  unsubscribed_at  ts
```

---

## §I Settings (`src/lib/validation/settings.ts` — isomorphic: admin forms, server and seed share it)

Each key has a zod schema and a default. `getSettings(key)` returns the stored value merged over the default; it never throws for a missing row. Values marked `[client-confirm]` come from phase-F placeholders.

| Key | Shape (TS) | Default |
|---|---|---|
| `store` | `{ freeShippingInr; shippingInr; expressInr; codEnabled: boolean; codFeeInr; codMaxInr; giftWrapInr; energizationInr; maxLineQty; standardDays: [number, number]; expressDays: [number, number]; onlinePayments: boolean; nextMahapuja: string \| null }` | 999 · 79 · 99 · true · 49 · 5000 · 49 · 251 · 10 · [4, 7] · [2, 4] · true · null (null → `muhurat()` from `src/lib/core/dates.ts`) |
| `contact` | `{ phoneDisplay; phoneTel; whatsapp; email; address: Loc; hours: Loc }` | "+91 90000 12345" · "+919000012345" · "919000012345" · "care@sadhakpawanpandey.com" · empty · `{ en: "Mon–Sat · 10:00–19:00 IST", hi: "सोम–शनि · 10:00–19:00 IST" }` |
| `social` | `{ youtube; instagram; facebook; whatsappChannel: string \| null; youtubeHandle: string; youtubeSubs: Loc }` | all null · "@SadhakPawanPandey" · `{ en: "1.2 lakh subscribers", hi: "1.2 लाख सब्सक्राइबर" }` |
| `seo` | `{ title: Loc; description: Loc; ogMediaId: number \| null }` | copied from `messages/*.json` → `meta` |
| `notify` | `{ adminEmails: string[]; orderAlerts: boolean; bookingAlerts: boolean; inquiryAlerts: boolean }` | [] (seed puts `SEED_OWNER_EMAIL`) · true · true · true |
| `kundali` | `{ enabled: boolean; priceInr; mrpInr }` | true · 99 · 499 |
| `courses` | `{ feeInr; instalments: { count; amountInr } \| null }` | 50000 · { 3, 16667 } |
| `consult` | `{ startTimes: Record<"30"\|"45"\|"60"\|"90", string[]>; openDays: number[]; bookingWindowDays; minLeadHours; holdMinutes; rescheduleMinHours; maxReschedules; blocked: { from: string; to: string; note: string }[] }` | startTimes = `src/lib/data/consult.json` → `slots` · [1,2,3,4,5,6] (0 = Sunday) · 30 · 12 · 10 · 12 · 1 · [] |
| `home` | `{ sections: Record<HomeSection, boolean>; hero: Record<"s1"\|"s2"\|"s3", HeroSlideText> \| null }` | all true · null (null → `messages` `home.hero.slides`) |
| `announcement` | `{ items: { text: Loc; href: string \| null }[] } \| null` | null (null → `messages` `chrome.ann`) |
| `videos` | `{ categories: { key: string; label: Loc }[] }` | from `src/lib/data/videos.json` → `cats` |
| `invoice` | `{ legalName; gstin: string \| null; address; stateCode; prefix }` | "Maa Kali Astuti" · null · "" · "" · "MKA" |

`SETTINGS_KEYS` = the 12 keys above. Every admin settings form validates with the same schema.
