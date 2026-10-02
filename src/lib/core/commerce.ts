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

export const WHATSAPP_NUMBER = "919000012345"; // [client-confirm] fallback +91 90000 12345
export const WHATSAPP_DISPLAY = "+91 90000 12345"; // [client-confirm] fallback

export function waLinkTo(number: string, text?: string): string {
  const clean = number.replace(/\D/g, "");
  return `https://wa.me/${clean}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function waLink(text?: string): string;
export function waLink(number: string, text?: string): string;
export function waLink(arg1?: string, arg2?: string): string {
  if (arg2 !== undefined) {
    return waLinkTo(arg1 ?? WHATSAPP_NUMBER, arg2);
  }
  return waLinkTo(WHATSAPP_NUMBER, arg1);
}


