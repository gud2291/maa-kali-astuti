"use client";

import { AdminIcon } from "@/components/admin/AdminIcon";
import type { Loc } from "@/lib/domain/loc";

export type SpecItem = {
  k: Loc;
  v: Loc;
};

export type SpecsEditorProps = {
  value: SpecItem[];
  onChange: (next: SpecItem[]) => void;
  label?: string;
  max?: number;
  disabled?: boolean;
};

export function SpecsEditor({
  value = [],
  onChange,
  label = "specification",
  max = 20,
  disabled = false,
}: SpecsEditorProps): React.JSX.Element {
  const addItem = (): void => {
    if (value.length >= max || disabled) return;
    onChange([...value, { k: { en: "", hi: "" }, v: { en: "", hi: "" } }]);
  };

  const updateItem = (
    index: number,
    field: "k" | "v",
    patch: Partial<Loc>,
  ): void => {
    const next = [...value];
    const target = next[index]!;
    next[index] = {
      ...target,
      [field]: { ...target[field], ...patch },
    };
    onChange(next);
  };

  const removeItem = (index: number): void => {
    if (disabled) return;
    onChange(value.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: -1 | 1): void => {
    const target = index + direction;
    if (target < 0 || target >= value.length || disabled) return;
    const next = [...value];
    const temp = next[index]!;
    next[index] = next[target]!;
    next[target] = temp;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-btn border border-s2 bg-cream p-3 sm:flex-row sm:items-center sm:gap-3"
        >
          <span className="flex size-6 flex-none items-center justify-center rounded-full bg-s1 font-mono text-[11px] font-semibold text-ink6">
            {index + 1}
          </span>

          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-4">
            <input
              type="text"
              disabled={disabled}
              value={item.k.en}
              onChange={(e) => updateItem(index, "k", { en: e.target.value })}
              placeholder="Key (e.g. Material)"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7 disabled:opacity-50"
            />
            <input
              type="text"
              disabled={disabled}
              value={item.k.hi}
              onChange={(e) => updateItem(index, "k", { hi: e.target.value })}
              placeholder="कुंजी (उदा. सामग्री)"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13px] text-ink outline-none focus:border-em7 disabled:opacity-50"
            />
            <input
              type="text"
              disabled={disabled}
              value={item.v.en}
              onChange={(e) => updateItem(index, "v", { en: e.target.value })}
              placeholder="Value (e.g. Pure Copper)"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7 disabled:opacity-50"
            />
            <input
              type="text"
              disabled={disabled}
              value={item.v.hi}
              onChange={(e) => updateItem(index, "v", { hi: e.target.value })}
              placeholder="मान (उदा. शुद्ध तांबा)"
              className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-deva text-[13px] text-ink outline-none focus:border-em7 disabled:opacity-50"
            />
          </div>

          {!disabled && (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveItem(index, -1)}
                title="Move up"
                aria-label="Move specification up"
                className="flex size-8 items-center justify-center rounded-field text-ink6 hover:bg-s1 hover:text-ink disabled:opacity-30 cursor-pointer"
              >
                <span className="size-3.5">
                  <AdminIcon name="chevU" />
                </span>
              </button>
              <button
                type="button"
                disabled={index === value.length - 1}
                onClick={() => moveItem(index, 1)}
                title="Move down"
                aria-label="Move specification down"
                className="flex size-8 items-center justify-center rounded-field text-ink6 hover:bg-s1 hover:text-ink disabled:opacity-30 cursor-pointer"
              >
                <span className="size-3.5">
                  <AdminIcon name="chevD" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                title="Remove specification"
                aria-label="Remove specification"
                className="flex size-8 items-center justify-center rounded-field text-sin hover:bg-rose/40 cursor-pointer"
              >
                <span className="size-3.5">
                  <AdminIcon name="trash" />
                </span>
              </button>
            </div>
          )}
        </div>
      ))}

      {value.length < max && !disabled && (
        <button
          type="button"
          onClick={addItem}
          className="inline-flex h-8 items-center gap-1.5 rounded-field border border-dashed border-s2 bg-cream/50 px-3 font-sans text-[12.5px] font-semibold text-em7 hover:border-em7 hover:bg-cream cursor-pointer"
        >
          <span className="size-3.5">
            <AdminIcon name="plus" />
          </span>
          <span>Add {label} ({value.length}/{max})</span>
        </button>
      )}
    </div>
  );
}
