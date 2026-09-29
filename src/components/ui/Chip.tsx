import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

/* Pill toggle.
   filter (Shop.dc.html 66, chip() 315): 36px; off cream + sand ring; on em7 + em7 ring.
   form (InquiryForm.dc.html 55, chip() 126): min 40px; off white; on em7 + a 3px gold halo.
   Pass role="radio" for single-choice groups: the state is then exposed as aria-checked. */
export function Chip({
  on = false,
  variant = "filter",
  className,
  type = "button",
  role,
  ...rest
}: ComponentProps<"button"> & { on?: boolean; variant?: "filter" | "form" }) {
  const radio = role === "radio";
  return (
    <button
      type={type}
      role={role}
      aria-pressed={radio ? undefined : on}
      aria-checked={radio ? on : undefined}
      className={cn(
        "flex flex-none items-center gap-[7px] rounded-pill border-0 px-[15px] font-sans text-[13px] leading-none font-semibold transition-[background-color,box-shadow] duration-150",
        variant === "filter" ? "h-9" : "min-h-10",
        on
          ? cn(
              "bg-em7 text-iv",
              variant === "form"
                ? "shadow-[inset_0_0_0_1px_#164E3F,0_0_0_3px_rgba(184,146,58,.25)]"
                : "shadow-ring-em",
            )
          : cn(variant === "form" ? "bg-white" : "bg-cream", "text-em7 shadow-ring-sand"),
        className,
      )}
      {...rest}
    />
  );
}
