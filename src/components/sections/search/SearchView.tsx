"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { ProductCard } from "@/components/commerce/ProductCard";
import { search } from "@/lib/core/search";
import { fmt } from "@/lib/core/format";
import { loc } from "@/lib/domain/loc";
import { serviceHref, routes } from "@/lib/routes";
import { useHistory } from "@/stores/history";
import { useCatalog } from "@/stores/catalog";
import { cn } from "@/lib/utils/cn";

type Tab = "products" | "services" | "articles";

export function SearchView(): React.JSX.Element {
  const t = useTranslations("searchPage");
  const locale = useLocale();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("products");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const snap = useCatalog((s) => s.snap);
  const status = useCatalog((s) => s.status);
  const load = useCatalog((s) => s.load);
  const recent = useHistory((s) => s.searches);

  useEffect(() => {
    setMounted(true);
    if (status === "idle") {
      load();
    }
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get("q") || "";
      if (queryParam) {
        setQ(queryParam);
        useHistory.getState().saveSearch(queryParam.trim());
      }
    }
  }, [status, load]);

  const updateUrl = (newVal: string) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (newVal.trim()) {
        url.searchParams.set("q", newVal.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
    }
  };

  const handleInputChange = (val: string) => {
    setQ(val);
    updateUrl(val);
  };

  const handleSelectSearch = (val: string) => {
    setQ(val);
    updateUrl(val);
    useHistory.getState().saveSearch(val.trim());
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQ("");
    updateUrl("");
    inputRef.current?.focus();
  };

  const searchData = useMemo(() => {
    const products = (snap?.products ?? []).map((p) => ({
      ...p,
      pop: (p.reviews ?? 0) * (p.rating ?? 0),
    }));
    const services = (snap?.services ?? []).map((s) => ({
      key: s.key,
      name: s.name.en,
      hi: s.name.hi,
      line: s.line.en + " " + s.line.hi,
      icon: s.icon,
      price: s.price,
      dur: s.dur,
      rawName: s.name,
    }));
    const articles = (snap?.articles ?? []).map((a) => ({
      t: loc(a.title, locale),
      c: a.category,
      m: a.mins,
      slug: a.slug,
    }));
    return { products, services, articles };
  }, [snap, locale]);

  const query = q.trim();
  const results = useMemo(() => search(query, searchData), [query, searchData]);

  const tabs: [Tab, string, number][] = [
    ["products", t("tabs.products"), results.products.length],
    ["services", t("tabs.services"), results.services.length],
    ["articles", t("tabs.articles"), results.articles.length],
  ];

  const trending = snap?.trending ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* Big Search Input */}
      <div className="relative">
        <label htmlFor="search-input" className="sr-only">
          {t("title")}
        </label>
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-4 text-g5 sm:left-5">
            <Icon name="search" className="size-6 sm:size-7" />
          </span>
          <input
            id="search-input"
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query) {
                useHistory.getState().saveSearch(query);
              }
            }}
            placeholder={t("placeholder")}
            autoComplete="off"
            enterKeyHint="search"
            className="h-16 w-full rounded-btn border border-g5/40 bg-cream pl-14 pr-12 font-title text-xl font-normal text-em9 outline-none shadow-sm transition-all focus:border-em7 focus:ring-1 focus:ring-em7 sm:pl-16 sm:text-2xl [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={t("clearSearch")}
              className="absolute right-4 grid size-8 cursor-pointer place-items-center rounded-full text-ink6 hover:bg-s2 hover:text-em9"
            >
              <Icon name="close" className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* When no query is typed: trending + recent chips */}
      {!query ? (
        <div className="flex flex-col gap-8 rounded-btn border border-s2 bg-cream p-6 sm:p-8">
          {trending.length > 0 && (
            <div>
              <span className="font-sans text-[11px] font-semibold tracking-widest text-g7 uppercase">
                {t("trending")}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {trending.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectSearch(item)}
                    className="h-9 cursor-pointer rounded-pill border border-s2 bg-iv px-4 font-sans text-xs font-medium text-em7 shadow-ring-sand transition-colors hover:border-em7 hover:bg-em1"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mounted && recent.length > 0 && (
            <div>
              <span className="font-sans text-[11px] font-semibold tracking-widest text-g7 uppercase">
                {t("recent")}
              </span>
              <div className="mt-3 flex flex-wrap gap-2">
                {recent.slice(0, 8).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectSearch(item)}
                    className="flex h-9 cursor-pointer items-center gap-2 rounded-pill border border-s2 bg-iv px-4 font-sans text-xs font-medium text-ink transition-colors hover:border-em7 hover:bg-em1"
                  >
                    <Icon name="clock" className="size-3.5 text-ink6" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results Section */
        <div className="flex flex-col gap-6">
          {/* Tabs */}
          <div role="tablist" className="flex border-b border-s2">
            {tabs.map(([k, name, count]) => {
              const isActive = tab === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setTab(k)}
                  className={cn(
                    "-mb-px flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3.5 font-sans text-sm font-semibold transition-colors sm:px-6",
                    isActive
                      ? "border-em7 text-em9 font-bold"
                      : "border-transparent text-ink6 hover:text-em7",
                  )}
                >
                  <span>{name}</span>
                  <span
                    className={cn(
                      "rounded-pill px-2 py-0.5 text-xs font-bold",
                      isActive ? "bg-em1 text-em7" : "bg-s2 text-ink6",
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tab Content: Products */}
          {tab === "products" && (
            <div>
              {results.products.length === 0 ? (
                <div className="my-12 text-center">
                  <p className="font-title text-xl text-em9 sm:text-2xl">
                    {t("noResults", { q: query })}
                  </p>
                  <p className="mt-2 text-xs text-ink6 sm:text-sm">
                    {t("tryDifferent")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {results.products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Consultations */}
          {tab === "services" && (
            <div>
              {results.services.length === 0 ? (
                <div className="my-12 text-center">
                  <p className="font-title text-xl text-em9 sm:text-2xl">
                    {t("noResults", { q: query })}
                  </p>
                  <p className="mt-2 text-xs text-ink6 sm:text-sm">
                    {t("tryDifferent")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                  {results.services.map((s) => (
                    <article
                      key={s.key}
                      className="flex flex-col justify-between rounded-btn border border-s2 bg-cream p-5 shadow-sm transition-all hover:border-g5/60 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="flex size-11 items-center justify-center rounded-btn bg-iv text-g5 shadow-ring-sand">
                            <Icon name={s.icon as IconName} className="size-6" />
                          </span>
                          <span className="rounded-pill bg-em1 px-2.5 py-0.5 font-sans text-[11px] font-semibold text-em7">
                            {s.dur}
                          </span>
                        </div>
                        <h3 className="font-title text-lg font-bold text-em9">
                          {loc(s.rawName, locale)}
                        </h3>
                        <p className="line-clamp-2 text-xs text-ink6">
                          {s.line}
                        </p>
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-s2 pt-4">
                        <span className="font-sans text-sm font-bold text-em9">
                          {t("from", { price: fmt(s.price) })}
                        </span>
                        <Link
                          href={serviceHref(s.key)}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-btn bg-em7 px-3.5 font-sans text-xs font-semibold text-iv transition-colors hover:bg-em5"
                        >
                          <span>{t("bookConsultation")}</span>
                          <Icon name="arrowR" className="size-3" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Articles */}
          {tab === "articles" && (
            <div>
              {results.articles.length === 0 ? (
                <div className="my-12 text-center">
                  <p className="font-title text-xl text-em9 sm:text-2xl">
                    {t("noResults", { q: query })}
                  </p>
                  <p className="mt-2 text-xs text-ink6 sm:text-sm">
                    {t("tryDifferent")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-s2 rounded-btn border border-s2 bg-cream shadow-sm">
                  {results.articles.map((a, i) => (
                    <article
                      key={a.slug || "art-" + i}
                      className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="mt-0.5 flex size-9 flex-none items-center justify-center rounded-btn bg-iv text-g5 shadow-ring-sand">
                          <Icon name="scroll" className="size-5" />
                        </span>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-[10.5px] font-semibold tracking-wider text-g7 uppercase">
                              {a.c}
                            </span>
                            <span className="size-1 rounded-full bg-g5" />
                            <span className="font-sans text-[11px] text-ink6">
                              {t("minsRead", { mins: a.m })}
                            </span>
                          </div>
                          <Link
                            href={routes.blog}
                            className="font-title text-base font-semibold text-em9 hover:text-em7"
                          >
                            {a.t}
                          </Link>
                        </div>
                      </div>
                      <Link
                        href={routes.blog}
                        className="inline-flex self-start sm:self-auto h-8 items-center gap-1.5 rounded-btn border border-s2 bg-iv px-3 font-sans text-xs font-semibold text-em7 transition-colors hover:bg-s1"
                      >
                        <span>{t("readArticle")}</span>
                        <Icon name="arrowR" className="size-3" />
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
