export const dynamic = "force-dynamic";

import { supplierColumns } from "@/components/suppliers/supplier-columns";
import { SupplierTable } from "@/components/suppliers/supplier-table";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form";
import { getSupplierList } from "@/actions/supplier-action";

export default async function SupplierPage() {
  const {data} = await getSupplierList();  

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
              <p className="text-muted-foreground">Manage your Suppliers</p>
            </div>
            <SupplierFormDialog />
          </div>

          <SupplierTable columns={supplierColumns} data={data?.suppliers ?? []} />
        </div>
      </div>
    </div>
  );
}
