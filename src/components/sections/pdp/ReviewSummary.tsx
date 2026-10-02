"use client";

import { useTranslations } from "next-intl";
import { Stars } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";

type Props = {
  avg: number;
  count: number;
  dist: [number, number, number, number, number]; // [5★, 4★, 3★, 2★, 1★]
  onWriteReview: () => void;
  selectedStar: number | null;
  onSelectStar: (star: number | null) => void;
};

export function ReviewSummary({
  avg,
  count,
  dist,
  onWriteReview,
  selectedStar,
  onSelectStar,
}: Props) {
  const t = useTranslations("reviews");

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-10 p-6 rounded-btn bg-cream/60 border border-s2">
      {/* Left: Overall Rating & Write Review CTA */}
      <div className="flex flex-col items-start gap-3 flex-none min-w-[200px]">
        <div className="flex items-baseline gap-2">
          <span className="font-title text-[46px] leading-none text-em9 font-normal">
            {avg.toFixed(1)}
          </span>
          <span className="font-sans text-[15px] font-medium text-ink6">
            / 5.0
          </span>
        </div>
        <div className="h-5 w-28">
          <Stars n={Math.round(avg)} />
        </div>
        <p className="m-0 font-sans text-[13px] text-ink6">
          {t("basedOn", { count })}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={onWriteReview}
          className="mt-2"
        >
          <span className="size-4 mr-1">
            <Icon name="edit" />
          </span>
          {t("writeReview")}
        </Button>
      </div>

      {/* Middle/Right: Distribution bars */}
      <div className="flex flex-col gap-1.5 w-full max-w-[420px]">
        {[5, 4, 3, 2, 1].map((stars, idx) => {
          const barCount = dist[idx] ?? 0;
          const pct = count > 0 ? Math.round((barCount / count) * 100) : 0;
          const isSelected = selectedStar === stars;

          return (
            <button
              key={stars}
              type="button"
              onClick={() => onSelectStar(isSelected ? null : stars)}
              className={cn(
                "group flex items-center gap-3 py-1 px-2 rounded-field transition-colors text-left border-0 bg-transparent cursor-pointer",
                isSelected
                  ? "bg-em1 font-semibold"
                  : "hover:bg-s1/60",
              )}
            >
              <span className="flex items-center gap-1 font-sans text-[12.5px] font-medium text-ink flex-none w-10">
                {stars}
                <span className="size-3 text-g5 inline-block">
                  <Icon name="starF" />
                </span>
              </span>
              <div className="flex-1 h-2 rounded-pill bg-s2 overflow-hidden">
                <div
                  className="h-full rounded-pill bg-g5 transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-sans text-[12px] text-ink6 flex-none w-8 text-right tabular">
                {barCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
