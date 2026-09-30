"use client";
import { useEffect, useRef } from "react";
import { Dialog } from "radix-ui";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { Logo } from "@/components/ui/Logo";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { enter, stagger } from "@/components/motion/fx";
import { routes } from "@/lib/routes";
import { PHONE_TEL, waLink } from "@/lib/site";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import { useSwitchLocale } from "./useSwitchLocale";

type Key = "shop" | "consult" | "kundali" | "rashifal" | "courses" | "rituals" | "videos" | "about";
/* SiteChrome 500: [key, Devanagari subtitle (EN mode only), href]. */
const LINKS: [Key, string, string][] = [
  ["shop", "शॉप", routes.shop],
  ["consult", "परामर्श", routes.consultations],
  ["kundali", "कुंडली", routes.kundali99],
  ["rashifal", "राशिफल", routes.rashifal],
  ["courses", "साधना", routes.courses],
  ["rituals", "अनुष्ठान", routes.rituals],
  ["videos", "वीडियो", routes.videos],
  ["about", "परिचय", routes.about],
];

/**
 * Full-screen night menu for <1180 (SiteChrome.dc.html 168–197, 498–500): slowly turning
 * mandala, language chips, eight large links staggered in (y18, 520 ms, 55 ms steps), quick
 * links and WhatsApp / Call CTAs. Radix Dialog: focus trap, Esc, scroll lock.
 */
export function MobileMenu() {
  const open = useUi((s) => s.menuOpen);
  return (
    <Dialog.Root open={open} onOpenChange={(o) => useUi.getState().setMenuOpen(o)}>
      <Dialog.Portal>{open && <MenuPanel />}</Dialog.Portal>
    </Dialog.Root>
  );
}

function MenuPanel() {
  const t = useTranslations("chrome");
  const { hi, setLocale } = useSwitchLocale();
  const ref = useRef<HTMLDivElement>(null);
  const close = () => useUi.getState().setMenuOpen(false);

  useEffect(() => {
    enter(ref.current, { y: 0, dur: 260 });
    stagger(ref.current, "[data-mi]", { y: 18, dur: 520, step: 55 });
  }, []);

  const chip = (on: boolean) =>
    cn("h-[34px] cursor-pointer rounded-pill border-0 px-3.5", on ? "bg-g3 text-n9" : "bg-transparent text-iv");
  const cta =
    "flex h-[52px] items-center justify-center gap-[9px] rounded-btn font-sans text-[14px] leading-none font-semibold text-g3 no-underline shadow-ring-g3";

  return (
    <Dialog.Content
      ref={ref}
      aria-describedby={undefined}
      className="fixed inset-0 z-60 flex flex-col overflow-auto bg-n9 text-iv outline-none"
    >
      <Dialog.Title className="sr-only">{t("menu")}</Dialog.Title>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[200px] -bottom-[190px] size-[560px] opacity-[.16]"
      >
        <span data-amb="spin:180" className="block size-full">
          <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
            <MandalaG R={296} col="#D9B96A" sw={1} />
          </svg>
        </span>
      </div>

      <div className="relative flex items-center justify-between py-2 pr-2 pl-4">
        <span className="flex items-center gap-2.5">
          <span className="block size-9">
            <Logo uid="menu" />
          </span>
          <span className="font-display text-[17px] leading-none font-medium">{t("brand")}</span>
        </span>
        <Dialog.Close
          aria-label={t("closeMenu")}
          className="grid size-11 cursor-pointer place-items-center border-0 bg-transparent text-iv"
        >
          <span className="block size-6">
            <Icon name="close" />
          </span>
        </Dialog.Close>
      </div>

      <div role="group" aria-label={t("language")} className="relative flex gap-4 px-5 pt-1.5">
        <button
          type="button"
          lang="en"
          aria-pressed={!hi}
          onClick={() => setLocale("en")}
          className={cn(chip(!hi), "font-sans text-[13px] leading-none font-semibold")}
        >
          English
        </button>
        <button
          type="button"
          lang="hi"
          aria-pressed={hi}
          onClick={() => setLocale("hi")}
          className={cn(chip(hi), "font-hi text-[15px] leading-none font-medium")}
        >
          हिंदी
        </button>
      </div>

      <nav aria-label={t("menu")} className="relative flex flex-col px-5 pt-[22px] pb-2.5">
        {LINKS.map(([k, sub, href]) => (
          <Link
            key={k}
            data-mi="1"
            href={href}
            onClick={close}
            className="flex items-baseline justify-between gap-3 border-b border-[rgba(217,185,106,.16)] py-[11px] text-iv no-underline"
          >
            <span className="font-title text-[30px] leading-[1.15] font-normal font-soft">{t(`nav.${k}`)}</span>
            {!hi && (
              <span lang="hi" className="font-deva text-[14px] leading-none text-g3">
                {sub}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="relative flex flex-wrap gap-[18px] px-5 pt-2 pb-5 font-sans text-[14px] leading-none font-medium">
        <Link href={routes.wishlist} onClick={close} className="text-em1 no-underline">
          {t("nav.wishlist")}
        </Link>
        <Link href={routes.account} onClick={close} className="text-em1 no-underline">
          {t("nav.account")}
        </Link>
        <Link href={routes.trackOrder} onClick={close} className="text-em1 no-underline">
          {t("nav.track")}
        </Link>
      </div>

      <div className="relative mt-auto grid grid-cols-2 gap-2.5 px-5 pt-4 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <a href={waLink()} target="_blank" rel="noopener" className={cta}>
          <span className="block size-[18px]">
            <Icon name="whatsapp" />
          </span>
          {t("nav.wa")}
        </a>
        <a href={PHONE_TEL} className={cta}>
          <span className="block size-[18px]">
            <Icon name="phone" />
          </span>
          {t("nav.call")}
        </a>
      </div>
    </Dialog.Content>
  );
}
