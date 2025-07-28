"use client";

import { Purchase } from "@/types/purchase";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PurchaseDeleteDialog } from "./purchase-delete-dailog";
import { PurchaseFormSheet } from "./purchase-form";
import { formatCurrency, formatDate } from "@/lib/utils";

export const purchaseColumns: ColumnDef<Purchase>[] = [
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
    accessorKey: "purchaseDate",
    header: "Date",
    cell: ({ row }) => {
        const date = row.getValue("purchaseDate") as string | Date;
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
    accessorKey: "supplierId",
    header: "Supplier",
    cell:({row}) =>{
      const Supplier = row.original.supplier.name

      return (
        <span>
          {Supplier}
        </span>
      )
    }
  },
  {
  accessorKey: "status",
  header: "Purchase Status",
  cell: ({ row }) => {
    const purchaseStatus = row.original.status;

    const statusColorMap: Record<string, string> = {
      Received: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
    };

        const colorClasses = statusColorMap[purchaseStatus] || "bg-gray-100 text-gray-800";

        return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${colorClasses}`}>
            {purchaseStatus}
        </span>
        );
    },
    enableColumnFilter:true,
    }
    ,{
      accessorKey: "totalAmount",
      header: "Grand Total",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
  },
  {
    accessorKey: "dueAmount",
    header: "Payment Due",
    cell: ({ row }) => {
        const amount = row.getValue("dueAmount") as number;
        return <div className="font-medium">{formatCurrency(amount)}</div>;
        }  
    },
  {
    id: "actions",
    cell: ({ row }) => <PurchaseActions purchase={row.original} />,
  },
];

const PurchaseActions = ({ purchase }: { purchase: Purchase }) => {
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
      <PurchaseFormSheet open={openEdit} openChange={setOpenEdit} purchase={purchase} />
      <PurchaseDeleteDialog purchase={purchase} open={openDelete} setOpen={setOpenDelete} />
    </div>
  );
};
