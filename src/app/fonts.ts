import { Fraunces, Manrope, Mukta, Tiro_Devanagari_Hindi } from "next/font/google";

/* Same families/axes as the design helmet (Home.dc.html 12). Exposed as CSS variables
   and mapped to Tailwind font tokens in globals.css (font-display, font-sans, font-deva, font-hi). */

export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
  variable: "--font-fraunces",
});

export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
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

export const fontVariables = [fraunces.variable, manrope.variable, tiro.variable, mukta.variable].join(" ");
