import Link from "next/link";
import type { LowStockProductItem } from "@/server/dashboard/queries";
import { fmt } from "@/lib/core/format";
import { AdminIcon } from "@/components/admin/AdminIcon";

export type LowStockListProps = {
  products: LowStockProductItem[];
};

export function LowStockList({ products }: LowStockListProps): React.JSX.Element {
  return (
    <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-s2 pb-3">
          <div>
            <h3 className="font-serif text-[17px] font-bold text-ink">
              Low Stock Items
            </h3>
            <p className="font-sans text-[11.5px] text-ink6">
              Products needing replenishment
            </p>
          </div>
          <Link
            href="/admin/products?stock=low"
            className="flex items-center gap-1 font-sans text-[12px] font-semibold text-em7 hover:text-em5 no-underline"
          >
            <span>Filtered list</span>
            <AdminIcon name="arrowR" className="size-3" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="py-8 text-center font-sans text-[13px] text-ink6">
            All active products have healthy stock levels.
          </div>
        ) : (
          <div className="divide-y divide-s2/60">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="group flex items-center justify-between gap-3 py-3 no-underline transition-colors hover:bg-s1/30 px-2 rounded -mx-2"
              >
                <div className="min-w-0">
                  <p className="truncate font-sans text-[13px] font-semibold text-ink group-hover:text-em7 transition-colors">
                    {p.nameEn}
                  </p>
                  <p className="truncate font-sans text-[11.5px] text-ink6">
                    {p.slug} · Threshold: {p.lowStockAt}
                  </p>
                </div>

                <div className="flex flex-col items-end flex-none text-right">
                  <span
                    className={`inline-flex items-center rounded-pill px-2 py-0.5 font-sans text-[11.5px] font-bold ${
                      p.stock === 0
                        ? "bg-rose text-sin"
                        : "bg-g1 text-g7"
                    }`}
                  >
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                  <span className="font-sans text-[11.5px] text-ink6 mt-0.5">
                    {fmt(p.priceInr)}
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
