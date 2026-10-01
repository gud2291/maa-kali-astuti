"use client";

import { useId } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { Checkbox } from "radix-ui";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type CheckboxFieldProps<T extends FieldValues = FieldValues> = {
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

export function CheckboxField<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  hint,
  error: overrideError,
  disabled,
  id: customId,
  className,
}: CheckboxFieldProps<T>): React.JSX.Element {
  const generatedId = useId();
  const id = customId ?? generatedId;
  const { field, fieldState } = useController({ name, control });
  const error = overrideError ?? fieldState.error?.message;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-2.5">
        <Checkbox.Root
          id={id}
          name={field.name}
          ref={field.ref}
          checked={Boolean(field.value)}
          onCheckedChange={field.onChange}
          onBlur={field.onBlur}
          disabled={disabled}
          className={cn(
            "mt-0.5 flex size-5 flex-none items-center justify-center rounded-field bg-cream transition-shadow outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "shadow-ring-error"
              : "shadow-ring-sand focus:shadow-ring-focus data-[state=checked]:bg-em7 data-[state=checked]:text-cream data-[state=checked]:shadow-none",
          )}
        >
          <Checkbox.Indicator className="text-current">
            <span className="block size-3.5">
              <AdminIcon name="check" />
            </span>
          </Checkbox.Indicator>
        </Checkbox.Root>

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
      </div>

      {hint && !error && <p className="ml-7 font-sans text-[12px] text-ink6">{hint}</p>}

      {error && (
        <p
          role="alert"
          className="ml-7 mt-0.5 flex items-center gap-1.5 font-sans text-[12px] font-medium text-sin"
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
