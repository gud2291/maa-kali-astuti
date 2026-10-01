"use client";

import { useId, type ComponentProps } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { FieldShell } from "./FieldShell";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectFieldProps<T extends FieldValues = FieldValues> = Omit<
  ComponentProps<"select">,
  "name" | "defaultValue"
> & {
  name: Path<T>;
  control?: Control<T>;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
};

export function SelectField<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Select an option...",
  hint,
  error: overrideError,
  required,
  id: customId,
  className,
  ...rest
}: SelectFieldProps<T>): React.JSX.Element {
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
      <div
        className={cn(
          "relative flex h-11 items-center rounded-field bg-cream transition-shadow",
          error
            ? "shadow-ring-error"
            : "shadow-ring-sand focus-within:shadow-ring-focus",
        )}
      >
        <select
          {...rest}
          id={id}
          name={field.name}
          ref={field.ref}
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className="h-full w-full appearance-none border-0 bg-transparent pl-3.5 pr-9 font-sans text-[14.5px] font-medium text-ink outline-none cursor-pointer"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 text-ink6">
          <span className="block size-4">
            <AdminIcon name="chevD" />
          </span>
        </span>
      </div>
    </FieldShell>
  );
}
