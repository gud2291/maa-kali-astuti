"use client";
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Icon } from "@/components/icons/Icon";
import { EASE } from "@/components/motion/easing";
import { useIsMobile } from "@/lib/hooks/useMedia";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { intentHref } from "@/lib/routes";
import { rovingTarget } from "@/lib/utils/roving";
import { cn } from "@/lib/utils/cn";
import type { Intent } from "@/types/catalog";
import type { IntentKey, Product } from "@/types/product";
import { STONES_DESK, STONES_MOB, type IntentStone } from "./home-data";

/* §9 client island (Home.dc.html 622–645, vIntent 1233–1247, S9).
   - Stones: 10 on desktop / 5 on mobile, each floating (`float` amb). On ≥768 the mouse pulls
     each one by depth × 36 px (900 ms CSS transition). No pull under reduced motion.
   - Pills pick the intention (wealth by default); the line and the four cards swap, the cards
     rising in (y 14, 520 ms, 70 ms apart). ←/→ move between pills.
   - Mobile product row: the prototype's rail sets width:100% plus −16px side margins inside a
     centred flex column, which cancels out — so the rail spans the content width with 16px
     inner padding. That rendered result is what we match. */

function Stone({ g }: { g: IntentStone }) {
  return (
    <span
      data-depth={g.d}
      className="absolute block aspect-square transition-transform duration-[900ms] ease-mka"
      style={{ left: g.l, top: g.t, width: g.w, opacity: g.op }}
    >
      <span data-amb={g.amb} className="block size-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/svg/gems/${g.k}.svg`} alt="" width={100} height={100} loading="lazy" className="block size-full" />
      </span>
    </span>
  );
}

type Props = { intents: Intent[]; lists: Record<IntentKey, Product[]>; children: ReactNode };

export function IntentPicker({ intents, lists, children }: Props) {
  const t = useTranslations("home.intent");
  const mobile = useIsMobile();
  const [key, setKey] = useState<IntentKey>("wealth");
  const deskRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const first = useRef(true);

  const I = intents.find((x) => x.key === key) ?? intents[0];

  // New intention: the cards rise in before the browser paints them.
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (isReduced()) return;
    gridRef.current?.querySelectorAll("[data-card]").forEach((c, i) => {
      c.getAnimations().forEach((a) => a.cancel());
      c.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 520, delay: i * 70, easing: EASE, fill: "backwards" },
      );
    });
  }, [key]);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (mobile || isReduced() || !deskRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    deskRef.current.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
      const d = +(el.getAttribute("data-depth") || 0);
      el.style.transform = `translate3d(${(mx * d * 36).toFixed(1)}px,${(my * d * 36).toFixed(1)}px,0)`;
    });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const to = rovingTarget(
      e.key,
      intents.findIndex((x) => x.key === key),
      intents.length,
    );
    if (to < 0) return;
    e.preventDefault();
    tabRefs.current[to]?.focus();
    setKey(intents[to].key);
  };

  return (
    <section
      lang="en"
      data-screen-label="08 Shop by intention"
      onMouseMove={onMove}
      className="relative overflow-hidden bg-s1 shadow-[inset_0_1px_0_rgba(184,146,58,.35),inset_0_-1px_0_rgba(184,146,58,.35)]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div ref={deskRef} className="absolute inset-0 max-md:hidden">
          {STONES_DESK.map((g, i) => (
            <Stone key={`d${i}`} g={g} />
          ))}
        </div>
        <div className="absolute inset-0 md:hidden">
          {STONES_MOB.map((g, i) => (
            <Stone key={`m${i}`} g={g} />
          ))}
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1320px] flex-col items-center px-4 pt-[132px] pb-16 text-center md:px-8 md:pt-[clamp(96px,11vw,160px)] md:pb-[clamp(64px,8vw,120px)]">
        {children}

        <div
          role="tablist"
          aria-label={t("tablist")}
          onKeyDown={onKey}
          className="mt-[30px] flex max-w-[880px] flex-wrap justify-center gap-2.5"
        >
          {intents.map((x, i) => {
            const on = x.key === key;
            return (
              <button
                key={x.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="hm-intent-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setKey(x.key)}
                className={cn(
                  "inline-flex h-[46px] cursor-pointer items-center gap-[9px] rounded-pill border-0 pr-[18px] pl-3.5 font-sans text-[14px] leading-none font-semibold transition-[background-color,color,box-shadow] duration-[250ms]",
                  on
                    ? "bg-em9 text-iv shadow-[inset_0_0_0_1px_#0E3B30]"
                    : "bg-iv text-em7 shadow-[inset_0_0_0_1px_#EAE0CA]",
                )}
              >
                <span className={cn("block size-[18px]", on ? "text-g3" : "text-g5")}>
                  <Icon name={x.icon} />
                </span>
                {x.en}
                <span
                  lang="hi"
                  className={cn("font-hi text-[14px] leading-none font-medium", on ? "text-g3" : "text-g7")}
                >
                  {x.hi}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-[22px] mb-0 min-h-[3.3em] max-w-[560px] font-sans text-[16.5px] leading-[1.65] text-balance text-ink">
          {t(`lines.${key}`)}
        </p>

        <div
          id="hm-intent-panel"
          ref={gridRef}
          role="tabpanel"
          aria-label={I.en}
          className="mt-[clamp(28px,4vw,48px)] no-scrollbar flex w-full snap-x snap-mandatory gap-[clamp(12px,1.6vw,24px)] overflow-x-auto px-4 pb-2 text-left md:mt-[clamp(32px,4vw,52px)] md:grid md:snap-none md:grid-cols-2 md:overflow-visible md:p-0 lg:grid-cols-4"
        >
          {lists[key].map((p) => (
            <div key={p.id} data-card="" className="min-w-0 flex-[0_0_64%] snap-start md:flex-none">
              <ProductCard product={p} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 64vw" />
            </div>
          ))}
        </div>

        <Link
          href={intentHref(key)}
          className="mt-[clamp(28px,3vw,44px)] inline-flex h-[50px] items-center gap-2.5 rounded-btn bg-iv px-6 font-sans text-[14.5px] leading-none font-semibold text-em7 no-underline shadow-[inset_0_0_0_1px_#164E3F] hover:bg-em1"
        >
          {t("all", { name: I.en.toLowerCase() })}
          <Icon name="arrowR" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
