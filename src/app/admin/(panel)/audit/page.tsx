import { requireAdminPage } from "@/server/auth/guards";
import { listAudit } from "@/server/audit-admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Pagination } from "@/components/admin/ui/Pagination";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AuditRow } from "@/components/admin/audit/AuditRow";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("audit.view");

  const sp = await searchParams;
  const entity = typeof sp.entity === "string" ? sp.entity : undefined;
  const actorIdStr = typeof sp.actorId === "string" ? sp.actorId : undefined;
  const actorId = actorIdStr ? parseInt(actorIdStr, 10) : undefined;
  const from = typeof sp.from === "string" ? sp.from : undefined;
  const to = typeof sp.to === "string" ? sp.to : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  const data = await listAudit({
    entity,
    actorId,
    from,
    to,
    page,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Immutable record of administrative actions, status transitions, and data modifications"
      />

      {/* Filter Toolbar */}
      <form
        method="GET"
        action="/admin/audit"
        className="rounded-btn bg-cream p-4 shadow-sm border border-s2 flex flex-wrap items-center gap-3"
      >
        {/* Entity filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="audit-entity" className="font-sans text-[12px] font-semibold text-ink6">
            Entity:
          </label>
          <select
            id="audit-entity"
            name="entity"
            defaultValue={entity || "all"}
            className="rounded-btn border border-s2 bg-iv px-2.5 py-1.5 font-sans text-[13px] text-ink focus:border-g5 focus:outline-none"
          >
            <option value="all">All Entities</option>
            <option value="orders">Orders</option>
            <option value="product">Products</option>
            <option value="booking">Bookings</option>
            <option value="kundali">Kundali</option>
            <option value="inquiry">Inquiries</option>
            <option value="user">Users</option>
            <option value="subscriber">Subscribers</option>
            <option value="settings">Settings</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Date From */}
        <div className="flex items-center gap-2">
          <label htmlFor="audit-from" className="font-sans text-[12px] font-semibold text-ink6">
            From:
          </label>
          <input
            id="audit-from"
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-btn border border-s2 bg-iv px-2 py-1.5 font-sans text-[13px] text-ink focus:border-g5 focus:outline-none"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2">
          <label htmlFor="audit-to" className="font-sans text-[12px] font-semibold text-ink6">
            To:
          </label>
          <input
            id="audit-to"
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-btn border border-s2 bg-iv px-2 py-1.5 font-sans text-[13px] text-ink focus:border-g5 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="rounded-btn bg-em7 px-3.5 py-1.5 font-sans text-[13px] font-semibold text-iv transition-colors hover:bg-em5 cursor-pointer"
        >
          Apply Filters
        </button>

        {(entity || from || to) && (
          <a
            href="/admin/audit"
            className="font-sans text-[12px] font-semibold text-sin hover:underline no-underline"
          >
            Reset
          </a>
        )}
      </form>

      {/* Audit Log Entries */}
      {data.items.length === 0 ? (
        <EmptyState
          icon="report"
          title="No audit entries found"
          body="No administrative actions match the selected filter criteria."
        />
      ) : (
        <div className="space-y-3">
          {data.items.map((log) => (
            <AuditRow key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <Pagination currentPage={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}
