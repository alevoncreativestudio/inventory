export const dynamic = "force-dynamic";

import { ProductTable } from "@/components/products/product-table";
import { ProductFormSheet } from "@/components/products/product-form";
import { productColumns } from "@/components/products/product-columns";
import { getProductList } from "@/actions/product-actions";

export default async function ProductPage() {
    const {data } = await getProductList();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Products</h1>
              <p className="text-muted-foreground">Manage your Products</p>
            </div>
                <ProductFormSheet/>
          </div>
          <ProductTable columns={productColumns} data={data?.products ?? []}/>
          
        </div>
      </div>
    </div>
  );
}