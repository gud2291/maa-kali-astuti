import type { CatalogSnapshot } from "@/lib/domain/types";
import { IS_DEV } from "@/lib/core/runtime";

/** Prefix for persisted client stores (`mka.store.v2.cart`, `….wish`). */
export const STORE_KEY = "mka.store.v2";

export type Fees = CatalogSnapshot["fees"];

/**
 * The prototype seeds a first-visit cart (5 Mukhi with a sankalp + Bitter Havan) and wishlist
 * (Rose Quartz, Baglamukhi, 7 Mukhi Mala) so the drawer and wishlist are never empty in the demo
 * (mka-core.js 399). [client-confirm] Turn off before launch.
 */
export const DEMO_SEED: boolean = IS_DEV;

export const WHATSAPP_NUMBER = "919355319051"; // fallback +91 93553 19051
export const WHATSAPP_DISPLAY = "+91 93553 19051";

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


