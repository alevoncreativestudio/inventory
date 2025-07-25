export const dynamic = "force-dynamic";

import { SalesTable } from "@/components/sales/sales-table";
import { SalesFormSheet } from "@/components/sales/sales-form";
import { salesColumns } from "@/components/sales/sales-colums";
import { getSalesList } from "@/actions/sales-action";

export default async function SalesPage() {
  const { data } = await getSalesList();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
              <p className="text-muted-foreground">Manage your sales</p>
            </div>
            <SalesFormSheet />
          </div>

          <SalesTable columns={salesColumns} data={data?.sales ?? []} />
        </div>
      </div>
    </div>
  );
}
