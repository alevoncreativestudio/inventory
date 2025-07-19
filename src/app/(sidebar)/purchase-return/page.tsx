import { PurchaseReturnTable } from "@/components/purchase-return/purchase-return-table";
import { PurchaseReturnFormSheet } from "@/components/purchase-return/purchase-return-form";
import { purchaseReturnColumns } from "@/components/purchase-return/purchase-return-colums";
import { getPurchaseReturnList } from "@/actions/purchase-return-action";

export default async function PurchaseReturnPage() {
  const { data } = await getPurchaseReturnList();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Purchase Returns</h1>
              <p className="text-muted-foreground">Manage your Purchase Returns</p>
            </div>
            <PurchaseReturnFormSheet />
          </div>

          <PurchaseReturnTable
            columns={purchaseReturnColumns}
            data={data?.returns ?? []}
          />
        </div>
      </div>
    </div>
  );
}
