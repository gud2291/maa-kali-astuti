"use client";

import { useId } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { Switch } from "radix-ui";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type SwitchFieldProps<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  control?: Control<T>;
  label: string;
  description?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function SwitchField<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  hint,
  error: overrideError,
  disabled,
  id: customId,
  className,
}: SwitchFieldProps<T>): React.JSX.Element {
  const generatedId = useId();
  const id = customId ?? generatedId;
  const { field, fieldState } = useController({ name, control });
  const error = overrideError ?? fieldState.error?.message;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={id} className="cursor-pointer select-none">
          <span className="block font-sans text-[13.5px] font-semibold leading-tight text-ink">
            {label}
          </span>
          {description && (
            <span className="mt-0.5 block font-sans text-[12px] leading-normal text-ink6">
              {description}
            </span>
          )}
        </label>

        <Switch.Root
          id={id}
          name={field.name}
          ref={field.ref}
          checked={Boolean(field.value)}
          onCheckedChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          className={cn(
            "relative h-6 w-11 flex-none rounded-pill transition-colors outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            field.value ? "bg-em7" : "bg-s2",
          )}
        >
          <Switch.Thumb
            className={cn(
              "block size-5 rounded-full bg-cream shadow-sm transition-transform duration-150 will-change-transform",
              field.value ? "translate-x-[22px]" : "translate-x-0.5",
            )}
          />
        </Switch.Root>
      </div>

      {hint && !error && (
        <p className="font-sans text-[12px] text-ink6">{hint}</p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-0.5 flex items-center gap-1.5 font-sans text-[12px] font-medium text-sin"
        >
          <span className="block size-3.5 flex-none">
            <AdminIcon name="alert" />
          </span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
