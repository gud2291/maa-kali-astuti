import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listArticles, type AdminArticleListItem } from "@/server/articles/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { SearchBox } from "@/components/admin/ui/SearchBox";
import { FilterSelect } from "@/components/admin/ui/FilterSelect";
import { DataTable, type DataTableColumn } from "@/components/admin/ui/DataTable";
import { Pagination } from "@/components/admin/ui/Pagination";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { buttonClass } from "@/components/ui/Button";
import { ARTICLE_CATEGORIES, type ArticleCategory, type ContentStatus } from "@/lib/domain/enums";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/domain/labels";
import { formatIst } from "@/lib/core/ist";

export default async function AdminBlogPage(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}): Promise<React.JSX.Element> {
  await requireAdminPage("content.edit");

  const sp = await props.searchParams;
  const search = sp.q;
  const category = sp.category as ArticleCategory | undefined;
  const status = sp.status as ContentStatus | undefined;
  const page = Number(sp.page) || 1;

  const { items, total, pages } = await listArticles({
    search,
    category,
    status,
    page,
    limit: 20,
  });

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...ARTICLE_CATEGORIES.map((k) => ({
      value: k,
      label: ARTICLE_CATEGORY_LABELS[k]?.en ?? k,
    })),
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
  ];

  const columns: DataTableColumn<AdminArticleListItem>[] = [
    {
      key: "title",
      header: "Article",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.coverMedia?.src ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={row.coverMedia.src}
              alt=""
              className="size-11 rounded-field border border-s2 object-cover shrink-0"
            />
          ) : (
            <div className="grid size-11 place-items-center rounded-field border border-s2 bg-cream text-g7 shrink-0">
              <AdminIcon name="scroll" className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/content/blog/${row.id}`}
              className="font-medium text-ink hover:text-em5 transition-colors line-clamp-1"
            >
              {row.titleEn}
            </Link>
            <p className="font-mono text-[11px] text-ink6 truncate">
              /blog/{row.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <span className="font-sans text-[13px] text-ink6 capitalize">
          {ARTICLE_CATEGORY_LABELS[row.category]?.en ?? row.category}
        </span>
      ),
    },
    {
      key: "readMins",
      header: "Read Time",
      render: (row) => (
        <span className="font-sans text-[13px] text-ink6">
          {row.readMins} min
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={row.status === "published" ? "active" : "draft"}
          label={row.status === "published" ? "Published" : "Draft"}
        />
      ),
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (row) => (
        <span className="font-sans text-[12px] text-ink6 tabular">
          {row.publishedAt ? formatIst(row.publishedAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === "published" && (
            <Link
              href={`/blog/${row.slug}`}
              target="_blank"
              className="grid size-8 place-items-center rounded-btn text-ink6 hover:text-em5 hover:bg-cream transition-colors"
              title="View on site"
            >
              <AdminIcon name="eye" className="size-4" />
            </Link>
          )}
          <Link
            href={`/admin/content/blog/${row.id}`}
            className="grid size-8 place-items-center rounded-btn text-ink6 hover:text-em5 hover:bg-cream transition-colors"
            title="Edit article"
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
        title="Blog Articles"
        description="Manage spiritual articles, guides, remedies, and astrological insights."
        action={
          <Link
            href="/admin/content/blog/new"
            className={buttonClass("primary", "sm")}
          >
            <AdminIcon name="plus" className="size-4 mr-1.5" />
            New Article
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchBox placeholder="Search articles by title or slug…" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            paramName="category"
            options={categoryOptions}
            defaultValue=""
          />
          <FilterSelect
            paramName="status"
            options={statusOptions}
            defaultValue=""
          />
        </div>
      </div>

      {/* Data Table */}
      {items.length === 0 ? (
        <EmptyState
          icon="scroll"
          title="No articles found"
          description={
            search || category || status
              ? "No articles match the selected filters."
              : "Start by writing your first blog article."
          }
          action={
            <Link
              href="/admin/content/blog/new"
              className={buttonClass("primary", "sm")}
            >
              Write Article
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <DataTable
            columns={columns}
            data={items}
            keyExtractor={(item) => String(item.id)}
          />
          <Pagination totalPages={pages} currentPage={page} />
        </div>
      )}
    </div>
  );
}
