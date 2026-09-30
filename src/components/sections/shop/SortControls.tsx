"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { Icon } from "@/components/icons/Icon";
import { EASE } from "@/components/motion/easing";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";
import type { ProductSort } from "@/types/catalog";
import { SORT_KEYS } from "./shop-data";

/** Desktop sort dropdown (Shop.dc.html 150–158, ≥1024). Closes on pick, outside click or Esc. */
export function SortMenu({
  sort,
  open,
  setOpen,
  onPick,
}: {
  sort: ProductSort;
  open: boolean;
  setOpen: (v: boolean) => void;
  onPick: (k: ProductSort) => void;
}) {
  const t = useTranslations("shop");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open, setOpen]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-10 cursor-pointer items-center gap-2.5 rounded-btn border-0 bg-cream px-3.5 font-sans text-[13.5px] leading-none font-semibold text-ink shadow-ring-sand transition-shadow hover:shadow-[inset_0_0_0_1px_#1C6B54]"
      >
        <span className="font-medium text-ink6">{t("sort")}</span>
        {t(`sorts.${sort}`)}
        <span className="block size-3.5 text-ink6">
          <Icon name="chevD" />
        </span>
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={t("sortBy")}
          className="absolute top-[46px] right-0 z-20 w-[230px] rounded-btn bg-cream p-1.5 shadow-card"
        >
          {SORT_KEYS.map((k) => {
            const on = sort === k;
            return (
              <button
                key={k}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => onPick(k)}
                className={cn(
                  "flex h-10 w-full cursor-pointer items-center justify-between rounded-3 border-0 px-2.5 text-left font-sans text-[14px] leading-none font-medium text-ink hover:bg-s1",
                  on ? "bg-s1" : "bg-transparent",
                )}
              >
                {t(`sorts.${k}`)}
                <span className="block size-[15px] text-em7" style={{ opacity: on ? 1 : 0 }}>
                  <Icon name="check" />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Bottom sheet shell for the mobile filter / sort sheets (<1024): overlay, slide-up, focus trap. */
export function BottomSheet({
  open,
  onClose,
  dur,
  label,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Slide-in duration: 380 ms (filter) / 360 ms (sort). */
  dur: number;
  /** Accessible name when the sheet renders no Dialog.Title of its own. */
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[55] bg-[rgba(10,31,26,.45)]" />
        {open && (
          <SheetContent dur={dur} label={label} className={className}>
            {children}
          </SheetContent>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SheetContent({
  dur,
  label,
  className,
  children,
}: {
  dur: number;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current || isReduced()) return;
    ref.current.animate([{ transform: "translateY(100%)" }, { transform: "none" }], { duration: dur, easing: EASE });
  }, [dur]);
  return (
    <Dialog.Content
      ref={ref}
      aria-describedby={undefined}
      aria-label={label}
      className={cn("fixed inset-x-0 bottom-0 z-[55] rounded-t-[8px] bg-iv outline-none", className)}
    >
      {children}
    </Dialog.Content>
  );
}

/** Mobile "Sort by" sheet (Shop.dc.html 228–235): radio rows, picking one applies and closes. */
export function SortSheet({
  open,
  onClose,
  sort,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  sort: ProductSort;
  onPick: (k: ProductSort) => void;
}) {
  const t = useTranslations("shop");
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      dur={360}
      className="px-5 pt-2.5 pb-[calc(18px+env(safe-area-inset-bottom))]"
    >
      <div aria-hidden="true" className="mx-auto mb-3.5 h-1 w-10 rounded-pill bg-s2" />
      <Dialog.Title className="mb-2 block font-display text-[24px] leading-none font-normal text-em9 hi:font-deva">
        {t("sortBy")}
      </Dialog.Title>
      <div role="radiogroup" aria-label={t("sortBy")}>
        {SORT_KEYS.map((k) => {
          const on = sort === k;
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(k)}
              className="flex min-h-[52px] w-full cursor-pointer items-center justify-between border-b border-s2 bg-transparent text-left font-sans text-[16px] leading-none font-medium text-ink"
            >
              {t(`sorts.${k}`)}
              <span
                className={cn(
                  "grid size-[22px] place-items-center rounded-pill",
                  on ? "shadow-ring-em-15" : "shadow-[inset_0_0_0_1.5px_#C9BFA6]",
                )}
              >
                <span className="block size-2.5 rounded-pill bg-em7" style={{ opacity: on ? 1 : 0 }} />
              </span>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
