import type { CatalogSnapshot } from "@/lib/domain/types";

/** Prefix for persisted client stores (`mka.store.v2.cart`, `….wish`). */
export const STORE_KEY = "mka.store.v2";

export type Fees = CatalogSnapshot["fees"];

/**
 * The prototype seeds a first-visit cart (5 Mukhi with a sankalp + Bitter Havan) and wishlist
 * (Rose Quartz, Baglamukhi, 7 Mukhi Mala) so the drawer and wishlist are never empty in the demo
 * (mka-core.js 399). [client-confirm] Turn off before launch.
 */
export const DEMO_SEED = true;

export const WHATSAPP_NUMBER = "919000012345"; // [client-confirm] +91 90000 12345
export const WHATSAPP_DISPLAY = "+91 90000 12345";
export const waLink = (text?: string): string =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

