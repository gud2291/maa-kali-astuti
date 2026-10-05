import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { can } from "@/lib/domain/permissions";
import { listProducts, type AdminProductRow } from "@/server/catalog/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { FilterSelect } from "@/components/admin/ui/FilterSelect";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { productThumb } from "@/components/admin/products/productThumb";
import { ProductRowMenu } from "@/components/admin/products/ProductRowMenu";
import { CATEGORY_KEYS, type CategoryKey, type ProductStatus } from "@/lib/domain/enums";

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  rudraksha: "Rudraksha",
  bracelets: "Bracelets",
  amulets: "Amulets & Yantras",
  havan: "Havan & Puja",
  copper: "Pure Copper",
};

export default async function ProductsPage(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    stock?: string;
    page?: string;
  }>;
}): Promise<React.JSX.Element> {
  const admin = await requireAdminPage("products.view");
  const canEdit = can(admin.role, "products.edit");

  const sp = await props.searchParams;
  const search = sp.q;
  const category = sp.category as CategoryKey | undefined;
  const status = sp.status as ProductStatus | undefined;
  const stock = sp.stock as "low" | "out" | undefined;
  const page = Number(sp.page) || 1;

  const { rows, total } = await listProducts({
    search,
    category,
    status,
    stock,
    page,
  });

  const categoryOptions = CATEGORY_KEYS.map((k) => ({
    value: k,
    label: CATEGORY_LABELS[k] ?? k,
  }));

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" },
  ];

  const stockOptions = [
    { value: "low", label: "Low stock (≤ alert)" },
    { value: "out", label: "Out of stock" },
  ];

  const columns: DataTableColumn<AdminProductRow>[] = [
    {
      key: "product",
      header: "Product",
      mobile: "title",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productThumb(row)}
            alt=""
            className="size-11 flex-none rounded-field border border-s2 bg-s1 object-cover"
          />
          <div className="min-w-0">
            <div className="font-sans text-[14px] font-semibold text-ink line-clamp-1">
              {row.nameEn}
            </div>
            {row.nameHi && (
              <div className="font-deva text-[12px] text-ink6 line-clamp-1">
                {row.nameHi}
              </div>
            )}
            <div className="font-mono text-[11px] text-ink6/70">
              ID: {row.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      mobile: "meta",
      cell: (row) => (
        <span className="font-sans text-[13px] text-ink6">
          {CATEGORY_LABELS[row.categoryKey] ?? row.categoryKey}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price / MRP",
      mobile: "meta",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-sans text-[13.5px] font-medium text-ink">
            ₹{row.priceInr.toLocaleString("en-IN")}
          </span>
          {row.mrpInr > row.priceInr && (
            <span className="font-sans text-[11.5px] text-ink6/70 line-through">
              ₹{row.mrpInr.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      mobile: "badge",
      cell: (row) => {
        if (row.stock === 0) {
          return <StatusBadge tone="danger">Out of stock</StatusBadge>;
        }
        if (row.stock <= row.lowStockAt) {
          return (
            <StatusBadge tone="warn">
              Low: {row.stock} left
            </StatusBadge>
          );
        }
        return (
          <span className="font-sans text-[13px] text-ink6">
            {row.stock} in stock
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      mobile: "badge",
      cell: (row) => {
        if (row.status === "active") {
          return <StatusBadge tone="ok">Active</StatusBadge>;
        }
        if (row.status === "draft") {
          return <StatusBadge tone="muted">Draft</StatusBadge>;
        }
        return <StatusBadge tone="danger">Archived</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      mobile: "meta",
      className: "w-[96px] text-right",
      cell: (row) => <ProductRowMenu product={row} canEdit={canEdit} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage sacred items, prices, inventory, photos, and descriptions."
        actions={
          canEdit ? (
            <Link
              href="/admin/products/new"
              className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-em7 px-3.5 font-sans text-[13px] font-semibold text-iv shadow-sm transition-colors hover:bg-em9"
            >
              <span className="size-4">
                <AdminIcon name="plus" />
              </span>
              <span>New product</span>
            </Link>
          ) : undefined
        }
      />

      {/* Filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox placeholder="Search name, slug or ID..." />

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            param="category"
            label="All Categories"
            options={categoryOptions}
          />
          <FilterSelect
            param="status"
            label="All Statuses"
            options={statusOptions}
          />
          <FilterSelect
            param="stock"
            label="All Stock"
            options={stockOptions}
          />
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        rows={rows}
        columns={columns}
        rowHref={(row) => `/admin/products/${row.id}`}
        empty={
          <EmptyState
            icon="tag"
            title="No products found"
            body="Try changing your search term or filters to find what you're looking for."
            action={
              canEdit ? (
                <Link
                  href="/admin/products/new"
                  className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-em7 px-3.5 font-sans text-[13px] font-semibold text-iv shadow-sm transition-colors hover:bg-em9"
                >
                  <span className="size-4">
                    <AdminIcon name="plus" />
                  </span>
                  <span>Add product</span>
                </Link>
              ) : undefined
            }
          />
        }
      />

      {/* Pagination */}
      {total > 20 && (
        <Pagination page={page} pageSize={20} total={total} />
      )}
    </div>
  );
}
