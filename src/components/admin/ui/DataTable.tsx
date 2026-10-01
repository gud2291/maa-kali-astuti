import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  mobile?: "title" | "meta" | "badge" | "hide";
};

export type DataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref?: (row: T) => string;
  empty: ReactNode;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  rowHref,
  empty,
  className,
}: DataTableProps<T>): React.JSX.Element {
  if (rows.length === 0) {
    return <>{empty}</>;
  }

  const titleCol = columns.find((c) => c.mobile === "title");
  const badgeCol = columns.find((c) => c.mobile === "badge");
  const metaCols = columns.filter(
    (c) => c.mobile === "meta" || (c.mobile === undefined && c !== titleCol && c !== badgeCol),
  );

  return (
    <div className={className}>
      {/* Desktop real table (>= 768px) */}
      <div className="hidden overflow-x-auto rounded-btn bg-cream shadow-ring-sand md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-s2 bg-s1/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-ink6",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const href = rowHref ? rowHref(row) : undefined;
              return (
                <tr
                  key={rowIdx}
                  className="group relative border-b border-s2 transition-colors hover:bg-s1 last:border-b-0"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 font-sans text-[14px] text-ink align-middle",
                        col.className,
                      )}
                    >
                      {colIdx === 0 && href && (
                        <Link
                          href={href}
                          className="absolute inset-0 z-10"
                          aria-label="View row details"
                          tabIndex={-1}
                        />
                      )}
                      <div className="relative z-20 inline-block w-full">
                        {col.cell(row)}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list (< 768px) */}
      <div className="space-y-3 md:hidden">
        {rows.map((row, rowIdx) => {
          const href = rowHref ? rowHref(row) : undefined;
          return (
            <div
              key={rowIdx}
              className="group relative rounded-btn bg-cream p-4 shadow-ring-sand transition-colors hover:bg-s1"
            >
              {href && (
                <Link
                  href={href}
                  className="absolute inset-0 z-10"
                  aria-label="View row details"
                  tabIndex={-1}
                />
              )}

              {/* Card top row: Title and Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {titleCol ? (
                    <div className="relative z-20 font-sans text-[15px] font-semibold text-ink">
                      {titleCol.cell(row)}
                    </div>
                  ) : (
                    <div className="relative z-20 font-sans text-[15px] font-semibold text-ink">
                      {columns[0]?.cell(row)}
                    </div>
                  )}
                </div>

                {badgeCol && (
                  <div className="relative z-20 flex-none">
                    {badgeCol.cell(row)}
                  </div>
                )}
              </div>

              {/* Card meta fields */}
              {metaCols.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-s2 pt-2.5">
                  {metaCols.map((col) => (
                    <div
                      key={col.key}
                      className="flex items-center justify-between gap-2 font-sans text-[13px]"
                    >
                      <span className="font-medium text-ink6">{col.header}</span>
                      <span className="relative z-20 font-normal text-ink">
                        {col.cell(row)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
