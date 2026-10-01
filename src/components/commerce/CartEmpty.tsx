"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { InlineArt } from "@/components/ui/InlineArt";
import { KALASH_SVG } from "@/lib/art/kalash";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

export type CartEmptyProps = {
  className?: string;
  uid?: string;
};

export function CartEmpty({ className, uid = "cart-empty" }: CartEmptyProps) {
  const t = useTranslations("drawer");

  return (
    <div className={cn("flex flex-1 flex-col items-center justify-center gap-3.5 px-7 py-6 text-center", className)}>
      <InlineArt svg={KALASH_SVG} uid={uid} className="h-[170px] w-[220px]" />
      <span className="font-display text-[26px] leading-[1.2] font-normal text-em9">{t("emptyTitle")}</span>
      <span className="max-w-[300px] font-sans text-[15px] leading-[1.6] font-normal text-ink6">
        {t("emptyBody")}
      </span>
      <Link
        href={routes.shop}
        className="mt-1.5 inline-flex h-12 items-center gap-2.5 rounded-btn bg-em7 px-6 font-sans text-[14px] leading-none font-semibold tracking-[.03em] text-iv no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)] hi:tracking-normal"
      >
        {t("emptyCta")}
        <span className="block size-4">
          <Icon name="arrowR" />
        </span>
      </Link>
    </div>
  );
}
