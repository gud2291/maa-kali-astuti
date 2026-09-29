import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Eyebrow } from "./Eyebrow";

/* Section heading block (e.g. Consultations "01 — Four ways to consult"):
   eyebrow → h2 (Fraunces, SOFT 40, tracking −.018em, <em> gold italic) → Devanagari subtitle,
   stacked with 12px gaps. With `lede`, the block and the paragraph sit in the design's
   auto-fit grid (minmax(min(100%,420px),1fr), gap 18px 56px, align end). */

const sizes = {
  sm: "text-[clamp(30px,3.6vw,48px)] leading-[1.08]",
  md: "text-[clamp(32px,3.8vw,50px)] leading-[1.08]",
  lg: "text-[clamp(32px,4vw,52px)] leading-[1.06]",
  xl: "text-[clamp(34px,4.2vw,56px)] leading-[1.06]",
} as const;

export function SectionHeader({
  eyebrow,
  title,
  deva,
  lede,
  tone = "light",
  size = "md",
  as: Tag = "h2",
  className,
  titleClassName,
}: {
  eyebrow?: ReactNode;
  /** Wrap the accent word in <em> — it renders gold italic. */
  title: ReactNode;
  /** Devanagari subtitle (Tiro 18px/1.35). */
  deva?: ReactNode;
  lede?: ReactNode;
  tone?: "light" | "night";
  size?: keyof typeof sizes;
  as?: ElementType;
  className?: string;
  titleClassName?: string;
}) {
  const night = tone === "night";
  const head = (
    <div className="flex flex-col gap-3" data-reveal={lede ? "0" : undefined}>
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <Tag
        className={cn(
          "m-0 font-display font-normal font-soft tracking-[-.018em] text-balance hi:tracking-normal hi:leading-[1.35] hi:font-deva",
          "[&_em]:italic hi:[&_em]:not-italic",
          night ? "text-iv [&_em]:text-g3" : "text-em9 [&_em]:text-g5",
          sizes[size],
          titleClassName,
        )}
      >
        {title}
      </Tag>
      {deva && (
        <span lang="hi" className={cn("font-deva text-[18px] leading-[1.35]", night ? "text-g3" : "text-g7")}>
          {deva}
        </span>
      )}
    </div>
  );
  if (!lede) return <div className={className}>{head}</div>;
  return (
    <div
      className={cn(
        "mb-[clamp(28px,4vw,44px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-[18px]",
        className,
      )}
    >
      {head}
      <p
        data-reveal="1"
        className={cn(
          "m-0 max-w-[520px] font-sans text-[16px] leading-[1.65] text-pretty",
          night ? "text-sg5" : "text-ink6",
        )}
      >
        {lede}
      </p>
    </div>
  );
}
