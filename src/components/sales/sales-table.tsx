"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  type ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

import { SaleTableProps } from "@/types/sales";
import { Search } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export function SalesTable<TValue>({ columns, data }: SaleTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const invoiceNo = row.getValue("invoiceNo") as string;
      const customer = row.original?.customer?.name || "";
      const filter = String(filterValue || "").toLowerCase();
      return (
        invoiceNo?.toLowerCase().includes(filter) ||
        customer?.toLowerCase().includes(filter)
      );
    },
  });


  const totalPurchaseAmount = data.reduce((acc, row) => acc + (row?.grandTotal ?? 0), 0);
  const totalDueAmount = data.reduce((acc,row) => acc+ (row?.dueAmount ?? 0),0)

  return (
    <div className="flex flex-col gap-5">
      {/* <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Search sales by invoice or customer
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-3">
            <div className="w-full">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Filter by Payment Status
              </label>
              <Select
                onValueChange={(value) =>
                  table.setColumnFilters((prev) => [
                    ...prev.filter((f) => f.id !== "salePaymentStatus"),
                    {
                      id: "salePaymentStatus",
                      value: value === "all" ? undefined : value,
                    },
                  ])
                }
                defaultValue="all"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Due">Due</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card> */}

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Sales</CardTitle>
            <CardDescription>A list of all sales</CardDescription>
          </div>

          <div className="relative w-full sm:w-1/2 md:w-1/4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by Ref no or customer"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter className="bg-muted/50 text-sm font-medium border-t">
              <TableRow>
                <TableCell colSpan={4}/>
                <TableCell  className="text-center border-r-2">Total:</TableCell>
                <TableCell className="border-r-2">{formatCurrency(totalPurchaseAmount)}</TableCell>
                <TableCell colSpan={2} className="border-r-2">{formatCurrency(totalDueAmount)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
