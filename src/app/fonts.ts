import { Cormorant_Garamond, Montserrat, Mukta, Tiro_Devanagari_Hindi } from "next/font/google";

/* Client revision: Fraunces/Manrope replaced by the "Luxury Serif" pairing (Cormorant Garamond +
   Montserrat). Exposed as CSS variables and mapped to Tailwind font tokens in globals.css
   (font-display, font-sans, font-deva, font-hi). Cormorant ships no 400 here on purpose: the
   design's `font-normal` headings resolve to 500, which keeps the thin serif legible at size. */

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
});

// Devanagari faces: not preloaded (they are only needed for Hindi copy and subtitles).
export const tiro = Tiro_Devanagari_Hindi({
  subsets: ["latin", "devanagari"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-tiro",
});

export const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-mukta",
});

export const fontVariables = [cormorant.variable, montserrat.variable, tiro.variable, mukta.variable].join(" ");
