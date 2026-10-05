import { requireAdminPage } from "@/server/auth/guards";
import { listReviews } from "@/server/reviews/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Pagination } from "@/components/admin/ui/Pagination";
import { LinkTabs, type LinkTab } from "@/components/admin/ui/Tabs";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ReviewCard } from "@/components/admin/reviews/ReviewCard";
import type { ReviewStatus } from "@/lib/domain/enums";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("reviews.moderate");

  const params = await searchParams;
  const rawStatus = params.status;
  const currentStatus =
    rawStatus === "approved" || rawStatus === "rejected" || rawStatus === "all"
      ? rawStatus
      : "pending";

  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const data = await listReviews({
    status: currentStatus === "all" ? undefined : (currentStatus as ReviewStatus),
    page,
  });

  const buildUrl = (updates: Partial<{ status: string; page: number }>): string => {
    const q = new URLSearchParams();
    const s = updates.status !== undefined ? updates.status : currentStatus;
    const p = updates.page !== undefined ? updates.page : 1;
    if (s && s !== "pending") q.set("status", s);
    if (p > 1) q.set("page", String(p));
    const qs = q.toString();
    return qs ? `/admin/reviews?${qs}` : "/admin/reviews";
  };

  const tabs: LinkTab[] = [
    {
      href: buildUrl({ status: "pending", page: 1 }),
      label: "Pending",
      active: currentStatus === "pending",
      count: data.counts.pending,
    },
    {
      href: buildUrl({ status: "approved", page: 1 }),
      label: "Approved",
      active: currentStatus === "approved",
      count: data.counts.approved,
    },
    {
      href: buildUrl({ status: "rejected", page: 1 }),
      label: "Rejected",
      active: currentStatus === "rejected",
      count: data.counts.rejected,
    },
    {
      href: buildUrl({ status: "all", page: 1 }),
      label: "All",
      active: currentStatus === "all",
      count: data.counts.all,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Moderate customer product reviews, verify photos, and feature highlights on the home page."
      />

      <LinkTabs tabs={tabs} />

      {data.rows.length === 0 ? (
        <EmptyState
          icon="star"
          title={`No ${currentStatus === "all" ? "" : currentStatus} reviews`}
          body={
            currentStatus === "pending"
              ? "All submitted reviews have been moderated. New customer reviews will appear here."
              : `There are currently no ${currentStatus} reviews to display.`
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {data.rows.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="pt-2">
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} pageSize={data.pageSize} />
        </div>
      )}
    </div>
  );
}
