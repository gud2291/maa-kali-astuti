/* Commerce constants from mka-core.js store (398–443). All are [client-confirm] placeholders. */
export const STORE_KEY = "mka.store.v2";
export const FREE_SHIPPING = 999;
export const SHIPPING = 79;
export const EXPRESS = 99;
export const COD_FEE = 49;
export const GIFT_WRAP = 49;
export const ENERGIZATION = 251;
export const MAX_LINE_QTY = 10;

export const COUPONS = {
  SADHANA10: { kind: "percent", value: 10 },
  FIRST100: { kind: "flat", value: 100, min: 999 },
} as const;

export const WHATSAPP_NUMBER = "919000012345"; // [client-confirm] +91 90000 12345
export const WHATSAPP_DISPLAY = "+91 90000 12345";
export const waLink = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
