"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type FilterSelectOption = {
  value: string;
  label: string;
};

export type FilterSelectProps = {
  param: string;
  label: string;
  options: FilterSelectOption[];
  className?: string;
};

export function FilterSelect({
  param,
  label,
  options,
  className,
}: FilterSelectProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get(param) ?? "";
  const [, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const val = e.target.value;
    const sp = new URLSearchParams(searchParams.toString());

    if (val) {
      sp.set(param, val);
    } else {
      sp.delete(param);
    }
    sp.delete("page"); // drops page on filter change

    const query = sp.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(nextUrl);
    });
  };

  return (
    <div
      className={cn(
        "relative flex h-10 items-center rounded-field bg-cream shadow-ring-sand transition-shadow focus-within:shadow-ring-focus",
        className,
      )}
    >
      <select
        value={currentValue}
        onChange={handleChange}
        aria-label={label}
        className="h-full min-w-0 appearance-none border-0 bg-transparent pl-3 pr-8 font-sans text-[13.5px] font-medium text-ink outline-none cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 text-ink6">
        <span className="block size-3.5">
          <AdminIcon name="chevD" />
        </span>
      </span>
    </div>
  );
}
