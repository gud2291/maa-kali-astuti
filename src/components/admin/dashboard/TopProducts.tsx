import Link from "next/link";
import type { TopProductItem } from "@/server/dashboard/queries";
import { fmt } from "@/lib/core/format";
import { AdminIcon } from "@/components/admin/AdminIcon";

export type TopProductsProps = {
  products: TopProductItem[];
};

export function TopProducts({ products }: TopProductsProps): React.JSX.Element {
  return (
    <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-s2 pb-3">
          <div>
            <h3 className="font-serif text-[17px] font-bold text-ink">
              Top Products
            </h3>
            <p className="font-sans text-[11.5px] text-ink6">
              Last 30 days by units sold
            </p>
          </div>
          <Link
            href="/admin/products"
            className="flex items-center gap-1 font-sans text-[12px] font-semibold text-em7 hover:text-em5 no-underline"
          >
            <span>All products</span>
            <AdminIcon name="arrowR" className="size-3" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="py-8 text-center font-sans text-[13px] text-ink6">
            No sales recorded in the last 30 days.
          </div>
        ) : (
          <div className="divide-y divide-s2/60">
            {products.map((p, idx) => (
              <Link
                key={p.productId}
                href={`/admin/products/${p.productId}`}
                className="group flex items-center justify-between gap-3 py-3 no-underline transition-colors hover:bg-s1/30 px-2 rounded -mx-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-6 flex-none place-items-center rounded-full bg-s1 text-g7 font-sans text-[11px] font-bold">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[13px] font-semibold text-ink group-hover:text-em7 transition-colors">
                      {p.nameEn}
                    </p>
                    <p className="truncate font-sans text-[11.5px] text-ink6">
                      {p.slug}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end flex-none text-right">
                  <span className="font-sans text-[13px] font-bold text-ink">
                    {p.totalQty} sold
                  </span>
                  <span className="font-sans text-[11.5px] font-medium text-g7">
                    {fmt(p.totalRevenue)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
