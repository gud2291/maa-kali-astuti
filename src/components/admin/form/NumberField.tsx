"use client";

import { useId, type ComponentProps } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { FieldShell } from "./FieldShell";
import { cn } from "@/lib/utils/cn";

export type NumberFieldProps<T extends FieldValues = FieldValues> = Omit<
  ComponentProps<"input">,
  "name" | "defaultValue" | "type"
> & {
  name: Path<T>;
  control?: Control<T>;
  label: string;
  hint?: string;
  error?: string;
};

export function NumberField<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  hint,
  error: overrideError,
  required,
  min,
  max,
  step = 1,
  id: customId,
  className,
  ...rest
}: NumberFieldProps<T>): React.JSX.Element {
  const generatedId = useId();
  const id = customId ?? generatedId;
  const { field, fieldState } = useController({ name, control });
  const error = overrideError ?? fieldState.error?.message;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value;
    if (val === "") {
      field.onChange(undefined);
    } else {
      const parsed = parseInt(val, 10);
      field.onChange(Number.isNaN(parsed) ? undefined : parsed);
    }
  };

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
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={field.value !== undefined && field.value !== null ? field.value : ""}
        onChange={handleChange}
        onBlur={field.onBlur}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cn(
          "h-11 w-full rounded-field bg-cream px-3.5 font-sans text-[14.5px] font-medium text-ink tabular-nums transition-shadow outline-none",
          error
            ? "shadow-ring-error"
            : "shadow-ring-sand focus:shadow-ring-focus",
        )}
      />
    </FieldShell>
  );
}
