"use client";

import { useId, type ComponentProps } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { FieldShell } from "./FieldShell";
import { cn } from "@/lib/utils/cn";

export type DateFieldProps<T extends FieldValues = FieldValues> = Omit<
  ComponentProps<"input">,
  "name" | "defaultValue" | "type"
> & {
  name: Path<T>;
  control?: Control<T>;
  label: string;
  hint?: string;
  error?: string;
};

export function DateField<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  hint,
  error: overrideError,
  required,
  min,
  max,
  id: customId,
  className,
  ...rest
}: DateFieldProps<T>): React.JSX.Element {
  const generatedId = useId();
  const id = customId ?? generatedId;
  const { field, fieldState } = useController({ name, control });
  const error = overrideError ?? fieldState.error?.message;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      <input
        {...rest}
        id={id}
        name={field.name}
        ref={field.ref}
        type="date"
        min={min}
        max={max}
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cn(
          "h-11 w-full rounded-field bg-cream px-3.5 font-sans text-[14.5px] font-medium text-ink transition-shadow outline-none cursor-pointer",
          error
            ? "shadow-ring-error"
            : "shadow-ring-sand focus:shadow-ring-focus",
        )}
      />
    </FieldShell>
  );
}
