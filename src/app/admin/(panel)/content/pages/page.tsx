import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listPages, type AdminPageItem } from "@/server/pages/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { formatIst } from "@/lib/core/ist";

export default async function AdminPagesPage(): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const items = await listPages();

  const columns: DataTableColumn<AdminPageItem>[] = [
    {
      key: "page",
      header: "Policy Page",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/content/pages/${row.slug}`}
            className="font-medium text-ink hover:text-em5 transition-colors"
          >
            {row.titleEn}
          </Link>
          <p className="font-mono text-[11px] text-ink6">
            /policies/{row.slug}
          </p>
        </div>
      ),
    },
    {
      key: "hasBodyEn",
      header: "English Content",
      cell: (row) => (
        <StatusBadge tone={row.hasBodyEn ? "ok" : "muted"}>{row.hasBodyEn ? "Drafted" : "Empty"}</StatusBadge>
      ),
    },
    {
      key: "hasBodyHi",
      header: "Hindi Content",
      cell: (row) => (
        <StatusBadge tone={row.hasBodyHi ? "ok" : "muted"}>{row.hasBodyHi ? "Drafted" : "Empty"}</StatusBadge>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      cell: (row) => (
        <span className="font-sans text-[12px] text-ink6 tabular">
          {row.updatedAt ? formatIst(row.updatedAt) : "Never"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/policies/${row.slug}`}
            target="_blank"
            className="grid size-8 place-items-center rounded-btn text-ink6 hover:text-em5 hover:bg-cream transition-colors"
            title="View on site"
          >
            <AdminIcon name="eye" className="size-4" />
          </Link>
          <Link
            href={`/admin/content/pages/${row.slug}`}
            className="grid size-8 place-items-center rounded-btn text-ink6 hover:text-em5 hover:bg-cream transition-colors"
            title="Edit policy"
          >
            <AdminIcon name="edit" className="size-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Policy Pages"
        description="Manage the 5 official legal, shipping, and astrology disclaimer pages on the storefront."
      />

      <DataTable
        columns={columns}
        rows={items}
            empty={null}
          />
    </div>
  );
}
