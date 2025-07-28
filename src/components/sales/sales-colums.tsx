"use client";

import { Sale } from "@/types/sales";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SalesDeleteDialog } from "./sales-delete-dailog";
import { useState } from "react";
import { SalesFormSheet } from "./sales-form";
import { formatCurrency, formatDate } from "@/lib/utils";

export const salesColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: "invoiceNo",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(sort === "asc")}>
          Ref No {sort === "asc" ? <ArrowUp /> : sort === "desc" ? <ArrowDown /> : <ArrowUpDown />}
        </Button>
      );
    },
  },
  {
    accessorKey: "salesdate",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("salesdate") as string | Date;
      return (
        <div>
          {date ? formatDate(date) : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell:({row}) =>{
      const Location = row.original.branch?.name

      return (
        <span>
          {Location}
        </span>
      )
    }
  },
  {
    accessorKey: "customerId",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer.name;
      return <span>{customer}</span>;
    },
  },
  {
    accessorKey: "grandTotal",
    header: "Grand Total",
    cell: ({ row }) => {
      const amount = row.getValue("grandTotal") as number;
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "dueAmount",
    header: "Payment Due",
    cell: ({ row }) => {
      const amount = row.getValue("dueAmount") as number;
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SalesActions sale={row.original} />,
  },
];

const SalesActions = ({ sale }: { sale: Sale }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpenEdit(true)}>
            <Edit2 className="size-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenDelete(true)} className="text-destructive">
            <Trash2 className="size-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SalesFormSheet open={openEdit} openChange={setOpenEdit} sales={sale} />
      <SalesDeleteDialog sale={sale} open={openDelete} setOpen={setOpenDelete} />
    </div>
  );
};
