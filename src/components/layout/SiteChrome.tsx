"use client";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { usePathname } from "@/i18n/navigation";
import { useScrollDir } from "@/lib/hooks/useScrollDir";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import { AnnouncementBar } from "./AnnouncementBar";
import { BottomTabBar } from "./BottomTabBar";
import { CartDrawer } from "./CartDrawer";
import { chromeFor } from "./chrome-config";
import { BackToTop, WhatsAppFab } from "./FloatingActions";
import { HeaderCheckout, HeaderCompact, HeaderFull, type MegaKind } from "./Header";
import { MegaConsult, MegaShop } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";

/**
 * Global chrome — port of SiteChrome.dc.html. Mounted once in the locale layout; the per-page
 * props of the design (`active`, `mode`, `tabbar`, `fabLift`) come from the route (chrome-config).
 *
 * Fixed top wrapper: announcement (32px) + header (76/64 ≥1180, 56 below) + mega menus. Once the
 * page scrolls past 28px the wrapper slides up 32px (380 ms) so only the header stays.
 * A spacer keeps the page content below it (108px / 88px / 64px checkout).
 */
export function SiteChrome() {
  const pathname = usePathname();
  const cfg = chromeFor(pathname);
  const checkout = cfg.mode === "checkout";
  const tabbar = cfg.tabbar && !checkout;
  const { stuck, hidden, far } = useScrollDir();

  const [mega, setMega] = useState<MegaKind>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openMega = (k: Exclude<MegaKind, null>) => {
    clearTimeout(timer.current);
    setMega(k);
  };
  const keepMega = () => clearTimeout(timer.current);
  const closeMega = () => {
    clearTimeout(timer.current);
    setMega(null);
  };
  const leave = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMega(null), 160);
  };
  const blur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMega(null);
  };

  // Route change: close the mega menu (render-time reset) and every overlay (store).
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setMega(null);
  }
  useEffect(() => {
    useUi.getState().closeAll();
  }, [pathname]);

  // Toast offset follows the page's chrome (SiteChrome 542).
  useEffect(() => {
    useUi.getState().setChrome({ tabbar, checkout });
  }, [tabbar, checkout]);

  // Esc closes the mega menu (dialogs handle their own Esc).
  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMega(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mega]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const fabBottom = !tabbar ? cfg.fabLift : hidden ? "20px" : "84px";

  return (
    <>
      <div aria-hidden className={checkout ? "h-16" : "h-[88px] nav:h-[108px]"} />

      <div
        onMouseLeave={leave}
        onBlur={blur}
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-transform duration-[380ms] ease-mka",
          stuck && !checkout && "-translate-y-8",
        )}
      >
        {checkout ? (
          <HeaderCheckout cfg={cfg} />
        ) : (
          <>
            <AnnouncementBar paused={stuck} />
            <HeaderFull active={cfg.active} stuck={stuck} mega={mega} openMega={openMega} closeMega={closeMega} />
            <HeaderCompact active={cfg.active} stuck={stuck} />
            {mega === "shop" && <MegaShop close={closeMega} keep={keepMega} />}
            {mega === "consult" && <MegaConsult close={closeMega} keep={keepMega} />}
          </>
        )}
      </div>

      {tabbar && <BottomTabBar active={cfg.active} hidden={hidden} />}
      <WhatsAppFab bottom={fabBottom} />
      {far && <BackToTop />}

      <MobileMenu />
      <SearchOverlay />
      <CartDrawer />
    </>
  );
}
