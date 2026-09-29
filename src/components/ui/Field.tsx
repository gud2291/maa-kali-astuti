import type { ComponentProps, ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

/* Form field (InquiryForm.dc.html 51–60):
   label 600 12.5px ink (+ optional part 500 ink6) · 48px white box, 2px radius, sand ring →
   1.5px em5 on focus → 1.5px sin when invalid (150 ms) · optional "+91" prefix ·
   input 500 15.5px with 14px padding · error row: alert icon + 500 12.5px/1.35 sin.
   States are CSS-only, so it works with react-hook-form's register() (the ref passes through). */
export function Field({
  label,
  optional,
  error,
  prefix,
  className,
  inputClassName,
  id,
  ...input
}: ComponentProps<"input"> & {
  label: ReactNode;
  optional?: ReactNode;
  error?: string;
  prefix?: string;
  inputClassName?: string;
}) {
  const errId = error && id ? `${id}-err` : undefined;
  return (
    <label htmlFor={id} className={cn("flex min-w-0 flex-col gap-[7px]", className)}>
      <span className="font-sans text-[12.5px] leading-[1.2] font-semibold text-ink">
        {label} {optional && <span className="font-medium text-ink6">{optional}</span>}
      </span>
      <span
        className={cn(
          "flex h-12 items-stretch rounded-field bg-white transition-shadow duration-150",
          error ? "shadow-ring-error" : "shadow-ring-sand focus-within:shadow-ring-focus",
        )}
      >
        {prefix && (
          <span className="flex items-center pr-[10px] pl-[14px] font-sans text-[15px] leading-none font-semibold text-ink6 shadow-[inset_-1px_0_0_#EAE0CA]">
            {prefix}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errId}
          className={cn(
            // The box's focus ring is the indicator (design); the input itself draws none.
            "h-full min-w-0 flex-1 border-0 bg-transparent px-[14px] font-sans text-[15.5px] leading-none font-medium text-ink outline-none focus-visible:outline-none",
            inputClassName,
          )}
          {...input}
        />
      </span>
      {error && (
        <span
          id={errId}
          role="alert"
          className="flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.35] font-medium text-sin"
        >
          <span className="block size-[14px] flex-none">
            <Icon name="alert" />
          </span>
          {error}
        </span>
      )}
    </label>
  );
}
