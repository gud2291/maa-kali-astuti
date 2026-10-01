import type { ReactNode } from "react";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type FieldShellProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldShellProps): React.JSX.Element {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={id}
        className="block font-sans text-[12.5px] font-semibold leading-tight text-ink"
      >
        {label}
        {required && (
          <span className="ml-1 text-sin" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {hint && !error && (
        <p id={hintId} className="font-sans text-[12px] leading-normal text-ink6">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 font-sans text-[12px] font-medium leading-normal text-sin"
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
