import type { ReactNode } from "react";
import badges from "@/lib/data/badges.json";
import { cn } from "@/lib/utils/cn";

export type BadgeKey = keyof typeof badges | "soldOut";

/* Product badge pill (ProductCard.dc.html 35): 22px, 700 10px, tracking .08em, uppercase.
   Colours from M.BADGE [en, hi, bg, fg]; ivory badges get a gold hairline. */
export function Badge({ k, hi, className }: { k: BadgeKey; hi?: boolean; className?: string }) {
  const [en, h, bg, fg] = k === "soldOut" ? ["Sold out", "स्टॉक ख़त्म", "#5B6A61", "#FBF7EE"] : badges[k];
  return (
    <BadgePill bg={bg} fg={fg} className={className}>
      {hi ? h : en}
    </BadgePill>
  );
}

export function BadgePill({ bg, fg, children, className }: { bg: string; fg: string; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center gap-[5px] rounded-pill px-[9px] font-sans text-[10px] leading-none font-bold tracking-[.08em] uppercase hi:tracking-normal",
        className,
      )}
      style={{
        backgroundColor: bg,
        color: fg,
        boxShadow: bg === "#FBF7EE" ? "inset 0 0 0 1px rgba(184,146,58,.55)" : "none",
      }}
    >
      {children}
    </span>
  );
}
