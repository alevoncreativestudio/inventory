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
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Search } from "lucide-react";
import { useState } from "react";
import { PurchaseTableProps as PurchaseTablePropsType } from "@/types/purchase";
import { PaginationControls } from "../ui/pagination-controls";
import { formatCurrency } from "@/lib/utils";

interface PurchaseTableProps<TData> extends PurchaseTablePropsType<TData> {
  metadata: {
    totalPages: number;
    totalCount: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  totals: {
    totalAmount: number;
    dueAmount: number;
    paidAmount: number;
  };
}

export function PurchaseTable<TValue>({ columns, data, metadata, totals }: PurchaseTableProps<TValue>) {
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
      const supplier = row.original?.supplier?.name || "";
      const filter = String(filterValue || "").toLowerCase();
      return (
        invoiceNo?.toLowerCase().includes(filter) ||
        supplier?.toLowerCase().includes(filter)
      );
    },
    manualPagination: true,
    pageCount: metadata.totalPages,
  });


  const totalPurchaseAmount = data.reduce((acc, row) => acc + (row?.totalAmount ?? 0), 0);

  const totalDueAmount = data.reduce((acc, row) => acc + (row?.dueAmount ?? 0), 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Filter Card */}
      {/* <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search purchases by invoice, supplier or payment</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-3">
            <div className="w-full">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Filter by Purchase Status
              </label>           
            </div>
          </div>
        </CardHeader>
      </Card> */}

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Purchases</CardTitle>
            <CardDescription>A list of all purchases</CardDescription>
          </div>

          <div className="relative w-full sm:w-1/2 md:w-1/4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by Ref no or supplier"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            onValueChange={(value) =>
              table.setColumnFilters((prev) => [
                ...prev.filter((f) => f.id !== "status"),
                { id: "status", value: value === "all" ? undefined : value },
              ])
            }
            defaultValue="all"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Purchase Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Received">Received</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}
                      className="bg-primary text-primary-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                <TableCell colSpan={5} />
                <TableCell className="text-center border-r-2">Page Total:</TableCell>
                <TableCell className="border-r-2">{formatCurrency(totalDueAmount)}</TableCell>
                <TableCell colSpan={2} className="border-r-2">{formatCurrency(totalPurchaseAmount)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={5} />
                <TableCell className="text-center border-r-2">Grand Total:</TableCell>
                <TableCell className="border-r-2">{formatCurrency(totals?.dueAmount ?? 0)}</TableCell>
                <TableCell colSpan={2} className="border-r-2">{formatCurrency(totals?.totalAmount ?? 0)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
        <PaginationControls
          totalPages={metadata.totalPages}
          hasNextPage={metadata.hasNextPage}
          hasPrevPage={metadata.hasPrevPage}
          totalCount={metadata.totalCount}
        />
      </Card>
    </div>
  );
}
