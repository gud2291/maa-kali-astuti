import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CardProps = ComponentProps<"div">;

export function Card({ className, ...props }: CardProps): React.JSX.Element {
  return (
    <div
      className={cn("overflow-hidden rounded-btn bg-cream shadow-ring-sand", className)}
      {...props}
    />
  );
}

export type CardHeaderProps = Omit<ComponentProps<"div">, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function CardHeader({
  title,
  description,
  actions,
  children,
  className,
  ...props
}: CardHeaderProps): React.JSX.Element {
  if (children) {
    return (
      <div
        className={cn("border-b border-s2 px-5 py-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 border-b border-s2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        {title && (
          <h2 className="font-display text-[18px] font-semibold leading-tight text-ink sm:text-[20px]">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-0.5 font-sans text-[13px] leading-normal text-ink6">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export type CardBodyProps = ComponentProps<"div">;

export function CardBody({ className, ...props }: CardBodyProps): React.JSX.Element {
  return <div className={cn("p-5", className)} {...props} />;
}
