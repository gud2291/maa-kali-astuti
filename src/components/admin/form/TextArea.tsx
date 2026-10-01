"use client";

import { useId, type ComponentProps } from "react";
import { useController, type Control, type FieldValues, type Path } from "react-hook-form";
import { FieldShell } from "./FieldShell";
import { cn } from "@/lib/utils/cn";

export type TextAreaProps<T extends FieldValues = FieldValues> = Omit<
  ComponentProps<"textarea">,
  "name" | "defaultValue"
> & {
  name: Path<T>;
  control?: Control<T>;
  label: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
};

export function TextArea<T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  hint,
  error: overrideError,
  required,
  rows = 4,
  maxLength,
  showCount,
  id: customId,
  className,
  ...rest
}: TextAreaProps<T>): React.JSX.Element {
  const generatedId = useId();
  const id = customId ?? generatedId;
  const { field, fieldState } = useController({ name, control });
  const error = overrideError ?? fieldState.error?.message;

  const currentLength = typeof field.value === "string" ? field.value.length : 0;
  const hintWithCount =
    showCount && maxLength ? (
      <span className="flex items-center justify-between gap-2">
        <span>{hint ?? ""}</span>
        <span className="tabular-nums text-ink6/80">
          {currentLength} / {maxLength}
        </span>
      </span>
    ) : (
      hint
    );

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hintWithCount}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        {...rest}
        id={id}
        name={field.name}
        ref={field.ref}
        rows={rows}
        value={field.value ?? ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cn(
          "w-full rounded-field bg-cream p-3.5 font-sans text-[14.5px] font-medium text-ink transition-shadow outline-none resize-y",
          error
            ? "shadow-ring-error"
            : "shadow-ring-sand focus:shadow-ring-focus",
        )}
      />
    </FieldShell>
  );
}
