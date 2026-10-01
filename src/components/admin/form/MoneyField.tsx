"use client";

import { useId, type ComponentProps } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { FieldShell } from "./FieldShell";
import { cn } from "@/lib/utils/cn";

export type MoneyFieldProps<T extends FieldValues = FieldValues> = Omit<
  ComponentProps<"input">,
  "name" | "defaultValue" | "type"
> & {
  name: Path<T>;
  control?: Control<T>;
  label: string;
  hint?: string;
  error?: string;
};

export function MoneyField<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  hint,
  error: overrideError,
  required,
  min = 0,
  id: customId,
  className,
  ...rest
}: MoneyFieldProps<T>): React.JSX.Element {
  const generatedId = useId();
  const id = customId ?? generatedId;
  const { field, fieldState } = useController({ name, control });
  const error = overrideError ?? fieldState.error?.message;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const val = e.target.value.replace(/[^0-9]/g, "");
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
      <div
        className={cn(
          "flex h-11 items-stretch rounded-field bg-cream transition-shadow",
          error
            ? "shadow-ring-error"
            : "shadow-ring-sand focus-within:shadow-ring-focus",
        )}
      >
        <span
          aria-hidden="true"
          className="flex items-center pl-3.5 pr-2 font-sans text-[15px] font-semibold text-ink6 shadow-[inset_-1px_0_0_#eae0ca] select-none"
        >
          ₹
        </span>
        <input
          {...rest}
          id={id}
          name={field.name}
          ref={field.ref}
          type="text"
          inputMode="numeric"
          value={field.value !== undefined && field.value !== null ? field.value : ""}
          onChange={handleChange}
          onBlur={field.onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 font-sans text-[14.5px] font-medium tabular-nums text-ink outline-none"
        />
      </div>
    </FieldShell>
  );
}
