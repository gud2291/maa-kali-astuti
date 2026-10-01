import type { ReactNode } from "react";
import Link from "next/link";
import { AdminIcon, type AdminIconName } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: AdminIconName;
  href?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  className,
}: StatCardProps): React.JSX.Element {
  const inner = (
    <div
      className={cn(
        "rounded-btn bg-cream p-5 shadow-ring-sand transition-[background-color,transform] duration-150",
        href && "hover:bg-s1/30 hover:-translate-y-px",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[12px] font-semibold uppercase tracking-wider text-ink6">
            {label}
          </p>
          <div className="mt-1 font-display text-[28px] font-bold leading-tight text-ink sm:text-[32px]">
            {value}
          </div>
          {hint && (
            <div className="mt-1.5 font-sans text-[12px] leading-snug text-ink6">
              {hint}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex size-10 flex-none items-center justify-center rounded-btn bg-em1 text-em7">
            <span className="size-5">
              <AdminIcon name={icon} />
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {inner}
      </Link>
    );
  }

  return inner;
}
