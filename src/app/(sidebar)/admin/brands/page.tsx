import { brandsColumns } from "@/components/brands/brands-columns";
import { BrandTable } from "@/components/brands/brands-table";
import {prisma} from "@/lib/prisma";
import { BrandFormDialog } from "@/components/brands/brand-form";

export default async function BrandsPage() {
  const brand = await prisma.brand.findMany();

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
              <p className="text-muted-foreground">Manage your brands</p>
            </div>
              <BrandFormDialog />
          </div>

          <BrandTable columns={brandsColumns} data={brand} />
        </div>
      </div>
    </div>
  );
}
