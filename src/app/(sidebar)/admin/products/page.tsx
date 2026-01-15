export const dynamic = "force-dynamic";

import { ProductTable } from "@/components/products/product-table";
import { ProductFormSheet } from "@/components/products/product-form";
import { productColumns } from "@/components/products/product-columns";
import { getProductList } from "@/actions/product-actions";

interface ProductPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductPage({ searchParams }: ProductPageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const limit = typeof params.limit === "string" ? Number(params.limit) : 10;

  const { data } = await getProductList({ page, limit });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Products</h1>
              <p className="text-muted-foreground">Manage your Products</p>
            </div>
            <ProductFormSheet />
          </div>
          <ProductTable
            columns={productColumns}
            data={data?.products ?? []}
            metadata={
              data?.metadata ?? {
                totalPages: 0,
                totalCount: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPrevPage: false,
              }
            }
            totals={data?.totals ?? { stock: 0 }}
          />

        </div>
      </div>
    </div>
  );
}