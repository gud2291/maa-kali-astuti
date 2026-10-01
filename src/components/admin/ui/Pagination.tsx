import Link from "next/link";
import { AdminIcon } from "../AdminIcon";
import { cn } from "@/lib/utils/cn";

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  pathname: string;
  params: Record<string, string>;
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  pathname,
  params,
  className,
}: PaginationProps): React.JSX.Element {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(total, safePage * pageSize);

  const buildHref = (targetPage: number): string => {
    const sp = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "" && key !== "page") {
          sp.set(key, value);
        }
      }
    }
    if (targetPage > 1) {
      sp.set("page", String(targetPage));
    }
    const q = sp.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 font-sans text-[13px] text-ink6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p>
        Showing <span className="font-semibold text-ink">{from}</span>–
        <span className="font-semibold text-ink">{to}</span> of{" "}
        <span className="font-semibold text-ink">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildHref(safePage - 1)}
            className="inline-flex h-8 items-center gap-1 rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-s1"
          >
            <span className="size-3.5">
              <AdminIcon name="chevL" />
            </span>
            <span>Prev</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex h-8 items-center gap-1 rounded-btn border border-s2 bg-cream/50 px-3 font-sans text-[13px] font-medium text-ink6/50 cursor-not-allowed select-none"
          >
            <span className="size-3.5">
              <AdminIcon name="chevL" />
            </span>
            <span>Prev</span>
          </span>
        )}

        <span className="px-2 text-[12.5px] font-medium text-ink6">
          Page {safePage} of {totalPages}
        </span>

        {hasNext ? (
          <Link
            href={buildHref(safePage + 1)}
            className="inline-flex h-8 items-center gap-1 rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] font-semibold text-ink transition-colors hover:bg-s1"
          >
            <span>Next</span>
            <span className="size-3.5">
              <AdminIcon name="chevR" />
            </span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex h-8 items-center gap-1 rounded-btn border border-s2 bg-cream/50 px-3 font-sans text-[13px] font-medium text-ink6/50 cursor-not-allowed select-none"
          >
            <span>Next</span>
            <span className="size-3.5">
              <AdminIcon name="chevR" />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
