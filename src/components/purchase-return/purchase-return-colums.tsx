"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PurchaseReturn } from "@/types/purchase-return";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { PurchaseReturnFormSheet } from "./purchase-return-form";
import { PurchaseReturnDeleteDialog } from "./purchase-return-delete-dailog";

export const purchaseReturnColumns: ColumnDef<PurchaseReturn>[] = [
  {
    accessorKey: "referenceNo",
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
    accessorKey: "returnDate",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("returnDate");
      return <div>{date ? new Date(date as string).toLocaleDateString("en-GB") : "-"}</div>;
    },
  },
  {
    accessorKey: "supplierId",
    header: "Supplier",
    cell: ({ row }) => {
      const supplierName = row.original.supplier?.name;
      return <span>{supplierName ?? "-"}</span>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Return Total",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <PurchaseReturnActions purchaseReturn={row.original} />,
  },
];

const PurchaseReturnActions = ({ purchaseReturn }: { purchaseReturn: PurchaseReturn }) => {
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
      <PurchaseReturnFormSheet open={openEdit} openChange={setOpenEdit} purchaseReturn={purchaseReturn} />
      <PurchaseReturnDeleteDialog purchaseReturn={purchaseReturn} open={openDelete} setOpen={setOpenDelete} />
    </div>
  );
};
