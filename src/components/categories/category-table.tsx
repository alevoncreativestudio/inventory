"use client";

import {
  ColumnDef,
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Category } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "../ui/input";
// import { Button } from "../ui/button";
import { Search } from "lucide-react";

interface CategoryTableProps<TValue> {
  columns: ColumnDef<Category, TValue>[];
  data: Category[];
}

export function CategoryTable<TValue>({ columns, data }: CategoryTableProps<TValue>) {
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
        const name = row.getValue('name') as string;
        const filter = String(filterValue || '').toLowerCase();
        return name.toLowerCase().includes(filter);
      },
      state: {
        sorting,
        globalFilter,
      },
    });

  return (
    <div className="flex flex-col gap-5">
        <Card>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter categories by name</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex gap-4 md:items-center justify-between">
        <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
            placeholder="Search by category name..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
        />
        </div>
        {/* <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline">
                <Funnel className="h-4 w-4 mr-0 sm:mr-0 md:mr-2" />
                <span className="hidden md:inline">Filter</span>
            </Button>
        </div> */}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
          <div className="space-y-2">
            <CardTitle>Categories</CardTitle>
            <CardDescription>A list of all Categories</CardDescription>
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
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
