"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { FilterSelect } from "@/components/admin/ui/FilterSelect";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/domain/enums";

export type OrderFiltersProps = {
  search?: string;
  method?: string;
  from?: string;
  to?: string;
};

export function OrderFilters({
  search,
  method,
  from,
  to,
}: OrderFiltersProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParam = (key: string, value: string | undefined): void => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (value && value.trim()) {
      params.set(key, value.trim());
    } else {
      params.delete(key);
    }
    params.delete("page");

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const clearAll = (): void => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    const currentTab = params.get("tab");
    const newParams = new URLSearchParams();
    if (currentTab) newParams.set("tab", currentTab);

    startTransition(() => {
      const qs = newParams.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const hasActiveFilters = Boolean(search || method || from || to);

  const methodOptions = [
    { value: "", label: "All Payment Methods" },
    ...PAYMENT_METHODS.map((m) => ({
      value: m,
      label: m === "cod" ? "Cash on Delivery (COD)" : m.toUpperCase(),
    })),
  ];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
      <div className="w-full sm:w-72">
        <SearchBox
          value={search}
          placeholder="Search number, phone, email, name..."
          onChange={(val) => updateParam("q", val)}
        />
      </div>

      <div className="w-full sm:w-48">
        <FilterSelect
          value={method || ""}
          options={methodOptions}
          onChange={(val) => updateParam("method", val || undefined)}
          placeholder="Payment Method"
        />
      </div>

      {/* Date Range: From / To */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-sans text-xs text-ink6">From:</span>
          <input
            type="date"
            value={from || ""}
            onChange={(e) => updateParam("from", e.target.value || undefined)}
            className="rounded-field border border-s2 bg-iv px-2.5 py-1.5 font-sans text-xs text-ink shadow-sm focus:border-em7 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-sans text-xs text-ink6">To:</span>
          <input
            type="date"
            value={to || ""}
            onChange={(e) => updateParam("to", e.target.value || undefined)}
            className="rounded-field border border-s2 bg-iv px-2.5 py-1.5 font-sans text-xs text-ink shadow-sm focus:border-em7 focus:outline-none"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          disabled={isPending}
          className="text-xs font-semibold text-rose hover:underline disabled:opacity-50 cursor-pointer self-center"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
