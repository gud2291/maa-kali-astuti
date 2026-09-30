"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { ScrollLine } from "@/components/motion/ScrollLine";
import type { IconRow } from "@/lib/api/content";
import { cn } from "@/lib/utils/cn";

/* Rituals #process steps (Rituals.dc.html 96–105, measure 154–160). A faint 1px rail with a 2px gold
   fill that grows with scroll: p = clamp((.62·vh − top) / height) of the whole list. Steps light in
   turn (n = min(5, floor(p·5 + .35))): gold disc with night icon and a soft halo, full opacity;
   unlit: night disc, gold ring, opacity .55. Each change eases over 500 ms. Reduced motion: full
   line, all steps lit (ScrollLine reports p = 1). */

const DEVA = ["१", "२", "३", "४", "५"];

export function ProcessSteps({ steps }: { steps: IconRow[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  const total = steps.length;

  return (
    <div ref={listRef} className="relative">
      <span
        aria-hidden="true"
        className="absolute top-7 bottom-7 left-[27.5px] w-px bg-[rgba(217,185,106,.22)]"
      />
      <ScrollLine
        measure={listRef}
        className="absolute top-7 bottom-7 left-[27px] w-[2px] overflow-visible"
        fillClassName="bg-g3"
        onProgress={(p) => setLit(Math.min(total, Math.floor(p * total + 0.35)))}
      />
      <ol className="relative m-0 list-none p-0">
        {steps.map(([icon, title, d], i) => {
          const on = i < lit;
          return (
            <li
              key={title}
              className={cn(
                "relative grid grid-cols-[56px_minmax(0,1fr)] gap-5 transition-opacity duration-500",
                i < total - 1 && "pb-[clamp(40px,6vw,72px)]",
                on ? "opacity-100" : "opacity-[.55]",
              )}
            >
              <span
                className={cn(
                  "relative grid size-14 place-items-center rounded-pill transition-[background-color,color,box-shadow] duration-500",
                  on
                    ? "bg-g3 text-n9 shadow-[0_0_0_6px_rgba(217,185,106,.14)]"
                    : "bg-n8 text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)]",
                )}
              >
                <Icon name={icon} className="size-6" />
              </span>
              <span className="flex flex-col gap-2 pt-1">
                <span lang="hi" className="font-deva text-[20px] leading-none text-g3">
                  {DEVA[i]}
                </span>
                <span lang="en" className="font-display text-[clamp(22px,2.4vw,28px)] leading-[1.2] font-normal text-iv">
                  {title}
                </span>
                <span lang="en" className="max-w-[520px] font-sans text-[16px] leading-[1.65] text-pretty text-sg3">
                  {d}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
