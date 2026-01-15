export const dynamic = "force-dynamic";

import { customersColumns } from "@/components/customers/customer-columns";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomerFormDialog } from "@/components/customers/customer-form";
import { getCustomerList } from "@/actions/customer-action";

interface CustomerPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CustomerPage({ searchParams }: CustomerPageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const limit = typeof params.limit === "string" ? Number(params.limit) : 10;

  const { data } = await getCustomerList({ page, limit });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
              <p className="text-muted-foreground">Manage your Customers</p>
            </div>
            <CustomerFormDialog />
          </div>

          <CustomerTable
            columns={customersColumns}
            data={data?.customers ?? []}
            metadata={
              data?.metadata ?? {
                totalPages: 0,
                totalCount: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPrevPage: false,
              }
            }
            totals={data?.totals ?? { openingBalance: 0, outstandingPayments: 0, salesDue: 0, salesReturnDue: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
