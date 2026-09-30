/* Site-wide contact + social constants used by the chrome and footer (SiteChrome.dc.html 30,
   129, 193–194; SiteFooter.dc.html 50–53). All are [client-confirm] placeholders. */
export { WHATSAPP_DISPLAY, waLink } from "@/lib/core/commerce";

export const PHONE_TEL = "tel:+919000012345";
export const EMAIL = "care@sadhakpawanpandey.com";

/** Social profiles. `null` = not confirmed yet: the footer shows a "coming soon" toast instead. */
export const SOCIAL: { key: "youtube" | "instagram" | "facebook" | "whatsapp"; name: string; url: string | null }[] = [
  { key: "youtube", name: "YouTube", url: null },
  { key: "instagram", name: "Instagram", url: null },
  { key: "facebook", name: "Facebook", url: null },
  { key: "whatsapp", name: "WhatsApp", url: null },
];

/** Payment marks: drawer footer (SiteChrome 536) and footer bottom bar (SiteFooter 110). */
export const PAY_DRAWER = ["UPI", "RuPay", "VISA", "Mastercard", "COD"] as const;
export const PAY_FOOTER = ["UPI", "RuPay", "VISA", "Mastercard", "Razorpay"] as const;
