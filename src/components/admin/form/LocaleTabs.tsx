"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type LocaleTabsProps = {
  en: ReactNode;
  hi: ReactNode;
  hiEmpty?: boolean;
  defaultLocale?: "en" | "hi";
  className?: string;
};

export function LocaleTabs({
  en,
  hi,
  hiEmpty = false,
  defaultLocale = "en",
  className,
}: LocaleTabsProps): React.JSX.Element {
  const [active, setActive] = useState<"en" | "hi">(defaultLocale);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between border-b border-s2 pb-2">
        <div className="inline-flex rounded-btn bg-s1 p-0.5">
          <button
            type="button"
            onClick={() => setActive("en")}
            className={cn(
              "rounded-btn px-3.5 py-1 font-sans text-[13px] font-semibold transition-colors cursor-pointer",
              active === "en"
                ? "bg-cream text-ink shadow-sm"
                : "text-ink6 hover:text-ink",
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setActive("hi")}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-btn px-3.5 py-1 font-hi text-[13.5px] font-semibold transition-colors cursor-pointer",
              active === "hi"
                ? "bg-cream text-ink shadow-sm"
                : "text-ink6 hover:text-ink",
            )}
          >
            <span>हिंदी</span>
            {hiEmpty && (
              <span
                className="size-2 rounded-full bg-g5 flex-none"
                title="Hindi content missing"
                aria-label="Hindi content missing"
              />
            )}
          </button>
        </div>
      </div>

      <div>{active === "en" ? en : hi}</div>
    </div>
  );
}
