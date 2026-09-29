import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/* The design's eyebrow: 600 11px/1.2 Manrope, tracking .16em, uppercase.
   light = #7A5C1C (small gold on ivory, AA) · night = #D9B96A */
export function Eyebrow({
  children,
  tone = "light",
  as: Tag = "span",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "night";
  as?: ElementType;
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] uppercase hi:tracking-normal",
        tone === "night" ? "text-g3" : "text-g7",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
