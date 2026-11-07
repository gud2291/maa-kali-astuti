import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/Icon";

const STAR = "M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z";

/** Five-star row — JSX port of A.stars5 (mka-astro.js 422). `n` stars filled (default 5). */
export function Stars({
  col = "#B8923A",
  n = 5,
  className,
  label,
}: {
  col?: string;
  n?: number;
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="2 2 128 20"
      width="100%"
      height="100%"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("block", className)}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={STAR}
          transform={`translate(${i * 27} 0)`}
          fill={i < n ? col : "none"}
          stroke={col}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/** Card rating (ProductCard.dc.html 57): gold star 12px · "4.6" 600 12px · "(96)" 500 ink6. */
export function Rating({
  rating,
  reviews,
  hi,
  className,
}: {
  rating: number;
  reviews?: number;
  hi?: boolean;
  className?: string;
}) {
  if (reviews === 0) return null;
  const r = rating.toFixed(1);
  const label = hi
    ? `रेटिंग ${r}/5${reviews != null ? `, ${reviews} समीक्षाएँ` : ""}`
    : `Rated ${r} out of 5${reviews != null ? `, ${reviews} reviews` : ""}`;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 font-sans text-[12px] leading-none font-semibold text-ink tabular",
        className,
      )}
    >
      <span className="block size-3 text-g5">
        <Icon name="starF" />
      </span>
      {r}
      {reviews != null && <span className="font-medium text-ink6">({reviews})</span>}
    </span>
  );
}
