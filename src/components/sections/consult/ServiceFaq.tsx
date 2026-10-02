import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { FaqList } from "@/components/ui/FaqList";
import type { Service } from "@/lib/api/consult";
import { waLinkTo } from "@/lib/core/commerce";
import { getSetting } from "@/server/settings/queries";
import { EYEBROW, rich } from "./ui";

/* §5 Service FAQ (Consultation-Detail.dc.html 136–145). Sand with a top hairline. "About …" heading
   and a WhatsApp link beside the service's FaqList set (kundali / palm / tarot / numerology). */

export async function ServiceFaq({ s, items }: { s: Service; items: [string, string][] }) {
  const [t, contact] = await Promise.all([
    getTranslations("consult.detail"),
    getSetting("contact"),
  ]);

  return (
    <section data-screen-label="Service FAQ" className="bg-s1 shadow-hair-top">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(28px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)] min-[980px]:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)]">
        <div className="flex flex-col gap-3">
          <span className={`${EYEBROW} text-g7`}>{t("faqEyebrow", { short: t(`copy.${s.key}.short`) })}</span>
          <h2
            lang="en"
            className="m-0 font-display text-[clamp(30px,3.4vw,44px)] leading-[1.1] font-normal tracking-[-.018em] text-em9 font-soft"
          >
            {t.rich("faqTitle", rich())}
          </h2>
          <a
            href={waLinkTo(contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 self-start font-sans text-[14px] leading-none font-semibold text-em7 no-underline"
          >
            <Icon name="whatsapp" className="size-[17px]" />
            {t("askWa")}
          </a>
        </div>
        <div lang="en">
          <FaqList items={items} openFirst />
        </div>
      </div>
    </section>
  );
}
