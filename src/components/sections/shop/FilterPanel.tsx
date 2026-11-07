"use client";
import { useId, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Dialog } from "radix-ui";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";
import type { Category, Intent } from "@/types/catalog";
import type { IntentKey, Product, StoneKey } from "@/types/product";
import { PriceRange } from "./PriceRange";
import { MUKHI, RATINGS, type Filters, type ShopCat } from "./shop-data";

export type GroupKey = "cat" | "intent" | "price" | "mukhi" | "stone" | "avail" | "rating";

export type FilterPanelProps = {
  /** side = sticky sidebar (≥1024) · sheet = inside the mobile bottom sheet. */
  variant: "side" | "sheet";
  f: Filters;
  products: readonly Product[];
  categories: readonly Category[];
  intents: readonly Intent[];
  hi: boolean;
  closed: Partial<Record<GroupKey, boolean>>;
  onToggleGroup: (k: GroupKey) => void;
  allStones: boolean;
  onAllStones: () => void;
  change: (patch: Partial<Filters>) => void;
  toggleIn: <K extends "intents" | "mukhi" | "stones">(key: K, v: Filters[K][number]) => void;
  clearAll: () => void;
  hasActive: boolean;
  /** Current result count ("Show N results"). */
  total: number;
};

/** Filter groups (Shop.dc.html 84–140, groups 319–330). Every group starts open. */
export function FilterPanel(props: FilterPanelProps) {
  const { variant, f, products, categories, intents, closed, onToggleGroup, change, toggleIn, clearAll } = props;
  const t = useTranslations("shop");
  const uid = useId();
  const sheet = variant === "sheet";

  const cnt = (k: ShopCat) => products.filter((p) => k === "all" || p.cat === k).length;
  const base = products.filter((p) => f.cat === "all" || p.cat === f.cat);
  const bracelets = products.filter((p) => p.cat === "bracelets" && p.stone);
  const pickCat = (cat: ShopCat) => change({ cat, sub: null, mukhi: [], stones: [] });

  const group = (k: GroupKey, body: ReactNode) => (
    <Group key={k} id={`${uid}-${k}`} title={t(`groups.${k}`)} open={!closed[k]} onToggle={() => onToggleGroup(k)}>
      {body}
    </Group>
  );

  return (
    <>
      {sheet ? (
        <div className="flex items-center justify-between border-b border-s2 pt-1.5 pb-2.5">
          <Dialog.Title className="m-0 font-display text-[24px] leading-none font-normal text-em9 hi:font-deva">
            {t("filters")}
          </Dialog.Title>
          <Dialog.Close
            aria-label={t("closeFilters")}
            className="grid size-11 cursor-pointer place-items-center border-0 bg-transparent text-em7"
          >
            <span className="block size-[22px]">
              <Icon name="close" />
            </span>
          </Dialog.Close>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-s2 pb-3.5">
          <span className="font-sans text-[11px] leading-none font-semibold tracking-[.16em] text-ink uppercase hi:tracking-normal">
            {t("refine")}
          </span>
          {props.hasActive && (
            <button
              type="button"
              onClick={clearAll}
              className="cursor-pointer border-0 bg-transparent py-1 font-sans text-[12.5px] leading-none font-semibold text-sin"
            >
              {t("clearAll")}
            </button>
          )}
        </div>
      )}

      {group(
        "cat",
        <div role="radiogroup" aria-label={t("groups.cat")} className="flex flex-col gap-0.5">
          <Opt radio on={f.cat === "all"} label={t("allOfferings")} count={cnt("all")} onPick={() => pickCat("all")} />
          {categories.map((c) => (
            <Opt
              key={c.key}
              radio
              on={f.cat === c.key}
              label={props.hi ? c.hi : c.name}
              count={cnt(c.key)}
              onPick={() => pickCat(c.key)}
            />
          ))}
        </div>,
      )}

      {group(
        "intent",
        intents.map((i) => (
          <Opt
            key={i.key}
            on={f.intents.includes(i.key)}
            label={`${i.en} · ${i.hi}`}
            count={base.filter((p) => p.cat !== "attar" && p.ik === i.key).length}
            onPick={() => toggleIn("intents", i.key as IntentKey)}
          />
        )),
      )}

      {group("price", <PriceRange value={f.price} onCommit={(price) => change({ price })} />)}

      {(f.cat === "all" || f.cat === "rudraksha") &&
        group(
          "mukhi",
          <div className="grid grid-cols-5 gap-1.5">
            {MUKHI.map((m) => {
              const on = f.mukhi.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  aria-pressed={on}
                  aria-label={t("mukhiN", { n: m })}
                  onClick={() => toggleIn("mukhi", m)}
                  className={cn(
                    "h-[38px] cursor-pointer rounded-btn border-0 font-sans text-[13px] leading-none font-bold tabular transition-[background-color,box-shadow] duration-150",
                    on ? "bg-em7 text-iv shadow-ring-em" : "bg-cream text-em7 shadow-ring-sand",
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>,
        )}

      {(f.cat === "all" || f.cat === "bracelets") &&
        group(
          "stone",
          <>
            {(props.allStones ? bracelets : bracelets.slice(0, 6)).map((p) => (
              <Opt
                key={p.id}
                on={f.stones.includes(p.stone!)}
                label={p.stoneName ?? p.name}
                onPick={() => toggleIn("stones", p.stone as StoneKey)}
              />
            ))}
            <button
              type="button"
              onClick={props.onAllStones}
              aria-expanded={props.allStones}
              className="cursor-pointer self-start border-0 bg-transparent py-1.5 font-sans text-[13px] leading-none font-semibold text-em7"
            >
              {props.allStones ? t("showFewer") : t("showAllStones")}
            </button>
          </>,
        )}

      {group(
        "avail",
        <button
          type="button"
          role="switch"
          aria-checked={f.stock}
          onClick={() => change({ stock: !f.stock })}
          className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent py-1 font-sans text-[14px] leading-[1.3] font-medium text-ink"
        >
          {t("inStockOnly")}
          <span
            className={cn(
              "relative h-6 w-10 rounded-pill transition-colors duration-200",
              f.stock ? "bg-em7" : "bg-[#C9BFA6]",
            )}
          >
            <span
              className="absolute top-[3px] left-[3px] size-[18px] rounded-pill bg-iv shadow-[0_1px_3px_rgba(14,59,48,.3)] transition-transform duration-[250ms] ease-mka"
              style={{ transform: f.stock ? "translateX(16px)" : "none" }}
            />
          </span>
        </button>,
      )}

      {group(
        "rating",
        <div role="radiogroup" aria-label={t("groups.rating")} className="flex flex-col gap-0.5">
          {RATINGS.map((v) => (
            <Opt
              key={v}
              radio
              on={f.rating === v}
              label={v ? t("ratingAbove", { r: v }) : t("ratingAny")}
              onPick={() => change({ rating: v })}
            />
          ))}
        </div>,
      )}

      {sheet && (
        <div className="sticky bottom-0 grid grid-cols-[1fr_2fr] gap-2.5 bg-iv pt-3.5 pb-[calc(8px+env(safe-area-inset-bottom))] shadow-[0_-1px_0_#EAE0CA]">
          <button
            type="button"
            onClick={clearAll}
            className="h-[52px] cursor-pointer rounded-btn border border-em7 bg-iv font-sans text-[14px] leading-none font-semibold text-em7"
          >
            {t("clear")}
          </button>
          <Dialog.Close className="h-[52px] cursor-pointer rounded-btn border-0 bg-em7 font-sans text-[15px] leading-none font-semibold text-iv shadow-ring-gold">
            {t("showResults", { n: props.total })}
          </Dialog.Close>
        </div>
      )}
    </>
  );
}

function Group({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-s2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent py-4 text-left font-sans text-[14px] leading-none font-semibold text-em9"
      >
        {title}
        <span
          className="block size-4 text-ink6 transition-transform duration-[250ms]"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        >
          <Icon name="chevD" />
        </span>
      </button>
      {open && (
        <div id={id} className="flex flex-col gap-0.5 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

/** Checkbox / radio row: 18px box, label, count (Shop.dc.html 104–108, box() 320). */
function Opt({
  on,
  radio = false,
  label,
  count,
  onPick,
}: {
  on: boolean;
  radio?: boolean;
  label: string;
  count?: number;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role={radio ? "radio" : "checkbox"}
      aria-checked={on}
      onClick={onPick}
      className="flex min-h-9 cursor-pointer items-center gap-2.5 border-0 bg-transparent py-[7px] text-left font-sans text-[14px] leading-[1.3] font-medium text-ink"
    >
      <span
        className={cn(
          "grid size-[18px] flex-none place-items-center text-iv transition-[background-color,box-shadow] duration-150",
          radio ? "rounded-pill" : "rounded-3",
          on ? "bg-em7 shadow-ring-em-15" : "bg-cream shadow-[inset_0_0_0_1.5px_#C9BFA6]",
        )}
      >
        <span className="block size-3" style={{ opacity: on ? 1 : 0 }}>
          <Icon name="check" />
        </span>
      </span>
      <span className="flex-1">{label}</span>
      {count != null && (
        <span className="font-sans text-[12px] leading-none font-medium text-ink6 tabular">{count}</span>
      )}
    </button>
  );
}
