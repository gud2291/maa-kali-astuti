"use client";

import { useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons/Icon";
import { ScrollLine } from "@/components/motion/ScrollLine";
import { cn } from "@/lib/utils/cn";
import { DEVA_NUM } from "./home-data";

/* §11 process (Home.dc.html 702–711, frame2 1269–1275, vRituals 1317). A 1px sand rail with a
   2px gold fill that grows with scroll: p = clamp((.62·vh − top) / height) of the whole list.
   Steps light up in turn (n = min(5, floor(p·5 + .35))): emerald disc, gold icon and a soft halo,
   full opacity — each change eases over 500 ms. Reduced motion: full line, all steps lit. */

export function RitualSteps({ steps }: { steps: [string, string, string][] }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  const total = steps.length;

  return (
    <div ref={listRef} className="relative mt-1.5">
      <span aria-hidden="true" className="absolute top-6 bottom-6 left-[23.5px] w-px bg-s2" />
      <ScrollLine
        measure={listRef}
        className="absolute top-6 bottom-6 left-[23px] w-[2px] overflow-visible"
        fillClassName="bg-g5"
        onProgress={(p) => setLit(Math.min(total, Math.floor(p * total + 0.35)))}
      />
      <ol className="relative m-0 list-none p-0">
        {steps.map(([icon, title, d], i) => {
          const on = i < lit;
          return (
            <li
              key={title}
              className={cn(
                "relative grid grid-cols-[48px_minmax(0,1fr)] gap-[18px] transition-opacity duration-500",
                i < total - 1 && "pb-[clamp(28px,3.4vw,44px)]",
                on ? "opacity-100" : "opacity-50",
              )}
            >
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-pill transition-[background-color,color,box-shadow] duration-500",
                  on
                    ? "bg-em7 text-g3 shadow-[0_0_0_6px_rgba(184,146,58,.14)]"
                    : "bg-iv text-g5 shadow-[inset_0_0_0_1px_rgba(184,146,58,.55)]",
                )}
              >
                <Icon name={icon as IconName} className="size-[22px]" />
              </span>
              <span className="flex flex-col gap-1.5 pt-0.5">
                <span lang="hi" className="font-deva text-[18px] leading-none text-g7">
                  {DEVA_NUM[i]}
                </span>
                <span className="font-display text-[clamp(20px,2vw,24px)] leading-[1.2] font-normal text-em9">
                  {title}
                </span>
                <span className="max-w-[520px] font-sans text-[15.5px] leading-[1.65] text-pretty text-ink6">{d}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
