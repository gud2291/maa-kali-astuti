import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import type { Service } from "@/lib/api/consult";
import { isReport } from "@/lib/api/consult";
import { fmt } from "@/lib/core/format";
import { serviceHref } from "@/lib/routes";
import { EYEBROW } from "./ui";

/* §6 "Other ways to consult" (Consultation-Detail.dc.html 147–160). Ivory. One card per other
   service (auto-fit, min 280px): icon circle, name, "from ₹… · 60 min", brass arrow; the ring turns
   brass and the card lifts 2px on hover. Extra bottom padding clears the sticky Book bar. */

export async function OtherServices({ others }: { others: Service[] }) {
  const t = await getTranslations("consult");

  return (
    <section data-screen-label="Other services" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(56px,7vw,96px)] pb-[clamp(88px,9vw,120px)]">
        <span className={`${EYEBROW} mb-5 block text-g7`}>{t("detail.others")}</span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-3.5">
          {others.map((o) => (
            <Link
              key={o.key}
              href={serviceHref(o.key)}
              className="grid grid-cols-[48px_minmax(0,1fr)_20px] items-center gap-4 rounded-btn bg-cream px-5 py-[18px] no-underline shadow-ring-sand transition-[box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-ring-g5"
            >
              <span className="grid size-12 place-items-center rounded-pill bg-s1 text-em7">
                <Icon name={o.icon} className="size-6" />
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span lang="en" className="font-display text-[19px] leading-[1.2] font-normal text-em9">
                  {o.name}
                </span>
                <span className="font-sans text-[13px] leading-none font-semibold text-ink6 tabular">
                  {t("detail.fromLine", {
                    price: fmt(o.tiers[0].price),
                    dur: isReport(o) ? t("dur.reportLower") : t("dur.mins", { n: o.tiers[0].mins }),
                  })}
                </span>
              </span>
              <Icon name="arrowR" className="size-[18px] text-g5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
