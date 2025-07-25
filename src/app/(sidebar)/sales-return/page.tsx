export const dynamic = "force-dynamic";

import { SalesReturnTable } from "@/components/sales-return/sales-return-table";
import { SalesReturnFormSheet } from "@/components/sales-return/sales-return-form";
import { salesReturnColumns } from "@/components/sales-return/sales-return-colums";
import { getSalesReturnList } from "@/actions/sales-return-action";

export default async function SalesReturnPage() {
  const { data } = await getSalesReturnList();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sales Returns</h1>
              <p className="text-muted-foreground">Manage your Sales Returns</p>
            </div>
            <SalesReturnFormSheet />
          </div>

          <SalesReturnTable
            columns={salesReturnColumns}
            data={data?.returns ?? []}
          />
        </div>
      </div>
    </div>
  );
}
