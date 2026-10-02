"use client";

import { useState, useMemo } from "react";
import { Dialog } from "radix-ui";
import { Icon, type IconName } from "@/components/icons/Icon";
import { ICON_PATHS } from "@/lib/art/icons";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { cn } from "@/lib/utils/cn";

export type IconPickerProps = {
  value: string;
  onChange: (next: IconName) => void;
  disabled?: boolean;
};

const ALL_ICONS = Object.keys(ICON_PATHS) as IconName[];

export function IconPicker({
  value,
  onChange,
  disabled = false,
}: IconPickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const currentIcon = (value in ICON_PATHS ? value : "diya") as IconName;

  const filteredIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICONS;
    return ALL_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  const selectIcon = (iconName: IconName): void => {
    onChange(iconName);
    setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="flex h-10 items-center gap-2.5 rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] text-ink shadow-sm hover:border-em7 hover:bg-s1 disabled:opacity-50 cursor-pointer"
        >
          <span className="flex size-6 items-center justify-center rounded-pill bg-s1 text-em7">
            <Icon name={currentIcon} className="size-4" />
          </span>
          <span className="font-mono text-[12px]">{currentIcon}</span>
          <span className="size-3 text-ink6 ml-1">
            <AdminIcon name="chevD" />
          </span>
        </button>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-n9/60 backdrop-blur-xs transition-opacity" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100vw-32px)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-btn bg-cream p-5 shadow-card border border-s2 outline-none">
            <div className="flex items-center justify-between border-b border-s2 pb-3">
              <div>
                <Dialog.Title className="font-display text-[18px] font-semibold text-ink">
                  Select Icon
                </Dialog.Title>
                <Dialog.Description className="font-sans text-[12px] text-ink6">
                  Choose an icon from the sacred icon set ({ALL_ICONS.length} available)
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="flex size-7 items-center justify-center rounded-full text-ink6 hover:bg-s1 hover:text-ink cursor-pointer"
                >
                  <span className="size-3.5">
                    <AdminIcon name="close" />
                  </span>
                </button>
              </Dialog.Close>
            </div>

            <div className="py-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search icon name (e.g. diya, lotus, bell)..."
                className="h-9 w-full rounded-field border border-s2 bg-cream px-3 font-sans text-[13px] text-ink outline-none focus:border-em7"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {filteredIcons.length === 0 ? (
                <div className="py-12 text-center text-[13px] text-ink6">
                  No icons matching &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {filteredIcons.map((name) => {
                    const isSelected = name === currentIcon;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => selectIcon(name)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-btn p-2 transition-colors cursor-pointer",
                          isSelected
                            ? "bg-em9 text-em1 shadow-sm"
                            : "hover:bg-s1 text-ink border border-transparent hover:border-s2",
                        )}
                        title={name}
                      >
                        <span className="size-5">
                          <Icon name={name} />
                        </span>
                        <span className="w-full truncate text-center font-mono text-[9.5px]">
                          {name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
