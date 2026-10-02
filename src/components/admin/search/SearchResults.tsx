import Link from "next/link";
import type { AdminSearchResults } from "@/server/search/admin";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon, type AdminIconName } from "@/components/admin/AdminIcon";

export type SearchResultsProps = {
  results: AdminSearchResults;
};

const GROUP_ICONS: Record<string, AdminIconName> = {
  orders: "package",
  customers: "user",
  products: "tag",
  bookings: "calendar",
  kundali: "kundali",
  inquiries: "chat",
};

export function SearchResults({ results }: SearchResultsProps): React.JSX.Element {
  const { query, groups, totalMatches } = results;

  if (query.length < 2) {
    return (
      <EmptyState
        icon="search"
        title="Search Admin Workspace"
        body="Enter at least 2 characters to search orders, customers, products, bookings, Kundali orders, and inquiries."
      />
    );
  }

  if (totalMatches === 0) {
    return (
      <EmptyState
        icon="search"
        title={`No results found for "${query}"`}
        body="Try searching by order number, phone number, customer email, product name, or booking reference."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary Header */}
      <div className="flex items-baseline justify-between border-b border-s2 pb-3">
        <h2 className="font-serif text-[20px] font-bold text-ink">
          Search Results for &ldquo;{query}&rdquo;
        </h2>
        <span className="font-sans text-[13px] text-ink6">
          {totalMatches} match{totalMatches === 1 ? "" : "es"} across {groups.length} category
          {groups.length === 1 ? "" : "ies"}
        </span>
      </div>

      {/* Grouped results */}
      <div className="space-y-6">
        {groups.map((group) => {
          const icon = GROUP_ICONS[group.key] || "grid";

          return (
            <div
              key={group.key}
              className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2"
            >
              <div className="flex items-center justify-between border-b border-s2 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded bg-s1 text-em7">
                    <AdminIcon name={icon} className="size-4" />
                  </span>
                  <h3 className="font-serif text-[17px] font-bold text-ink">
                    {group.label}
                  </h3>
                </div>
                <span className="rounded-pill bg-s1 px-2.5 py-0.5 font-sans text-[11px] font-semibold text-g7">
                  {group.items.length} result{group.items.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="mt-2 divide-y divide-s2/60">
                {group.items.map((item) => (
                  <Link
                    key={`${group.key}-${item.id}`}
                    href={item.href}
                    className="group flex items-center justify-between gap-4 py-3 no-underline transition-colors hover:bg-s1/30 px-3 rounded -mx-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-bold text-em7 group-hover:underline">
                          {item.title}
                        </span>
                        {item.badge && (
                          <StatusBadge tone={item.badge.tone}>
                            {item.badge.label}
                          </StatusBadge>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="mt-0.5 truncate font-sans text-[12.5px] text-ink">
                          {item.subtitle}
                        </p>
                      )}
                      {item.meta && (
                        <p className="font-sans text-[11px] text-ink6">
                          {item.meta}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-sans text-[12.5px] font-medium text-em7 group-hover:text-em5 flex-none">
                      <span>View</span>
                      <AdminIcon
                        name="arrowR"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
