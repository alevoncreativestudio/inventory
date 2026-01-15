import { categoryColumns } from "@/components/categories/category-columns";
import { CategoryTable } from "@/components/categories/category-table";
import { prisma } from "@/lib/prisma";
import { CategoryFormDialog } from "@/components/categories/category-form";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface CategoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({
  searchParams,
}: CategoryPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const limit = Number(resolvedSearchParams?.limit) || 10;
  const skip = (page - 1) * limit;

  const [category, totalCount] = await Promise.all([
    prisma.category.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.category.count(),
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
              <h1 className="text-2xl font-bold tracking-tight">Category</h1>
              <p className="text-muted-foreground">Manage your Category</p>
            </div>
            <CategoryFormDialog />
          </div>
          <CategoryTable columns={categoryColumns} data={category} />
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
