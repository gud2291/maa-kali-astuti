import Link from "next/link";
import type { AccountOverview as AccountOverviewType } from "@/server/account/queries";
import type { Locale } from "@/lib/domain/enums";
import { OrderTimeline } from "@/components/sections/order/OrderTimeline";
import { Icon } from "@/components/icons/Icon";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";

export function AccountOverview({
  overview,
  locale = "en",
}: {
  overview: AccountOverviewType;
  locale?: Locale;
}): React.JSX.Element {
  const { profile, counts, latestOrder } = overview;
  const userName = profile?.name?.trim() || (locale === "hi" ? "साधक" : "Devotee");

  const tiles = [
    {
      title: locale === "hi" ? "मेरे ऑर्डर" : "My Orders",
      count: counts.orders,
      href: "/account/orders",
      icon: "bag" as const,
      desc:
        locale === "hi"
          ? `${counts.orders} ऑर्डर दिए गए हैं`
          : `${counts.orders} placed orders`,
    },
    {
      title: locale === "hi" ? "सहेजे गए पते" : "Saved Addresses",
      count: counts.addresses,
      href: "/account/addresses",
      icon: "pin" as const,
      desc:
        locale === "hi"
          ? `${counts.addresses} पते उपलब्ध हैं`
          : `${counts.addresses} delivery addresses`,
    },
    {
      title: locale === "hi" ? "प्रोफ़ाइल एवं जन्म विवरण" : "Profile & Birth Details",
      count: null,
      href: "/account/profile",
      icon: "user" as const,
      desc:
        locale === "hi"
          ? "जन्म समय व स्थान सहेजें"
          : "Saved birth details for rituals",
    },
    {
      title: locale === "hi" ? "इच्छा सूची" : "Sacred Wishlist",
      count: null,
      href: "/wishlist",
      icon: "heart" as const,
      desc:
        locale === "hi"
          ? "पसंदीदा पवित्र वस्तुएं"
          : "Your saved sacred items",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-s2 bg-cream p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-g7">
              {locale === "hi" ? "खाता डैशबोर्ड" : "Account Dashboard"}
            </span>
            <h1 className="mt-1 font-title text-2xl font-normal text-em9 sm:text-3xl">
              {locale === "hi" ? `नमस्ते, ${userName}` : `Namaste, ${userName}`}
            </h1>
            <p className="mt-1 font-sans text-xs font-medium text-ink6 sm:text-sm">
              {locale === "hi"
                ? "माँ काली अस्तुति में आपका स्वागत है। यहाँ आप अपने सभी ऑर्डर और पवित्र सामग्री की स्थिति देख सकते हैं।"
                : "Welcome to your personal sacred space at Maa Kali Astuti."}
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center gap-1.5 rounded-pill border border-g5/30 bg-g1/25 px-3 py-1 font-sans text-xs font-semibold text-g7">
              <Icon name="check" className="size-3.5 text-g5" />
              <span>{profile?.email}</span>
            </span>
          </div>
        </div>

        {/* Quick Navigation Tiles */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group flex flex-col justify-between rounded-btn border border-s2 bg-iv p-4 transition-all duration-200 hover:border-g5 hover:shadow-card hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-field bg-cream text-em7 group-hover:bg-em7 group-hover:text-iv transition-colors">
                  <Icon name={tile.icon} className="size-5" />
                </div>
                {tile.count !== null && (
                  <span className="font-mono text-lg font-bold text-em9">
                    {tile.count}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h2 className="font-sans text-sm font-bold text-ink group-hover:text-em7 transition-colors">
                  {tile.title}
                </h2>
                <p className="mt-0.5 font-sans text-[11px] text-ink6">
                  {tile.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Order Section */}
      <div className="rounded-xl border border-s2 bg-cream p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-s2 pb-4">
          <div className="flex items-center gap-2">
            <Icon name="truck" className="size-5 text-em7" />
            <h2 className="font-title text-xl font-normal text-em9">
              {locale === "hi" ? "नवीनतम ऑर्डर" : "Recent Order"}
            </h2>
          </div>

          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-em7 hover:text-em9 hover:underline"
          >
            <span>{locale === "hi" ? "सभी ऑर्डर देखें" : "View all orders"}</span>
            <Icon name="arrowR" className="size-3" />
          </Link>
        </div>

        {latestOrder ? (
          <div className="mt-6 space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-field bg-iv p-4 border border-s2">
              <div>
                <span className="font-sans text-xs text-ink6">
                  {locale === "hi" ? "ऑर्डर संख्या" : "Order"}
                </span>
                <p className="font-mono text-sm font-bold text-ink">
                  {latestOrder.number}
                </p>
              </div>

              <div>
                <span className="font-sans text-xs text-ink6">
                  {locale === "hi" ? "दिनांक" : "Date"}
                </span>
                <p className="font-sans text-sm font-medium text-ink">
                  {formatIst(new Date(latestOrder.createdAt), { time: false })}
                </p>
              </div>

              <div>
                <span className="font-sans text-xs text-ink6">
                  {locale === "hi" ? "कुल राशि" : "Total"}
                </span>
                <p className="font-sans text-sm font-bold text-em7">
                  {fmt(latestOrder.totalInr)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge tone="gold" size="sm">
                  {latestOrder.status.replace("_", " ")}
                </Badge>
                <Link
                  href={`/account/orders/${latestOrder.number}`}
                  className="rounded-btn bg-em7 px-3 py-1.5 font-sans text-xs font-semibold text-iv hover:bg-em9 transition-colors"
                >
                  {locale === "hi" ? "विवरण देखें" : "Details"}
                </Link>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="rounded-field border border-s2 bg-iv p-4 sm:p-6">
              <OrderTimeline status={latestOrder.status} locale={locale} />
            </div>

            {/* Items summary */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="font-sans text-xs font-semibold text-ink6">
                {locale === "hi" ? "सामग्री:" : "Items:"}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {latestOrder.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-2 rounded-field border border-s2 bg-iv p-1.5 pr-3 text-xs"
                  >
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name[locale] ?? it.name.en}
                        className="size-8 rounded object-cover"
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded bg-cream text-g5">
                        <Icon name="bag" className="size-4" />
                      </div>
                    )}
                    <span className="max-w-[150px] truncate font-sans font-medium text-ink">
                      {it.name[locale] ?? it.name.en}
                    </span>
                    <span className="text-ink6">×{it.qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-pill bg-s1 text-ink6">
              <Icon name="bag" className="size-6" />
            </div>
            <p className="font-sans text-sm font-semibold text-ink">
              {locale === "hi" ? "कोई सक्रिय ऑर्डर नहीं है" : "No orders placed yet"}
            </p>
            <p className="mt-1 font-sans text-xs text-ink6">
              {locale === "hi"
                ? "हमारे पवित्र संग्रह से अभिमंत्रित रुद्राक्ष एवं रत्न देखें।"
                : "Explore our collection of authentic, energized rudraksha & gemstones."}
            </p>
            <div className="mt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 rounded-btn bg-em7 px-4 py-2 font-sans text-xs font-semibold text-iv hover:bg-em9 transition-colors"
              >
                <span>{locale === "hi" ? "दुकान देखें" : "Explore Sacred Offerings"}</span>
                <Icon name="arrowR" className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
