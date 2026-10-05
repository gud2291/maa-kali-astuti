"use client";

import { useId } from "react";
import { FieldShell } from "./FieldShell";
import { cn } from "@/lib/utils/cn";

/*
 * Plain controlled fields for forms that keep their own useState instead of react-hook-form
 * (TextField & co. need a form `control`). Same look as the RHF fields; onChange gets the value.
 */

const fieldClass = (error?: string): string =>
  cn(
    "w-full rounded-field bg-cream px-3.5 font-sans text-[14.5px] font-medium text-ink transition-shadow outline-none",
    error ? "shadow-ring-error" : "shadow-ring-sand focus:shadow-ring-focus",
  );

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export function PlainText({
  label,
  hint,
  error,
  required,
  placeholder,
  className,
  value,
  onChange,
  maxLength,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}): React.JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn("h-11", fieldClass(error))}
      />
    </FieldShell>
  );
}

export function PlainTextArea({
  label,
  hint,
  error,
  required,
  placeholder,
  className,
  value,
  onChange,
  maxLength,
  rows = 3,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
}): React.JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn("py-2.5 leading-relaxed", fieldClass(error))}
      />
    </FieldShell>
  );
}

export function PlainSelect({
  label,
  hint,
  error,
  required,
  className,
  value,
  onChange,
  options,
}: Omit<BaseProps, "placeholder"> & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}): React.JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={cn("h-11 cursor-pointer", fieldClass(error))}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function PlainNumber({
  label,
  hint,
  error,
  required,
  className,
  value,
  onChange,
  min,
  max,
}: Omit<BaseProps, "placeholder"> & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}): React.JSX.Element {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value === "" ? Number.NaN : Number(e.target.value))}
        aria-invalid={error ? true : undefined}
        className={cn("h-11 tabular-nums", fieldClass(error))}
      />
    </FieldShell>
  );
}
