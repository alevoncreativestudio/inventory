export const dynamic = "force-dynamic";

import { SalesTable } from "@/components/sales/sales-table";
import { salesColumns } from "@/components/sales/sales-colums";
import { getSalesList } from "@/actions/sales-action";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface SalesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const limit = typeof params.limit === "string" ? Number(params.limit) : 10;

  const { data } = await getSalesList({ page, limit });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
              <p className="text-muted-foreground">Manage your sales</p>
            </div>
            <Link href="/sales/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Sale
              </Button>
            </Link>
          </div>

          <SalesTable
            columns={salesColumns}
            data={(data?.sales ?? []) as any}
            metadata={
              data?.metadata ?? {
                totalPages: 0,
                totalCount: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPrevPage: false,
              }
            }
            totals={data?.totals ?? { grandTotal: 0, dueAmount: 0, paidAmount: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
