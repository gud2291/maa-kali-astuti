import type { ComponentProps, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/* CTA styles taken from the design's most-used buttons (Home hero, Consultations, night bands):
   primary  — emerald, gold hairline, hover em5               (height 52–54, 600 15px)
   sheen    — emerald with the gold light sweep on hover       (Home hero primary)
   outline  — ivory, emerald ring, hover em1                   (secondary on light)
   gold     — gold fill, night text, lifts 1px on hover        (CTA on night/emerald)
   night    — gold hairline on night, pale-gold text           (secondary on night)
   Call sites override exact px (padding, gap, font) with className when a section differs. */

export type ButtonVariant = "primary" | "sheen" | "outline" | "gold" | "night";
export type ButtonSize = "lg" | "md" | "sm" | "xs";

const base =
  "inline-flex items-center justify-center gap-[10px] rounded-btn font-sans font-semibold leading-none no-underline whitespace-nowrap select-none disabled:cursor-not-allowed disabled:opacity-55";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-em7 text-iv shadow-ring-gold transition-[background-color,transform] duration-[150ms,250ms] ease-mka hover:bg-em5 hover:text-iv",
  sheen: "bg-em7 text-iv shadow-ring-gold tracking-[.03em] sheen hover:text-iv hi:tracking-normal",
  outline:
    "bg-iv text-em7 shadow-ring-em transition-[background-color,transform] duration-[150ms,250ms] ease-mka hover:bg-em1 hover:text-em7",
  gold: "bg-g3 text-n9 font-bold transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-g4 hover:text-n9",
  night:
    "text-g1 shadow-ring-gold-60 transition-colors duration-200 hover:bg-[rgba(217,185,106,.1)] hover:text-iv",
};

const sizes: Record<ButtonSize, string> = {
  lg: "h-[54px] px-[26px] text-[15px]",
  md: "h-[52px] px-6 text-[15px]",
  sm: "h-[50px] px-[22px] text-[14.5px]",
  xs: "h-11 px-[18px] text-[14px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; className?: string; children: ReactNode };

/** `<button>` — defaults to type="button". */
export function Button({ variant, size, className, type = "button", ...rest }: Common & ComponentProps<"button">) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

/** Locale-aware internal link styled as a button. */
export function ButtonLink({ variant, size, className, ...rest }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}

/** External link (WhatsApp, YouTube) styled as a button; opens in a new tab. */
export function ButtonA({ variant, size, className, ...rest }: Common & ComponentProps<"a">) {
  return <a target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)} {...rest} />;
}
