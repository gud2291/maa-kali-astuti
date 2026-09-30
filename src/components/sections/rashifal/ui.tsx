import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/* Shared bits of the Rashifal pages. */

/** Night breadcrumb (Rashifal 37, Rashi-Detail 35): 500 12.5px sage links, brass slashes, the
 *  current page in em1. */
export function NightCrumbs({
  label,
  items,
  className,
}: {
  label: string;
  items: { href?: string; t: ReactNode }[];
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={`flex flex-wrap items-center gap-2 font-sans text-[12.5px] leading-none font-medium text-sg5 ${className ?? ""}`}
    >
      {items.map((it, i) => (
        <span key={i} className="contents">
          {i > 0 && (
            <span aria-hidden="true" className="text-g5">
              /
            </span>
          )}
          {it.href ? (
            <Link href={it.href} className="text-sg5 no-underline hover:text-sg5">
              {it.t}
            </Link>
          ) : (
            <span aria-current="page" className="text-em1">
              {it.t}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Light section h2 (Fraunces 400, SOFT 40, −.018em, em9). */
export const H2 =
  "m-0 font-display font-normal leading-[1.08] tracking-[-.018em] text-balance text-em9 font-soft";

/** <em> inside the light h2s (brass italic). */
export const brass = (c: ReactNode) => <em className="text-g5 italic">{c}</em>;
