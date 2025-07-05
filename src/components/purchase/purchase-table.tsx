"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Funnel, Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseTableProps } from "@/types/purchase";



export function PurchaseTable<TValue>({
  columns,
  data,
}: PurchaseTableProps<TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const refNo = row.getValue("referenceNo") as string;
      const supplier = row.getValue("supplier") as string;
      const filter = String(filterValue || "").toLowerCase();

      return refNo?.toLowerCase().includes(filter) ||
             supplier?.toLowerCase().includes(filter) 
    },
    state: {
      sorting,
      globalFilter,
    },
  });

    interface Purchase {
      grandTotal?: number;
      paymentDue?: number;
      paymentStatus?:string;
    }

        const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);

        // Total purchase and due amounts
        const totalPurchaseAmount = data.reduce((acc, row: Purchase) => acc + (row?.grandTotal || 0), 0);
        const totalDueAmount = data.reduce((acc, row: Purchase) => acc + (row?.paymentDue ||0),0);

        // Counts
        const dueCount = data.filter((row: Purchase) => row?.paymentStatus === "Due").length;
        const paidCount = data.filter((row: Purchase) => row?.paymentStatus === "Paid").length;
        const partialCount = data.filter((row: Purchase) => row?.paymentStatus === "Partial").length;

        // Formatted values
        const formattedTotalPurchase = formatCurrency(totalPurchaseAmount);
        const formattedTotalDue = formatCurrency(totalDueAmount);



  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search purchases by invoice, supplier or payment</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex gap-4 md:items-center justify-between">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by invoice or supplier"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <div>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by payment method" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { id: "all", name: "All" },
                  { id: "cash", name: "Cash" },
                  { id: "bank", name: "Bank" },
                  { id: "credit", name: "Credit" },
                ].map((payment) => (
                  <SelectItem key={payment.id} value={payment.id}>
                    {payment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline">
              <Funnel className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Purchases</CardTitle>
          <CardDescription>A list of all purchases</CardDescription>
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
              {table.getRowModel().rows?.length ? (
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter className="bg-muted/50 text-sm font-medium border-t">
                <TableRow>
                    <TableCell colSpan={columns.length} className="px-4 py-2">
                    Total Purchase: {formattedTotalPurchase}  |  Due: {formattedTotalDue}
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={columns.length} className="text-muted-foreground px-4 py-2">
                    Payment Status — Due: {dueCount} | Paid: {paidCount} | Partial: {partialCount}
                    </TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
