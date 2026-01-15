export const dynamic = "force-dynamic";
import { expenseColumns } from "@/components/expenses/expense-colums";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { ExpenseFormDialog } from "@/components/expenses/expense-form";
import { getExpenseList } from "@/actions/expense-actions";

interface ExpensePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExpensePage({ searchParams }: ExpensePageProps) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const limit = typeof params.limit === "string" ? Number(params.limit) : 10;

  const { data } = await getExpenseList({ page, limit });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
              <p className="text-muted-foreground">Manage your Expenses</p>
            </div>
            <ExpenseFormDialog />
          </div>

          <ExpenseTable
            columns={expenseColumns}
            data={data?.expense ?? []}
            metadata={
              data?.metadata ?? {
                totalPages: 0,
                totalCount: 0,
                currentPage: 1,
                hasNextPage: false,
                hasPrevPage: false,
              }
            }
            totals={data?.totals ?? { amount: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
