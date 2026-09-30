import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

/* Shared bits of the Kundali ₹99 page (Kundali-99.dc.html). */

/** 52px cream field (form 64–128): 16px Manrope 500, 1px sand ring → emerald 1.5px on focus. */
export const FIELD =
  "h-[52px] w-full rounded-field border-none bg-cream font-sans text-[16px] leading-[1.2] font-medium text-ink outline-none focus:shadow-[inset_0_0_0_1.5px_#164E3F]!";

/** Field label: 600 13px/1.2 ink. */
export const LABEL = "font-sans text-[13px] leading-[1.2] font-semibold text-ink";

/** The ring colour: rose-red when the field has an error, sand otherwise. */
export const ringOf = (bad: boolean) => ({ boxShadow: `inset 0 0 0 1px ${bad ? "#A8322D" : "#EAE0CA"}` });

/** Error row under a field (alert icon + 600 12.5px sindoor). */
export function ErrorRow({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <span
      id={id}
      role="alert"
      className={cn("flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.4] font-semibold text-sin", className)}
    >
      <span className="block size-3.5 flex-none">
        <Icon name="alert" />
      </span>
      {children}
    </span>
  );
}

/** Brass-underlined text link (Kundali-99 253, 315). */
export const UNDERLINE_LINK =
  "inline-flex items-center gap-2 self-start bg-[linear-gradient(#B8923A,#B8923A)] bg-[length:100%_1px] bg-bottom bg-no-repeat py-1.5 font-sans text-[14px] leading-[1.3] font-semibold text-em7 no-underline";
