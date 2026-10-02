import { getTranslations, getLocale } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { getSetting } from "@/server/settings/queries";

export async function ContactCards(): Promise<React.JSX.Element> {
  const [t, contact, locale] = await Promise.all([
    getTranslations("contact"),
    getSetting("contact"),
    getLocale(),
  ]);

  const hours = locale === "hi" ? contact.hours.hi : contact.hours.en;
  const address = locale === "hi" ? contact.address.hi : contact.address.en;

  const cards: { icon: "whatsapp" | "phone" | "mail" | "clock"; label: string; value: string; href?: string; rel?: string; target?: string }[] = [
    {
      icon: "whatsapp",
      label: t("cards.whatsapp"),
      value: contact.phoneDisplay,
      href: `https://wa.me/${contact.whatsapp}`,
      rel: "noopener noreferrer",
      target: "_blank",
    },
    {
      icon: "phone",
      label: t("cards.call"),
      value: contact.phoneDisplay,
      href: `tel:${contact.phoneTel}`,
    },
    {
      icon: "mail",
      label: t("cards.email"),
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      icon: "clock",
      label: t("cards.hours"),
      value: hours || "Mon–Sat · 10:00–19:00 IST",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-[20px] leading-[1.2] font-normal text-ink">
        {t("cards.heading")}
      </h2>
      {address && (
        <p className="font-sans text-[14px] leading-[1.5] font-medium text-ink6">
          {address}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((c) => {
          const inner = (
            <>
              <span className="grid size-10 flex-none place-items-center rounded-pill bg-em7 text-iv">
                <Icon name={c.icon} className="size-[18px]" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-sans text-[12px] leading-[1.3] font-semibold tracking-[.06em] text-ink6 uppercase">
                  {c.label}
                </span>
                <span className="font-sans text-[14px] leading-[1.35] font-medium text-ink">
                  {c.value}
                </span>
              </div>
            </>
          );

          if (c.href) {
            return (
              <a
                key={c.icon}
                href={c.href}
                target={c.target}
                rel={c.rel}
                className="flex items-center gap-3 rounded-field border border-s2 bg-cream px-4 py-3.5 no-underline transition-colors hover:border-em7"
              >
                {inner}
              </a>
            );
          }

          return (
            <div
              key={c.icon}
              className="flex items-center gap-3 rounded-field border border-s2 bg-cream px-4 py-3.5"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
