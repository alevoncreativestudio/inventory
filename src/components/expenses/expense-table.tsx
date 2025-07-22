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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "../ui/input";
// import { Button } from "../ui/button";
import { Funnel, Search } from "lucide-react";
import { Button } from "../ui/button";
// import { FormControl } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseTableProps } from "@/types/expense";




export function ExpenseTable<TValue>({ columns, data }: ExpenseTableProps<TValue>) {
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
      globalFilterFn: (row, columnId, filterValue) => {
        const title = row.getValue('title') as string;
        const description = row.getValue('description') as string;
        const category = row.getValue('category') as string

        const filter = String(filterValue || '').toLowerCase();

        return title.toLowerCase().includes(filter) || 
        description.toLocaleLowerCase().includes(filter) || 
        category.toLocaleLowerCase().includes(filter) 
      },
      state: {
        sorting,
        globalFilter,
      },
    });

    const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    const totalExpenseAmount = data.reduce((acc, row) => acc + (row?.amount ?? 0), 0);

    const formattedTotalPurchase = formatCurrency(totalExpenseAmount);


  return (
    <div className="flex flex-col gap-5">
        <Card>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter expense by name</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex gap-4 md:items-center justify-between">
        <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
            placeholder="Search by title,description,category"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
        />
        </div>
        <div>
            <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Expense Category" />
                  </SelectTrigger>
                <SelectContent>
                  {[
                    { id: "allcategory", name : "All Category"},
                    { id: "officeappliances", name: "Office Appliances" },
                    { id: "travel", name: "Travel" },
                    { id: "market", name: "Market" },
                    { id: "software", name: "Software" },
                    { id: "other", name: "Other" },
                    ].map((category) => (
                    <SelectItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline">
                <Funnel className="h-4 w-4 mr-0 sm:mr-0 md:mr-2" />
                <span className="hidden md:inline">Filter</span>
            </Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
          <div className="space-y-2">
            <CardTitle>Expenses</CardTitle>
            <CardDescription>A list of all Expenses</CardDescription>
          </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                <TableCell colSpan={4} />
                <TableCell className="text-center border-r-2">Total:</TableCell>
                <TableCell className="border-r-2">{formattedTotalPurchase}</TableCell>
              </TableRow>
            </TableFooter>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
