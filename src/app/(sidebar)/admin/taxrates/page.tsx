import { taxRatesColumns } from "@/components/taxrates/taxrates-columns";
import { TaxRateTable } from "@/components/taxrates/taxrates-table";
import { prisma } from "@/lib/prisma";
import { TaxRateFormDialog } from "@/components/taxrates/taxrates-form";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface TaxRatePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TaxRatePage({ searchParams }: TaxRatePageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const limit = Number(resolvedSearchParams?.limit) || 10;
  const skip = (page - 1) * limit;

  const [taxRate, totalCount] = await Promise.all([
    prisma.taxRates.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.taxRates.count(),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tax Rates</h1>
              <p className="text-muted-foreground">
                Manage your Tax Rates Category
              </p>
            </div>
            <TaxRateFormDialog />
          </div>

          <TaxRateTable columns={taxRatesColumns} data={taxRate} />
          <PaginationControls
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            totalCount={totalCount}
          />
        </div>
      </div>
    </div>
  );
}
