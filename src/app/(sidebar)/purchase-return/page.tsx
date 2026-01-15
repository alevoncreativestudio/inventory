export const dynamic = "force-dynamic";

import { PurchaseReturnTable } from "@/components/purchase-return/purchase-return-table";
import { PurchaseReturnFormSheet } from "@/components/purchase-return/purchase-return-form";
import { purchaseReturnColumns } from "@/components/purchase-return/purchase-return-colums";
import { getPurchaseReturnList } from "@/actions/purchase-return-action";

interface PurchaseReturnPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PurchaseReturnPage({ searchParams }: PurchaseReturnPageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const limit = typeof params.limit === "string" ? Number(params.limit) : 10;

  const { data } = await getPurchaseReturnList({ page, limit });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Purchase Returns</h1>
              <p className="text-muted-foreground">Manage your Purchase Returns</p>
            </div>
            <PurchaseReturnFormSheet />
          </div>

          <PurchaseReturnTable
            columns={purchaseReturnColumns}
            data={data?.returns ?? []}
            metadata={
              data?.metadata ?? {
                totalPages: 0,
                totalCount: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPrevPage: false,
              }
            }
            totals={data?.totals ?? { totalAmount: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
