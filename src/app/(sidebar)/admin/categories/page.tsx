import { categoryColumns } from "@/components/categories/category-columns";
import { CategoryTable } from "@/components/categories/category-table";
import {prisma} from "@/lib/prisma";
import { CategoryFormDialog } from "@/components/categories/category-form";

export default async function CategoryPage() {
  const category = await prisma.category.findMany();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Category</h1>
              <p className="text-muted-foreground">Manage your Category</p>
            </div>
              <CategoryFormDialog />
          </div>
          <CategoryTable columns={categoryColumns} data={category} />
        </div>
      </div>
    </div>
  );
}
