"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/domain/enums";
import { Icon, type IconName } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

type NavTab = {
  href: string;
  labelEn: string;
  labelHi: string;
  icon: IconName;
  exact?: boolean;
};

const TABS: NavTab[] = [
  {
    href: "/account",
    labelEn: "Overview",
    labelHi: "डैशबोर्ड",
    icon: "home",
    exact: true,
  },
  {
    href: "/account/orders",
    labelEn: "My Orders",
    labelHi: "मेरे ऑर्डर",
    icon: "bag",
  },
  {
    href: "/account/bookings",
    labelEn: "Consultations",
    labelHi: "मेरे परामर्श",
    icon: "calendar",
  },
  {
    href: "/account/kundali",
    labelEn: "My Kundali",
    labelHi: "मेरी जन्मपत्री",
    icon: "kundali",
  },
  {
    href: "/account/addresses",
    labelEn: "Addresses",
    labelHi: "सहेजे गए पते",
    icon: "pin",
  },
  {
    href: "/account/profile",
    labelEn: "Profile & Birth",
    labelHi: "प्रोफ़ाइल एवं जन्म",
    icon: "user",
  },
];

export function AccountNav({ locale = "en" }: { locale?: Locale }): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account navigation"
      className="sticky top-[64px] z-30 mb-8 border-b border-s2 bg-cream/95 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar sm:gap-2">
          {TABS.map((tab) => {
            // Strip locale prefix if present for matching
            const cleanPath = pathname.replace(/^\/(en|hi)/, "") || "/";
            const isActive = tab.exact
              ? cleanPath === tab.href
              : cleanPath === tab.href || cleanPath.startsWith(`${tab.href}/`);

            const label = locale === "hi" ? tab.labelHi : tab.labelEn;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-btn px-3.5 py-2 font-sans text-xs font-semibold transition-all duration-150 sm:text-sm",
                  isActive
                    ? "bg-em7 text-iv shadow-sm"
                    : "text-ink6 hover:bg-s2 hover:text-ink",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon name={tab.icon} className="size-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
