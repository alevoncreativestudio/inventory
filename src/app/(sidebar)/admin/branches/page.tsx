import { branchColumns } from "@/components/branches/branch-columns";
import { BranchTable } from "@/components/branches/branch-table";
import {prisma} from "@/lib/prisma";
import { BranchFormDialog } from "@/components/branches/branch-form";

export default async function BranchPage() {
  const branch = await prisma.branch.findMany();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Branch</h1>
              <p className="text-muted-foreground">Manage your branches</p>
            </div>
              <BranchFormDialog />
          </div>

          <BranchTable columns={branchColumns} data={branch} />
        </div>
      </div>
    </div>
  );
}
