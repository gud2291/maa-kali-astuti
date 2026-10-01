"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/components/icons/Icon";
import { fmt } from "@/lib/core/format";
import { cn } from "@/lib/utils/cn";

type Props = {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  name: string;
  onNameChange: (name: string) => void;
  gotra: string;
  onGotraChange: (gotra: string) => void;
  fee: number;
};

export function EnergizationFields({
  enabled,
  onToggle,
  name,
  onNameChange,
  gotra,
  onGotraChange,
  fee,
}: Props) {
  const t = useTranslations("pdp");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-btn border p-3.5 transition-all duration-200",
        enabled ? "border-g5 bg-cream/80 shadow-[0_0_0_1px_#B8923A]" : "border-s2 bg-cream/40",
      )}
    >
      <label className="flex cursor-pointer items-start gap-3 select-none">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only"
        />
        <span
          className={cn(
            "mt-0.5 grid size-5 flex-none place-items-center rounded-[3px] border transition-colors",
            enabled ? "border-em7 bg-em7 text-iv" : "border-s2 bg-iv text-transparent",
          )}
        >
          <Icon name="check" className="size-3.5 stroke-[2.5]" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-sans text-[14px] font-semibold text-em9">
            {t("personalEnergize", { fee: fmt(fee).replace("₹", "") })}
          </span>
          <span className="font-sans text-[12px] leading-[1.45] text-ink6">
            {t("personalEnergizeDesc")}
          </span>
        </div>
      </label>

      {enabled && (
        <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-s2/70 animate-in fade-in duration-200">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="pdp-energ-name" className="font-sans text-[12px] font-semibold text-em9">
              {t("nameLabel")} <span className="text-sin">*</span>
            </label>
            <input
              id="pdp-energ-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={80}
              className="h-10 rounded-field border border-s2 bg-iv px-3 font-sans text-[13.5px] text-ink placeholder:text-ink6/60 outline-none transition-colors focus:border-g5 focus:ring-1 focus:ring-g5"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pdp-energ-gotra" className="font-sans text-[12px] font-semibold text-em9">
              {t("gotraLabel")}
            </label>
            <input
              id="pdp-energ-gotra"
              type="text"
              value={gotra}
              onChange={(e) => onGotraChange(e.target.value)}
              placeholder={t("gotraPlaceholder")}
              maxLength={80}
              className="h-10 rounded-field border border-s2 bg-iv px-3 font-sans text-[13.5px] text-ink placeholder:text-ink6/60 outline-none transition-colors focus:border-g5 focus:ring-1 focus:ring-g5"
            />
          </div>
        </div>
      )}
    </div>
  );
}
