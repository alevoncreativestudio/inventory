import { customersColumns } from "@/components/customers/customer-columns";
import { CustomerTable } from "@/components/customers/customer-table";
import { prisma } from "@/lib/prisma";
import { CustomerFormDialog } from "@/components/customers/customer-form";

export default async function CustomerPage() {
  const customers = await prisma.customer.findMany();

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

          <CustomerTable columns={customersColumns} data={customers} />
        </div>
      </div>
    </div>
  );
}
