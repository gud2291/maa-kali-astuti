import { notFound } from "next/navigation";
import { env } from "@/server/env";
import { requireAdminPage } from "@/server/auth/guards";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader, CardBody } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { FilterSelect } from "@/components/admin/ui/FilterSelect";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Tabs, LinkTabs } from "@/components/admin/ui/Tabs";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Sheet } from "@/components/admin/ui/Sheet";
import { KitDemoForm } from "@/components/admin/form/useActionForm";
import { Button, buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type DemoItem = {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: "ok" | "warn" | "danger" | "info" | "muted";
  statusText: string;
};

const sampleRows: DemoItem[] = [
  {
    id: "prod-1",
    name: "Mahakali Kavach",
    category: "Kavach",
    price: "₹2,100",
    stock: 15,
    status: "ok",
    statusText: "In Stock",
  },
  {
    id: "prod-2",
    name: "Navarna Yantra (Energized)",
    category: "Yantras",
    price: "₹1,250",
    stock: 4,
    status: "warn",
    statusText: "Low Stock",
  },
  {
    id: "prod-3",
    name: "Rudraksha Siddha Mala",
    category: "Mala",
    price: "₹3,500",
    stock: 0,
    status: "danger",
    statusText: "Out of Stock",
  },
  {
    id: "prod-4",
    name: "Kali Sahasranama Stotram Book",
    category: "Puja",
    price: "₹450",
    stock: 50,
    status: "info",
    statusText: "Pre-order",
  },
  {
    id: "prod-5",
    name: "Gomti Chakra (11 pcs)",
    category: "Puja",
    price: "₹300",
    stock: 80,
    status: "muted",
    statusText: "Draft",
  },
];

export default async function AdminKitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  if (env.NODE_ENV !== "development") {
    notFound();
  }

  await requireAdminPage("dashboard.view");
  const rawParams = await searchParams;

  const currentTab = typeof rawParams.tab === "string" ? rawParams.tab : "all";
  const searchQ = typeof rawParams.q === "string" ? rawParams.q : "";
  const filterCat = typeof rawParams.cat === "string" ? rawParams.cat : "";
  const pageNum = typeof rawParams.page === "string" ? parseInt(rawParams.page, 10) || 1 : 1;

  // Filter sample rows based on search / category
  const filteredRows = sampleRows.filter((r) => {
    if (searchQ && !r.name.toLowerCase().includes(searchQ.toLowerCase())) {
      return false;
    }
    if (filterCat && r.category.toLowerCase() !== filterCat.toLowerCase()) {
      return false;
    }
    return true;
  });

  const columns = [
    {
      key: "name",
      header: "Product",
      cell: (row: DemoItem) => (
        <div>
          <p className="font-semibold text-ink">{row.name}</p>
          <p className="text-[12px] text-ink6">{row.id}</p>
        </div>
      ),
      mobile: "title" as const,
    },
    {
      key: "category",
      header: "Category",
      cell: (row: DemoItem) => row.category,
      mobile: "meta" as const,
    },
    {
      key: "price",
      header: "Price",
      cell: (row: DemoItem) => <span className="font-semibold">{row.price}</span>,
      mobile: "meta" as const,
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row: DemoItem) => `${row.stock} units`,
      mobile: "meta" as const,
    },
    {
      key: "status",
      header: "Status",
      cell: (row: DemoItem) => (
        <StatusBadge tone={row.status}>{row.statusText}</StatusBadge>
      ),
      mobile: "badge" as const,
    },
    {
      key: "actions",
      header: "Action",
      cell: () => (
        <button
          type="button"
          className={cn(buttonClass("outline", "xs"), "h-7 px-2.5 text-[12px] cursor-pointer")}
        >
          View
        </button>
      ),
      className: "text-right",
      mobile: "hide" as const,
    },
  ];

  const stringParams: Record<string, string> = {};
  if (searchQ) stringParams.q = searchQ;
  if (filterCat) stringParams.cat = filterCat;
  if (currentTab !== "all") stringParams.tab = currentTab;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Admin UI Kit"
        description="Comprehensive showcase of design tokens, tables, dialogs, sheets, and form fields for admin screens."
        backHref="/admin"
        backLabel="Dashboard"
        actions={
          <>
            <ConfirmDialog
              title="Publish Changes"
              body="Are you sure you want to publish these updates live to the store?"
              confirmLabel="Publish Now"
              onConfirm={async () => {
                await new Promise((r) => setTimeout(r, 600));
                return true;
              }}
              trigger={
                <button
                  type="button"
                  className={cn(buttonClass("primary", "xs"), "cursor-pointer")}
                >
                  Publish Changes
                </button>
              }
            />
            <Sheet
              title="Quick Settings"
              description="Configure drawer preferences"
              trigger={
                <button
                  type="button"
                  className={cn(buttonClass("outline", "xs"), "cursor-pointer")}
                >
                  Open Sheet
                </button>
              }
            >
              <div className="space-y-4">
                <p className="font-sans text-[14px] text-ink6">
                  This sheet automatically renders as a sliding right drawer on screens ≥ 768px,
                  and as a swipeable bottom sheet on mobile screens &lt; 768px.
                </p>
                <div className="rounded-btn bg-s1 p-4">
                  <p className="font-sans text-[13px] font-semibold text-ink">
                    Responsive Behavior Verified
                  </p>
                  <p className="mt-1 font-sans text-[12px] text-ink6">
                    Radix Dialog primitive handles focus trap, Escape key dismiss, and aria roles.
                  </p>
                </div>
              </div>
            </Sheet>
          </>
        }
      />

      {/* 2. Stat Cards Grid */}
      <section className="space-y-3">
        <h3 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-ink6">
          1. Metric Cards (StatCard)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value="₹1,48,200"
            hint="+14.2% from last month"
            icon="cash"
            href="/admin"
          />
          <StatCard
            label="Active Orders"
            value="24"
            hint="6 awaiting dispatch"
            icon="truck"
            href="/admin"
          />
          <StatCard
            label="Consultations"
            value="18"
            hint="4 scheduled today"
            icon="calendar"
            href="/admin"
          />
          <StatCard
            label="Catalog Items"
            value="56"
            hint="5 low in stock"
            icon="tag"
            href="/admin"
          />
        </div>
      </section>

      {/* 3. Badges, Dialogs & Tabs */}
      <section className="space-y-4">
        <h3 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-ink6">
          2. Badges & Dialogs
        </h3>
        <Card>
          <CardHeader
            title="UI Badges and Confirmations"
            description="Status pill variants and Radix AlertDialog triggers"
          />
          <CardBody className="space-y-6">
            <div>
              <p className="mb-2.5 font-sans text-[12.5px] font-semibold text-ink6">
                Status Badges:
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge tone="ok">Completed (ok)</StatusBadge>
                <StatusBadge tone="warn">Pending Action (warn)</StatusBadge>
                <StatusBadge tone="danger">Cancelled (danger)</StatusBadge>
                <StatusBadge tone="info">Processing (info)</StatusBadge>
                <StatusBadge tone="muted">Archived (muted)</StatusBadge>
              </div>
            </div>

            <div className="border-t border-s2 pt-4">
              <p className="mb-2.5 font-sans text-[12.5px] font-semibold text-ink6">
                Confirmation Dialogs (AlertDialog):
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <ConfirmDialog
                  title="Confirm Delete"
                  body="Are you sure you want to delete this product? This action cannot be undone."
                  confirmLabel="Delete Item"
                  tone="danger"
                  onConfirm={async () => {
                    await new Promise((r) => setTimeout(r, 600));
                    return true;
                  }}
                  trigger={
                    <button
                      type="button"
                      className="rounded-btn bg-rose/60 px-3.5 py-1.5 font-sans text-[13px] font-semibold text-sin transition-colors hover:bg-rose cursor-pointer"
                    >
                      Delete with Danger Confirm
                    </button>
                  }
                />
                <ConfirmDialog
                  title="Confirm Refund"
                  body="Process a full refund of ₹1,250 to customer's source account?"
                  confirmLabel="Approve Refund"
                  tone="default"
                  onConfirm={async () => {
                    await new Promise((r) => setTimeout(r, 600));
                    return true;
                  }}
                  trigger={
                    <button
                      type="button"
                      className={cn(buttonClass("outline", "xs"), "cursor-pointer")}
                    >
                      Default Confirm Dialog
                    </button>
                  }
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* 4. Tabs Showcase */}
      <section className="space-y-4">
        <h3 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-ink6">
          3. Tabs & URL Tabs
        </h3>
        <Card>
          <CardHeader
            title="Tab Navigation Components"
            description="Radix underline tabs and URL query link tabs"
          />
          <CardBody className="space-y-6">
            <div>
              <p className="mb-2 font-sans text-[12.5px] font-semibold text-ink6">
                URL LinkTabs:
              </p>
              <LinkTabs
                tabs={[
                  { href: "/admin/kit?tab=all", label: "All Items", active: currentTab === "all", count: 42 },
                  { href: "/admin/kit?tab=active", label: "Active", active: currentTab === "active", count: 35 },
                  { href: "/admin/kit?tab=drafts", label: "Drafts", active: currentTab === "drafts", count: 7 },
                  { href: "/admin/kit?tab=archived", label: "Archived", active: currentTab === "archived", count: 0 },
                ]}
              />
            </div>

            <div className="border-t border-s2 pt-4">
              <p className="mb-2 font-sans text-[12.5px] font-semibold text-ink6">
                Radix Tabs (em7 underline style):
              </p>
              <Tabs
                defaultValue="overview"
                items={[
                  {
                    value: "overview",
                    label: "Overview",
                    content: (
                      <p className="font-sans text-[13.5px] text-ink6">
                        Overview panel content demonstrating clean typographic scale and spacing.
                      </p>
                    ),
                  },
                  {
                    value: "pricing",
                    label: "Pricing & Tax",
                    content: (
                      <p className="font-sans text-[13.5px] text-ink6">
                        Pricing settings with GST calculation and coupon rules.
                      </p>
                    ),
                  },
                  {
                    value: "logs",
                    label: "Audit History",
                    content: (
                      <p className="font-sans text-[13.5px] text-ink6">
                        Audit records logged with timestamp and staff user details.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </CardBody>
        </Card>
      </section>

      {/* 5. Responsive Data Table & Search */}
      <section className="space-y-4">
        <h3 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-ink6">
          4. Responsive Data Table & Search
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <SearchBox placeholder="Search demo products..." />
            <FilterSelect
              param="cat"
              label="All Categories"
              options={[
                { value: "kavach", label: "Kavach" },
                { value: "yantras", label: "Yantras" },
                { value: "mala", label: "Mala" },
                { value: "puja", label: "Puja" },
              ]}
            />
          </div>
          <p className="font-sans text-[12.5px] text-ink6">
            Switches to cards on mobile (&lt; 768px)
          </p>
        </div>

        <DataTable
          rows={filteredRows}
          columns={columns}
          rowHref={(r) => `/admin/kit?id=${r.id}`}
          empty={
            <EmptyState
              title="No products found"
              body="Try clearing your search keyword or changing category filter."
              icon="search"
              action={
                <Button variant="outline" size="xs">
                  Clear Filters
                </Button>
              }
            />
          }
        />

        <Pagination
          page={pageNum}
          pageSize={5}
          total={sampleRows.length}
          pathname="/admin/kit"
          params={stringParams}
        />
      </section>

      {/* 6. Form Kit with useActionForm */}
      <section className="space-y-4">
        <h3 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-ink6">
          5. Action Form Kit (FieldShell, inputs, LocaleTabs, FormBar)
        </h3>
        <Card>
          <CardHeader
            title="Product Editor Form Demo"
            description="Form fields wired with react-hook-form, zod onBlur validation, leave guard, and sticky mobile FormBar"
          />
          <CardBody>
            <KitDemoForm />
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
