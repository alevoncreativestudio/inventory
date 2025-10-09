"use client";

import { Purchase } from "@/types/purchase";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit2,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PurchaseDeleteDialog } from "./purchase-delete-dailog";
import { PurchaseFormSheet } from "./purchase-form";
// Removed sheet import; we'll navigate to a dynamic page for view
import { formatCurrency, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
    },
    {
    id: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const payments = row.original.payments ?? [];
      const dueDate = payments.find((p) => p.dueDate)?.dueDate;
      const dueAmount = row.original.dueAmount ?? 0;

      // fully paid
      if (dueAmount === 0) {
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-green-100 text-green-800">
            Paid
          </span>
        );
      }

      if (!dueDate) {
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-gray-100 text-gray-800">
            No Due Date
          </span>
        );
      }

      const today = new Date();
      const due = new Date(dueDate);

      if (due < today) {
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-red-100 text-red-800">
            Overdue
          </span>
        );
      }

      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium bg-blue-100 text-blue-800">
          Upcoming Payment
        </span>
      );
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
      accessorKey: "totalAmount",
      header: "Grand Total",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <PurchaseActions purchase={row.original} />,
  },
];

const PurchaseActions = ({ purchase }: { purchase: Purchase }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/purchase/${purchase.id}`)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenEdit(true)}
        className="h-8 w-8 p-0"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpenDelete(true)}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <PurchaseFormSheet open={openEdit} openChange={setOpenEdit} purchase={purchase} />
      <PurchaseDeleteDialog purchase={purchase} open={openDelete} setOpen={setOpenDelete} />
    </div>
  );
};
