"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "radix-ui";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { ProductImage } from "@/components/commerce/ProductImage";
import { enter } from "@/components/motion/fx";
import { search } from "@/lib/core/search";
import { fmt } from "@/lib/core/format";
import { loc } from "@/lib/domain/loc";
import { productHref, routes, searchHref, serviceHref } from "@/lib/routes";
import { useHistory } from "@/stores/history";
import { useCatalog } from "@/stores/catalog";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";

type Tab = "products" | "services" | "articles";

/**
 * Full-screen store search (SiteChrome.dc.html 199–242, 455–458, 501–508, saveQ 562).
 * Empty query: trending chips + recent searches. With a query: Products / Consultations /
 * Articles tabs (products capped at 6), "See all" → /search?q=. Enter also goes there.
 * Opens −10px 300 ms; the input takes focus. Radix Dialog: focus trap, Esc, scroll lock.
 */
export function SearchOverlay() {
  const open = useUi((s) => s.searchOpen);
  return (
    <Dialog.Root open={open} onOpenChange={(o) => useUi.getState().setSearchOpen(o)}>
      <Dialog.Portal>{open && <SearchPanel />}</Dialog.Portal>
    </Dialog.Root>
  );
}

function SearchPanel() {
  const t = useTranslations("search");
  const locale = useLocale();
  const hi = locale === "hi";
  const router = useRouter();
  const initialQ = useUi((s) => s.searchQ);
  const [q, setQ] = useState(initialQ);
  const [tab, setTab] = useState<Tab>("products");
  const recent = useHistory((s) => s.searches);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const snap = useCatalog((s) => s.snap);

  useEffect(() => {
    enter(panelRef.current, { y: -10, dur: 300 });
  }, []);

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
  const close = () => useUi.getState().setSearchOpen(false);
  const saveQ = () => useHistory.getState().saveSearch(query);
  const pick = () => {
    saveQ();
    close();
  };

  const rows =
    tab === "products"
      ? results.products.slice(0, 6).map((p) => ({
          key: p.id,
          href: productHref(p),
          img: <ProductImage p={{ ...p, date: 0, pop: 0 }} slot="main" sizes="56px" alt="" />,
          kicker: p.catName,
          title: hi ? p.hi : p.name,
          right: p.buyUrl ? "Flipkart" : fmt(p.price),
        }))
      : tab === "services"
        ? results.services.map((s) => ({
            key: s.key,
            href: serviceHref(s.key),
            img: (
              <span className="m-auto block size-[26px]">
                <Icon name={s.icon as IconName} />
              </span>
            ),
            kicker: t("serviceKicker", { dur: s.dur }),
            title: loc(s.rawName, locale),
            right: t("from", { price: fmt(s.price) }),
          }))
        : results.articles.map((a, i) => ({
            key: "a" + i,
            href: routes.blog,
            img: (
              <span className="m-auto block size-[26px]">
                <Icon name="scroll" />
              </span>
            ),
            kicker: t("articleKicker", { c: a.c, m: a.m }),
            title: a.t,
            right: "",
          }));

  const tabs: [Tab, string, number][] = [
    ["products", t("products"), results.products.length],
    ["services", t("services"), results.services.length],
    ["articles", t("articles"), results.articles.length],
  ];

  const label =
    "font-sans text-[11px] leading-none font-semibold tracking-[.16em] text-ink6 uppercase hi:tracking-normal";

  const trending = snap?.trending ?? [];

  return (
    <Dialog.Content
      ref={panelRef}
      aria-describedby={undefined}
      onOpenAutoFocus={(e) => {
        // Design focuses the field 60 ms after opening.
        e.preventDefault();
        setTimeout(() => inputRef.current?.focus(), 60);
      }}
      className="fixed inset-0 z-60 overflow-auto bg-iv outline-none"
    >
      <Dialog.Title className="sr-only">{t("dialog")}</Dialog.Title>
      <div className="mx-auto max-w-[1080px] px-[clamp(16px,4vw,32px)] pt-[clamp(18px,4vw,48px)] pb-12">
        <div className="flex items-center justify-between gap-3">
          <span className="font-sans text-[11px] leading-none font-semibold tracking-[.16em] text-g7 uppercase">
            {t("kicker")}
          </span>
          <Dialog.Close
            aria-label={t("close")}
            className="grid size-11 cursor-pointer place-items-center rounded-btn border-0 bg-transparent text-em7 hover:bg-s1"
          >
            <span className="block size-6">
              <Icon name="close" />
            </span>
          </Dialog.Close>
        </div>

        <label className="mt-2.5 flex items-center gap-3.5 border-b border-g5 pb-2.5">
          <span className="block size-7 flex-none text-g5">
            <Icon name="search" />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query) {
                saveQ();
                close();
                router.push(searchHref(query));
              }
            }}
            aria-label={t("label")}
            placeholder={t("placeholder")}
            enterKeyHint="search"
            autoComplete="off"
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent py-1.5 font-title text-[clamp(26px,5vw,46px)] leading-[1.15] font-normal text-em9 outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </label>

        {!query ? (
          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-8">
            <div className="flex flex-col gap-3.5">
              <span className={label}>{t("trending")}</span>
              <div className="flex flex-wrap gap-2">
                {trending.map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => setQ(x)}
                    className="h-9 cursor-pointer rounded-pill border-0 bg-cream px-3.5 font-sans text-[14px] leading-none font-medium text-em7 shadow-ring-sand hover:bg-em1 hover:shadow-[inset_0_0_0_1px_#1C6B54]"
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className={label}>{t("recent")}</span>
              {recent.slice(0, 4).map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setQ(x)}
                  className="flex cursor-pointer items-center gap-2.5 border-0 bg-transparent px-0 py-1 text-left font-sans text-[15px] leading-[1.3] font-medium text-ink"
                >
                  <span className="block size-4 text-ink6">
                    <Icon name="clock" />
                  </span>
                  {x}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div role="tablist" className="mt-[22px] flex gap-[22px] border-b border-s2">
              {tabs.map(([k, name, n]) => {
                const on = tab === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setTab(k)}
                    className={cn(
                      "-mb-px cursor-pointer border-0 bg-transparent px-0 py-3 font-sans text-[14px] leading-none font-semibold",
                      on ? "text-em9 shadow-[inset_0_-2px_0_#B8923A]" : "text-ink6",
                    )}
                  >
                    {name} <span className="font-medium text-ink6">{n}</span>
                  </button>
                );
              })}
            </div>
            <div role="tabpanel" className="mt-2 flex flex-col">
              {rows.map((r) => (
                <Link
                  key={r.key}
                  href={r.href}
                  onClick={pick}
                  className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 border-b border-s2 py-3 no-underline"
                >
                  <span className="relative grid h-[70px] w-14 place-items-center overflow-hidden rounded-3 bg-s1 text-g5">
                    {r.img}
                  </span>
                  <span className="flex min-w-0 flex-col gap-[5px]">
                    <span className="font-sans text-[10.5px] leading-none font-semibold tracking-[.14em] text-g7 uppercase hi:tracking-normal">
                      {r.kicker}
                    </span>
                    <span className="font-title text-[18px] leading-[1.25] font-normal text-em9">{r.title}</span>
                  </span>
                  <span className="font-sans text-[15px] leading-none font-bold whitespace-nowrap text-ink tabular">
                    {r.right}
                  </span>
                </Link>
              ))}
              {rows.length === 0 && (
                <p className="mt-6 mb-0 font-sans text-[16px] leading-[1.6] font-normal text-ink6">
                  {t("none", { q: query })}
                </p>
              )}
              <Link
                href={searchHref(query)}
                onClick={pick}
                className="mt-5 flex items-center gap-2 self-start font-sans text-[14px] leading-none font-semibold text-em7 no-underline"
              >
                {t("seeAll", { q: query })}
                <span className="block size-4">
                  <Icon name="arrowR" />
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </Dialog.Content>
  );
}
