import Link from "next/link";
import { requireAdminPage } from "@/server/auth/guards";
import { listCategoriesAdmin } from "@/server/catalog/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";

export default async function CategoriesPage(): Promise<React.JSX.Element> {
  await requireAdminPage("products.view");
  const categories = await listCategoriesAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Manage category descriptions, SEO metadata, and storefront visibility."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={`/admin/categories/${cat.key}`}
            className="group flex flex-col justify-between rounded-btn border border-s2 bg-cream p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-em7/50 hover:shadow-md no-underline"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[11px] font-semibold tracking-wider text-g7 uppercase">
                  /{cat.slug}
                </span>
                <StatusBadge tone={cat.visible ? "ok" : "muted"}>
                  {cat.visible ? "Visible" : "Hidden"}
                </StatusBadge>
              </div>

              <div className="mt-3">
                <h3 className="font-display text-[18px] font-semibold text-ink transition-colors group-hover:text-em7">
                  {cat.nameEn}
                </h3>
                {cat.nameHi && (
                  <p className="font-deva text-[13.5px] text-ink6">
                    {cat.nameHi}
                  </p>
                )}
                <p className="mt-1 line-clamp-2 font-sans text-[13px] leading-relaxed text-ink6/80">
                  {cat.shortEn}
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-s2 pt-3 font-sans text-[12.5px]">
              <span className="font-medium text-ink6">
                {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
              </span>

              <div className="flex items-center gap-1 font-semibold text-em7 group-hover:text-em5">
                <span>Edit</span>
                <span className="size-3.5 transition-transform group-hover:translate-x-0.5">
                  <AdminIcon name="arrowR" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
