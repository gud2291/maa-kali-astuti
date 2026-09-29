import { fmt, off } from "@/lib/core/format";
import { cn } from "@/lib/utils/cn";

/* Price row (ProductCard.dc.html 20 / 62–66): price 700 ink, MRP struck ink6, % off sin 600.
   size "card" = 15px price on 13px row · "row" = 16px price, wraps with 2px row gap. */
export function Price({
  price,
  mrp,
  hi,
  size = "card",
  className,
}: {
  price: number;
  mrp?: number;
  hi?: boolean;
  size?: "card" | "row";
  className?: string;
}) {
  const showMrp = mrp != null && mrp > price;
  return (
    <div
      className={cn(
        "flex items-baseline font-sans text-[13px] font-medium tabular",
        size === "row" ? "flex-wrap gap-x-2 gap-y-[2px] leading-[1.2]" : "gap-2 leading-none",
        className,
      )}
    >
      <span className={cn("font-bold text-ink", size === "row" ? "text-[16px]" : "text-[15px]")}>{fmt(price)}</span>
      {showMrp && (
        <>
          <span className="text-ink6 line-through">
            <span className="sr-only">{hi ? "मूल्य" : "MRP"} </span>
            {fmt(mrp)}
          </span>
          <span className="font-semibold text-sin">
            {off({ price, mrp })}
            {hi ? "% छूट" : "% off"}
          </span>
        </>
      )}
    </div>
  );
}
