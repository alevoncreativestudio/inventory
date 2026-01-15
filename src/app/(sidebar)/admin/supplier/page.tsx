export const dynamic = "force-dynamic";

import { supplierColumns } from "@/components/suppliers/supplier-columns";
import { SupplierTable } from "@/components/suppliers/supplier-table";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form";
import { getSupplierList } from "@/actions/supplier-action";

interface SupplierPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SupplierPage({ searchParams }: SupplierPageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const limit = typeof params.limit === "string" ? Number(params.limit) : 10;

  const { data } = await getSupplierList({ page, limit });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
              <p className="text-muted-foreground">Manage your Suppliers</p>
            </div>
            <SupplierFormDialog />
          </div>

          <SupplierTable
            columns={supplierColumns}
            data={data?.suppliers ?? []}
            metadata={
              data?.metadata ?? {
                totalPages: 0,
                totalCount: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPrevPage: false,
              }
            }
            totals={data?.totals ?? { openingBalance: 0, purchaseDue: 0, purchaseReturnDue: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
