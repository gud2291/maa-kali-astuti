import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

/* Shared bits of the booking stepper (Booking.dc.html). The fields here are the booking variant:
   52px, cream (#FFFDF8) surface, 1px sand ring (#A8322D when invalid), 1.5px emerald ring on focus,
   500 16px text; labels 600 13px; error rows 600 12.5px. (InquiryForm's Field is 48px/white.) */

/** Field label (Booking 105, 112, 119…). */
export const FIELD_LABEL = "font-sans text-[13px] leading-[1.2] font-semibold text-ink";

/** Text input / textarea. `bad` swaps the sand ring for the error ring; focus always wins. */
export const inputCls = (bad?: boolean) =>
  cn(
    "w-full rounded-field border-0 bg-cream px-[14px] font-sans text-[16px] leading-[1.2] font-medium text-ink outline-none focus:shadow-[inset_0_0_0_1.5px_#164E3F] focus-visible:outline-none",
    bad ? "shadow-[inset_0_0_0_1px_#A8322D]" : "shadow-ring-sand",
  );

/** Fraunces 22px group title (Booking 61, 74, 84, 126, 181, 219, 317). Uses the serif with the
 *  Devanagari fallback so the translated /hi titles still render in a serif. */
export const GROUP_TITLE = "font-title text-[22px] leading-[1.25] font-normal text-em9";

/** Radio selection surfaces (service cards, tiers, pay methods). */
export const pickRing = (sel: boolean) => (sel ? "shadow-ring-em-15" : "shadow-ring-sand");

/** Error line under a field (Booking 108 …): alert icon + 600 12.5px/1.4 sin, role=alert. */
export function ErrorRow({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <span
      id={id}
      role="alert"
      className="flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.4] font-semibold text-sin"
    >
      <span className="block size-[14px] flex-none">
        <Icon name="alert" />
      </span>
      {children}
    </span>
  );
}

/** Radio dot (18px ring, 8px emerald dot springing in over 260 ms). */
export function RadioDot({ sel, className }: { sel: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-[18px] flex-none place-items-center rounded-pill",
        sel ? "shadow-[inset_0_0_0_1.5px_#164E3F]" : "shadow-[inset_0_0_0_1.5px_#B8923A]",
        className,
      )}
    >
      <span
        className={cn(
          "block size-2 rounded-pill bg-em7 transition-transform duration-[260ms] ease-[cubic-bezier(.34,1.56,.64,1)]",
          sel ? "scale-100" : "scale-0",
        )}
      />
    </span>
  );
}
