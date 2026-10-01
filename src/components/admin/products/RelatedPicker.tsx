"use client";

import { useState, useMemo } from "react";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { cn } from "@/lib/utils/cn";

export type ProductOption = {
  id: string;
  name: string;
};

export type RelatedPickerProps = {
  value: string[];
  onChange: (next: string[]) => void;
  options: ProductOption[];
  max?: number;
  disabled?: boolean;
};

export function RelatedPicker({
  value = [],
  onChange,
  options = [],
  max = 12,
  disabled = false,
}: RelatedPickerProps): React.JSX.Element {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const optionMap = useMemo(() => {
    return new Map<string, string>(options.map((opt) => [opt.id, opt.name]));
  }, [options]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return options
      .filter((opt) => !value.includes(opt.id))
      .filter((opt) => !q || opt.name.toLowerCase().includes(q) || opt.id.toLowerCase().includes(q))
      .slice(0, 10);
  }, [options, value, search]);

  const addProduct = (id: string): void => {
    if (value.length >= max || value.includes(id) || disabled) return;
    onChange([...value, id]);
    setSearch("");
    setOpen(false);
  };

  const removeProduct = (id: string): void => {
    if (disabled) return;
    onChange(value.filter((itemId) => itemId !== id));
  };

  const canAddMore = value.length < max && !disabled;

  return (
    <div className="space-y-3">
      {/* Selected chips list */}
      <div className="flex flex-wrap items-center gap-2">
        {value.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 rounded-pill border border-s2 bg-cream px-3 py-1 font-sans text-[12.5px] font-medium text-ink shadow-xs"
          >
            <span className="font-semibold">{optionMap.get(id) ?? id}</span>
            <span className="font-mono text-[11px] text-ink6">({id})</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeProduct(id)}
                title="Remove related product"
                aria-label={`Remove related product ${optionMap.get(id) ?? id}`}
                className="flex size-4 items-center justify-center rounded-full text-ink6 hover:bg-rose/40 hover:text-sin cursor-pointer"
              >
                <span className="size-3">
                  <AdminIcon name="close" />
                </span>
              </button>
            )}
          </span>
        ))}

        {value.length === 0 && (
          <span className="font-sans text-[13px] text-ink6">
            No related products selected.
          </span>
        )}
      </div>

      {/* Search and picker dropdown */}
      {canAddMore && (
        <div className="relative max-w-md">
          <div className="relative flex h-9 items-center rounded-field border border-s2 bg-cream shadow-xs focus-within:border-em7">
            <span className="pointer-events-none pl-2.5 pr-1.5 text-ink6">
              <span className="block size-3.5">
                <AdminIcon name="search" />
              </span>
            </span>
            <input
              type="text"
              value={search}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              placeholder={`Search products to link (${value.length}/${max})...`}
              className="h-full flex-1 border-0 bg-transparent pr-3 font-sans text-[13px] text-ink placeholder:text-ink6/60 outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="mr-2 flex size-4 items-center justify-center text-ink6 hover:text-ink"
              >
                <span className="size-3">
                  <AdminIcon name="close" />
                </span>
              </button>
            )}
          </div>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-btn border border-s2 bg-cream p-1 shadow-card">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => addProduct(opt.id)}
                      className="flex w-full items-center justify-between rounded-field px-3 py-2 text-left font-sans text-[13px] text-ink transition-colors hover:bg-s1 cursor-pointer"
                    >
                      <span className="font-medium">{opt.name}</span>
                      <span className="font-mono text-[11px] text-ink6">
                        {opt.id}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center font-sans text-[12.5px] text-ink6">
                    {search ? "No matching products found" : "No more products available"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
