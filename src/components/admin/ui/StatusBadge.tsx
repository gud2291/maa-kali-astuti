import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone = "ok" | "warn" | "danger" | "info" | "muted";

export type StatusBadgeProps = {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
};

const tones: Record<BadgeTone, string> = {
  ok: "text-ok bg-em1",
  warn: "text-g7 bg-g1",
  danger: "text-sin bg-rose",
  info: "text-em5 bg-em1",
  muted: "text-ink6 bg-s1",
};

export function StatusBadge({
  tone,
  children,
  className,
}: StatusBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 font-sans text-[12px] font-semibold leading-normal whitespace-nowrap select-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
