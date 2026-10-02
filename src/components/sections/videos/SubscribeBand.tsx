import { getTranslations } from "next-intl/server";
import { Icon } from "@/components/icons/Icon";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { waLinkTo } from "@/lib/core/commerce";
import { getSetting } from "@/server/settings/queries";
import { SubButton } from "./VideosLibrary";

/** Videos §4 Subscribe band (design/Videos.dc.html 147–159): emerald, faint gold mandala right;
 *  YouTube disc + line + handle, then Subscribe / WhatsApp (row from 900, right-aligned). */
export async function SubscribeBand({ subs }: { subs: string }) {
  const [t, contact] = await Promise.all([
    getTranslations("videos.sub"),
    getSetting("contact"),
  ]);
  return (
    <section aria-label={t("label")} className="relative overflow-hidden bg-em7 text-em1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[-140px] size-[460px] -translate-y-1/2 opacity-10"
      >
        <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
          <MandalaG R={296} col="#D9B96A" sw={1} />
        </svg>
      </div>
      <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-x-12 gap-y-6 px-[clamp(16px,4vw,32px)] py-[clamp(44px,6vw,80px)] w900:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-[18px]">
          <span className="grid size-16 place-items-center rounded-pill text-g3 shadow-ring-g3">
            <Icon name="youtube" className="size-[30px]" />
          </span>
          <span className="flex flex-col gap-1.5">
            <span
              lang="en"
              className="font-display text-[clamp(24px,2.6vw,34px)] leading-[1.15] font-normal text-balance text-iv"
            >
              {t("title")}
            </span>
            <span className="font-sans text-[14px] leading-[1.4] font-medium text-sg3">{t("handle", { subs })}</span>
          </span>
        </div>
        <div className="flex flex-wrap justify-start gap-2.5 w900:justify-end">
          <SubButton className="h-[52px]" />
          <a
            href={waLinkTo(contact.whatsapp, t("waText"))}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[52px] items-center gap-[9px] rounded-btn px-5 font-sans text-[14.5px] leading-none font-semibold text-g1 no-underline shadow-ring-g3 hover:bg-[rgba(217,185,106,.12)] hover:text-iv"
          >
            <Icon name="whatsapp" className="size-[18px]" />
            {t("wa")}
          </a>
        </div>
      </div>
    </section>
  );
}
