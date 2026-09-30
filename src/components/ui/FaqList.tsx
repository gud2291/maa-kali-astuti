"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { enter } from "@/components/motion/fx";
import { cn } from "@/lib/utils/cn";

/* FaqList (design/FaqList.dc.html 15–59). Single-open accordion: a numbered question row with a
   plus that turns 45° into a cross (300 ms EASE) on an emerald-tinted circle; the answer mounts
   with a small fade-down (y −6, 320 ms) and closes without animation, as designed.
   Sets live in src/lib/data/faq.json (home, consult, kundali99, courses, kundali, palm, tarot,
   numerology, rituals); pass one set's [question, answer] pairs. */

export function FaqList({ items, openFirst = true }: { items: [string, string][]; openFirst?: boolean }) {
  const uid = useId();
  const [open, setOpen] = useState(openFirst ? 0 : -1);
  // Only answers opened by a click animate in (the first one is server-rendered open).
  const touched = useRef(false);

  useLayoutEffect(() => {
    if (!touched.current || open < 0) return;
    enter(document.getElementById(`faq-${uid}-${open}`), { y: -6, dur: 320 });
  }, [open, uid]);

  return (
    <div className="flex flex-col border-t border-s2">
      {items.map(([q, a], i) => {
        const on = open === i;
        const id = `faq-${uid}-${i}`;
        return (
          <div key={q} className="border-b border-s2">
            <h3 className="m-0 [font:inherit]">
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  setOpen(on ? -1 : i);
                }}
                aria-expanded={on}
                aria-controls={id}
                className="grid w-full cursor-pointer grid-cols-[32px_minmax(0,1fr)_30px] items-start gap-2.5 border-0 bg-transparent py-5 text-left text-em9 transition-colors duration-150 hover:text-em5"
              >
                <span className="pt-2 font-sans text-[11px] leading-none font-semibold tracking-[.14em] text-g7 tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[clamp(18px,1.7vw,21px)] leading-[1.35] font-normal text-pretty font-soft">
                  {q}
                </span>
                <span
                  className={cn(
                    "grid size-[30px] place-items-center rounded-pill text-em7 [transition:transform_300ms_cubic-bezier(.22,1,.36,1),background-color_200ms,box-shadow_200ms]",
                    on
                      ? "[transform:rotate(45deg)] bg-em1 shadow-[inset_0_0_0_1px_#1C6B54]"
                      : "bg-transparent shadow-[inset_0_0_0_1px_#EAE0CA]",
                  )}
                >
                  <Icon name="plus" className="size-3.5" />
                </span>
              </button>
            </h3>
            {on && (
              <div
                id={id}
                role="region"
                className="max-w-[760px] pr-10 pb-6 pl-[42px] font-sans text-[15.5px] leading-[1.7] text-pretty text-ink6"
              >
                {a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
