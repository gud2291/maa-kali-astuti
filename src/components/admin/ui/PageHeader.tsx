import type { ReactNode } from "react";
import Link from "next/link";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  className,
}: PageHeaderProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6",
        className,
      )}
    >
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="group mb-2 inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-ink6 transition-colors hover:text-em7"
          >
            <span className="size-4 transition-transform group-hover:-translate-x-0.5">
              <AdminIcon name="arrowL" />
            </span>
            <span>{backLabel}</span>
          </Link>
        )}
        <h1 className="font-display text-[28px] font-normal leading-[1.15] tracking-tight text-ink sm:text-[32px]">
          {title}
        </h1>
        {description && (
          <div className="mt-1 font-sans text-[14px] leading-relaxed text-ink6">
            {description}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5 sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
