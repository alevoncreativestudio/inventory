import { taxRatesColumns } from "@/components/taxrates/taxrates-columns";
import { TaxRateTable } from "@/components/taxrates/taxrates-table";
import {prisma} from "@/lib/prisma";
import { TaxRateFormDialog } from "@/components/taxrates/taxrates-form"

export default async function TaxRatePage() {
  const taxRate = await prisma.taxRates.findMany();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tax Rates</h1>
              <p className="text-muted-foreground">Manage your Tax Rates Category</p>
            </div>
              <TaxRateFormDialog />
          </div>

          <TaxRateTable columns={taxRatesColumns} data={taxRate} />
        </div>
      </div>
    </div>
  );
}
