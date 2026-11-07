"use client";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { Chip } from "@/components/ui/Chip";
import { stagger } from "@/components/motion/fx";
import { routing } from "@/i18n/routing";
import { fmt } from "@/lib/core/format";
import { queryProducts } from "@/lib/core/query";
import { useMedia } from "@/lib/hooks/useMedia";
import { rovingTarget } from "@/lib/utils/roving";
import { cn } from "@/lib/utils/cn";
import type { Category, Intent, ProductSort } from "@/types/catalog";
import type { Product, StoneKey } from "@/types/product";
import { BuyersNote } from "./BuyersNote";
import { FilterPanel, type GroupKey } from "./FilterPanel";
import { ShopHeader } from "./ShopHeader";
import { EmptyState, LoadMore, ShopGrid } from "./ShopGrid";
import { BottomSheet, SortMenu, SortSheet } from "./SortControls";
import {
  DEFAULT_FILTERS,
  HEADER_ART,
  MUKHI,
  PAGE,
  PRICE_MAX,
  bannerArtId,
  parseShopUrl,
  shopUrl,
  urlKey,
  type DemoState,
  type Filters,
  type ShopCat,
} from "./shop-data";

type Props = {
  products: Product[];
  categories: Category[];
  intents: Intent[];
  /** Category from the route (`/shop` = all, `/shop/<slug>`). */
  initialCat: ShopCat;
};

type ListKey = "intents" | "mukhi" | "stones";

/**
 * The shop template (Shop.dc.html 26–236 + script 240–382) for `/shop` and `/shop/[category]`.
 *
 * The route renders statically with the route's category and no filters, in the design's
 * initial loading state. On mount the URL is parsed, and the grid appears after 650 ms (design
 * didMount). Every change sets the new state at once, rewrites the URL with `replaceState`
 * (category = path, filters = query) and shows skeletons for 380 ms (design `change`).
 * Navigations from outside (mega menu, intent links) are picked up by `UrlWatch`.
 */
export function ShopView({ products, categories, intents, initialCat }: Props) {
  const t = useTranslations("shop");
  const locale = useLocale();
  const hi = locale === "hi";
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

  const [f, setF] = useState<Filters>({ cat: initialCat, ...DEFAULT_FILTERS });
  const [demo, setDemo] = useState<DemoState>("live");
  const [shown, setShown] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [sheet, setSheet] = useState<"filter" | "sort" | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [closed, setClosed] = useState<Partial<Record<GroupKey, boolean>>>({});
  const [allStones, setAllStones] = useState(false);

  const md = useMedia("(min-width: 768px)");
  const side = useMedia("(min-width: 1024px)");
  const wide = useMedia("(min-width: 1400px)");
  const cols = wide ? 4 : md ? 3 : 2;

  const loadT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const moreT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastUrl = useRef("");
  const gridRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p] as const)), [products]);
  const stoneKeys = useMemo(
    () => products.filter((p) => p.cat === "bracelets" && p.stone).map((p) => p.stone as StoneKey),
    [products],
  );

  const wait = (ms: number) => {
    clearTimeout(loadT.current);
    loadT.current = setTimeout(() => setLoading(false), ms);
  };

  /* URL → state: on mount and after outside navigations. Our own replaceState writes are
     recognised by `lastUrl` and skipped. */
  const syncFromUrl = useCallback(() => {
    const { pathname, search } = window.location;
    const key = urlKey(pathname, search.slice(1));
    if (key === lastUrl.current) return;
    lastUrl.current = key;
    const r = parseShopUrl(pathname, search, categories, intents, stoneKeys);
    setF(r.filters);
    setDemo(r.demo);
    setShown(PAGE);
  }, [categories, intents, stoneKeys]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  /* First load: skeletons for 650 ms (design didMount 242). */
  useEffect(() => {
    loadT.current = setTimeout(() => setLoading(false), 650);
    return () => {
      clearTimeout(loadT.current);
      clearTimeout(moreT.current);
    };
  }, []);

  /** Apply a filter change (design `change` 268–270). */
  const change = (patch: Partial<Filters>, closeSheet = false) => {
    const next = { ...f, ...patch };
    setF(next);
    setShown(PAGE);
    setSortOpen(false);
    setMoreLoading(false);
    clearTimeout(moreT.current);
    if (closeSheet) setSheet(null);
    setLoading(true);
    wait(380);
    const { path, query } = shopUrl(next, categories);
    const full = prefix + path;
    lastUrl.current = urlKey(full, query);
    // `null` data: Next.js keeps its own history state and syncs usePathname/useSearchParams.
    window.history.replaceState(null, "", query ? `${full}?${query}` : full);
  };

  const toggleIn = <K extends ListKey>(key: K, v: Filters[K][number]) => {
    const a = (f[key] as Filters[K][number][]).slice();
    const i = a.indexOf(v);
    if (i > -1) a.splice(i, 1);
    else a.push(v);
    change({ [key]: a } as Partial<Filters>);
  };

  const clearAll = () =>
    change({ sub: null, intents: [], mukhi: [], stones: [], stock: false, rating: 0, price: [0, PRICE_MAX] });

  const pickCat = (cat: ShopCat) => change({ cat, sub: null, mukhi: [], stones: [] });
  const onAll = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    change({ cat: "all", sub: null });
  };

  /* Results */
  const busy = loading || demo === "loading";
  const results = useMemo(
    () =>
      demo === "empty"
        ? []
        : queryProducts(products, {
            cat: f.cat,
            sub: f.sub,
            intents: f.intents,
            mukhi: f.mukhi,
            stones: f.stones,
            inStock: f.stock,
            minRating: f.rating,
            price: f.price,
            sort: f.sort,
          }),
    [products, f, demo],
  );
  const total = results.length;

  /* Cards fade up in a 40 ms stagger whenever a new result set (or page) appears (didUpdate 251). */
  const resKey = [f.cat, f.sub, f.intents, f.mukhi, f.stones, f.stock, f.rating, f.price, f.sort, shown].join("|");
  const lastRes = useRef("");
  useLayoutEffect(() => {
    if (busy || resKey === lastRes.current) return;
    lastRes.current = resKey;
    stagger(gridRef.current, "[data-card]", { y: 10, dur: 380, step: 40 });
  }, [busy, resKey]);

  const loadMore = () => {
    setMoreLoading(true);
    clearTimeout(moreT.current);
    moreT.current = setTimeout(() => {
      setMoreLoading(false);
      setShown((s) => s + PAGE);
    }, 520);
  };

  /* Header */
  const catIdx = categories.findIndex((c) => c.key === f.cat);
  const cat = catIdx > -1 ? categories[catIdx] : null;
  const cnt = (k: ShopCat) => products.filter((p) => k === "all" || p.cat === k).length;
  const headerArt = HEADER_ART[f.cat].map((id) => byId.get(id)).filter((p): p is Product => !!p);

  /* Category tabs + sub-chips (313–318) */
  const tabs: { k: ShopCat; t: string }[] = [
    { k: "all", t: t("all") },
    ...categories.map((c) => ({ k: c.key, t: hi ? c.hi : c.name })),
  ];
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const to = rovingTarget(
      e.key,
      tabRefs.current.findIndex((el) => el === document.activeElement),
      tabs.length,
    );
    if (to < 0) return;
    e.preventDefault();
    tabRefs.current[to]?.focus();
  };
  const intentName = (k: string) => {
    const i = intents.find((x) => x.key === k);
    return i ? (hi ? i.hi : i.en) : k;
  };

  /* Active filter chips (333–341) */
  const chips: { t: string; remove: () => void }[] = [];
  if (f.sub)
    chips.push({ t: f.sub === "malas" ? t("malas") : t("mukhiN", { n: f.sub }), remove: () => change({ sub: null }) });
  f.intents.forEach((k) => chips.push({ t: intentName(k), remove: () => toggleIn("intents", k) }));
  f.mukhi.forEach((m) => chips.push({ t: t("mukhiN", { n: m }), remove: () => toggleIn("mukhi", m) }));
  f.stones.forEach((k) =>
    chips.push({
      t: products.find((p) => p.stone === k)?.stoneName ?? k,
      remove: () => toggleIn("stones", k),
    }),
  );
  if (f.price[0] > 0 || f.price[1] < PRICE_MAX)
    chips.push({
      t: `${fmt(f.price[0])}–${f.price[1] >= PRICE_MAX ? "₹12,000+" : fmt(f.price[1])}`,
      remove: () => change({ price: [0, PRICE_MAX] }),
    });
  if (f.stock) chips.push({ t: t("inStock"), remove: () => change({ stock: false }) });
  if (f.rating) chips.push({ t: t("ratingChip", { r: f.rating }), remove: () => change({ rating: 0 }) });
  const hasActive = chips.length > 0;

  const panel = {
    f,
    products,
    categories,
    intents,
    hi,
    closed,
    onToggleGroup: (k: GroupKey) => setClosed((c) => ({ ...c, [k]: !c[k] })),
    allStones,
    onAllStones: () => setAllStones((v) => !v),
    change: (patch: Partial<Filters>) => change(patch),
    toggleIn,
    clearAll,
    hasActive,
    total,
  };

  const pickSort = (k: ProductSort) => change({ sort: k });

  return (
    <>
      <Suspense fallback={null}>
        <UrlWatch onChange={syncFromUrl} />
      </Suspense>

      <ShopHeader cat={cat} idx={catIdx} count={cnt(f.cat)} art={headerArt} hi={hi} onAll={onAll} />

      <div className="mx-auto max-w-[1480px] px-[clamp(16px,3vw,24px)]">
        <div
          role="tablist"
          aria-label={t("tabsLabel")}
          onKeyDown={onTabKey}
          className="mt-2 no-scrollbar flex gap-[26px] overflow-x-auto border-b border-s2"
        >
          {tabs.map((tb, i) => {
            const on = f.cat === tb.k;
            return (
              <button
                key={tb.k}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="shop-results"
                tabIndex={on ? 0 : -1}
                onClick={() => pickCat(tb.k)}
                className={cn(
                  "-mb-px flex-none cursor-pointer border-0 bg-transparent pt-[18px] pb-3.5 font-sans text-[14px] leading-none font-semibold whitespace-nowrap transition-colors duration-150",
                  on ? "text-em9 shadow-[inset_0_-2px_0_#B8923A]" : "text-ink6",
                )}
              >
                {tb.t} <span className="font-medium text-ink6 tabular">{cnt(tb.k)}</span>
              </button>
            );
          })}
        </div>

        {f.cat === "rudraksha" ? (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pt-4 pb-1">
            <Chip on={!f.sub} onClick={() => change({ sub: null })}>
              {t("all")}
            </Chip>
            {MUKHI.map((m) => {
              const on = f.sub === String(m);
              return (
                <Chip key={m} on={on} onClick={() => change({ sub: on ? null : String(m) })}>
                  {t("mukhiN", { n: m })}
                </Chip>
              );
            })}
            <Chip on={f.sub === "malas"} onClick={() => change({ sub: f.sub === "malas" ? null : "malas" })}>
              {t("malas")}
            </Chip>
          </div>
        ) : (
          f.cat !== "havan" &&
          f.cat !== "copper" &&
          f.cat !== "attar" && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto pt-4 pb-1">
              {intents.map((i) => (
                <Chip key={i.key} on={f.intents.includes(i.key)} onClick={() => toggleIn("intents", i.key)}>
                  {hi ? i.hi : i.en}
                </Chip>
              ))}
            </div>
          )
        )}
      </div>

      {/* Mobile Filter · Sort bar (<1024), sticky under the compact header */}
      <div className="sticky top-14 z-30 mt-3 bg-[rgba(251,247,238,.95)] shadow-[inset_0_-1px_0_#EAE0CA] backdrop-blur-[10px] lg:hidden">
        <div className="grid h-[52px] grid-cols-[1fr_1px_1fr] items-center">
          <button
            type="button"
            onClick={() => setSheet("filter")}
            aria-haspopup="dialog"
            className="flex h-full cursor-pointer items-center justify-center gap-2 border-0 bg-transparent font-sans text-[14px] leading-none font-semibold text-em7"
          >
            <span className="block size-[18px]">
              <Icon name="filter" />
            </span>
            {t("filter")}
            {hasActive && (
              <span className="h-5 min-w-5 rounded-pill bg-g5 px-1.5 font-sans text-[11px] leading-5 font-bold text-em9">
                {chips.length}
              </span>
            )}
          </button>
          <span aria-hidden="true" className="h-6 bg-s2" />
          <button
            type="button"
            onClick={() => setSheet("sort")}
            aria-haspopup="dialog"
            className="flex h-full cursor-pointer items-center justify-center gap-2 border-0 bg-transparent font-sans text-[14px] leading-none font-semibold text-em7"
          >
            <span className="block size-[18px]">
              <Icon name="sort" />
            </span>
            {t(`sorts.${f.sort}`)}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1480px] grid-cols-[minmax(0,1fr)] items-start gap-10 px-[clamp(16px,3vw,24px)] pt-[clamp(16px,3vw,28px)] pb-[clamp(56px,7vw,96px)] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          aria-label={t("filters")}
          data-lenis-prevent
          className="sticky top-[100px] hidden max-h-[calc(100vh-116px)] [scrollbar-width:thin] overflow-auto pr-1.5 lg:block"
        >
          <FilterPanel variant="side" {...panel} />
        </aside>

        <div className="min-w-0">
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-4",
              hasActive ? "mb-[22px]" : "mb-3.5 lg:mb-[22px]",
            )}
          >
            <div className="flex min-h-[34px] flex-wrap items-center gap-2">
              <span
                aria-live="polite"
                className="mr-1.5 font-sans text-[14px] leading-none font-medium text-ink6 tabular"
              >
                {busy ? t("finding") : t("offerings", { n: total })}
              </span>
              {chips.map((c) => (
                <button
                  key={c.t}
                  type="button"
                  onClick={c.remove}
                  aria-label={t("removeFilter", { t: c.t })}
                  className="flex h-8 cursor-pointer items-center gap-1.5 rounded-pill border-0 bg-em1 pr-2.5 pl-[13px] font-sans text-[12.5px] leading-none font-semibold text-em7 hover:bg-[#D5E5DB]"
                >
                  {c.t}
                  <span className="block size-[13px]">
                    <Icon name="close" />
                  </span>
                </button>
              ))}
            </div>
            <div className="hidden lg:block">
              <SortMenu sort={f.sort} open={sortOpen && side} setOpen={setSortOpen} onPick={pickSort} />
            </div>
          </div>

          {!busy && total === 0 && <EmptyState onClear={clearAll} />}

          <ShopGrid
            gridRef={gridRef}
            items={results}
            loading={busy}
            moreLoading={moreLoading}
            shown={shown}
            cols={cols}
            mob={!md}
            cat={f.cat}
            bannerArt={byId.get(bannerArtId(f.cat))}
          />

          {!busy && total > 0 && <LoadMore shown={shown} total={total} onMore={loadMore} />}
        </div>
      </div>

      <BuyersNote cat={f.cat} />

      {/* Mobile sheets (<1024). Radix: focus trap, Esc, scroll lock. */}
      <BottomSheet
        open={sheet === "filter" && !side}
        onClose={() => setSheet(null)}
        dur={380}
        className="max-h-[88vh] overflow-auto px-5 pt-1.5 shadow-[0_-20px_50px_-20px_rgba(10,31,26,.5)]"
      >
        <FilterPanel variant="sheet" {...panel} />
      </BottomSheet>
      <SortSheet
        open={sheet === "sort" && !side}
        onClose={() => setSheet(null)}
        sort={f.sort}
        onPick={(k) => change({ sort: k }, true)}
      />
    </>
  );
}

/** Reports client navigations (path or query) so the view can re-read the URL. Isolated in
 *  its own Suspense boundary: `useSearchParams` keeps the rest of the page static. */
function UrlWatch({ onChange }: { onChange: () => void }) {
  const path = usePathname();
  const q = useSearchParams().toString();
  useEffect(() => {
    onChange();
  }, [path, q, onChange]);
  return null;
}
