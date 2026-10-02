import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { FaqList } from "@/components/ui/FaqList";
import { waLinkTo } from "@/lib/core/commerce";
import { getSetting } from "@/server/settings/queries";
import { EYEBROW, rich } from "./ui";

/* §6 FAQ (Consultations.dc.html 217–231). Ivory. "Before you book" heading with the emerald
   "Still unsure? Ask a person." WhatsApp card (sticky at top 96px from 980px) beside FaqList
   set "consult" (first answer open). */

export async function ConsultFaq({ items }: { items: [string, string][] }) {
  const [t, contact] = await Promise.all([
    getTranslations("consult.faq"),
    getSetting("contact"),
  ]);

  return (
    <section data-screen-label="FAQ" className="bg-iv">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-start gap-[clamp(32px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(64px,9vw,120px)] min-[980px]:grid-cols-[minmax(0,.8fr)_minmax(0,1.4fr)]">
        <div className="static top-24 flex flex-col gap-3.5 min-[980px]:sticky">
          <span className={`${EYEBROW} text-g7`}>{t("eyebrow")}</span>
          <h2
            lang="en"
            className="m-0 font-display text-[clamp(32px,3.6vw,46px)] leading-[1.08] font-normal tracking-[-.018em] text-em9 font-soft"
          >
            {t.rich("title", rich())}
          </h2>
          <div className="relative mt-3.5 flex flex-col gap-2.5 overflow-hidden rounded-btn bg-em9 p-[22px] text-em1">
            <Icon name="whatsapp" className="size-[26px] text-g3" />
            <span lang="en" className="font-display text-[21px] leading-[1.2] font-normal text-iv">
              {t("waTitle")}
            </span>
            <span className="font-sans text-[14px] leading-[1.6] text-sg3">{t("waBody")}</span>
            <a
              href={waLinkTo(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex h-11 items-center gap-2 self-start rounded-btn px-4 font-sans text-[14px] leading-none font-semibold text-g3 no-underline shadow-ring-g3 hover:bg-[rgba(217,185,106,.12)] hover:text-g3"
            >
              {contact.phoneDisplay}
            </a>
          </div>
        </div>
        <div lang="en">
          <FaqList items={items} openFirst />
        </div>
      </div>
    </section>
  );
}
