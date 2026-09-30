import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

/* Shared bits of the consultation pages (Consultations.dc.html, Consultation-Detail.dc.html).
   Copy rule on /hi: Fraunces display text (h1/h2, service and tier names, quotes) stays English,
   as the design has no Devanagari display face; Manrope text is translated. */

/** Section eyebrow: 600 11px/1.2, tracking .16em, uppercase (Devanagari: no tracking). */
export const EYEBROW =
  "font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] uppercase hi:tracking-normal";

/** Small uppercase label (dt, "From"): 600 10.5px/1, tracking .14em. */
export const LABEL = "font-sans text-[10.5px] leading-none font-semibold tracking-[.14em] uppercase hi:tracking-normal";

/** Text link with the 1px brass underline (Details, Compare packages, Read his story). */
export const UNDERLINE =
  "bg-[linear-gradient(#B8923A,#B8923A)] bg-[length:100%_1px] bg-bottom bg-no-repeat py-1.5 font-sans font-semibold text-em7 no-underline";

/** Rich-text tags used by the `consult` messages. `gold` sets the <em> colour (g5 on light, g3 on night). */
export const rich = (gold = "text-g5") => ({
  em: (c: ReactNode) => <em className={cn("italic hi:not-italic", gold)}>{c}</em>,
  hi: (c: ReactNode) => (
    <span lang="hi" className="font-hi text-[1.08em] font-medium tracking-normal normal-case">
      {c}
    </span>
  ),
  b: (c: ReactNode) => <strong className="font-bold">{c}</strong>,
});

/** Breadcrumb row (Consultations 35, Consultation-Detail 35): 500 12.5px ink6, brass slashes. */
export function Crumbs({ label, items }: { label: string; items: { href?: string; t: ReactNode }[] }) {
  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center gap-2 font-sans text-[12.5px] leading-none font-medium text-ink6"
    >
      {items.map((it, i) => (
        <span key={i} className="contents">
          {i > 0 && (
            <span aria-hidden="true" className="text-g5">
              /
            </span>
          )}
          {it.href ? (
            <Link href={it.href} className="text-ink6 no-underline hover:text-ink6">
              {it.t}
            </Link>
          ) : (
            <span aria-current="page" className="text-ink">
              {it.t}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
