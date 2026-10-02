"use client";

import { useEffect, useState } from "react";
import type { HeadingItem } from "./RichText";
import { cn } from "@/lib/utils/cn";

export type TocProps = {
  headings: HeadingItem[];
  title?: string;
  className?: string;
};

export function Toc({
  headings,
  title = "Contents",
  className,
}: TocProps): React.JSX.Element | null {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = (): void => {
      const scrollY = window.scrollY;
      const offset = 140; // Top offset for header/sticky bar

      let currentId = headings[0]?.id ?? "";
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          if (scrollY + offset >= top) {
            currentId = h.id;
          }
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  if (headings.length < 2) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        "sticky top-28 self-start rounded-field border border-s2 bg-cream/50 p-5 backdrop-blur-xs",
        className,
      )}
    >
      <p className="mb-3 font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-g7">
        {title}
      </p>
      <ul className="space-y-2 text-[14px]">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li
              key={h.id}
              className={cn(
                "transition-colors",
                h.level === 3 ? "pl-3 text-[13px]" : "pl-0",
              )}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(h.id);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                    setActiveId(h.id);
                  }
                }}
                className={cn(
                  "block py-0.5 leading-snug transition-colors",
                  isActive
                    ? "font-medium text-em5 border-l-2 border-em5 -ml-2 pl-2"
                    : "text-ink6 hover:text-em9",
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
