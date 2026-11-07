import type {
  CategoryKey as ProductCategoryKey,
  IntentKey as ProductIntentKey,
  WristSize as ProductWristSize,
  BadgeKey as ProductBadgeKey,
  StoneKey as ProductStoneKey,
} from "@/types/product";

export const LOCALES = ["en", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const ROLES = ["customer", "editor", "staff", "manager", "owner"] as const;
export type Role = (typeof ROLES)[number];

export const ADMIN_ROLES = ["editor", "staff", "manager", "owner"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const USER_STATUS = ["active", "blocked"] as const;
export type UserStatus = (typeof USER_STATUS)[number];

export const SESSION_KINDS = ["customer", "admin"] as const;
export type SessionKind = (typeof SESSION_KINDS)[number];

export const OTP_PURPOSES = ["login", "admin_login"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const OTP_CHANNELS = ["email", "sms", "whatsapp"] as const;
export type OtpChannel = (typeof OTP_CHANNELS)[number];

export const MEDIA_KINDS = ["image", "pdf"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MEDIA_BUCKETS = ["public", "private"] as const;
export type MediaBucket = (typeof MEDIA_BUCKETS)[number];

export const MEDIA_STATUS = ["pending", "ready"] as const;
export type MediaStatus = (typeof MEDIA_STATUS)[number];

export const MEDIA_PURPOSES = [
  "product",
  "category",
  "banner",
  "article",
  "testimonial",
  "setting",
  "review",
  "palm",
  "report",
  "kundali",
] as const;
export type MediaPurpose = (typeof MEDIA_PURPOSES)[number];

export const CATEGORY_KEYS = [
  "rudraksha",
  "bracelets",
  "amulets",
  "havan",
  "copper",
  "attar",
  "books",
] as const satisfies readonly ProductCategoryKey[];
export type CategoryKey = (typeof CATEGORY_KEYS)[number];
export type CategoryKeyEnum = CategoryKey;

export const INTENT_KEYS = [
  "wealth",
  "protection",
  "love",
  "peace",
  "health",
  "courage",
  "clarity",
] as const satisfies readonly ProductIntentKey[];
export type IntentKey = (typeof INTENT_KEYS)[number];
export type IntentKeyEnum = IntentKey;

export const BADGE_KEYS = [
  "bestseller",
  "energized",
  "new",
  "rare",
  "featured",
] as const satisfies readonly ProductBadgeKey[];
export type BadgeKey = (typeof BADGE_KEYS)[number];
export type BadgeKeyEnum = BadgeKey;

export const STONE_KEYS = [
  "pyrite",
  "citrine",
  "jade",
  "tourmaline",
  "tiger",
  "rose",
  "amethyst",
  "chakra",
  "quartz",
  "lapis",
  "moon",
  "garnet",
  "blood",
  "jasper",
  "malachite",
] as const satisfies readonly ProductStoneKey[];
export type StoneKey = (typeof STONE_KEYS)[number];
export type StoneKeyEnum = StoneKey;

export const WRIST_SIZES = [
  "S",
  "M",
  "L",
] as const satisfies readonly ProductWristSize[];
export type WristSize = (typeof WRIST_SIZES)[number];
export type WristSizeEnum = WristSize;

export const PRODUCT_STATUS = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUS)[number];

export const SERVICE_KEYS = [
  "kundali",
  "palm",
  "tarot",
  "numerology",
] as const;
export type ServiceKey = (typeof SERVICE_KEYS)[number];
export type ServiceKeyEnum = ServiceKey;

export const TIER_KEYS = [
  "essential",
  "detailed",
  "premium",
] as const;
export type TierKey = (typeof TIER_KEYS)[number];
export type TierKeyEnum = TierKey;

export const MODE_KEYS = [
  "call",
  "video",
  "wa",
  "report",
] as const;
export type ModeKey = (typeof MODE_KEYS)[number];
export type ModeKeyEnum = ModeKey;

export const COURSE_KEYS = [
  "baglamukhi",
  "hanuman",
  "kali",
  "durga",
  "shiva",
  "bhairav",
] as const;
export type CourseKey = (typeof COURSE_KEYS)[number];

export const RASHI_KEYS = [
  "mesha",
  "vrishabha",
  "mithuna",
  "karka",
  "simha",
  "kanya",
  "tula",
  "vrishchika",
  "dhanu",
  "makara",
  "kumbha",
  "meena",
] as const;
export type RashiKey = (typeof RASHI_KEYS)[number];

export const RASHIFAL_PERIODS = ["day", "week", "month", "year"] as const;
export type RashifalPeriod = (typeof RASHIFAL_PERIODS)[number];

export const CONTENT_STATUS = ["draft", "published"] as const;
export type ContentStatus = (typeof CONTENT_STATUS)[number];

export const VIDEO_KINDS = ["video", "short"] as const;
export type VideoKind = (typeof VIDEO_KINDS)[number];

export const TESTIMONIAL_KINDS = ["text", "video", "photo"] as const;
export type TestimonialKind = (typeof TESTIMONIAL_KINDS)[number];

export const FAQ_SETS = [
  "home",
  "consult",
  "kundali99",
  "courses",
  "kundali",
  "palm",
  "tarot",
  "numerology",
  "rituals",
  "shop",
  "general",
] as const;
export type FaqSet = (typeof FAQ_SETS)[number];

export const ARTICLE_CATEGORIES = [
  "rudraksha",
  "crystals",
  "rashifal",
  "sadhana",
  "remedies",
  "festivals",
  "astrology",
] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const POLICY_SLUGS = [
  "shipping",
  "refund-returns",
  "privacy",
  "terms",
  "astrology-disclaimer",
] as const;
export type PolicySlug = (typeof POLICY_SLUGS)[number];

export const HOME_SECTIONS = [
  "hero",
  "trust",
  "categories",
  "bestsellers",
  "nagSpotlight",
  "rashifal",
  "astroTools",
  "consult",
  "intentions",
  "courses",
  "rituals",
  "about",
  "videos",
  "testimonials",
  "journal",
  "faq",
  "newsletter",
] as const;
export type HomeSection = (typeof HOME_SECTIONS)[number];

export const ORDER_STATUS = [
  "pending_payment",
  "placed",
  "energizing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];

export const STOCK_REASON = [
  "initial",
  "order",
  "oversold",
  "cancel_restock",
  "manual",
  "edit",
] as const;
export type StockReason = (typeof STOCK_REASON)[number];

export const SHIPMENT_STATUS = [
  "creating",
  "created",
  "awb_assigned",
  "in_transit",
  "delivered",
  "rto",
  "cancelled",
  "failed",
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUS)[number];

export const PAYMENT_STATUS = [
  "unpaid",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
  "cod_pending",
  "cod_collected",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS)[number];

export const PAYMENT_METHODS = ["online", "cod"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAY_PREFS = ["upi", "card", "netbanking", "wallet"] as const;
export type PayPref = (typeof PAY_PREFS)[number];

export const DELIVERY_OPTIONS = ["standard", "express"] as const;
export type DeliveryOption = (typeof DELIVERY_OPTIONS)[number];

export const PAY_ENTITIES = ["order", "booking", "kundali", "link"] as const;
export type PayEntity = (typeof PAY_ENTITIES)[number];

export const PAY_PROVIDERS = ["razorpay", "cod", "manual"] as const;
export type PayProvider = (typeof PAY_PROVIDERS)[number];

export const PAYMENT_ROW_STATUS = [
  "created",
  "captured",
  "failed",
  "refunded",
  "partially_refunded",
] as const;
export type PaymentRowStatus = (typeof PAYMENT_ROW_STATUS)[number];

export const REFUND_STATUS = ["pending", "processed", "failed"] as const;
export type RefundStatus = (typeof REFUND_STATUS)[number];

export const COUPON_KINDS = ["percent", "flat"] as const;
export type CouponKind = (typeof COUPON_KINDS)[number];

export const REVIEW_STATUS = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[number];

export const BOOKING_STATUS = [
  "pending_payment",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
  "expired",
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

export const KUNDALI_STATUS = [
  "pending_payment",
  "paid",
  "generating",
  "ready",
  "failed",
] as const;
export type KundaliStatus = (typeof KUNDALI_STATUS)[number];

export const INQUIRY_KINDS = ["course", "ritual"] as const;
export type InquiryKind = (typeof INQUIRY_KINDS)[number];

export const INQUIRY_STATUS = [
  "new",
  "contacted",
  "call_scheduled",
  "approved",
  "enrolled",
  "declined",
  "closed",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUS)[number];

export const LINK_ENTITIES = ["inquiry", "booking", "order", "custom"] as const;
export type LinkEntity = (typeof LINK_ENTITIES)[number];

export const LINK_STATUS = ["created", "paid", "cancelled", "expired"] as const;
export type LinkStatus = (typeof LINK_STATUS)[number];

export const MESSAGE_TOPICS = [
  "order",
  "consultation",
  "kundali",
  "course",
  "ritual",
  "other",
] as const;
export type MessageTopic = (typeof MESSAGE_TOPICS)[number];

export const MESSAGE_STATUS = ["new", "replied", "closed"] as const;
export type MessageStatus = (typeof MESSAGE_STATUS)[number];

export const SUBSCRIBER_STATUS = ["subscribed", "unsubscribed"] as const;
export type SubscriberStatus = (typeof SUBSCRIBER_STATUS)[number];
