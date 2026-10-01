import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductCard } from "@/components/commerce/ProductCard";
import type { Product } from "@/types/product";

type Props = {
  products: Product[];
  eyebrow: string;
  title: React.ReactNode;
};

export function RelatedRail({ products, eyebrow, title }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <section className="flex flex-col gap-6 py-6 border-t border-s2">
      <SectionHeader eyebrow={eyebrow} title={title} size="sm" />

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3">
        {products.map((p) => (
          <div key={p.id} className="w-[260px] md:w-[280px] flex-none snap-start">
            <ProductCard product={p} size="std" />
          </div>
        ))}
      </div>
    </section>
  );
}
