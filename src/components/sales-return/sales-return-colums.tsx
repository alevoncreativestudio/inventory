"use client";

import { SalesReturn } from "@/types/sales-return"; // adjust if needed
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
import { useState } from "react";
import { SalesReturnFormSheet } from "./sales-return-form";
import { SalesReturnDeleteDialog } from "./sales-return-delete-dailog";

export const salesReturnColumns: ColumnDef<SalesReturn>[] = [
  {
    accessorKey: "invoiceNo",
    header: ({ column }) => {
      const sort = column.getIsSorted();
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(sort === "asc")}>
          Invoice No {sort === "asc" ? <ArrowUp /> : sort === "desc" ? <ArrowDown /> : <ArrowUpDown />}
        </Button>
      );
    },
  },
  {
    accessorKey: "salesReturnDate",
    header: "Return Date",
    cell: ({ row }) => {
      const date = row.getValue("salesReturnDate");
      return (
        <div>
          {date ? new Date(date as string).toLocaleDateString("en-GB") : "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "customerId",
    header: "Customer",
    cell: ({ row }) => {
      const customer = row.original.customer?.name ?? "-";
      return <span>{customer}</span>;
    },
  },
  {
    accessorKey: "grandTotal",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = row.getValue("grandTotal") as number;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SalesReturnActions returnData={row.original} />,
  },
];

const SalesReturnActions = ({ returnData }: { returnData: SalesReturn }) => {
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

      <SalesReturnFormSheet open={openEdit} openChange={setOpenEdit} salesReturn={returnData} />
      <SalesReturnDeleteDialog open={openDelete} setOpen={setOpenDelete} salesReturn={returnData} />
    </div>
  );
};
