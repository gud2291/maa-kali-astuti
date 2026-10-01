import { notFound } from "next/navigation";
import { requireAdminPage } from "@/server/auth/guards";
import { can } from "@/lib/domain/permissions";
import { getProductForEdit, listProductOptions } from "@/server/catalog/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { ProductActions } from "@/components/admin/products/ProductActions";
import { StockAdjust } from "@/components/admin/products/StockAdjust";
import { formatIst } from "@/lib/core/ist";
import type { ProductStatus } from "@/lib/domain/enums";

export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const admin = await requireAdminPage("products.view");
  const canEdit = can(admin.role, "products.edit");

  const { id } = await props.params;

  const [productData, productOptions] = await Promise.all([
    getProductForEdit(id),
    listProductOptions(),
  ]);

  if (!productData) {
    notFound();
  }

  const { product } = productData;

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.nameEn}
        description={
          <span className="font-sans text-[13px] text-ink6">
            ID: <span className="font-mono">{product.id}</span> · Added{" "}
            {formatIst(product.createdAt, { date: true })}
          </span>
        }
        backHref="/admin/products"
        backLabel="Products"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StockAdjust
              productId={product.id}
              productName={product.nameEn}
              currentStock={product.stock}
              disabled={!canEdit}
            />
            <ProductActions
              product={{
                id: product.id,
                slug: product.slug,
                nameEn: product.nameEn,
                status: product.status as ProductStatus,
              }}
              canEdit={canEdit}
            />
          </div>
        }
      />

      <ProductForm
        initialData={productData}
        productOptions={productOptions}
        canEdit={canEdit}
      />
    </div>
  );
}
