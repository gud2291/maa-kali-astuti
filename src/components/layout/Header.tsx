"use client";
import type { MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { Logo } from "@/components/ui/Logo";
import { useCartCount } from "@/stores/cart";
import { useWishCount } from "@/stores/wishlist";
import { useUi } from "@/stores/ui";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import type { ChromeActive, ChromeConfig } from "./chrome-config";
import { scrollToTop } from "./scroll";

export type MegaKind = "shop" | "consult" | null;

/* Header surface (SiteChrome 471–472): solid ivory at rest; frosted with a gold hairline once stuck. */
const surface = (stuck: boolean) =>
  stuck
    ? "bg-[rgba(251,247,238,.86)] backdrop-blur-[14px] shadow-[inset_0_-1px_0_rgba(184,146,58,.45)]"
    : "bg-iv shadow-hair-bottom";

/** Logo / Home tab on Home scrolls to the top instead of reloading (SiteChrome 474). */
export function useGoHome(active: ChromeActive) {
  return (e: MouseEvent) => {
    if (active !== "home") return;
    e.preventDefault();
    scrollToTop();
  };
}

function CartBadge({ className }: { className: string }) {
  const n = useCartCount();
  return (
    <span
      data-cart-badge="1"
      className={cn(
        "absolute h-[17px] min-w-[17px] rounded-pill bg-g5 px-1 text-center font-sans text-[10px] leading-[17px] font-bold text-em9 tabular",
        className,
      )}
    >
      {n}
    </span>
  );
}

function useCartAria() {
  const t = useTranslations("chrome");
  return t("cartAria", { count: useCartCount() });
}

/* ------------------------------------------------------------------ full header ≥1180 */

type NavKey = "rashifal" | "courses" | "rituals" | "videos" | "about";
const NAV: { k: NavKey; href: string }[] = [
  { k: "rashifal", href: routes.rashifal },
  { k: "courses", href: routes.courses },
  { k: "rituals", href: routes.rituals },
  { k: "videos", href: routes.videos },
  { k: "about", href: routes.about },
];

/* Gold underline that grows on hover and stays for the active page (SiteChrome 53–60). */
const underline = (on: boolean, current: boolean) =>
  cn(
    "bg-[linear-gradient(#B8923A,#B8923A)] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-300 ease-mka hover:bg-[size:100%_1px]",
    on ? "bg-[size:100%_1px]" : "bg-[size:0_1px]",
    current ? "text-em7" : "text-ink",
  );

type FullProps = {
  active: ChromeActive;
  stuck: boolean;
  mega: MegaKind;
  openMega: (k: Exclude<MegaKind, null>) => void;
  closeMega: () => void;
};

/** 76px header (64px once stuck): logo, primary nav with the two mega triggers, icon row (SiteChrome 42–70). */
export function HeaderFull({ active, stuck, mega, openMega, closeMega }: FullProps) {
  const t = useTranslations("chrome");
  const wishN = useWishCount();
  const cartAria = useCartAria();
  const goHome = useGoHome(active);
  const openSearch = () => {
    closeMega();
    useUi.getState().openSearch();
  };
  const openCart = () => {
    closeMega();
    useUi.getState().openCart();
  };
  const iconBtn =
    "relative grid size-10 cursor-pointer place-items-center rounded-btn border-0 bg-transparent text-em7 transition-colors duration-150 hover:bg-s1";

  return (
    <header
      className={cn(
        "hidden transition-[height,background-color,box-shadow] duration-300 ease-mka nav:block",
        stuck ? "h-16" : "h-[76px]",
        surface(stuck),
      )}
    >
      <div className="mx-auto flex h-full max-w-[1320px] items-center gap-6 px-6">
        <Link
          href={routes.home}
          onClick={goHome}
          aria-label={t("homeAria")}
          className="flex flex-none items-center gap-3 no-underline"
        >
          <span
            className={cn(
              "block transition-[width,height] duration-300 ease-[ease]",
              stuck ? "size-[42px]" : "size-[50px]",
            )}
          >
            <Logo uid="hdr" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-display text-[21px] leading-none font-medium tracking-[-.01em] whitespace-nowrap text-em9 font-soft">
              {t("brand")}
            </span>
            <span className="font-sans text-[9.5px] leading-none font-semibold tracking-[.2em] whitespace-nowrap text-g7 uppercase">
              {t("byline")}
            </span>
          </span>
        </Link>

        <nav
          aria-label={t("primary")}
          className="mx-auto flex items-center gap-5 font-sans text-[14px] leading-none font-medium"
        >
          <Link
            href={routes.shop}
            onMouseEnter={() => openMega("shop")}
            onFocus={() => openMega("shop")}
            aria-expanded={mega === "shop"}
            aria-haspopup="true"
            className={cn(
              "flex items-center gap-1 py-2 no-underline",
              underline(active === "shop" || mega === "shop", active === "shop"),
            )}
          >
            {t("nav.shop")}
            <span
              className={cn(
                "block size-3.5 transition-transform duration-[250ms] ease-[ease]",
                mega === "shop" && "rotate-180",
              )}
            >
              <Icon name="chevD" />
            </span>
          </Link>
          <Link
            href={routes.consultations}
            onMouseEnter={() => openMega("consult")}
            onFocus={() => openMega("consult")}
            aria-expanded={mega === "consult"}
            aria-haspopup="true"
            className={cn(
              "flex items-center gap-1 py-2 no-underline",
              underline(active === "consult" || mega === "consult", active === "consult"),
            )}
          >
            {t("nav.consult")}
            <span
              className={cn(
                "block size-3.5 transition-transform duration-[250ms] ease-[ease]",
                mega === "consult" && "rotate-180",
              )}
            >
              <Icon name="chevD" />
            </span>
          </Link>
          <Link
            href={routes.kundali99}
            onMouseEnter={closeMega}
            onFocus={closeMega}
            aria-current={active === "kundali" ? "page" : undefined}
            className={cn(
              "flex h-[30px] items-center gap-1.5 rounded-pill px-3 font-semibold text-g7 no-underline shadow-[inset_0_0_0_1px_rgba(184,146,58,.6)] transition-colors duration-150 hover:bg-s2",
              active === "kundali" ? "bg-s2" : "bg-s1",
            )}
          >
            <span className="block size-3.5">
              <Icon name="kundali" />
            </span>
            {t("nav.kundali")}
          </Link>
          {NAV.map(({ k, href }) => (
            <Link
              key={k}
              href={href}
              onMouseEnter={closeMega}
              onFocus={closeMega}
              aria-current={active === k ? "page" : undefined}
              className={cn("py-2 whitespace-nowrap no-underline", underline(active === k, active === k))}
            >
              {t(`nav.${k}`)}
            </Link>
          ))}
        </nav>

        <div className="flex flex-none items-center gap-1" onMouseEnter={closeMega}>
          <button type="button" onClick={openSearch} aria-label={t("search")} className={iconBtn}>
            <span className="block size-[21px]">
              <Icon name="search" />
            </span>
          </button>
          <Link href={routes.wishlist} aria-label={t("wishlistAria")} onFocus={closeMega} className={iconBtn}>
            <span className="block size-[21px]">
              <Icon name="heart" />
            </span>
            {wishN > 0 && (
              <span className="absolute top-1 right-[3px] h-4 min-w-4 rounded-pill bg-em1 px-1 text-center font-sans text-[9.5px] leading-4 font-bold text-em7">
                {wishN}
              </span>
            )}
          </Link>
          <Link href={routes.account} aria-label={t("accountAria")} className={iconBtn}>
            <span className="block size-[21px]">
              <Icon name="user" />
            </span>
          </Link>
          <button type="button" onClick={openCart} data-cart-target="1" aria-label={cartAria} className={iconBtn}>
            <span className="block size-[21px]">
              <Icon name="bag" />
            </span>
            <CartBadge className="top-[3px] right-px" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ compact header <1180 */

/** 56px bar: menu · centred logo · search + cart (SiteChrome 72–81). */
export function HeaderCompact({ active, stuck }: { active: ChromeActive; stuck: boolean }) {
  const t = useTranslations("chrome");
  const cartAria = useCartAria();
  const goHome = useGoHome(active);
  const btn = "relative grid size-11 cursor-pointer place-items-center border-0 bg-transparent text-em7";
  return (
    <header
      className={cn(
        "relative flex h-14 items-center justify-between px-1.5 transition-[background-color,box-shadow] duration-300 nav:hidden",
        surface(stuck),
      )}
    >
      <button
        type="button"
        onClick={() => useUi.getState().setMenuOpen(true)}
        aria-label={t("openMenu")}
        aria-haspopup="dialog"
        className={btn}
      >
        <span className="block size-6">
          <Icon name="menu" />
        </span>
      </button>
      <Link
        href={routes.home}
        onClick={goHome}
        aria-label={t("homeAria")}
        className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-[9px] no-underline"
      >
        <span className="block size-[38px]">
          <Logo uid="hdrc" />
        </span>
        <span className="font-display text-[17px] leading-none font-medium whitespace-nowrap text-em9 font-soft">
          {t("brand")}
        </span>
      </Link>
      <div className="flex">
        <button type="button" onClick={() => useUi.getState().openSearch()} aria-label={t("search")} className={btn}>
          <span className="block size-[22px]">
            <Icon name="search" />
          </span>
        </button>
        <button
          type="button"
          onClick={() => useUi.getState().openCart()}
          data-cart-target="1"
          aria-label={cartAria}
          className={btn}
        >
          <span className="block size-[22px]">
            <Icon name="bag" />
          </span>
          <CartBadge className="top-[5px] right-[3px]" />
        </button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ checkout header */

/** 64px secure bar for Booking (and Checkout later): logo, lock label, back link ≥768 (SiteChrome 83–91). */
export function HeaderCheckout({ cfg }: { cfg: ChromeConfig }) {
  const t = useTranslations("chrome");
  const back = cfg.backHref ?? routes.cart;
  return (
    <header className="h-16 bg-iv shadow-hair-bottom">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-5">
        <Link href={back} className="flex items-center gap-2.5 no-underline">
          <span className="block size-10">
            <Logo uid="hdrk" />
          </span>
          <span className="font-display text-[19px] leading-none font-medium whitespace-nowrap text-em9">
            {t("brand")}
          </span>
        </Link>
        <span className="flex items-center gap-2 font-sans text-[12px] leading-none font-semibold tracking-[.14em] text-ink uppercase hi:tracking-normal">
          <span className="block size-4 text-ok">
            <Icon name="lock" />
          </span>
          {t(`secure.${cfg.secureLabel ?? "checkout"}`)}
        </span>
        <Link
          href={back}
          className="hidden items-center gap-1.5 font-sans text-[13px] leading-none font-semibold text-em7 no-underline md:flex"
        >
          <span className="block size-4">
            <Icon name="arrowL" />
          </span>
          {t(`back.${cfg.backLabel ?? "cart"}`)}
        </Link>
      </div>
    </header>
  );
}
