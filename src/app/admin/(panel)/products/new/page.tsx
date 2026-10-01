import { requireAdminPage } from "@/server/auth/guards";
import { listProductOptions } from "@/server/catalog/admin";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default async function NewProductPage(): Promise<React.JSX.Element> {
  await requireAdminPage("products.edit");
  const productOptions = await listProductOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Product"
        description="Add a new sacred item to the store catalogue."
        backHref="/admin/products"
        backLabel="Products"
      />

      <ProductForm productOptions={productOptions} canEdit={true} />
    </div>
  );
}
