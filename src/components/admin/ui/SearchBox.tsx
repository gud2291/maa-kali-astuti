"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type SearchBoxProps = {
  param?: string;
  placeholder?: string;
  className?: string;
};

export function SearchBox({
  param = "q",
  placeholder = "Search...",
  className,
}: SearchBoxProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialValue = searchParams.get(param) ?? "";

  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();

  // Keep state in sync if URL updates externally
  useEffect(() => {
    setValue(searchParams.get(param) ?? "");
  }, [searchParams, param]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get(param) ?? "";
      const trimmed = value.trim();

      if (trimmed === current) return;

      const sp = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        sp.set(param, trimmed);
      } else {
        sp.delete(param);
      }
      sp.delete("page"); // drops page on search change

      const query = sp.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.replace(nextUrl);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, param, pathname, router, searchParams]);

  return (
    <div
      className={cn(
        "relative flex h-10 w-full sm:w-64 items-center rounded-field bg-cream shadow-ring-sand transition-shadow focus-within:shadow-ring-focus",
        className,
      )}
    >
      <span className="pointer-events-none pl-3 pr-2 text-ink6">
        <span className="block size-4">
          <AdminIcon name="search" />
        </span>
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-full min-w-0 flex-1 border-0 bg-transparent pr-8 font-sans text-[13.5px] font-medium text-ink placeholder:text-ink6/60 outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="absolute right-2.5 flex size-5 items-center justify-center rounded-full text-ink6 hover:text-ink transition-colors cursor-pointer"
        >
          <span className="block size-3">
            <AdminIcon name="close" />
          </span>
        </button>
      )}
    </div>
  );
}
