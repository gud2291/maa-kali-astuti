/* Site-wide contact + social constants. These serve as documented fallbacks when database settings
   are not available (e.g. before initial hydration or in offline scripts). */
export { WHATSAPP_DISPLAY, waLink, waLinkTo } from "@/lib/core/commerce";

/** Production origin for absolute metadata URLs (Vercel previews also resolve against it). */
export const SITE_URL = "https://sadhakpawanpandey.com";

/** Fallback telephone URL (tel:+...) */
export const PHONE_TEL = "tel:+919355319051";

/** Fallback customer care email */
export const EMAIL = "support@sadhakpawanpandey.com";

/** Fallback social profiles. `null` = not confirmed yet: the footer shows a "coming soon" toast instead. */
export const SOCIAL: { key: "youtube" | "instagram" | "facebook" | "whatsapp"; name: string; url: string | null }[] = [
  { key: "youtube", name: "YouTube", url: null },
  { key: "instagram", name: "Instagram", url: null },
  { key: "facebook", name: "Facebook", url: null },
  { key: "whatsapp", name: "WhatsApp", url: null },
];

/** Payment marks: drawer footer (SiteChrome 536) and footer bottom bar (SiteFooter 110). */
export const PAY_DRAWER = ["UPI", "RuPay", "VISA", "Mastercard", "COD"] as const;
export const PAY_FOOTER = ["UPI", "RuPay", "VISA", "Mastercard", "Razorpay"] as const;

/**
 * Real YouTube video ids per design video id (`v1`…`v12`, `s1`…`s6`). [client-confirm] Empty
 * until the channel's ids arrive: players then run the design's preview playback instead of
 * loading the youtube-nocookie iframe.
 */
export const YT_IDS: Partial<Record<string, string>> = {};

/** youtube-nocookie embed URL, loaded only after the visitor presses play (facade). */
export const ytEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
