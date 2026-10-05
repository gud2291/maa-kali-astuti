import { requireAdminPage } from "@/server/auth/guards";
import { listMessages } from "@/server/messages/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Pagination } from "@/components/admin/ui/Pagination";
import { LinkTabs, type LinkTab } from "@/components/admin/ui/Tabs";
import { MessageList } from "@/components/admin/messages/MessageList";
import { MESSAGE_STATUS } from "@/lib/domain/enums";

const STATUS_LABELS: Record<string, string> = {
  all: "All",
  new: "New",
  replied: "Replied",
  closed: "Closed",
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("messages.view");

  const params = await searchParams;
  const currentStatus = params.status || "all";
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const data = await listMessages({
    status: currentStatus,
    page,
    pageSize: 20,
  });

  const buildUrl = (updates: Partial<{ status: string; page: number }>): string => {
    const q = new URLSearchParams();
    const s = updates.status !== undefined ? updates.status : currentStatus;
    const p = updates.page !== undefined ? updates.page : 1;
    if (s && s !== "all") q.set("status", s);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/admin/messages?${qs}` : "/admin/messages";
  };

  const tabs: LinkTab[] = [
    {
      href: buildUrl({ status: "all", page: 1 }),
      label: "All",
      active: currentStatus === "all",
      count: data.counts.all,
    },
    ...MESSAGE_STATUS.map((s) => ({
      href: buildUrl({ status: s, page: 1 }),
      label: STATUS_LABELS[s] || s,
      active: currentStatus === s,
      count: data.counts[s],
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Messages received from the contact form."
      />

      <LinkTabs tabs={tabs} />

      <div className="rounded-field border border-s2 bg-iv">
        <MessageList items={data.items} />
      </div>

      {data.totalPages > 1 && (
        <Pagination page={data.page} totalPages={data.totalPages} />
      )}
    </div>
  );
}
