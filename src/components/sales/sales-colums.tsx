"use client";

import { Sale } from "@/types/sales";
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
import { SalesDeleteDialog } from "./sales-delete-dailog";
import { useState } from "react";
import { SalesFormSheet } from "./sales-form";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { updateSalesStatus } from "@/actions/sales-action";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Check } from "lucide-react";

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
    cell: ({ row }) => {
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.original as any).status || "Ordered";
      const statusColorMap: Record<string, string> = {
        Dispatched: "bg-green-100 text-green-800",
        Ordered: "bg-yellow-100 text-yellow-800",
        Cancelled: "bg-red-100 text-red-800",
      };

      const color = statusColorMap[status] || "bg-gray-100 text-gray-800";

      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${color}`}>
          {status}
        </span>
      );
    },
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
    accessorKey: "openingBalance",
    header: "Opening Balance",
    cell: ({ row }) => {
      const customer = row.original.customer.openingBalance;
      return <span>{formatCurrency(customer)}</span>;
    },
  },
  {
    accessorKey: "paidAmount",
    header: "Paid Amount",
    cell: ({ row }) => {
      const amount = row.getValue("paidAmount") as number;
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "dueAmount",
    header: "Due (Old Balance)",
    cell: ({ row }) => {
      const amount = row.getValue("dueAmount") as number;
      return <div className="font-medium">{formatCurrency(amount)}</div>;
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <SalesActions sale={row.original} />,
  },
];

const SalesActions = ({ sale }: { sale: Sale }) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const router = useRouter();

  const { execute: updateStatus, isExecuting } = useAction(updateSalesStatus, {
    onSuccess: ({ data }) => {
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Sale dispatched");
      }
    },
    onError: () => toast.error("Something went wrong"),
  });

  const status = (sale as any).status || "Ordered";

  return (
    <div className="flex items-center gap-2">
      {status === "Ordered" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateStatus({ id: sale.id, status: "Dispatched" })}
          disabled={isExecuting}
          className="h-8 gap-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
        >
          <Check className="h-3.5 w-3.5" />
          {isExecuting ? "..." : "Approve"}
        </Button>
      ) : (
        <div className="w-[88px]" /> // Approximate width of the Approve button to maintain alignment
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/sales/${sale.id}`)}
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

      <SalesFormSheet open={openEdit} openChange={setOpenEdit} sales={sale} />
      <SalesDeleteDialog sale={sale} open={openDelete} setOpen={setOpenDelete} />
    </div>
  );
};
