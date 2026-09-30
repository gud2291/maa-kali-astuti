"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { useCartCount } from "@/stores/cart";
import { useUi } from "@/stores/ui";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import type { ChromeActive } from "./chrome-config";
import { useGoHome } from "./Header";

/**
 * Mobile app bar, <768 only (SiteChrome.dc.html 325–337, 537–538): Home · Shop · raised Consult
 * chakra (spins 24 s) · Cart · Account. Slides away (110 %, 320 ms) while scrolling down past
 * 160px and returns on scroll up.
 */
export function BottomTabBar({ active, hidden }: { active: ChromeActive; hidden: boolean }) {
  const t = useTranslations("chrome");
  const count = useCartCount();
  const goHome = useGoHome(active);
  const tab = (on: boolean) =>
    cn(
      "flex flex-col items-center gap-1 py-2 font-sans text-[10.5px] leading-none font-semibold no-underline",
      on ? "text-em7" : "text-ink6",
    );

  return (
    <nav
      aria-label={t("app")}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 bg-[rgba(251,247,238,.95)] pb-[env(safe-area-inset-bottom)] shadow-[inset_0_1px_0_#EAE0CA] backdrop-blur-[14px] transition-transform duration-[320ms] ease-mka md:hidden",
        hidden && "translate-y-[110%]",
      )}
    >
      <div className="grid h-16 grid-cols-5 items-center">
        <Link
          href={routes.home}
          onClick={goHome}
          aria-current={active === "home" ? "page" : undefined}
          className={tab(active === "home")}
        >
          <span className="block size-[22px]">
            <Icon name="home" />
          </span>
          {t("nav.home")}
        </Link>
        <Link
          href={routes.shop}
          aria-current={active === "shop" ? "page" : undefined}
          className={tab(active === "shop")}
        >
          <span className="block size-[22px]">
            <Icon name="grid" />
          </span>
          {t("nav.shop")}
        </Link>
        <Link
          href={routes.consultations}
          aria-label={t("consultAria")}
          className="-mt-6 flex flex-col items-center gap-1 font-sans text-[10.5px] leading-none font-semibold text-em7 no-underline"
        >
          <span className="grid size-14 place-items-center rounded-pill bg-em7 text-g3 shadow-[0_0_0_3px_#FBF7EE,0_0_0_4px_#B8923A,0_10px_22px_-8px_rgba(14,59,48,.55)]">
            <span data-amb="spin:24" className="block size-7">
              <Icon name="chakra" />
            </span>
          </span>
          {t("nav.consultShort")}
        </Link>
        <button
          type="button"
          onClick={() => useUi.getState().openCart()}
          data-cart-target="1"
          className={cn(tab(active === "cart"), "relative cursor-pointer border-0 bg-transparent")}
        >
          <span className="block size-[22px]">
            <Icon name="bag" />
          </span>
          {t("nav.cart")}
          <span
            data-cart-badge="1"
            className="absolute top-0.5 left-[calc(50%+4px)] h-[17px] min-w-[17px] rounded-pill bg-g5 px-1 text-center font-sans text-[10px] leading-[17px] font-bold text-em9"
          >
            {count}
          </span>
        </button>
        <Link href={routes.account} className={tab(false)}>
          <span className="block size-[22px]">
            <Icon name="user" />
          </span>
          {t("nav.account")}
        </Link>
      </div>
    </nav>
  );
}
