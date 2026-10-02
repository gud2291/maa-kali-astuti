"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils/cn";
import type { Place } from "@/server/kundali/places";

export type { Place as SelectedPlace };

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: Place) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  autoComplete?: string;
  icon?: React.ReactNode;
  hasError?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

export function PlaceInput({
  value,
  onChange,
  onSelect,
  id = "place-input",
  placeholder,
  className,
  style,
  autoComplete = "off",
  icon,
  hasError,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [places, setPlaces] = useState<Place[]>([]);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortCtrl = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      clearTimeout(blurTimer.current);
      clearTimeout(debounceTimer.current);
      abortCtrl.current?.abort();
    };
  }, []);

  const fetchPlaces = (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setPlaces([]);
      setOpen(false);
      return;
    }

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      abortCtrl.current?.abort();
      const ctrl = new AbortController();
      abortCtrl.current = ctrl;

      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(trimmed)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as Place[];
          setPlaces(data);
          setOpen(data.length > 0);
          setActive(-1);
        }
      } catch {
        // Ignored if aborted
      }
    }, 250);
  };

  const handleInputChange = (text: string) => {
    onChange(text);
    fetchPlaces(text);
  };

  const handlePick = (p: Place) => {
    onSelect(p);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (!places.length || !open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % places.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + places.length) % places.length);
    } else if (e.key === "Enter" && active >= 0 && places[active]) {
      e.preventDefault();
      handlePick(places[active]);
    }
  };

  const listOpen = open && places.length > 0;
  const listId = `${id}-listbox`;

  return (
    <div className="relative w-full">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={listOpen}
        aria-autocomplete="list"
        aria-controls={listOpen ? listId : undefined}
        aria-activedescendant={
          listOpen && active >= 0 && places[active]
            ? `${id}-opt-${active}`
            : undefined
        }
        aria-invalid={ariaInvalid ?? hasError}
        aria-describedby={ariaDescribedBy}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (places.length > 0) setOpen(true);
        }}
        onBlur={() => {
          clearTimeout(blurTimer.current);
          blurTimer.current = setTimeout(() => setOpen(false), 200);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "h-[50px] w-full rounded-field border-none bg-iv font-sans text-[15px] font-medium text-ink outline-none",
          icon ? "pr-3.5 pl-[42px]" : "px-3.5",
          className,
        )}
        style={style}
      />

      {icon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-3.5 left-3.5 block size-5 text-g5"
        >
          {icon}
        </span>
      )}

      {listOpen && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-30 max-h-[260px] w-full overflow-y-auto rounded-field border border-g3/30 bg-iv py-1.5 shadow-[0_16px_36px_rgba(20,18,14,.2)]"
        >
          {places.map((p, i) => (
            <button
              key={p.id}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handlePick(p);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex w-full items-center justify-between px-3.5 py-2.5 text-left transition-colors",
                i === active ? "bg-cream text-em9" : "text-ink hover:bg-cream/60",
              )}
            >
              <span className="font-sans text-[14px] font-semibold">{p.name}</span>
              <span className="font-sans text-[12px] text-ink6">
                {p.region ? `${p.region}, ${p.country}` : p.country}
              </span>
            </button>
          ))}
          <div className="border-t border-g3/20 px-3.5 py-1.5 text-[11px] text-ink6">
            Place data © GeoNames (CC BY 4.0)
          </div>
        </div>
      )}
    </div>
  );
}
