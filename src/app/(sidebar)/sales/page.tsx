export const dynamic = "force-dynamic";

import { SalesTable } from "@/components/sales/sales-table";
import { salesColumns } from "@/components/sales/sales-colums";
import { getSalesList } from "@/actions/sales-action";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

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
            <Link href="/sales/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Sale
              </Button>
            </Link>
          </div>

          <SalesTable columns={salesColumns} data={(data?.sales ?? []) as any} />
        </div>
      </div>
    </div>
  );
}
