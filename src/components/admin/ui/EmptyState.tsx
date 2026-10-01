import type { ReactNode } from "react";
import { AdminIcon, type AdminIconName } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type EmptyStateProps = {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  icon?: AdminIconName;
  className?: string;
};

export function EmptyState({
  title,
  body,
  action,
  icon,
  className,
}: EmptyStateProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-btn bg-cream p-8 text-center shadow-ring-sand sm:p-12",
        className,
      )}
    >
      {icon && (
        <div className="mb-3.5 flex size-12 items-center justify-center rounded-full bg-s1 text-ink6">
          <span className="size-6">
            <AdminIcon name={icon} />
          </span>
        </div>
      )}
      <h3 className="font-display text-[18px] font-semibold leading-tight text-ink sm:text-[20px]">
        {title}
      </h3>
      {body && (
        <div className="mt-1.5 max-w-sm font-sans text-[13.5px] leading-relaxed text-ink6">
          {body}
        </div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
