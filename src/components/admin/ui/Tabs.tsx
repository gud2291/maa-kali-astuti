"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Tabs as RadixTabs } from "radix-ui";
import { cn } from "@/lib/utils/cn";

export type TabItem = {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  items: TabItem[];
  className?: string;
};

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  items,
  className,
}: TabsProps): React.JSX.Element {
  const initialValue = defaultValue ?? items[0]?.value ?? "";

  return (
    <RadixTabs.Root
      defaultValue={initialValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <RadixTabs.List className="flex border-b border-s2 gap-2 overflow-x-auto no-scrollbar">
        {items.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="border-b-2 border-transparent px-4 py-2.5 font-sans text-[14px] font-semibold text-ink6 transition-colors hover:text-ink data-[state=active]:border-em7 data-[state=active]:text-em7 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap outline-none cursor-pointer"
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((tab) => (
        <RadixTabs.Content
          key={tab.value}
          value={tab.value}
          className="pt-4 outline-none focus-visible:ring-1 focus-visible:ring-em7"
        >
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}

export type LinkTab = {
  href: string;
  label: ReactNode;
  active: boolean;
  count?: number;
};

export type LinkTabsProps = {
  tabs: LinkTab[];
  className?: string;
};

export function LinkTabs({ tabs, className }: LinkTabsProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex border-b border-s2 gap-4 overflow-x-auto no-scrollbar",
        className,
      )}
    >
      {tabs.map((tab, idx) => (
        <Link
          key={tab.href || idx}
          href={tab.href}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-1 py-3 font-sans text-[14px] font-semibold whitespace-nowrap transition-colors outline-none",
            tab.active
              ? "border-em7 text-em7"
              : "border-transparent text-ink6 hover:border-s2 hover:text-ink",
          )}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={cn(
                "rounded-pill px-2 py-0.5 text-[11px] font-medium leading-none",
                tab.active ? "bg-em1 text-em7" : "bg-s1 text-ink6",
              )}
            >
              {tab.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
